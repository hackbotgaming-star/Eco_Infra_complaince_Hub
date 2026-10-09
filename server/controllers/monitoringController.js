const MonitoringRecord = require('../models/MonitoringRecord');
const { logAudit } = require('../middleware/audit');

// @desc    Get all monitoring records
// @route   GET /api/monitoring
// @access  Private
exports.getMonitoringRecords = async (req, res, next) => {
  try {
    const { project, parameter, complianceStatus, search } = req.query;
    let query = {};

    if (project) query.project = project;
    if (parameter && parameter !== 'all') query.parameter = parameter;
    if (complianceStatus && complianceStatus !== 'all') query.complianceStatus = complianceStatus;
    if (search) {
      query.$or = [
        { location: { $regex: search, $options: 'i' } },
        { observation: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await MonitoringRecord.find(query)
      .populate('project', 'name code location projectType')
      .populate('recordedBy', 'name email role')
      .sort('-monitoringDate');

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// @desc    Get monitoring telemetry and trends for charts
// @route   GET /api/monitoring/trends
// @access  Private
exports.getMonitoringTrends = async (req, res, next) => {
  try {
    const { project, parameter } = req.query;
    let query = {};
    if (project) query.project = project;
    if (parameter) query.parameter = parameter;

    const records = await MonitoringRecord.find(query)
      .sort('monitoringDate')
      .limit(50);

    const formatted = records.map(r => ({
      date: new Date(r.monitoringDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      measuredValue: r.measuredValue,
      allowedLimit: r.allowedLimit,
      parameter: r.parameter,
      unit: r.unit,
      status: r.complianceStatus,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

// @desc    Create monitoring record
// @route   POST /api/monitoring
// @access  Private
exports.createMonitoring = async (req, res, next) => {
  try {
    if (!req.body.recordedBy) {
      req.body.recordedBy = req.user.id;
    }

    // Determine compliance status automatically based on limits if not manually provided
    if (!req.body.complianceStatus && req.body.measuredValue && req.body.allowedLimit) {
      const val = parseFloat(req.body.measuredValue);
      const limit = parseFloat(req.body.allowedLimit);
      if (val > limit * 1.1) {
        req.body.complianceStatus = 'Non-compliant';
      } else if (val > limit * 0.9) {
        req.body.complianceStatus = 'Alert';
      } else {
        req.body.complianceStatus = 'Compliant';
      }
    }

    const record = await MonitoringRecord.create(req.body);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Monitoring',
      recordId: record._id,
      recordTitle: `${record.parameter} @ ${record.location}`,
      details: `Logged measurement: ${record.measuredValue} ${record.unit} (Limit: ${record.allowedLimit})`,
      newValue: record,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete monitoring record
// @route   DELETE /api/monitoring/:id
// @access  Private
exports.deleteMonitoring = async (req, res, next) => {
  try {
    const record = await MonitoringRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    await record.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Monitoring',
      recordId: record._id,
      recordTitle: record.parameter,
      details: `Deleted monitoring record`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
