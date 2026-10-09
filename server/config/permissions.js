// Role-Based Access Control (RBAC) Permissions Definition
// Eco Infra Compliance Hub

const PERMISSIONS = {
  // Projects
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_ARCHIVE: 'projects.archive',
  PROJECTS_DELETE: 'projects.delete',

  // Assessments
  ASSESSMENTS_VIEW: 'assessments.view',
  ASSESSMENTS_CREATE: 'assessments.create',
  ASSESSMENTS_UPDATE: 'assessments.update',
  ASSESSMENTS_REVIEW: 'assessments.review',
  ASSESSMENTS_DELETE: 'assessments.delete',

  // Approvals & Permits
  APPROVALS_VIEW: 'approvals.view',
  APPROVALS_SUBMIT: 'approvals.submit',
  APPROVALS_REVIEW: 'approvals.review',
  APPROVALS_APPROVE: 'approvals.approve',
  APPROVALS_DELETE: 'approvals.delete',

  // Compliance Requirements
  COMPLIANCE_VIEW: 'compliance.view',
  COMPLIANCE_CREATE: 'compliance.create',
  COMPLIANCE_UPDATE: 'compliance.update',
  COMPLIANCE_VERIFY: 'compliance.verify',
  COMPLIANCE_DELETE: 'compliance.delete',

  // Mitigation Measures
  MITIGATION_VIEW: 'mitigation.view',
  MITIGATION_CREATE: 'mitigation.create',
  MITIGATION_UPDATE: 'mitigation.update',
  MITIGATION_ASSIGN: 'mitigation.assign',
  MITIGATION_DELETE: 'mitigation.delete',

  // Tasks
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE: 'tasks.update',
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_DELETE: 'tasks.delete',

  // Inspections
  INSPECTIONS_VIEW: 'inspections.view',
  INSPECTIONS_CREATE: 'inspections.create',
  INSPECTIONS_UPDATE: 'inspections.update',
  INSPECTIONS_REVIEW: 'inspections.review',
  INSPECTIONS_DELETE: 'inspections.delete',

  // Documents
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_ARCHIVE: 'documents.archive',
  DOCUMENTS_DELETE: 'documents.delete',

  // Environmental Monitoring
  MONITORING_VIEW: 'monitoring.view',
  MONITORING_RECORD: 'monitoring.record',
  MONITORING_UPDATE: 'monitoring.update',
  MONITORING_DELETE: 'monitoring.delete',

  // Notifications
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_EXPORT: 'reports.export',

  // Audit Logs
  AUDIT_LOGS_VIEW: 'auditLogs.view',

  // Team Discussion & Doubts
  CHAT_VIEW: 'chat.view',
  CHAT_SEND: 'chat.send',
  CHAT_RESOLVE: 'chat.resolve',

  // Administration & Governance
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  SETTINGS_MANAGE: 'settings.manage',
};

const ROLE_PERMISSIONS = {
  ADMIN: [
    '*', // Full system administrator access across all modules
  ],
  PROJECT_MANAGER: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.ASSESSMENTS_VIEW,
    PERMISSIONS.ASSESSMENTS_REVIEW,
    PERMISSIONS.APPROVALS_VIEW,
    PERMISSIONS.APPROVALS_SUBMIT,
    PERMISSIONS.APPROVALS_REVIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_UPDATE,
    PERMISSIONS.MITIGATION_VIEW,
    PERMISSIONS.MITIGATION_ASSIGN,
    PERMISSIONS.MITIGATION_UPDATE,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_REVIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.MONITORING_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_RESOLVE,
  ],
  ENVIRONMENTAL_OFFICER: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.ASSESSMENTS_VIEW,
    PERMISSIONS.ASSESSMENTS_CREATE,
    PERMISSIONS.ASSESSMENTS_UPDATE,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_UPDATE,
    PERMISSIONS.MITIGATION_VIEW,
    PERMISSIONS.MITIGATION_CREATE,
    PERMISSIONS.MITIGATION_UPDATE,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_CREATE,
    PERMISSIONS.INSPECTIONS_UPDATE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.MONITORING_VIEW,
    PERMISSIONS.MONITORING_RECORD,
    PERMISSIONS.MONITORING_UPDATE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_RESOLVE,
  ],
  COMPLIANCE_STAFF: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.ASSESSMENTS_VIEW,
    PERMISSIONS.ASSESSMENTS_REVIEW,
    PERMISSIONS.APPROVALS_VIEW,
    PERMISSIONS.APPROVALS_REVIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_UPDATE,
    PERMISSIONS.COMPLIANCE_VERIFY,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_REVIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.CHAT_RESOLVE,
  ],
};

