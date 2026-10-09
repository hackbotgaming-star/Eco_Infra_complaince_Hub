const Assessment = require('../models/Assessment');
const { logAudit } = require('../middleware/audit');
const { getUserAccessibleProjectIds } = require('../middleware/rbac');

// @desc    Get all assessments with optional project filter
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res, next) => {
  try {
    const { project, status, riskLevel, search } = req.query;
    let query = {};

    // Project-level scoping for non-admins
    if (req.user && req.user.role !== 'ADMIN') {
      const accessibleProjectIds = await getUserAccessibleProjectIds(req.user);
      if (project) {
        if (!accessibleProjectIds.some(id => id.toString() === project.toString())) {
          return res.status(403).json({
            success: false,
            error: 'Access Denied: You are not authorized to view assessments for this project.',
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
    if (riskLevel && riskLevel !== 'all') query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { assessmentType: { $regex: search, $options: 'i' } },
        { findings: { $regex: search, $options: 'i' } },
      ];
    }

    const assessments = await Assessment.find(query)
      .populate('project', 'name code location projectType')
      .populate('responsibleOfficer', 'name email role')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('project', 'name code location manager assignedTeam')
      .populate('responsibleOfficer', 'name email role department');

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    // Verify project authorization
    if (req.user && req.user.role !== 'ADMIN' && assessment.project) {
      const isManager = assessment.project.manager && assessment.project.manager.toString() === req.user._id.toString();
      const isAssigned = assessment.project.assignedTeam && assessment.project.assignedTeam.some(
        id => id.toString() === req.user._id.toString()
      );
      if (!isManager && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You are not authorized to view this assessment.',
        });
      }
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

// @desc    Create assessment
// @route   POST /api/assessments
// @access  Private (Admin, PM, Environmental Officer)
exports.createAssessment = async (req, res, next) => {
  try {
    if (!req.body.responsibleOfficer) {
      req.body.responsibleOfficer = req.user.id;
    }

    const assessment = await Assessment.create(req.body);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Assessments',
      recordId: assessment._id,
      recordTitle: assessment.title,
      details: `Created assessment under category ${assessment.environmentalCategory}`,
      newValue: assessment,
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Admin, PM, Environmental Officer, Compliance Staff)
exports.updateAssessment = async (req, res, next) => {
  try {
    const existing = await Assessment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    // Independent review & prohibited self-approval rule
    if (req.body.status === 'Approved') {
      if (req.user.role === 'ENVIRONMENTAL_OFFICER') {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Environmental Officers cannot grant formal approvals. Independent review and sign-off is required by compliance governance policy.',
        });
      }

      if (existing.responsibleOfficer && existing.responsibleOfficer.toString() === req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Prohibited Self-Approval: You cannot approve your own assessment submission. An independent Project Manager, Compliance Officer, or Administrator must review and sign off.',
        });
      }
    }

    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name code')
      .populate('responsibleOfficer', 'name email');

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Assessments',
      recordId: assessment._id,
      recordTitle: assessment.title,
      details: `Updated assessment status to ${assessment.status}`,
      previousValue: existing,
      newValue: assessment,
    });

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Admin only)
exports.deleteAssessment = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only System Administrators can permanently delete assessments.',
      });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    await assessment.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Assessments',
      recordId: assessment._id,
      recordTitle: assessment.title,
      details: `Assessment deleted`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

