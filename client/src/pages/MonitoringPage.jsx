import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const MonitoringPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [records, setRecords] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('PM2.5 Ambient Air');
  const [complianceStatus, setComplianceStatus] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    project: '',
    location: '',
    parameter: 'PM2.5 Ambient Air',
    measuredValue: '',
    unit: 'µg/m³',
    allowedLimit: '60',
    observation: '',
    monitoringDate: new Date().toISOString().split('T')[0],
  });

  const parameterDefaults = {
    'PM2.5 Ambient Air': { unit: 'µg/m³', limit: 60 },
    'PM10 Ambient Air': { unit: 'µg/m³', limit: 100 },
    'SO2 Sulfur Dioxide': { unit: 'µg/m³', limit: 80 },
    'NOx Nitrogen Oxides': { unit: 'µg/m³', limit: 80 },
    'BOD Biochemical Oxygen Demand': { unit: 'mg/L', limit: 30 },
    'COD Chemical Oxygen Demand': { unit: 'mg/L', limit: 250 },
    'pH Level': { unit: 'pH', limit: 8.5 },
    'Ambient Noise (Day Time)': { unit: 'dB(A)', limit: 75 },
    'Ambient Noise (Night Time)': { unit: 'dB(A)', limit: 70 },
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedParameter, complianceStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRecords, resTrends, resProj] = await Promise.all([
        api.getMonitoring({ search, parameter: selectedParameter, complianceStatus }),
        api.getMonitoringTrends({ parameter: selectedParameter }),
        api.getProjects(),
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resTrends.success) setTrendData(resTrends.data);
      if (resProj.success) setProjects(resProj.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (param) => {
    const config = parameterDefaults[param] || { unit: 'units', limit: 100 };
    setFormData({
      ...formData,
      parameter: param,
      unit: config.unit,
      allowedLimit: String(config.limit),
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createMonitoring(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          project: '',
          location: '',
          parameter: 'PM2.5 Ambient Air',
          measuredValue: '',
          unit: 'µg/m³',
          allowedLimit: '60',
          observation: '',
          monitoringDate: new Date().toISOString().split('T')[0],
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error recording telemetry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this monitoring record?')) return;
    try {
      await api.deleteMonitoring(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Environmental Telemetry & Quality Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time parameters: Ambient Air Quality (PM2.5/PM10), Noise dBA, Effluent BOD/COD, and Water TDS against statutory thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Log Parameter Reading</span>
        </button>
      </div>

      {/* Parameter Trend Analytics Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Monitoring Trend: {selectedParameter}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparison of on-site telemetry sensor readings versus allowable statutory limit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none transition font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="PM2.5 Ambient Air">PM2.5 Ambient Air</option>
              <option value="PM10 Ambient Air">PM10 Ambient Air</option>
              <option value="SO2 Sulfur Dioxide">SO2 Sulfur Dioxide</option>
              <option value="NOx Nitrogen Oxides">NOx Nitrogen Oxides</option>
              <option value="Ambient Noise (Day Time)">Ambient Noise (Day)</option>
              <option value="pH Level">pH Level</option>
              <option value="BOD Biochemical Oxygen Demand">BOD Effluent</option>
            </select>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val, name) => [
                  `${val} ${trendData[0]?.unit || ''}`,
                  name === 'measuredValue' ? 'Measured Value' : 'Statutory Limit',
                ]}
              />
              <Line
                type="monotone"
                dataKey="measuredValue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
                name="measuredValue"
              />
              <Line
                type="step"
                dataKey="allowedLimit"
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                name="allowedLimit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded"></span> Measured Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded"></span> Prescribed Regulatory Limit
            </span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Continuous Station Feed</span>
        </div>
      </div>

      {/* Monitoring Logs Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location or observation..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <select
            value={complianceStatus}
            onChange={(e) => setComplianceStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full sm:w-auto"
          >
            <option value="all">All Compliance Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Alert">Alert (Near Threshold)</option>
            <option value="Non-compliant">Non-compliant (Exceeded)</option>
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No telemetry records found"
            description="Log sensor readings from Continuous Ambient Stations or water testing laboratories."
            actionLabel="Log Measurement"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Parameter</th>
                  <th className="px-5 py-3.5">Measured Value</th>
                  <th className="px-5 py-3.5">Statutory Limit</th>
                  <th className="px-5 py-3.5">Project & Location</th>
                  <th className="px-5 py-3.5">Compliance Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{r.parameter}</td>
                    <td className="px-5 py-4 font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {r.measuredValue} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{r.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {r.allowedLimit} {r.unit}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{r.project?.name || 'Project'}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{r.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.complianceStatus} size="xs" />
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(r.monitoringDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Measurement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Environmental Quality Reading"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project *
              </label>
              <select
                required
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monitoring Parameter *
              </label>
              <select
                value={formData.parameter}
                onChange={(e) => handleParamChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="PM2.5 Ambient Air">PM2.5 Ambient Air</option>
                <option value="PM10 Ambient Air">PM10 Ambient Air</option>
                <option value="SO2 Sulfur Dioxide">SO2 Sulfur Dioxide</option>
                <option value="NOx Nitrogen Oxides">NOx Nitrogen Oxides</option>
                <option value="Ambient Noise (Day Time)">Ambient Noise (Day Time)</option>
                <option value="Ambient Noise (Night Time)">Ambient Noise (Night Time)</option>
                <option value="pH Level">pH Level</option>
                <option value="BOD Biochemical Oxygen Demand">BOD (Biochemical Oxygen Demand)</option>
                <option value="COD Chemical Oxygen Demand">COD (Chemical Oxygen Demand)</option>
                <option value="TDS (Total Dissolved Solids)">TDS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Measured Value *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.measuredValue}
                onChange={(e) => setFormData({ ...formData, measuredValue: e.target.value })}
                placeholder="e.g. 48.5"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Allowed Limit
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.allowedLimit}
                onChange={(e) => setFormData({ ...formData, allowedLimit: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sensor Station / Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. CAAQMS Sensor #1 @ Km 48"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sampling Date *
              </label>
              <input
                type="date"
                required
                value={formData.monitoringDate}
                onChange={(e) => setFormData({ ...formData, monitoringDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Field Observation / Wind & Weather Notes
            </label>
            <textarea
              rows={2}
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Record meteorological conditions or batching plant operations..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Logging...' : 'Save Telemetry Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
