const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  req,
  action,
  module,
  recordId,
  recordTitle = '',
  details = '',
  previousValue = null,
  newValue = null,
}) => {
  try {
    const user = req && req.user ? req.user._id : null;
    const userName = req && req.user ? req.user.name : 'System';
    const userRole = req && req.user ? req.user.role : 'SYSTEM';
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';

    await AuditLog.create({
      user,
      userName,
      userRole,
      action,
      module,
      recordId,
      recordTitle,
      details,
      previousValue,
      newValue,
      ipAddress,
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

module.exports = { logAudit };
