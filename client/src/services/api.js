// Centralized API client service for Eco Infra Compliance Hub
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ecohub_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !res.url?.includes('/auth/login') && !res.url?.includes('/auth/register')) {
      localStorage.removeItem('ecohub_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || `HTTP error! Status: ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },
  demoSwitch: async (role) => {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  updateUser: async (id, data) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Projects
  getProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/projects?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getProjectById: async (id) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createProject: async (data) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateProject: async (id, data) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteProject: async (id) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Assessments
  getAssessments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/assessments?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createAssessment: async (data) => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateAssessment: async (id, data) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteAssessment: async (id) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Approvals
  getApprovals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/approvals?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createApproval: async (data) => {
    const res = await fetch(`${API_BASE}/approvals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateApproval: async (id, data) => {
    const res = await fetch(`${API_BASE}/approvals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteApproval: async (id) => {
    const res = await fetch(`${API_BASE}/approvals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Compliance Requirements
  getCompliance: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/compliance?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createCompliance: async (data) => {
    const res = await fetch(`${API_BASE}/compliance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateCompliance: async (id, data) => {
    const res = await fetch(`${API_BASE}/compliance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteCompliance: async (id) => {
    const res = await fetch(`${API_BASE}/compliance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Mitigation Measures
  getMitigation: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/mitigation?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createMitigation: async (data) => {
    const res = await fetch(`${API_BASE}/mitigation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateMitigation: async (id, data) => {
    const res = await fetch(`${API_BASE}/mitigation/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateMitigationStatus: async (id, data) => {
    const res = await fetch(`${API_BASE}/mitigation/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteMitigation: async (id) => {
    const res = await fetch(`${API_BASE}/mitigation/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Tasks
  getTasks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tasks?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createTask: async (data) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateTask: async (id, data) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateTaskStatus: async (id, data) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  addTaskComment: async (id, commentData) => {
    const payload =
      typeof commentData === 'object' && commentData !== null
        ? commentData
        : { comment: commentData };
    const res = await fetch(`${API_BASE}/tasks/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Inspections
  getInspections: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inspections?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createInspection: async (data) => {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateInspection: async (id, data) => {
    const res = await fetch(`${API_BASE}/inspections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteInspection: async (id) => {
    const res = await fetch(`${API_BASE}/inspections/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Documents
  getDocuments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/documents?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('ecohub_token');
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(res);
  },
  deleteDocument: async (id) => {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  downloadDocument: (id) => {
    const token = localStorage.getItem('ecohub_token');
    return `${API_BASE}/documents/download/${id}?token=${encodeURIComponent(token || '')}`;
  },

  // Monitoring
  getMonitoring: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/monitoring?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getMonitoringTrends: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/monitoring/trends?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createMonitoring: async (data) => {
    const res = await fetch(`${API_BASE}/monitoring`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteMonitoring: async (id) => {
    const res = await fetch(`${API_BASE}/monitoring/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reports & Analytics
  getDashboardAnalytics: async () => {
    const res = await fetch(`${API_BASE}/reports/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getProjectSummaryReport: async (id) => {
    const res = await fetch(`${API_BASE}/reports/project-summary/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Team Discussion & Doubts
  getMessages: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/messages?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  sendMessage: async (data) => {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  toggleResolveMessage: async (id) => {
    const res = await fetch(`${API_BASE}/messages/${id}/resolve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  deleteMessage: async (id) => {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
