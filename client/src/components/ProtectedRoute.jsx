import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './AccessDenied';

export const ProtectedRoute = ({
  module,
  permission,
  roles,
  children,
}) => {
  const { user, isAuthenticated, loading, canAccess, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role restriction if provided
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <AccessDenied
        moduleName={module}
        customMessage={`This module is restricted to roles: [${roles.join(', ')}].`}
      />
    );
  }

  // Check module access restriction if provided
  if (module && !canAccess(module)) {
    return (
      <AccessDenied
        moduleName={module}
        customMessage={`Your role '${user?.role?.replace('_', ' ')}' does not have access permissions for the ${module} workspace.`}
      />
    );
  }

  // Check granular permission restriction if provided
  if (permission && !hasPermission(permission)) {
    return (
      <AccessDenied
        moduleName={module}
        requiredPermission={permission}
      />
    );
  }

  return children ? children : <Outlet />;
};
