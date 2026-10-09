const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);
router.use(requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW));

router.get('/', getAuditLogs);

module.exports = router;

