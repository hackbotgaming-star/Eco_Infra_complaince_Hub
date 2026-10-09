const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  toggleResolve,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(requirePermission(PERMISSIONS.CHAT_VIEW), getMessages)
  .post(requirePermission(PERMISSIONS.CHAT_SEND), sendMessage);

router
  .route('/:id/resolve')
  .patch(requirePermission(PERMISSIONS.CHAT_SEND), toggleResolve);

router
  .route('/:id')
  .delete(deleteMessage);

module.exports = router;
