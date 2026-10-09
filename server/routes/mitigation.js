const express = require('express');
const router = express.Router();
const {
  getMitigationMeasures,
  getMitigationById,
  createMitigation,
  updateMitigation,
  deleteMitigation,
} = require('../controllers/mitigationController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.MITIGATION_VIEW), getMitigationMeasures)
  .post(requirePermission(PERMISSIONS.MITIGATION_CREATE), createMitigation);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.MITIGATION_VIEW), getMitigationById)
  .put(requirePermission(PERMISSIONS.MITIGATION_UPDATE, PERMISSIONS.MITIGATION_ASSIGN), updateMitigation)
  .delete(requirePermission(PERMISSIONS.MITIGATION_DELETE), deleteMitigation);

module.exports = router;

