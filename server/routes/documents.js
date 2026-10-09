const express = require('express');
const router = express.Router();
const {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');
const upload = require('../middleware/upload');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.DOCUMENTS_VIEW), getDocuments)
  .post(requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD), upload.single('file'), uploadDocument);

router
  .route('/download/:id')
  .get(requirePermission(PERMISSIONS.DOCUMENTS_DOWNLOAD, PERMISSIONS.DOCUMENTS_VIEW), downloadDocument);

router
  .route('/:id')
  .delete(requirePermission(PERMISSIONS.DOCUMENTS_DELETE, PERMISSIONS.DOCUMENTS_ARCHIVE), deleteDocument);

module.exports = router;

