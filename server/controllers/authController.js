const User = require('../models/User');
const { logAudit } = require('../middleware/audit');
const { ROLE_PERMISSIONS, ROLE_MODULES, DEMO_PERSONAS } = require('../config/permissions');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const assignedRole = role || 'COMPLIANCE_STAFF';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Environmental Compliance Unit',
      phone: phone || '',
    });

    const token = user.getSignedJwtToken();

    await logAudit({
      req: { user, headers: req.headers, socket: req.socket },
      action: 'REGISTER',
      module: 'Auth',
      recordId: user._id,
      recordTitle: user.name,
      details: `New user registration with role ${user.role}`,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        accessibleModules: ROLE_MODULES[user.role] || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
    }

    // Support both domain variants seamlessly
    const altEmail = email.includes('@ecoinfracompliance.io')
      ? email.replace('@ecoinfracompliance.io', '@envirotrack.io')
      : email.replace('@envirotrack.io', '@ecoinfracompliance.io');

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { email: altEmail.toLowerCase() }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    const token = user.getSignedJwtToken();

    await logAudit({
      req: { user, headers: req.headers, socket: req.socket },
      action: 'LOGIN',
      module: 'Auth',
      recordId: user._id,
      recordTitle: user.name,
      details: `User logged in from ${req.ip || 'remote'}`,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        accessibleModules: ROLE_MODULES[user.role] || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        accessibleModules: ROLE_MODULES[user.role] || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Safe 1-Click Demo Persona Switcher (Development/Demo Mode)
// @route   POST /api/auth/demo-switch
// @access  Public (Safe Demo Helper)
exports.demoSwitch = async (req, res, next) => {
  try {
    const { role } = req.body;
    const personaMeta = DEMO_PERSONAS[role];

    if (!personaMeta) {
      return res.status(400).json({
        success: false,
        error: `Invalid demo persona role '${role}'. Supported roles: ADMIN, PROJECT_MANAGER, ENVIRONMENTAL_OFFICER, COMPLIANCE_STAFF`,
      });
    }

    // Lookup demo user by role
    let user = await User.findOne({ role });

    // Fallback search by email
    if (!user) {
      user = await User.findOne({ email: personaMeta.email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Demo persona account for role '${role}' not initialized in database.`,
      });
    }

    const token = user.getSignedJwtToken();

    await logAudit({
      req: { user, headers: req.headers, socket: req.socket },
      action: 'SWITCH_PERSONA',
      module: 'Auth',
      recordId: user._id,
      recordTitle: user.name,
      details: `Switched demo persona to ${personaMeta.name} (${personaMeta.roleLabel})`,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        accessibleModules: ROLE_MODULES[user.role] || [],
        persona: personaMeta,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (for assignment & admin)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort('name');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role or status (Admin only, prevent self-role escalation)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Security check: Only Admin can update users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only System Administrators can modify user roles or permissions.',
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Security check: Prevent changing self-role if it would lock out Admin
    if (req.user._id.toString() === req.params.id && req.body.role && req.body.role !== 'ADMIN') {
      const otherAdmins = await User.countDocuments({ role: 'ADMIN', _id: { $ne: req.user._id } });
      if (otherAdmins === 0) {
        return res.status(400).json({
          success: false,
          error: 'Self-Role Escalation / Demotion Prevented: Cannot remove the last active System Administrator.',
        });
      }
    }

    const { role, department, isActive, phone } = req.body;
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (department !== undefined) updateFields.department = department;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (phone !== undefined) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    await logAudit({
      req,
      action: 'UPDATE_ROLE',
      module: 'Settings',
      recordId: user._id,
      recordTitle: user.name,
      details: `User permissions updated. Role: ${user.role}, Active: ${user.isActive}`,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
