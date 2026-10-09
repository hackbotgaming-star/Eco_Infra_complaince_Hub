const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const { requirePermission, enforceApprovalWorkflow } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.ASSESSMENTS_VIEW), getAssessments)
  .post(requirePermission(PERMISSIONS.ASSESSMENTS_CREATE), createAssessment);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.ASSESSMENTS_VIEW), getAssessmentById)
  .put(
    requirePermission(PERMISSIONS.ASSESSMENTS_UPDATE, PERMISSIONS.ASSESSMENTS_REVIEW),
    enforceApprovalWorkflow('Assessment', 'responsibleOfficer'),
    updateAssessment
  )
  .delete(requirePermission(PERMISSIONS.ASSESSMENTS_DELETE), deleteAssessment);

module.exports = router;

