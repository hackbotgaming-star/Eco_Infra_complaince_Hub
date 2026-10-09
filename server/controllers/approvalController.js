const Approval = require('../models/Approval');
const { logAudit } = require('../middleware/audit');
const { getUserAccessibleProjectIds } = require('../middleware/rbac');

// @desc    Get all approvals with optional project and status filter
// @route   GET /api/approvals
// @access  Private
exports.getApprovals = async (req, res, next) => {
  try {
    const { project, status, approvalType, search, expiringSoon } = req.query;
    let query = {};

    // Scope to accessible projects for non-admins
    if (req.user && req.user.role !== 'ADMIN') {
      const accessibleProjectIds = await getUserAccessibleProjectIds(req.user);
      if (project) {
        if (!accessibleProjectIds.some(id => id.toString() === project.toString())) {
          return res.status(403).json({
            success: false,
            error: 'Access Denied: You are not authorized to view clearances for this project.',
          });
        }
        query.project = project;
      } else {
        query.project = { $in: accessibleProjectIds };
      }
    } else if (project) {
      query.project = project;
    }

    if (status && status !== 'all') query.status = status;
    if (approvalType && approvalType !== 'all') query.approvalType = approvalType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { authority: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (expiringSoon === 'true') {
      const now = new Date();
      const in60Days = new Date();
      in60Days.setDate(now.getDate() + 60);
      query.expiryDate = { $gte: now, $lte: in60Days };
    }

    const approvals = await Approval.find(query)
      .populate('project', 'name code location projectType')
      .sort('expiryDate');

    // Add virtual flag for UI
    const now = new Date();
    const formatted = approvals.map(app => {
      const daysLeft = Math.ceil((new Date(app.expiryDate) - now) / (1000 * 60 * 60 * 24));
      return {
        ...app.toObject(),
        daysLeft,
        isExpiringSoon: daysLeft > 0 && daysLeft <= 60,
        isExpired: daysLeft <= 0,
      };
    });

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single approval
// @route   GET /api/approvals/:id
// @access  Private
exports.getApprovalById = async (req, res, next) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate('project', 'name code location manager assignedTeam');

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval record not found' });
    }

    // Project-level authorization check
    if (req.user && req.user.role !== 'ADMIN' && approval.project) {
      const isManager = approval.project.manager && approval.project.manager.toString() === req.user._id.toString();
      const isAssigned = approval.project.assignedTeam && approval.project.assignedTeam.some(
        id => id.toString() === req.user._id.toString()
      );
      if (!isManager && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You are not authorized to view clearances for this project.',
        });
      }
    }

    const now = new Date();
    const daysLeft = Math.ceil((new Date(approval.expiryDate) - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      data: {
        ...approval.toObject(),
        daysLeft,
        isExpiringSoon: daysLeft > 0 && daysLeft <= 60,
        isExpired: daysLeft <= 0,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create approval
// @route   POST /api/approvals
// @access  Private (Admin, PM, Environmental Officer)
exports.createApproval = async (req, res, next) => {
  try {
    const approvalData = {
      ...req.body,
      submittedBy: req.user._id,
    };

    const approval = await Approval.create(approvalData);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Approvals',
      recordId: approval._id,
      recordTitle: approval.name,
      details: `Registered approval/permit issued by ${approval.authority}`,
      newValue: approval,
    });

    res.status(201).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
};

// @desc    Update approval
// @route   PUT /api/approvals/:id
// @access  Private (Admin, PM, Environmental Officer, Compliance Staff)
exports.updateApproval = async (req, res, next) => {
  try {
    const existing = await Approval.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }

    // Role-based restrictions on approving
    if (req.body.status === 'Approved') {
      if (req.user.role === 'ENVIRONMENTAL_OFFICER') {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Environmental Officers cannot grant formal approvals. Independent review and approval sign-off is required.',
        });
      }

      if (existing.submittedBy && existing.submittedBy.toString() === req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Prohibited Self-Approval: You cannot approve your own clearance submission. Independent review is required.',
        });
      }

      req.body.approvedBy = req.user._id;
    }

    const approval = await Approval.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('project', 'name code');

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Approvals',
      recordId: approval._id,
      recordTitle: approval.name,
      details: `Updated approval status to ${approval.status}`,
      previousValue: existing,
      newValue: approval,
    });

    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete approval
// @route   DELETE /api/approvals/:id
// @access  Private (Admin only)
exports.deleteApproval = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only System Administrators can permanently delete regulatory permits and approvals.',
      });
    }

    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }

    await approval.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Approvals',
      recordId: approval._id,
      recordTitle: approval.name,
      details: `Deleted approval reference ${approval.referenceNumber}`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

