import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const AuditLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({
        search,
        module: moduleFilter,
        action: actionFilter,
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    CREATE: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    UPDATE: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    STATUS_CHANGE: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    DELETE: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    UPLOAD: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    LOGIN: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Audit Trail & Compliance Activity History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable, timestamped event log recording all project registrations, permit updates, status shifts, and document uploads.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit records by title, user name or detail..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition w-full md:w-auto"
        >
          <option value="all">All Modules</option>
          <option value="Projects">Projects</option>
          <option value="Assessments">Assessments</option>
          <option value="Approvals">Approvals</option>
          <option value="Compliance">Compliance</option>
          <option value="Mitigation">Mitigation</option>
          <option value="Tasks">Tasks</option>
          <option value="Inspections">Inspections</option>
          <option value="Documents">Documents</option>
          <option value="Monitoring">Monitoring</option>
          <option value="Auth">Auth</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition w-full md:w-auto"
        >
          <option value="all">All Action Types</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="STATUS_CHANGE">STATUS CHANGE</option>
          <option value="DELETE">DELETE</option>
          <option value="UPLOAD">UPLOAD</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit log records found"
          description="Actions performed in the system will automatically appear here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Module</th>
                  <th className="px-5 py-3.5">Record Target</th>
                  <th className="px-5 py-3.5">Activity Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => {
                  const badgeStyle = actionColors[log.action] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                        <span className="text-slate-400 dark:text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{log.userRole}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeStyle}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{log.module}</td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {log.recordTitle || 'Record'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-sm">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
