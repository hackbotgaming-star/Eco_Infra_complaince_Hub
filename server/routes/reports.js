const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getProjectReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requirePermission, requireProjectAccess } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router.get('/analytics', requirePermission(PERMISSIONS.REPORTS_VIEW), getDashboardAnalytics);
router.get(
  '/project-summary/:id',
  requirePermission(PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.REPORTS_VIEW),
  requireProjectAccess('id'),
  getProjectReport
);

module.exports = router;

