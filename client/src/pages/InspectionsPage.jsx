import React, { useState, useEffect } from 'react';
import {
  SearchCheck,
  Plus,
  Search,
  MapPin,
  AlertTriangle,
  Camera,
  Trash2,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const InspectionsPage = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [inspectionType, setInspectionType] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    location: '',
    inspectionType: 'Routine Monthly Compliance Check',
    date: new Date().toISOString().split('T')[0],
    findings: '',
    recommendations: '',
    status: 'Completed',
  });

  useEffect(() => {
    fetchData();
  }, [search, status, inspectionType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resIns, resProj] = await Promise.all([
        api.getInspections({ search, status, inspectionType }),
        api.getProjects(),
      ]);
      if (resIns.success) setInspections(resIns.data);
      if (resProj.success) setProjects(resProj.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.inspector && user) {
        payload.inspector = user._id;
      }
      const res = await api.createInspection(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          project: '',
          location: '',
          inspectionType: 'Routine Monthly Compliance Check',
          date: new Date().toISOString().split('T')[0],
          findings: '',
          recommendations: '',
          status: 'Completed',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error recording inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (inspectionId, nextStatus) => {
    try {
      const res = await api.updateInspection(inspectionId, { status: nextStatus });
      if (res.success) {
        if (selectedInspection && selectedInspection._id === inspectionId) {
          setSelectedInspection(res.data);
        }
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error updating inspection status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inspection dossier?')) return;
    try {
      await api.deleteInspection(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Field Environmental Inspections & Audits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit ground compliance, log non-conformances, and attach geotagged evidence.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER', 'ENVIRONMENTAL_OFFICER', 'COMPLIANCE_STAFF'].includes(user.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule / Log Inspection</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspection title, location or findings..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
          />
        </div>

        <select
          value={inspectionType}
          onChange={(e) => setInspectionType(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
        >
          <option value="all">All Inspection Types</option>
          <option value="Routine Monthly Compliance Check">Routine Monthly Check</option>
          <option value="Surprise Regulatory Site Inspection">Surprise Regulatory Audit</option>
          <option value="Pre-Monsoon Drainage & Soil Inspection">Pre-Monsoon Drainage</option>
          <option value="Hazardous Waste Storage Audit">Hazardous Waste Audit</option>
          <option value="EIA Clearance Baseline Verification">EIA Baseline Verification</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Follow-up Required">Follow-up Required</option>
        </select>
      </div>

      {/* Inspections Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={SearchCheck}
          title="No inspection records found"
          description="Log on-site environmental inspections to audit physical compliance."
          actionLabel="Log Inspection"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inspections.map((ins) => (
            <div
              key={ins._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {ins.inspectionType}
                  </span>
                  <StatusBadge status={ins.status} size="xs" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{ins.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" /> {ins.location} &bull; {ins.project?.name}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {ins.findings}
                </p>

                {/* Violation flag */}
                {ins.violations && ins.violations.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="truncate">
                      <strong>{ins.violations.length} Violation(s) Logged:</strong> {ins.violations[0].issue}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Auditor</span>
                  <strong className="text-slate-700 dark:text-slate-300">{ins.inspector?.name || 'Dr. Sengupta'}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedInspection(ins);
                      setIsDetailOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Audit Dossier
                  </button>
                  {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                    <button
                      onClick={() => handleDelete(ins._id)}
                      className="p-1 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Detail Modal with Photos */}
      {selectedInspection && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Field Inspection Dossier: ${selectedInspection.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedInspection.inspectionType}</span>
                <StatusBadge status={selectedInspection.status} />
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                Date: {new Date(selectedInspection.date).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Project Asset</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">{selectedInspection.project?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Audit Location / Chainage</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">{selectedInspection.location}</strong>
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1">Detailed Findings & Observations</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedInspection.findings}
              </p>
            </div>

            {selectedInspection.violations && selectedInspection.violations.length > 0 && (
              <div>
                <span className="text-rose-600 dark:text-rose-400 block font-bold mb-2">Identified Violations & Corrective Orders</span>
                <div className="space-y-2">
                  {selectedInspection.violations.map((v, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200">
                      <div className="flex items-center justify-between font-bold">
                        <span>{v.issue}</span>
                        <span className="text-[10px] bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded">{v.severity}</span>
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                        <strong>Corrective Action Required:</strong> {v.correctiveAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedInspection.recommendations && (
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1">Inspector Recommendations</span>
                <p className="leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
                  {selectedInspection.recommendations}
                </p>
              </div>
            )}

            {/* Quick Status Update */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1.5">
                Update Inspection Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Scheduled', 'In Progress', 'Completed', 'Follow-up Required'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedInspection._id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedInspection.status === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos */}
            {selectedInspection.photos && selectedInspection.photos.length > 0 && (
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Photographic Inspection Evidence
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {selectedInspection.photos.map((ph, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                      <img src={ph.url} alt={ph.caption} className="w-full h-36 object-cover" />
                      <p className="p-2 text-[11px] text-slate-600 dark:text-slate-400">{ph.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Schedule / Log Inspection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule / Log Field Environmental Audit"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inspection Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q3 Fugitive Dust & Sediment Runoff Field Audit"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            />
          </div>

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
                Inspection Type *
              </label>
              <select
                value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Routine Monthly Compliance Check">Routine Monthly Check</option>
                <option value="Surprise Regulatory Site Inspection">Surprise Regulatory Audit</option>
                <option value="Pre-Monsoon Drainage & Soil Inspection">Pre-Monsoon Drainage</option>
                <option value="Hazardous Waste Storage Audit">Hazardous Waste Audit</option>
                <option value="EIA Clearance Baseline Verification">EIA Clearance Baseline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Audit Location / Chainage *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Km 42+000 Batching Yard"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inspection Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Field Findings & Observations *
            </label>
            <textarea
              required
              rows={3}
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              placeholder="Record physical inspections of water sprinklers, silt barriers, bunding..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corrective Recommendations
            </label>
            <textarea
              rows={2}
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Steps for site engineers to remediate..."
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
              {submitting ? 'Recording...' : 'Log Inspection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
