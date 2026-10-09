const express = require('express');
const router = express.Router();
const {
  getMonitoringRecords,
  getMonitoringTrends,
  createMonitoring,
  deleteMonitoring,
} = require('../controllers/monitoringController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router.get('/trends', requirePermission(PERMISSIONS.MONITORING_VIEW), getMonitoringTrends);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.MONITORING_VIEW), getMonitoringRecords)
  .post(requirePermission(PERMISSIONS.MONITORING_RECORD), createMonitoring);

router
  .route('/:id')
  .delete(requirePermission(PERMISSIONS.MONITORING_DELETE), deleteMonitoring);

module.exports = router;

