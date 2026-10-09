const Project = require('../models/Project');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Approval = require('../models/Approval');
const ComplianceRequirement = require('../models/ComplianceRequirement');
const MitigationMeasure = require('../models/MitigationMeasure');
const Task = require('../models/Task');
const Inspection = require('../models/Inspection');
const Document = require('../models/Document');
const MonitoringRecord = require('../models/MonitoringRecord');
const { logAudit } = require('../middleware/audit');

// @desc    Get all projects with filtering and search
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { search, projectType, status, riskLevel, location, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (projectType && projectType !== 'all') {
      query.projectType = projectType;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (riskLevel && riskLevel !== 'all') {
      query.riskLevel = riskLevel;
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Role-based project assignment filter:
    // Non-admins can only see projects they manage or are assigned to
    if (req.user && req.user.role !== 'ADMIN') {
      const assignmentFilter = {
        $or: [
          { manager: req.user._id },
          { environmentalOfficer: req.user._id },
          { complianceStaff: req.user._id },
          { assignedTeam: req.user._id },
        ],
      };
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, assignmentFilter] };
      } else {
        query.$or = assignmentFilter.$or;
      }
    }

    let sortOption = '-createdAt';
    if (sort === 'name') sortOption = 'name';
    if (sort === 'compliance-desc') sortOption = '-compliancePercentage';
    if (sort === 'compliance-asc') sortOption = 'compliancePercentage';
    if (sort === 'date-asc') sortOption = 'startDate';

    const projects = await Project.find(query)
      .populate('manager', 'name email role department')
      .populate('environmentalOfficer', 'name email role department')
      .populate('complianceStaff', 'name email role department')
      .populate('assignedTeam', 'name email role department')
      .sort(sortOption);

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project with detailed workspace aggregations
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email role department phone')
      .populate('environmentalOfficer', 'name email role department phone')
      .populate('complianceStaff', 'name email role department phone')
      .populate('assignedTeam', 'name email role department phone');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Project-level authorization check for non-admins
    if (req.user && req.user.role !== 'ADMIN') {
      const isManager = project.manager && project.manager._id.toString() === req.user._id.toString();
      const isEO = project.environmentalOfficer && project.environmentalOfficer._id.toString() === req.user._id.toString();
      const isStaff = project.complianceStaff && project.complianceStaff._id.toString() === req.user._id.toString();
      const isAssigned = project.assignedTeam && project.assignedTeam.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

      if (!isManager && !isEO && !isStaff && !isAssigned) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You do not have project-level authorization to access '${project.name}'.`,
          projectId: project._id,
        });
      }
    }

    // Parallel fetch related entity counts
    const [
      assessmentCount,
      approvalCount,
      complianceCount,
      mitigationCount,
      taskCount,
      inspectionCount,
      documentCount,
      monitoringCount,
      completedComplianceCount,
      overdueTaskCount,
    ] = await Promise.all([
      Assessment.countDocuments({ project: project._id }),
      Approval.countDocuments({ project: project._id }),
      ComplianceRequirement.countDocuments({ project: project._id }),
      MitigationMeasure.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id }),
      Inspection.countDocuments({ project: project._id }),
      Document.countDocuments({ project: project._id }),
      MonitoringRecord.countDocuments({ project: project._id }),
      ComplianceRequirement.countDocuments({ project: project._id, status: 'Completed' }),
      Task.countDocuments({ project: project._id, status: { $ne: 'Done' }, dueDate: { $lt: new Date() } }),
    ]);

    // Recalculate dynamic compliance if requirements exist
    let computedCompliance = project.compliancePercentage;
    if (complianceCount > 0) {
      computedCompliance = Math.round((completedComplianceCount / complianceCount) * 100);
      if (computedCompliance !== project.compliancePercentage) {
        project.compliancePercentage = computedCompliance;
        await project.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        counts: {
          assessments: assessmentCount,
          approvals: approvalCount,
          compliance: complianceCount,
          completedCompliance: completedComplianceCount,
          mitigation: mitigationCount,
          tasks: taskCount,
          overdueTasks: overdueTaskCount,
          inspections: inspectionCount,
          documents: documentCount,
          monitoring: monitoringCount,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin / Project Manager)
exports.createProject = async (req, res, next) => {
  try {
    // If designated roles are not specified, assign organizational personnel so all 4 dashboard personas have immediate project access
    if (!req.body.manager) {
      const pmUser = await User.findOne({ role: 'PROJECT_MANAGER' });
      req.body.manager = pmUser ? pmUser._id : req.user.id;
    }
    if (!req.body.environmentalOfficer) {
      const eoUser = await User.findOne({ role: 'ENVIRONMENTAL_OFFICER' });
      if (eoUser) req.body.environmentalOfficer = eoUser._id;
    }
    if (!req.body.complianceStaff) {
      const csUser = await User.findOne({ role: 'COMPLIANCE_STAFF' });
      if (csUser) req.body.complianceStaff = csUser._id;
    }

    // Sync assignedTeam with designated officers
    const teamSet = new Set(
      Array.isArray(req.body.assignedTeam) ? req.body.assignedTeam.map(String) : []
    );
    if (req.body.manager) teamSet.add(String(req.body.manager));
    if (req.body.environmentalOfficer) teamSet.add(String(req.body.environmentalOfficer));
    if (req.body.complianceStaff) teamSet.add(String(req.body.complianceStaff));
    req.body.assignedTeam = Array.from(teamSet);

    let project = await Project.create(req.body);

    project = await Project.findById(project._id)
      .populate('manager', 'name email role department')
      .populate('environmentalOfficer', 'name email role department')
      .populate('complianceStaff', 'name email role department')
      .populate('assignedTeam', 'name email role department');

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Projects',
      recordId: project._id,
      recordTitle: project.name,
      details: `Created new project [${project.code}] in ${project.location} with designated team assignments`,
      newValue: project,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin / Project Manager)
exports.updateProject = async (req, res, next) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (req.body.manager || req.body.environmentalOfficer || req.body.complianceStaff || req.body.assignedTeam) {
      const teamSet = new Set(
        Array.isArray(req.body.assignedTeam)
          ? req.body.assignedTeam.map(String)
          : (existing.assignedTeam || []).map(String)
      );
      if (req.body.manager) teamSet.add(String(req.body.manager));
      if (req.body.environmentalOfficer) teamSet.add(String(req.body.environmentalOfficer));
      if (req.body.complianceStaff) teamSet.add(String(req.body.complianceStaff));
      req.body.assignedTeam = Array.from(teamSet);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'name email role department')
      .populate('environmentalOfficer', 'name email role department')
      .populate('complianceStaff', 'name email role department')
      .populate('assignedTeam', 'name email role department');

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'Projects',
      recordId: project._id,
      recordTitle: project.name,
      details: `Updated project parameters and assigned personnel`,
      previousValue: existing,
      newValue: project,
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Sensitive action: Only System Administrators can permanently delete projects
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Permanent deletion of projects is restricted to System Administrators.',
      });
    }

    await project.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Projects',
      recordId: project._id,
      recordTitle: project.name,
      details: `Project deleted along with associated references`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
