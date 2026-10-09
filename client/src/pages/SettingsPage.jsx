import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Building,
  Save,
  CheckCircle2,
  Users,
  Edit2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AccessDenied } from '../components/AccessDenied';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [systemSettings, setSystemSettings] = useState({
    orgName: 'National Infrastructure Environmental Directorate',
    compliancePassBenchmark: '85',
    approvalExpiryAlertDays: '60',
    telemetryExceedTolerance: '10',
    enableEmailDigest: true,
    enableCriticalSms: true,
  });

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      if (res.success) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      fetchUsers();
      alert('User role updated successfully');
    } catch (err) {
      alert(err.message || 'Error updating user role');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <AccessDenied
        moduleName="System Settings"
        customMessage="Access Denied: Only System Administrators (Dr. Sengupta) are authorized to modify organization parameters, configure integrations, and manage user roles."
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage regulatory threshold parameters, user role permissions, and organization profile.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 -mb-px ${
            activeTab === 'system'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Compliance Thresholds</span>
        </button>

        {user && user.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 -mb-px ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Administration</span>
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                <span>{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                disabled
                value={user?.department || 'Environmental Compliance Directorate'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Security Role</label>
              <input
                type="text"
                disabled
                value={user?.role}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Compliance thresholds and notification rules saved successfully.</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Regulatory Alert Horizons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Permit Expiration Early Warning Horizon (Days)
                </label>
                <input
                  type="number"
                  value={systemSettings.approvalExpiryAlertDays}
                  onChange={(e) => setSystemSettings({ ...systemSettings, approvalExpiryAlertDays: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Triggers high-priority dashboard warnings before clearances expire.
                </span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Project Compliance Benchmark (%)
                </label>
                <input
                  type="number"
                  value={systemSettings.compliancePassBenchmark}
                  onChange={(e) => setSystemSettings({ ...systemSettings, compliancePassBenchmark: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Minimum statutory criteria required to consider project compliant.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telemetry Over-limit Alert Margin (%)
              </label>
              <input
                type="number"
                value={systemSettings.telemetryExceedTolerance}
                onChange={(e) => setSystemSettings({ ...systemSettings, telemetryExceedTolerance: e.target.value })}
                className="w-full sm:w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                Generates "Alert" status when measured PM2.5 or noise reaches within this percentage of the limit.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Users Administration Tab (Admin only) */}
      {activeTab === 'users' && user?.role === 'ADMIN' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Enterprise User Directory & Roles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assign role-based access permissions across project teams.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5 text-right">Modify Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{u.department}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                        <option value="ENVIRONMENTAL_OFFICER">ENVIRONMENTAL_OFFICER</option>
                        <option value="COMPLIANCE_STAFF">COMPLIANCE_STAFF</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
