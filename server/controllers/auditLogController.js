const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin, PM)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { module: mod, action, user, search } = req.query;
    let query = {};

    if (mod && mod !== 'all') query.module = mod;
    if (action && action !== 'all') query.action = action;
    if (user && user !== 'all') query.user = user;
    if (search) {
      query.$or = [
        { recordTitle: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort('-timestamp')
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};
