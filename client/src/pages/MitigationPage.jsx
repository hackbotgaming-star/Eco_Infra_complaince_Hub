import React, { useState, useEffect } from 'react';
import {
  Leaf,
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

export const MitigationPage = () => {
  const { user } = useAuth();
  const [measures, setMeasures] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [effectiveness, setEffectiveness] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    measureTitle: '',
    environmentalImpact: 'Fugitive Dust & Air Quality Degradation',
    project: '',
    responsiblePerson: '',
    implementationDate: '',
    targetDate: '',
    status: 'In Progress',
    effectiveness: 'Pending Assessment',
    cost: '$50,000',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, status, effectiveness]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMit, resProj, resUsers] = await Promise.all([
        api.getMitigation({ search, status, effectiveness }),
        api.getProjects(),
        api.getUsers(),
      ]);
      if (resMit.success) setMeasures(resMit.data);
      if (resProj.success) setProjects(resProj.data);
      if (resUsers && resUsers.success) setUsersList(resUsers.data);
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
      if (!payload.responsiblePerson) {
        delete payload.responsiblePerson;
      }
      const res = await api.createMitigation(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          measureTitle: '',
          environmentalImpact: 'Fugitive Dust & Air Quality Degradation',
          project: '',
          responsiblePerson: '',
          implementationDate: '',
          targetDate: '',
          status: 'In Progress',
          effectiveness: 'Pending Assessment',
          cost: '$50,000',
          notes: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error adding mitigation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedMeasure) return;
    setSubmitting(true);
    try {
      const res = await api.updateMitigationStatus(selectedMeasure._id, {
        status: selectedMeasure.status,
        effectiveness: selectedMeasure.effectiveness,
        notes: selectedMeasure.notes,
      });
      if (res.success) {
        setIsUpdateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error updating mitigation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mitigation record?')) return;
    try {
      await api.deleteMitigation(id);
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
            Environmental Mitigation Measures
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Systematic management of dust suppression, wildlife passages, noise barriers, and effluent treatment.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER', 'ENVIRONMENTAL_OFFICER', 'COMPLIANCE_STAFF'].includes(user.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mitigation Measure</span>
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
              placeholder="Search mitigation measure, environmental impact or notes..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
          >
            <option value="all">All Implementation Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Implemented">Implemented</option>
            <option value="Verified">Verified</option>
          </select>

          <select
            value={effectiveness}
            onChange={(e) => setEffectiveness(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
          >
            <option value="all">All Effectiveness Ratings</option>
            <option value="High">High Effectiveness</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
            <option value="Pending Assessment">Pending Assessment</option>
          </select>
        </div>
      </div>

      {/* Mitigation Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : measures.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No mitigation measures found"
          description="Register environmental engineering interventions such as eco-ducts, mist cannons, or acoustic walls."
          actionLabel="Add Mitigation Measure"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {measures.map((m) => (
            <div
              key={m._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                    {m.effectiveness} Effectiveness
                  </span>
                  <StatusBadge status={m.status} size="xs" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{m.measureTitle}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{m.environmentalImpact}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Project: <strong className="text-slate-700 dark:text-slate-300">{m.project?.name}</strong>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {m.notes || 'Operating under verified operational environmental plan.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Target Horizon</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(m.targetDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMeasure({ ...m });
                      setIsUpdateModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Update
                  </button>
                  {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                    <button
                      onClick={() => handleDelete(m._id)}
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

      {/* Update Mitigation Status Modal */}
      {selectedMeasure && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Mitigation: ${selectedMeasure.measureTitle}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Implementation Status
              </label>
              <select
                value={selectedMeasure.status}
                onChange={(e) => setSelectedMeasure({ ...selectedMeasure, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Implemented">Implemented</option>
                <option value="Verified">Verified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Field Effectiveness Rating
              </label>
              <select
                value={selectedMeasure.effectiveness}
                onChange={(e) => setSelectedMeasure({ ...selectedMeasure, effectiveness: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
                <option value="Pending Assessment">Pending Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operational Notes & Evidence
              </label>
              <textarea
                rows={3}
                value={selectedMeasure.notes || ''}
                onChange={(e) => setSelectedMeasure({ ...selectedMeasure, notes: e.target.value })}
                placeholder="Log field performance..."
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

      {/* Create Mitigation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Environmental Mitigation Measure"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mitigation Measure Title *
            </label>
            <input
              type="text"
              required
              value={formData.measureTitle}
              onChange={(e) => setFormData({ ...formData, measureTitle: e.target.value })}
              placeholder="e.g. Wildlife Underpass Eco-Ducts at Km 54"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Addressed Environmental Impact *
              </label>
              <select
                value={formData.environmentalImpact}
                onChange={(e) => setFormData({ ...formData, environmentalImpact: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Fugitive Dust & Air Quality Degradation">Dust & Air Degradation</option>
                <option value="Runoff Sedimentation & Water Body Contamination">Runoff & Water Pollution</option>
                <option value="Noise & Vibration from Heavy Machinery & Blasting">Noise & Vibration</option>
                <option value="Vegetation Loss & Wildlife Corridor Fragmentation">Wildlife & Forest Loss</option>
                <option value="Solid & Construction Waste Dumping">Solid & Hazardous Waste</option>
                <option value="Soil Compaction, Erosion & Topsoil Loss">Soil Erosion</option>
                <option value="Groundwater Depletion & Seepage Issues">Groundwater Depletion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsible Lead (Optional)
              </label>
              <select
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Unassigned / Field Team</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role?.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Implementation Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.implementationDate}
                onChange={(e) => setFormData({ ...formData, implementationDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Completion Date *
              </label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Implemented">Implemented</option>
                <option value="Verified">Verified</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effectiveness
              </label>
              <select
                value={formData.effectiveness}
                onChange={(e) => setFormData({ ...formData, effectiveness: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Pending Assessment">Pending Assessment</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Budget / Cost
              </label>
              <input
                type="text"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="$100,000"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Engineering Specs & Monitoring Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detail design specifications, acoustic decibel reductions or water volume savings..."
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
              {submitting ? 'Creating...' : 'Save Mitigation Measure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
