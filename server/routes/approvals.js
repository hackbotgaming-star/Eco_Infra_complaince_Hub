const express = require('express');
const router = express.Router();
const {
  getApprovals,
  getApprovalById,
  createApproval,
  updateApproval,
  deleteApproval,
} = require('../controllers/approvalController');
const { protect } = require('../middleware/auth');
const { requirePermission, enforceApprovalWorkflow } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.APPROVALS_VIEW), getApprovals)
  .post(requirePermission(PERMISSIONS.APPROVALS_SUBMIT), createApproval);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.APPROVALS_VIEW), getApprovalById)
  .put(
    requirePermission(PERMISSIONS.APPROVALS_REVIEW, PERMISSIONS.APPROVALS_APPROVE),
    enforceApprovalWorkflow('Approval', 'submittedBy'),
    updateApproval
  )
  .delete(requirePermission(PERMISSIONS.APPROVALS_DELETE), deleteApproval);

module.exports = router;

