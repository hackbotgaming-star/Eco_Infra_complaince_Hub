import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { CompliancePage } from './pages/CompliancePage';
import { MitigationPage } from './pages/MitigationPage';
import { TasksPage } from './pages/TasksPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Workspace */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><DashboardPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute module="projects"><ProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute module="projects"><ProjectDetailsPage /></ProtectedRoute>} />
            <Route path="/assessments" element={<ProtectedRoute module="assessments"><AssessmentsPage /></ProtectedRoute>} />
            <Route path="/approvals" element={<ProtectedRoute module="approvals"><ApprovalsPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute module="compliance"><CompliancePage /></ProtectedRoute>} />
            <Route path="/mitigation" element={<ProtectedRoute module="mitigation"><MitigationPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute module="tasks"><TasksPage /></ProtectedRoute>} />
            <Route path="/inspections" element={<ProtectedRoute module="inspections"><InspectionsPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute module="documents"><DocumentsPage /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute module="monitoring"><MonitoringPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute module="chat"><ChatPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute module="notifications"><NotificationsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute module="reports"><ReportsPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute module="audit-logs"><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute module="settings"><SettingsPage /></ProtectedRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
