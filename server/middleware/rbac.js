const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Project = require('../models/Project');
const Document = require('../models/Document');
const { hasPermission, hasAnyPermission, PERMISSIONS } = require('../config/permissions');

/**
 * Middleware: Require one or more specific granular permissions
 */
exports.requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to verify permissions.',
      });
    }

    const authorized = hasAnyPermission(req.user.role, permissions);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Your role '${req.user.role}' lacks required permission(s): [${permissions.join(', ')}]`,
        requiredPermissions: permissions,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Middleware: Require one of the specified roles
 */
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Role '${req.user.role}' is not authorized to access this resource. Required roles: [${roles.join(', ')}]`,
        requiredRoles: roles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Helper: Retrieve all project IDs accessible by the user
 */
exports.getUserAccessibleProjectIds = async (user) => {
  if (!user) return [];
  if (user.role === 'ADMIN') {
    const all = await Project.find({}).select('_id');
    return all.map((p) => p._id);
  }

  // Non-admins only get projects they manage or are assigned to
  const accessible = await Project.find({
    $or: [
      { manager: user._id },
      { environmentalOfficer: user._id },
      { complianceStaff: user._id },
      { assignedTeam: user._id },
    ],
  }).select('_id');

  return accessible.map((p) => p._id);
};

/**
 * Middleware: Verify project-level authorization for single project routes
 */
exports.requireProjectAccess = (paramKey = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      // System Admin has full project clearance
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const projectId = req.params[paramKey] || req.body.project || req.query.project;
      if (!projectId) {
        return next();
      }

      const project = await Project.findById(projectId).select(
        'manager environmentalOfficer complianceStaff assignedTeam name'
      );
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const isManager = project.manager && project.manager.toString() === req.user._id.toString();
      const isEO = project.environmentalOfficer && project.environmentalOfficer.toString() === req.user._id.toString();
      const isStaff = project.complianceStaff && project.complianceStaff.toString() === req.user._id.toString();
      const isAssigned = project.assignedTeam && project.assignedTeam.some(
        (id) => id.toString() === req.user._id.toString()
      );

      if (!isManager && !isEO && !isStaff && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You do not have project-level authorization to access project '${project.name}'.`,
          projectId,
          projectName: project.name,
        });
      }

      req.project = project;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware: Prevent unauthorized approvals and self-approval
 */
exports.enforceApprovalWorkflow = (entityModel, fieldName = 'responsibleOfficer') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      // Check if this request is attempting to set status to 'Approved'
      const requestedStatus = req.body.status;
      if (requestedStatus === 'Approved') {
        // Rule 1: Environmental Officers cannot perform formal regulatory approvals
        if (req.user.role === 'ENVIRONMENTAL_OFFICER') {
          return res.status(403).json({
            success: false,
            error: 'Access Denied: Environmental Officers cannot grant formal regulatory approvals. Independent review and sign-off is required by compliance governance policy.',
          });
        }

        // Rule 2: Submitter / Responsible Officer cannot approve their own submission
        if (req.params.id) {
          const Model = require(`../models/${entityModel}`);
          const record = await Model.findById(req.params.id);
          if (record) {
            const submitterId = record[fieldName] || record.submittedBy || record.responsiblePerson;
            if (submitterId && submitterId.toString() === req.user._id.toString() && req.user.role !== 'ADMIN') {
              return res.status(403).json({
                success: false,
                error: 'Prohibited Self-Approval: You cannot approve your own submission. An independent Project Manager, Compliance Officer, or Administrator must review and sign off.',
              });
            }
          }
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware: Protect static file access under /uploads
 * Prevents unauthorized direct file access via URLs
 */
exports.protectDocumentAccess = async (req, res) => {
  try {
    let token = req.query.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication token is required to access project files.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'envirotrack_default_jwt_secret');
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired document session token.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account inactive or not found.',
      });
    }

    const filename = req.path.replace(/^\//, '');
    const physicalPath = path.join(__dirname, '..', 'uploads', filename);

    // Verify file exists
    if (!fs.existsSync(physicalPath)) {
      return res.status(404).json({ success: false, error: 'Document file not found.' });
    }

    // Admins have access to all uploaded documents
    if (user.role === 'ADMIN') {
      return res.sendFile(physicalPath);
    }

    // Lookup corresponding document in database to verify project access
    const doc = await Document.findOne({
      $or: [
        { fileUrl: `/uploads/${filename}` },
        { fileName: filename },
      ],
    }).populate('project');

    if (doc && doc.project) {
      const isManager = doc.project.manager && doc.project.manager.toString() === user._id.toString();
      const isAssigned = doc.project.assignedTeam && doc.project.assignedTeam.some(
        (id) => id.toString() === user._id.toString()
      );

      if (!isManager && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You are not authorized to view files for project '${doc.project.name}'.`,
        });
      }
    }

    return res.sendFile(physicalPath);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
