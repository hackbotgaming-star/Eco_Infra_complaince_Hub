import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FileCheck2,
  Stamp,
  ShieldCheck,
  Leaf,
  CheckSquare,
  SearchCheck,
  FileText,
  Activity,
  Bell,
  MessageSquare,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout, canAccess } = useAuth();

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { name: 'Projects', path: '/projects', icon: FolderGit2, module: 'projects' },
    { name: 'Assessments', path: '/assessments', icon: FileCheck2, module: 'assessments' },
    { name: 'Approvals', path: '/approvals', icon: Stamp, module: 'approvals' },
    { name: 'Compliance', path: '/compliance', icon: ShieldCheck, module: 'compliance' },
    { name: 'Mitigation', path: '/mitigation', icon: Leaf, module: 'mitigation' },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, module: 'tasks' },
    { name: 'Inspections', path: '/inspections', icon: SearchCheck, module: 'inspections' },
    { name: 'Documents', path: '/documents', icon: FileText, module: 'documents' },
    { name: 'Monitoring', path: '/monitoring', icon: Activity, module: 'monitoring' },
    { name: 'Team Chat & Doubts', path: '/chat', icon: MessageSquare, module: 'chat' },
    { name: 'Notifications', path: '/notifications', icon: Bell, module: 'notifications' },
    { name: 'Reports', path: '/reports', icon: BarChart3, module: 'reports' },
    { name: 'Audit Logs', path: '/audit-logs', icon: History, module: 'audit-logs' },
    { name: 'Settings', path: '/settings', icon: Settings, module: 'settings' },
  ];

  // Strictly display only modules each role is authorized to access
  const navItems = allNavItems.filter((item) => canAccess(item.module));

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm leading-tight block truncate">
                  Eco Infra<span className="text-emerald-600 dark:text-emerald-400"> Compliance</span>
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase -mt-0.5 truncate">
                  Hub &bull; Infrastructure
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-emerald-200 dark:border-emerald-800/50">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate uppercase">
                  {user?.role?.replace('_', ' ') || 'Guest'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800/50"
              title={user?.name}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
