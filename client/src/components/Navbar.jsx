import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export const Navbar = ({ isSidebarCollapsed }) => {
  const { user, quickLogin, switchPersona } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
      if (link) {
        navigate(link);
        setShowNotifications(false);
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/projects?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // Generate breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbTitle =
    pathSegments.length > 0
      ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1).replace('-', ' ')
      : 'Dashboard';

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link
          to="/dashboard"
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">{breadcrumbTitle}</span>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search projects, permits, regulations..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Fast Role Switcher (For Demo & Testing) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
            title="Switch demo persona"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold truncate max-w-[100px] sm:max-w-none">
              {user?.role?.replace('_', ' ')}
            </span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95">
              <p className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                1-Click Demo Persona Access
              </p>
              {[
                { role: 'ADMIN', title: '1. Admin — Dr. Sengupta', sub: 'Executive Directorate' },
                { role: 'PROJECT_MANAGER', title: '2. Project Mgr — Sarah Jenkins', sub: 'Delivery & Planning' },
                { role: 'ENVIRONMENTAL_OFFICER', title: '3. Enviro Officer — Arunabh Sharma', sub: 'Ecology & Assessments' },
                { role: 'COMPLIANCE_STAFF', title: '4. Compliance Staff — Elena Rodriguez', sub: 'Audit & Verification' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={async () => {
                    setShowRoleSwitcher(false);
                    await (switchPersona ? switchPersona(item.role) : quickLogin(item.role));
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition ${
                    user?.role === item.role
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-[10px] text-slate-400">{item.sub}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-200" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform duration-200" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevated overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconColor =
                      n.type === 'Critical'
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
                        : n.type === 'Warning'
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                        : n.type === 'Success'
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400';

                    return (
                      <div
                        key={n._id}
                        onClick={() => handleMarkAsRead(n._id, n.link)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex gap-3 ${
                          !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}
                        >
                          {n.type === 'Critical' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : n.type === 'Warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : n.type === 'Success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
