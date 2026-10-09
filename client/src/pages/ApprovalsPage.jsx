import React, { useState, useEffect } from 'react';
import {
  Stamp,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [expiringSoon, setExpiringSoon] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    approvalType: 'Environmental Clearance (EC)',
    authority: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    referenceNumber: '',
    issueDate: '',
    expiryDate: '',
    status: 'Approved',
  });

  useEffect(() => {
    fetchData();
  }, [search, status, expiringSoon]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resApprovals, resProjects] = await Promise.all([
        api.getApprovals({ search, status, expiringSoon: expiringSoon ? 'true' : undefined }),
        api.getProjects(),
      ]);
      if (resApprovals.success) setApprovals(resApprovals.data);
      if (resProjects.success) setProjects(resProjects.data);
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
      const res = await api.createApproval(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          project: '',
          approvalType: 'Environmental Clearance (EC)',
          authority: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
          referenceNumber: '',
          issueDate: '',
          expiryDate: '',
          status: 'Approved',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.updateApproval(id, { status: 'Approved' });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Approval action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this approval?')) return;
    try {
      await api.deleteApproval(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clearances & Statutory Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track Environmental Clearances (EC), Consent to Establish (CTE), Forest & Wildlife permits.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER', 'ENVIRONMENTAL_OFFICER'].includes(user.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Register Approval</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search approval name, reference code or authority..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
          >
            <option value="all">All Approval Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
          </select>

          {/* Expiring Soon Toggle */}
          <button
            type="button"
            onClick={() => setExpiringSoon(!expiringSoon)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 w-full md:w-auto justify-center ${
              expiringSoon
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Expiring Soon (&lt; 60 Days)</span>
          </button>
        </div>
      </div>

      {/* Approvals Table Card */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : approvals.length === 0 ? (
        <EmptyState
          icon={Stamp}
          title="No statutory approvals found"
          description="Register formal Environmental Clearances (EC), Consent to Establish (CTE), or Forest permits."
          actionLabel="Add Approval"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Reference Number</th>
                  <th className="px-5 py-3.5">Approval / Permit Title</th>
                  <th className="px-5 py-3.5">Issuing Authority</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Validity Expiry</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {approvals.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {app.referenceNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{app.name}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{app.approvalType}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-xs">{app.authority}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{app.project?.name}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} size="xs" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(app.expiryDate).toLocaleDateString()}
                        </span>
                        {app.isExpiringSoon && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 animate-pulse">
                            {app.daysLeft}d left
                          </span>
                        )}
                        {app.isExpired && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApproval(app)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition"
                        >
                          Conditions
                        </button>
                        {app.status !== 'Approved' && (
                          user?.role === 'ENVIRONMENTAL_OFFICER' ? (
                            <span
                              className="px-2 py-1 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-not-allowed"
                              title="Environmental Officers cannot approve clearances. Independent review and sign-off required."
                            >
                              Review Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(app._id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm"
                              title="Sign and grant formal approval"
                            >
                              Approve
                            </button>
                          )
                        )}
                        {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditions Detail Modal */}
      {selectedApproval && (
        <Modal
          isOpen={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          title={`Conditions & Stated Clauses: ${selectedApproval.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">Reference:</span> {selectedApproval.referenceNumber} &bull;{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">Authority:</span> {selectedApproval.authority}
            </div>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Clearance Conditions Checklist</h4>
            {selectedApproval.conditions && selectedApproval.conditions.length > 0 ? (
              <div className="space-y-2.5">
                {selectedApproval.conditions.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                    <div className="mt-0.5">
                      {c.isComplied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Status: <strong className={c.isComplied ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{c.isComplied ? 'Complied' : 'Pending Verification'}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500">Standard statutory conditions apply.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Create Approval Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Statutory Clearance / Permit"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clearance Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Consent to Establish (CTE) DAHEJ-Phase-II"
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
                Approval Type *
              </label>
              <select
                value={formData.approvalType}
                onChange={(e) => setFormData({ ...formData, approvalType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Environmental Clearance (EC)">Environmental Clearance (EC)</option>
                <option value="Forest Clearance (Stage-I In-Principle)">Forest Clearance (Stage-I)</option>
                <option value="Forest Clearance (Stage-II Final)">Forest Clearance (Stage-II)</option>
                <option value="Consent to Establish (CTE)">Consent to Establish (CTE)</option>
                <option value="Consent to Operate (CTO)">Consent to Operate (CTO)</option>
                <option value="Wildlife Clearance (NBWL Recommendation)">Wildlife Clearance (NBWL)</option>
                <option value="Coastal Regulation Zone (CRZ) Clearance">CRZ Clearance</option>
                <option value="Central Ground Water Authority (CGWA) NOC">Groundwater CGWA NOC</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Regulatory Authority *
              </label>
              <input
                type="text"
                required
                value={formData.authority}
                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                placeholder="e.g. State Pollution Control Board"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File / Reference Number *
              </label>
              <input
                type="text"
                required
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="e.g. PCB/CTE-2024/991"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none uppercase font-mono text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
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
              {submitting ? 'Registering...' : 'Save Clearance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
