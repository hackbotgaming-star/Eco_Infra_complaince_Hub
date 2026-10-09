const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router.get('/', getUsers);
router.put('/:id', requirePermission(PERMISSIONS.ROLES_MANAGE, PERMISSIONS.USERS_MANAGE), updateUser);

module.exports = router;

