const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.TASKS_VIEW), getTasks)
  .post(requirePermission(PERMISSIONS.TASKS_CREATE), createTask);

router
  .route('/:id')
  .get(requirePermission(PERMISSIONS.TASKS_VIEW), getTaskById)
  .put(requirePermission(PERMISSIONS.TASKS_UPDATE), updateTask)
  .delete(requirePermission(PERMISSIONS.TASKS_DELETE), deleteTask);

router.post('/:id/comments', requirePermission(PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_UPDATE), addTaskComment);

module.exports = router;

