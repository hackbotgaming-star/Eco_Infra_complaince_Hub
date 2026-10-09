const Inspection = require('../models/Inspection');
const { logAudit } = require('../middleware/audit');

// @desc    Get all inspections
// @route   GET /api/inspections
// @access  Private
exports.getInspections = async (req, res, next) => {
  try {
    const { project, status, inspectionType, search } = req.query;
    let query = {};

    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;
    if (inspectionType && inspectionType !== 'all') query.inspectionType = inspectionType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { findings: { $regex: search, $options: 'i' } },
      ];
    }

    const inspections = await Inspection.find(query)
      .populate('project', 'name code location projectType')
      .populate('inspector', 'name email role department')
      .sort('-date');

    res.status(200).json({ success: true, count: inspections.length, data: inspections });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single inspection
// @route   GET /api/inspections/:id
// @access  Private
exports.getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('project', 'name code location')
      .populate('inspector', 'name email role department phone');

    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection report not found' });
    }

    res.status(200).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Create inspection
// @route   POST /api/inspections
// @access  Private (Admin, PM, Environmental Officer, Compliance Staff)
exports.createInspection = async (req, res, next) => {
  try {
    if (!req.body.inspector || req.body.inspector === '') {
      req.body.inspector = req.user.id;
    }

    const inspection = await Inspection.create(req.body);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Inspections',
      recordId: inspection._id,
      recordTitle: inspection.title,
      details: `Logged inspection at ${inspection.location} with status ${inspection.status}`,
      newValue: inspection,
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inspection
// @route   PUT /api/inspections/:id
// @access  Private
exports.updateInspection = async (req, res, next) => {
  try {
    const existing = await Inspection.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name code')
      .populate('inspector', 'name email');

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Inspections',
      recordId: inspection._id,
      recordTitle: inspection.title,
      details: `Updated inspection findings and violation status`,
      previousValue: existing,
      newValue: inspection,
    });

    res.status(200).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete inspection
// @route   DELETE /api/inspections/:id
// @access  Private (Admin, PM)
exports.deleteInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    await inspection.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Inspections',
      recordId: inspection._id,
      recordTitle: inspection.title,
      details: `Deleted inspection report`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
