const Project = require('../models/Project');
const Approval = require('../models/Approval');
const ComplianceRequirement = require('../models/ComplianceRequirement');
const Task = require('../models/Task');
const Inspection = require('../models/Inspection');
const Document = require('../models/Document');
const MonitoringRecord = require('../models/MonitoringRecord');
const Assessment = require('../models/Assessment');
const MitigationMeasure = require('../models/MitigationMeasure');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard analytics, KPIs, alerts and chart datasets
// @route   GET /api/reports/analytics
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const in60Days = new Date();
    in60Days.setDate(now.getDate() + 60);

    // Parallel fetch for optimal performance
    const [
      totalProjects,
      activeProjects,
      compliantProjects,
      totalApprovals,
      pendingApprovals,
      expiringApprovalsList,
      totalTasks,
      overdueTasksList,
      scheduledInspectionsList,
      totalDocuments,
      totalAssessments,
      totalMitigations,
      complianceStatusCounts,
      taskStatusCounts,
      approvalStatusCounts,
      projectsList,
      recentActivities,
      monitoringRecords,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'Active' }),
      Project.countDocuments({ compliancePercentage: { $gte: 80 } }),
      Approval.countDocuments(),
      Approval.countDocuments({ status: { $in: ['Pending', 'Submitted'] } }),
      Approval.find({ expiryDate: { $gte: now, $lte: in60Days } })
        .populate('project', 'name code')
        .limit(5),
      Task.countDocuments(),
      Task.find({ status: { $ne: 'Done' }, dueDate: { $lt: now } })
        .populate('project', 'name code')
        .populate('assignedTo', 'name email')
        .limit(5),
      Inspection.find({ status: { $in: ['Scheduled', 'In Progress'] } })
        .populate('project', 'name code')
        .populate('inspector', 'name email')
        .limit(5),
      Document.countDocuments(),
      Assessment.countDocuments(),
      MitigationMeasure.countDocuments(),
      // Aggregation for compliance status breakdown
      ComplianceRequirement.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Aggregation for task status breakdown
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Aggregation for approval status breakdown
      Approval.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Sector progress
      Project.find().select('name code projectType status compliancePercentage riskLevel location').limit(8),
      // Live activity feed
      AuditLog.find().sort('-timestamp').limit(8),
      // Monitoring compliance counts
      MonitoringRecord.aggregate([
        { $group: { _id: '$complianceStatus', count: { $sum: 1 } } }
      ])
    ]);

    // Format chart datasets
    const complianceStatusData = [
      { name: 'Completed', value: 0, color: '#10b981' },
      { name: 'In Progress', value: 0, color: '#3b82f6' },
      { name: 'Under Review', value: 0, color: '#f59e0b' },
      { name: 'Not Started', value: 0, color: '#94a3b8' },
      { name: 'Overdue', value: 0, color: '#ef4444' },
    ];
    complianceStatusCounts.forEach(c => {
      const match = complianceStatusData.find(item => item.name.toLowerCase() === c._id.toLowerCase());
      if (match) match.value = c.count;
    });

    const taskStatusData = [
      { name: 'Done', count: 0, fill: '#10b981' },
      { name: 'In Progress', count: 0, fill: '#3b82f6' },
      { name: 'In Review', count: 0, fill: '#f59e0b' },
      { name: 'Todo', count: 0, fill: '#64748b' },
    ];
    taskStatusCounts.forEach(t => {
      const match = taskStatusData.find(item => item.name.toLowerCase() === t._id.toLowerCase());
      if (match) match.count = t.count;
    });

    const approvalStatusData = [
      { name: 'Approved', value: 0, fill: '#10b981' },
      { name: 'Pending', value: 0, fill: '#f59e0b' },
      { name: 'Submitted', value: 0, fill: '#3b82f6' },
      { name: 'Expired', value: 0, fill: '#ef4444' },
    ];
    approvalStatusCounts.forEach(a => {
      const match = approvalStatusData.find(item => item.name.toLowerCase() === a._id.toLowerCase());
      if (match) match.value = a.count;
    });

    // Monthly compliance trends simulation data
    const monthlyComplianceTrends = [
      { month: 'May', compliance: 68, target: 80, audits: 4 },
      { month: 'Jun', compliance: 74, target: 80, audits: 6 },
      { month: 'Jul', compliance: 71, target: 80, audits: 5 },
      { month: 'Aug', compliance: 82, target: 85, audits: 8 },
      { month: 'Sep', compliance: 88, target: 85, audits: 9 },
      { month: 'Oct', compliance: 92, target: 90, audits: 11 },
    ];

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalProjects,
          activeProjects,
          compliantProjects,
          pendingApprovals,
          totalApprovals,
          overdueTasksCount: overdueTasksList.length,
          totalTasks,
          scheduledInspectionsCount: scheduledInspectionsList.length,
          totalDocuments,
          totalAssessments,
          totalMitigations,
        },
        charts: {
          complianceStatus: complianceStatusData,
          taskStatus: taskStatusData,
          approvalStatus: approvalStatusData,
          monthlyTrends: monthlyComplianceTrends,
          projectSectorBreakdown: projectsList.map(p => ({
            name: p.code,
            fullName: p.name,
            compliance: p.compliancePercentage,
            risk: p.riskLevel,
            type: p.projectType,
          })),
          monitoringHealth: monitoringRecords.map(m => ({
            status: m._id,
            count: m.count,
          })),
        },
        alerts: {
          expiringApprovals: expiringApprovalsList,
          overdueTasks: overdueTasksList,
          scheduledInspections: scheduledInspectionsList,
        },
        recentActivity: recentActivities,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate printable/exportable project compliance summary report
// @route   GET /api/reports/project-summary/:id
// @access  Private
exports.getProjectReport = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email role department');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const [
      assessments,
      approvals,
      compliance,
      mitigations,
      tasks,
      inspections,
      monitoring,
      documents,
    ] = await Promise.all([
      Assessment.find({ project: project._id }),
      Approval.find({ project: project._id }),
      ComplianceRequirement.find({ project: project._id }),
      MitigationMeasure.find({ project: project._id }),
      Task.find({ project: project._id }),
      Inspection.find({ project: project._id }),
      MonitoringRecord.find({ project: project._id }).sort('-monitoringDate').limit(20),
      Document.find({ project: project._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        project,
        generatedAt: new Date(),
        summary: {
          totalRequirements: compliance.length,
          completedRequirements: compliance.filter(c => c.status === 'Completed').length,
          complianceScore: project.compliancePercentage,
          approvalsTotal: approvals.length,
          approvalsApproved: approvals.filter(a => a.status === 'Approved').length,
          openViolations: inspections.reduce((acc, ins) => acc + (ins.violations ? ins.violations.filter(v => v.status === 'Open').length : 0), 0),
          implementedMitigations: mitigations.filter(m => m.status === 'Implemented' || m.status === 'Verified').length,
        },
        assessments,
        approvals,
        compliance,
        mitigations,
        tasks,
        inspections,
        monitoring,
        documents,
      }
    });
  } catch (err) {
    next(err);
  }
};
