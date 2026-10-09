const ComplianceRequirement = require('../models/ComplianceRequirement');
const Project = require('../models/Project');
const { logAudit } = require('../middleware/audit');

// Helper to update project compliance score
const updateProjectComplianceScore = async (projectId) => {
  try {
    const total = await ComplianceRequirement.countDocuments({ project: projectId });
    if (total === 0) return;
    const completed = await ComplianceRequirement.countDocuments({ project: projectId, status: 'Completed' });
    const score = Math.round((completed / total) * 100);
    await Project.findByIdAndUpdate(projectId, { compliancePercentage: score });
  } catch (err) {
    console.error('Failed to update project compliance score:', err.message);
  }
};

// @desc    Get all compliance requirements
// @route   GET /api/compliance
// @access  Private
exports.getComplianceRequirements = async (req, res, next) => {
  try {
    const { project, status, priority, regulatoryCategory, search } = req.query;
    let query = {};

    // Project-level scoping for non-admins
    if (req.user && req.user.role !== 'ADMIN') {
      const { getUserAccessibleProjectIds } = require('../middleware/rbac');
      const accessibleProjectIds = await getUserAccessibleProjectIds(req.user);
      if (project) {
        if (!accessibleProjectIds.some(id => id.toString() === project.toString())) {
          return res.status(403).json({
            success: false,
            error: 'Access Denied: You are not authorized to view compliance records for this project.',
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
    if (priority && priority !== 'all') query.priority = priority;
    if (regulatoryCategory && regulatoryCategory !== 'all') query.regulatoryCategory = regulatoryCategory;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { regulatoryCategory: { $regex: search, $options: 'i' } },
      ];
    }

    const requirements = await ComplianceRequirement.find(query)
      .populate('project', 'name code location projectType')
      .populate('responsiblePerson', 'name email role')
      .populate('relatedApproval', 'name referenceNumber')
      .sort('dueDate');

    res.status(200).json({ success: true, count: requirements.length, data: requirements });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single compliance requirement
// @route   GET /api/compliance/:id
// @access  Private
exports.getComplianceById = async (req, res, next) => {
  try {
    const requirement = await ComplianceRequirement.findById(req.params.id)
      .populate('project', 'name code location compliancePercentage')
      .populate('responsiblePerson', 'name email role department')
      .populate('relatedApproval', 'name referenceNumber authority expiryDate');

    if (!requirement) {
      return res.status(404).json({ success: false, error: 'Compliance requirement not found' });
    }

    res.status(200).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
};

// @desc    Create compliance requirement
// @route   POST /api/compliance
// @access  Private (Admin, PM, Environmental Officer)
exports.createCompliance = async (req, res, next) => {
  try {
    const requirement = await ComplianceRequirement.create(req.body);
    await updateProjectComplianceScore(requirement.project);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Compliance',
      recordId: requirement._id,
      recordTitle: requirement.title,
      details: `Created requirement under ${requirement.regulatoryCategory}`,
      newValue: requirement,
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
};

// @desc    Update compliance requirement
// @route   PUT /api/compliance/:id
// @access  Private
exports.updateCompliance = async (req, res, next) => {
  try {
    const existing = await ComplianceRequirement.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    const requirement = await ComplianceRequirement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name code')
      .populate('responsiblePerson', 'name email');

    await updateProjectComplianceScore(requirement.project._id || requirement.project);

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Compliance',
      recordId: requirement._id,
      recordTitle: requirement.title,
      details: `Status updated to ${requirement.status} (${requirement.progressPercentage}%)`,
      previousValue: existing,
      newValue: requirement,
    });

    res.status(200).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete compliance requirement
// @route   DELETE /api/compliance/:id
// @access  Private (Admin only)
exports.deleteCompliance = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only System Administrators can permanently delete compliance requirements.',
      });
    }

    const requirement = await ComplianceRequirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    const projectId = requirement.project;
    await requirement.deleteOne();
    await updateProjectComplianceScore(projectId);

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Compliance',
      recordId: requirement._id,
      recordTitle: requirement.title,
      details: `Deleted compliance requirement`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
