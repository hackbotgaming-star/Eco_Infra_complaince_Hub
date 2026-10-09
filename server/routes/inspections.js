const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.INSPECTIONS_VIEW), getInspections)
  .post(requirePermission(PERMISSIONS.INSPECTIONS_CREATE), createInspection);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.INSPECTIONS_VIEW), getInspectionById)
  .put(requirePermission(PERMISSIONS.INSPECTIONS_UPDATE, PERMISSIONS.INSPECTIONS_REVIEW), updateInspection)
  .delete(requirePermission(PERMISSIONS.INSPECTIONS_DELETE), deleteInspection);

module.exports = router;

