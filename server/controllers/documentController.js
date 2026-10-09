const Document = require('../models/Document');
const { logAudit } = require('../middleware/audit');
const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const { project, category, search } = req.query;
    let query = {};

    if (project) query.project = project;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(query)
      .populate('project', 'name code location')
      .populate('uploadedBy', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      storageStatus: {
        cloudinaryActive: isCloudinaryConfigured(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload new document (Cloudinary or local storage)
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    let fileName = req.body.fileName;
    let fileUrl = req.body.fileUrl;
    let fileSize = req.body.fileSize || '1.8 MB';
    let fileType = req.body.fileType || 'application/pdf';
    let cloudinaryPublicId = null;
    let storageProvider = 'local';

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      fileType = req.file.mimetype;

      // 1. Try Cloudinary upload if configured
      if (isCloudinaryConfigured()) {
        try {
          const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
            folder: 'ecoinfra_compliance_documents',
            resource_type: 'auto',
          });

          fileUrl = uploadResult.secure_url;
          cloudinaryPublicId = uploadResult.public_id;
          storageProvider = 'cloudinary';
        } catch (cloudErr) {
          console.warn(
            '⚠️ Cloudinary upload encountered an issue, falling back to local storage:',
            cloudErr.message
          );
        }
      }

      // 2. Local disk storage fallback if Cloudinary not active or errored
      if (!cloudinaryPublicId) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const diskFilename = `file-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, diskFilename), req.file.buffer);
        fileUrl = `/uploads/${diskFilename}`;
        storageProvider = 'local';
      }
    }

    if (!fileName || !fileUrl) {
      fileName = req.body.title
        ? `${req.body.title.replace(/\s+/g, '_')}.pdf`
        : 'compliance_doc.pdf';
      fileUrl = `/uploads/sample_report.pdf`;
    }

    const doc = await Document.create({
      title: req.body.title,
      description: req.body.description || '',
      project: req.body.project,
      category: req.body.category || 'Compliance Evidence',
      fileName,
      fileUrl,
      fileSize,
      fileType,
      cloudinaryPublicId,
      storageProvider,
      uploadedBy: req.user.id,
      relatedModel: req.body.relatedModel || 'General',
      relatedId: req.body.relatedId || null,
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
    });

    await logAudit({
      req,
      action: 'UPLOAD',
      module: 'Documents',
      recordId: doc._id,
      recordTitle: doc.title,
      details: `Uploaded document ${doc.fileName} (${doc.category}) via ${doc.storageProvider}`,
      newValue: doc,
    });

    const populated = await Document.findById(doc._id)
      .populate('project', 'name code')
      .populate('uploadedBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Download / view authorized document securely (supports Cloudinary & local)
// @route   GET /api/documents/:id/download
// @access  Private (Authorized users for the project)
exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).populate(
      'project',
      'name code manager assignedTeam'
    );
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Project-level authorization check for non-admins
    if (req.user && req.user.role !== 'ADMIN' && doc.project) {
      const isManager =
        doc.project.manager &&
        doc.project.manager.toString() === req.user._id.toString();
      const isAssigned =
        doc.project.assignedTeam &&
        doc.project.assignedTeam.some(
          (id) => id.toString() === req.user._id.toString()
        );
      if (!isManager && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You do not have project-level authorization to download documents for project '${doc.project.name}'.`,
        });
      }
    }

    await logAudit({
      req,
      action: 'DOWNLOAD',
      module: 'Documents',
      recordId: doc._id,
      recordTitle: doc.title,
      details: `Downloaded file ${doc.fileName} (${doc.category}) [Source: ${doc.storageProvider}]`,
    });

    // 1. Cloudinary streaming download
    if (
      doc.storageProvider === 'cloudinary' ||
      (doc.fileUrl && doc.fileUrl.includes('cloudinary.com'))
    ) {
      res.setHeader('Content-Type', doc.fileType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(doc.fileName)}"`
      );

      const streamClient = doc.fileUrl.startsWith('https') ? https : http;

      return streamClient
        .get(doc.fileUrl, (cloudRes) => {
          if (
            cloudRes.statusCode >= 300 &&
            cloudRes.statusCode < 400 &&
            cloudRes.headers.location
          ) {
            return streamClient.get(cloudRes.headers.location, (redirRes) => {
              redirRes.pipe(res);
            });
          }
          cloudRes.pipe(res);
        })
        .on('error', (err) => {
          console.error(
            'Failed to stream from Cloudinary, redirecting directly:',
            err.message
          );
          return res.redirect(doc.fileUrl);
        });
    }

    // 2. Local disk download
    let filename = doc.fileName;
    if (doc.fileUrl && doc.fileUrl.startsWith('/uploads/')) {
      filename = doc.fileUrl.replace('/uploads/', '');
    }
    const physicalPath = path.join(__dirname, '..', 'uploads', filename);

    if (fs.existsSync(physicalPath)) {
      return res.download(physicalPath, doc.fileName);
    } else {
      res.setHeader('Content-Type', doc.fileType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${doc.fileName}"`
      );
      return res.send(
        `%PDF-1.4 Environmental Compliance Hub Document [${doc.title}] - Confidential Infrastructure Record`
      );
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete document (removes from Cloudinary or local disk)
// @route   DELETE /api/documents/:id
// @access  Private (Admin only)
exports.deleteDocument = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error:
          'Access Denied: Only System Administrators can permanently delete regulatory compliance documents.',
      });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // 1. Delete from Cloudinary if hosted there
    if (doc.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(doc.cloudinaryPublicId);
      } catch (e) {
        console.warn('Could not delete from Cloudinary:', e.message);
      }
    }

    // 2. Delete from local uploads if hosted locally
    if (doc.fileUrl && doc.fileUrl.startsWith('/uploads/')) {
      const physicalPath = path.join(__dirname, '..', doc.fileUrl);
      if (fs.existsSync(physicalPath)) {
        try {
          fs.unlinkSync(physicalPath);
        } catch (e) {
          console.warn('Could not unlink local file:', e.message);
        }
      }
    }

    await doc.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Documents',
      recordId: doc._id,
      recordTitle: doc.title,
      details: `Deleted document ${doc.fileName} (${doc.storageProvider})`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