const ROLE_MODULES = {
  ADMIN: [
    'dashboard',
    'projects',
    'assessments',
    'approvals',
    'compliance',
    'mitigation',
    'tasks',
    'inspections',
    'documents',
    'monitoring',
    'notifications',
    'reports',
    'audit-logs',
    'settings',
    'chat',
  ],
  PROJECT_MANAGER: [
    'dashboard',
    'projects',
    'assessments',
    'approvals',
    'compliance',
    'mitigation',
    'tasks',
    'inspections',
    'documents',
    'monitoring',
    'notifications',
    'reports',
    'audit-logs',
    'chat',
  ],
  ENVIRONMENTAL_OFFICER: [
    'dashboard',
    'projects',
    'assessments',
    'compliance',
    'mitigation',
    'tasks',
    'inspections',
    'documents',
    'monitoring',
    'notifications',
    'reports',
    'chat',
  ],
  COMPLIANCE_STAFF: [
    'dashboard',
    'projects',
    'assessments',
    'approvals',
    'compliance',
    'tasks',
    'inspections',
    'documents',
    'notifications',
    'reports',
    'audit-logs',
    'chat',
  ],
};

const DEMO_PERSONAS = {
  ADMIN: {
    key: 'ADMIN',
    name: 'Dr. Vikram Sengupta',
    shortName: 'Dr. Sengupta',
    roleLabel: 'Admin',
    email: 'admin@ecoinfracompliance.io',
    department: 'Regulatory Compliance & Executive Directorate',
    badge: 'System Administrator',
  },
  PROJECT_MANAGER: {
    key: 'PROJECT_MANAGER',
    name: 'Sarah Jenkins, PMP',
    shortName: 'Sarah Jenkins',
    roleLabel: 'Project Mgr',
    email: 'pm@ecoinfracompliance.io',
    department: 'Mega Infrastructure Project Delivery',
    badge: 'Project Manager',
  },
  ENVIRONMENTAL_OFFICER: {
    key: 'ENVIRONMENTAL_OFFICER',
    name: 'Arunabh Sharma',
    shortName: 'Arunabh Sharma',
    roleLabel: 'Enviro Officer',
    email: 'officer@ecoinfracompliance.io',
    department: 'Environmental Science, Auditing & Ecology',
    badge: 'Environmental Officer',
  },
  COMPLIANCE_STAFF: {
    key: 'COMPLIANCE_STAFF',
    name: 'Elena Rodriguez',
    shortName: 'Elena Rodriguez',
    roleLabel: 'Compliance Staff',
    email: 'staff@ecoinfracompliance.io',
    department: 'Field Verification & Documentation Office',
    badge: 'Compliance Staff',
  },
};

const hasPermission = (role, permission) => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
};

const hasAnyPermission = (role, permissionsList = []) => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  return permissionsList.some((p) => permissions.includes(p));
};

const canAccessModule = (role, moduleName) => {
  if (!role) return false;
  const allowed = ROLE_MODULES[role] || [];
  return allowed.includes(moduleName);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_MODULES,
  DEMO_PERSONAS,
  hasPermission,
  hasAnyPermission,
  canAccessModule,
};
