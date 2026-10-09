import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  checkPermission,
  checkAnyPermission,
  checkModuleAccess,
  DEMO_PERSONAS,
  ROLE_PERMISSIONS,
  ROLE_MODULES,
} from '../utils/permissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecohub_token') || null);
  const [loading, setLoading] = useState(true);

  // Demo account credentials
  const demoAccounts = {
    ADMIN: { email: 'admin@ecoinfracompliance.io', password: 'admin123' },
    PROJECT_MANAGER: { email: 'pm@ecoinfracompliance.io', password: 'pm123456' },
    ENVIRONMENTAL_OFFICER: { email: 'officer@ecoinfracompliance.io', password: 'officer123' },
    COMPLIANCE_STAFF: { email: 'staff@ecoinfracompliance.io', password: 'staff123' },
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ecohub_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or server unavailable:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('ecohub_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('ecohub_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  /**
   * Safe 1-Click Demo Persona Switcher:
   * Uses backend demo-switch endpoint or falls back to demo credentials.
   */
  const switchPersona = async (roleKey) => {
    try {
      const res = await api.demoSwitch(roleKey);
      if (res.success && res.token) {
        localStorage.setItem('ecohub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      // Fallback to quickLogin if demoSwitch endpoint fails
      const creds = demoAccounts[roleKey];
      if (creds) {
        return await login(creds.email, creds.password);
      }
      throw err;
    }
  };

  const quickLogin = async (roleKey) => {
    return await switchPersona(roleKey);
  };

  const logout = () => {
    localStorage.removeItem('ecohub_token');
    setToken(null);
    setUser(null);
  };

  // Granular Permission checking helpers
  const hasPermission = (permission) => {
    return checkPermission(user, permission);
  };

  const hasAnyPermission = (permissionsList) => {
    return checkAnyPermission(user, permissionsList);
  };

  const canAccess = (moduleKey) => {
    return checkModuleAccess(user, moduleKey);
  };

  const currentPersona = user?.role ? DEMO_PERSONAS[user.role] : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        currentPersona,
        currentRole: user?.role,
        permissions: user?.permissions || (user?.role ? ROLE_PERMISSIONS[user.role] : []),
        accessibleModules: user?.accessibleModules || (user?.role ? ROLE_MODULES[user.role] : []),
        hasPermission,
        hasAnyPermission,
        canAccess,
        login,
        register,
        quickLogin,
        switchPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
