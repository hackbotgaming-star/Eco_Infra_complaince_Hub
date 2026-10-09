const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requirePermission, requireProjectAccess } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.PROJECTS_VIEW), getProjects)
  .post(requirePermission(PERMISSIONS.PROJECTS_CREATE), createProject);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.PROJECTS_VIEW), requireProjectAccess('id'), getProjectById)
  .put(requirePermission(PERMISSIONS.PROJECTS_UPDATE), requireProjectAccess('id'), updateProject)
  .delete(requirePermission(PERMISSIONS.PROJECTS_DELETE, PERMISSIONS.PROJECTS_ARCHIVE), deleteProject);

module.exports = router;

