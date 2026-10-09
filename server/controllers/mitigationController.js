const MitigationMeasure = require('../models/MitigationMeasure');
const { logAudit } = require('../middleware/audit');

// @desc    Get all mitigation measures
// @route   GET /api/mitigation
// @access  Private
exports.getMitigationMeasures = async (req, res, next) => {
  try {
    const { project, status, effectiveness, environmentalImpact, search } = req.query;
    let query = {};

    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;
    if (effectiveness && effectiveness !== 'all') query.effectiveness = effectiveness;
    if (environmentalImpact && environmentalImpact !== 'all') query.environmentalImpact = environmentalImpact;
    if (search) {
      query.$or = [
        { measureTitle: { $regex: search, $options: 'i' } },
        { environmentalImpact: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const measures = await MitigationMeasure.find(query)
      .populate('project', 'name code location projectType')
      .populate('responsiblePerson', 'name email role')
      .sort('targetDate');

    res.status(200).json({ success: true, count: measures.length, data: measures });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single mitigation measure
// @route   GET /api/mitigation/:id
// @access  Private
exports.getMitigationById = async (req, res, next) => {
  try {
    const measure = await MitigationMeasure.findById(req.params.id)
      .populate('project', 'name code location')
      .populate('responsiblePerson', 'name email role department');

    if (!measure) {
      return res.status(404).json({ success: false, error: 'Mitigation measure not found' });
    }

    res.status(200).json({ success: true, data: measure });
  } catch (err) {
    next(err);
  }
};

// @desc    Create mitigation measure
// @route   POST /api/mitigation
// @access  Private (Admin, PM, Environmental Officer, Compliance Staff)
exports.createMitigation = async (req, res, next) => {
  try {
    if (!req.body.responsiblePerson || req.body.responsiblePerson === '') {
      delete req.body.responsiblePerson;
    }
    const measure = await MitigationMeasure.create(req.body);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Mitigation',
      recordId: measure._id,
      recordTitle: measure.measureTitle,
      details: `Created mitigation action for ${measure.environmentalImpact}`,
      newValue: measure,
    });

    res.status(201).json({ success: true, data: measure });
  } catch (err) {
    next(err);
  }
};

// @desc    Update mitigation measure
// @route   PUT /api/mitigation/:id
// @access  Private
exports.updateMitigation = async (req, res, next) => {
  try {
    const existing = await MitigationMeasure.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Mitigation measure not found' });
    }

    if (req.body.responsiblePerson === '') {
      req.body.responsiblePerson = null;
    }

    const measure = await MitigationMeasure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name code')
      .populate('responsiblePerson', 'name email');

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Mitigation',
      recordId: measure._id,
      recordTitle: measure.measureTitle,
      details: `Status updated to ${measure.status} with ${measure.effectiveness} effectiveness`,
      previousValue: existing,
      newValue: measure,
    });

    res.status(200).json({ success: true, data: measure });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete mitigation measure
// @route   DELETE /api/mitigation/:id
// @access  Private (Admin, PM)
exports.deleteMitigation = async (req, res, next) => {
  try {
    const measure = await MitigationMeasure.findById(req.params.id);
    if (!measure) {
      return res.status(404).json({ success: false, error: 'Mitigation measure not found' });
    }

    await measure.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Mitigation',
      recordId: measure._id,
      recordTitle: measure.measureTitle,
      details: `Deleted mitigation measure`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
