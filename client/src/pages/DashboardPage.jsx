import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  ShieldCheck,
  Stamp,
  Clock,
  CheckSquare,
  SearchCheck,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Plus,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { KpiCard } from '../components/KpiCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, currentPersona, hasPermission, canAccess } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <LoadingSkeleton type="cards" count={4} />
        <LoadingSkeleton type="cards" count={4} />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Dashboard Unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, charts, alerts, recentActivity } = analytics;
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-8 pb-12">
      {/* Active Persona & Scope Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Persona: {user?.name}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md uppercase tracking-wider">
                {currentPersona?.badge || user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentPersona?.department || user?.department} &bull; {currentPersona?.description || 'Role-Based Access Control Active'}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Access Clearance: <strong className="text-slate-800 dark:text-slate-200">{user?.role === 'ADMIN' ? 'Full 13 Modules' : `${user?.accessibleModules?.length || 10} Authorized Modules`}</strong></span>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Environmental Compliance Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time regulatory tracking, clearance validity, and field telemetry across infrastructure assets.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          {hasPermission('projects.create') && (
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
          {canAccess('compliance') && (
            <button
              onClick={() => navigate('/compliance')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-card"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Requirements</span>
            </button>
          )}
          {canAccess('reports') && (
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-card"
            >
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Export Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Projects"
          value={kpis.totalProjects}
          subtitle={`${kpis.activeProjects} Active / In Progress`}
          icon={FolderGit2}
          colorScheme="emerald"
          onClick={() => navigate('/projects')}
        />
        <KpiCard
          title="Compliant Assets"
          value={`${kpis.compliantProjects}/${kpis.totalProjects}`}
          subtitle="Meets >= 80% statutory criteria"
          trend="+4.2%"
          trendPositive={true}
          icon={ShieldCheck}
          colorScheme="emerald"
          onClick={() => navigate('/compliance')}
        />
        <KpiCard
          title="Pending Approvals"
          value={kpis.pendingApprovals}
          subtitle="Clearance applications under review"
          icon={Stamp}
          colorScheme="amber"
          onClick={() => navigate('/approvals')}
        />
        <KpiCard
          title="Overdue Tasks"
          value={kpis.overdueTasksCount}
          subtitle="Statutory compliance actions"
          icon={Clock}
          colorScheme="rose"
          onClick={() => navigate('/tasks')}
        />

        <KpiCard
          title="Total Tasks"
          value={kpis.totalTasks}
          subtitle="Assigned mitigation & audits"
          icon={CheckSquare}
          colorScheme="blue"
          onClick={() => navigate('/tasks')}
        />
        <KpiCard
          title="Inspections Logged"
          value={kpis.scheduledInspectionsCount}
          subtitle="Scheduled / in progress"
          icon={SearchCheck}
          colorScheme="slate"
          onClick={() => navigate('/inspections')}
        />
        <KpiCard
          title="Central Documents"
          value={kpis.totalDocuments}
          subtitle="Verified permits, EIA & reports"
          icon={FileText}
          colorScheme="emerald"
          onClick={() => navigate('/documents')}
        />
        <KpiCard
          title="Total Clearances"
          value={kpis.totalApprovals}
          subtitle="MoEFCC, CPCB & State permits"
          icon={Stamp}
          colorScheme="blue"
          onClick={() => navigate('/approvals')}
        />
      </div>

      {/* Critical Alert Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Immediate Environmental Action Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Approvals nearing expiration and overdue regulatory compliance conditions
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Real-Time Monitoring
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Expiring approvals */}
          {alerts.expiringApprovals && alerts.expiringApprovals.length > 0 ? (
            alerts.expiringApprovals.map((app) => (
              <div
                key={app._id}
                onClick={() => navigate('/approvals')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    Expiring Permit
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(app.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">{app.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Project: {app.project?.name || 'Infrastructure Project'}
                </p>
                <div className="mt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>View clearance conditions</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/40 text-xs text-slate-400">
              No permits expiring within 60 days
            </div>
          )}

          {/* Overdue tasks */}
          {alerts.overdueTasks && alerts.overdueTasks.length > 0 ? (
            alerts.overdueTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate('/tasks')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    Overdue Task
                  </span>
                  <span className="text-[11px] text-rose-400 font-medium">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">{task.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned: {task.assignedTo?.name || 'Staff'} &bull; {task.project?.code}
                </p>
                <div className="mt-3 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <span>Take corrective action</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/40 text-xs text-slate-400">
              Zero overdue statutory tasks
            </div>
          )}

          {/* Upcoming scheduled inspections */}
          {alerts.scheduledInspections && alerts.scheduledInspections.length > 0 ? (
            alerts.scheduledInspections.slice(0, 1).map((ins) => (
              <div
                key={ins._id}
                onClick={() => navigate('/inspections')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                    Scheduled Audit
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ins.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">{ins.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inspector: {ins.inspector?.name || 'Officer'}
                </p>
                <div className="mt-3 text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                  <span>Open inspection sheet</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/40 text-xs text-slate-400">
              No audits currently scheduled
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Compliance Scores Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Infrastructure Project Compliance Scorecard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory condition satisfaction percentage across active corridors
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.projectSectorBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(val, name, props) => [`${val}% Compliance`, props.payload.fullName]}
                />
                <Bar dataKey="compliance" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Status Donut Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Compliance Requirement Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Statutory requirement condition health</p>

            <div className="h-52 mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.complianceStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.complianceStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {charts.complianceStatus.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 truncate">{c.name}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Compliance Trends & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Monthly Compliance & Environmental Audit Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Average compliance score progression vs statutory benchmarks
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Target: 90%
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Area type="monotone" dataKey="compliance" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompliance)" />
                <Line type="monotone" dataKey="target" stroke={isDark ? '#64748b' : '#94a3b8'} strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Recent Activity Stream */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Compliance Activity</h3>
              <Link to="/audit-logs" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Full Audit Trail &rarr;
              </Link>
            </div>

            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <div key={act._id} className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {act.recordTitle || act.action}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.details}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {act.userName} ({act.module})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Audit integrity: Tamper-evident</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
