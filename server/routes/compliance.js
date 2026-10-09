const express = require('express');
const router = express.Router();
const {
  getComplianceRequirements,
  getComplianceById,
  createCompliance,
  updateCompliance,
  deleteCompliance,
} = require('../controllers/complianceController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.COMPLIANCE_VIEW), getComplianceRequirements)
  .post(requirePermission(PERMISSIONS.COMPLIANCE_CREATE), createCompliance);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.COMPLIANCE_VIEW), getComplianceById)
  .put(requirePermission(PERMISSIONS.COMPLIANCE_UPDATE, PERMISSIONS.COMPLIANCE_VERIFY), updateCompliance)
  .delete(requirePermission(PERMISSIONS.COMPLIANCE_DELETE), deleteCompliance);

module.exports = router;

