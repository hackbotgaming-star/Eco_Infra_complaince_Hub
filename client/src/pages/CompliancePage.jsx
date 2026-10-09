import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Trash2,
  Edit2,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const CompliancePage = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [regulatoryCategory, setRegulatoryCategory] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    regulatoryCategory: 'Air (Prevention & Control of Pollution) Act, 1981',
    responsiblePerson: '',
    dueDate: '',
    priority: 'High',
    status: 'In Progress',
    progressPercentage: 50,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, status, priority, regulatoryCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resComp, resProj, resUsers] = await Promise.all([
        api.getCompliance({ search, status, priority, regulatoryCategory }),
        api.getProjects(),
        api.getUsers(),
      ]);
      if (resComp.success) setRequirements(resComp.data);
      if (resProj.success) setProjects(resProj.data);
      if (resUsers.success) setUsersList(resUsers.data);
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
      const res = await api.createCompliance(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          project: '',
          regulatoryCategory: 'Air (Prevention & Control of Pollution) Act, 1981',
          responsiblePerson: '',
          dueDate: '',
          priority: 'High',
          status: 'In Progress',
          progressPercentage: 50,
          notes: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating requirement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);
    try {
      const res = await api.updateComplianceStatus(selectedReq._id, {
        status: selectedReq.status,
        progressPercentage: selectedReq.progressPercentage,
        notes: selectedReq.notes,
      });
      if (res.success) {
        setIsUpdateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error updating requirement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this statutory condition?')) return;
    try {
      await api.deleteCompliance(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Environmental Compliance Requirements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory conditions, clearances covenants, and pollution control mandates.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER', 'ENVIRONMENTAL_OFFICER'].includes(user.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Requirement</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requirement title..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <select
            value={regulatoryCategory}
            onChange={(e) => setRegulatoryCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Regulatory Acts</option>
            <option value="Air (Prevention & Control of Pollution) Act, 1981">Air Pollution Act</option>
            <option value="Water (Prevention & Control of Pollution) Act, 1974">Water Pollution Act</option>
            <option value="Environment (Protection) Act, 1986">Environment Protection Act</option>
            <option value="Forest (Conservation) Act, 1980">Forest Conservation Act</option>
            <option value="Wildlife (Protection) Act, 1972">Wildlife Protection Act</option>
            <option value="Hazardous & Other Wastes Management Rules">Hazardous Waste Rules</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Under Review">Under Review</option>
            <option value="Not Started">Not Started</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : requirements.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No compliance requirements found"
          description="Create specific statutory conditions mandated by the EIA clearance or pollution boards."
          actionLabel="Add Requirement"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {requirements.map((req) => {
            const progressColor =
              req.progressPercentage >= 80 ? 'bg-emerald-500' : req.progressPercentage >= 50 ? 'bg-blue-500' : 'bg-amber-500';

            return (
              <div
                key={req._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/60">
                      {req.regulatoryCategory}
                    </span>
                    <StatusBadge status={req.priority} size="xs" />
                    <StatusBadge status={req.status} size="xs" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{req.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{req.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>
                      Project: <strong className="text-slate-700 dark:text-slate-300">{req.project?.name || req.project?.code}</strong>
                    </span>
                    <span>
                      Assignee: <strong className="text-slate-700 dark:text-slate-300">{req.responsiblePerson?.name || 'Field Officer'}</strong>
                    </span>
                    <span>
                      Due Date: <strong className="text-slate-700 dark:text-slate-300">{new Date(req.dueDate).toLocaleDateString()}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar & Update action */}
                <div className="md:w-64 flex flex-col justify-between pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Compliance Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{req.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${req.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedReq({ ...req });
                        setIsUpdateModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                    {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedReq && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Compliance Status: ${selectedReq.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compliance Status
              </label>
              <select
                value={selectedReq.status}
                onChange={(e) => setSelectedReq({ ...selectedReq, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Progress Percentage</span>
                <span>{selectedReq.progressPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedReq.progressPercentage}
                onChange={(e) => setSelectedReq({ ...selectedReq, progressPercentage: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verification Observations / Notes
              </label>
              <textarea
                rows={3}
                value={selectedReq.notes || ''}
                onChange={(e) => setSelectedReq({ ...selectedReq, notes: e.target.value })}
                placeholder="Detail site verification, photos or certificates..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Requirement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Compliance Requirement"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Requirement Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Operate Continuous Dust Suppression Mist Cannons"
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
                Regulatory Category *
              </label>
              <select
                value={formData.regulatoryCategory}
                onChange={(e) => setFormData({ ...formData, regulatoryCategory: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Air (Prevention & Control of Pollution) Act, 1981">Air Pollution Act</option>
                <option value="Water (Prevention & Control of Pollution) Act, 1974">Water Pollution Act</option>
                <option value="Environment (Protection) Act, 1986">Environment Protection Act</option>
                <option value="Forest (Conservation) Act, 1980">Forest Conservation Act</option>
                <option value="Wildlife (Protection) Act, 1972">Wildlife Protection Act</option>
                <option value="Hazardous & Other Wastes Management Rules">Hazardous Waste Rules</option>
                <option value="Noise Pollution (Regulation and Control) Rules">Noise Pollution Rules</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsible Assignee
              </label>
              <select
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Assign Person</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Condition Description & Scope *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline specific conditions stipulated in the environmental clearance letter..."
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
              {submitting ? 'Creating...' : 'Register Requirement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
