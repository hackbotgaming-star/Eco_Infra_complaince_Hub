import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const AssessmentsPage = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assessmentType: 'Comprehensive Environmental Impact Assessment (EIA)',
    environmentalCategory: 'Category A (National MoEFCC Cleared)',
    riskLevel: 'Medium',
    description: '',
    findings: '',
    recommendations: '',
    status: 'Under Review',
  });

  useEffect(() => {
    fetchData();
  }, [search, status, riskLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAssessments, resProjects] = await Promise.all([
        api.getAssessments({ search, status, riskLevel }),
        api.getProjects(),
      ]);
      if (resAssessments.success) setAssessments(resAssessments.data);
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
      const res = await api.createAssessment(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          project: '',
          assessmentType: 'Comprehensive Environmental Impact Assessment (EIA)',
          environmentalCategory: 'Category A (National MoEFCC Cleared)',
          riskLevel: 'Medium',
          description: '',
          findings: '',
          recommendations: '',
          status: 'Under Review',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      await api.deleteAssessment(id);
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
            Environmental Impact Assessments (EIA & EMP)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Author baseline environmental studies, impact predictions, and statutory mitigation plans.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER', 'ENVIRONMENTAL_OFFICER'].includes(user.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessment title, findings or type..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
          >
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No environmental assessments found"
          description="Create a comprehensive EIA or EMP report for an active infrastructure project."
          actionLabel="Add Assessment"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((a) => (
            <div
              key={a._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                    {a.environmentalCategory}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={a.status} size="xs" />
                    <StatusBadge status={a.riskLevel} size="xs" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">{a.title}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{a.assessmentType}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Project: <strong className="text-slate-700 dark:text-slate-300">{a.project?.name || 'Corridor'}</strong>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {a.findings || a.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">
                  Officer: <strong className="text-slate-700 dark:text-slate-300">{a.responsibleOfficer?.name || 'Dr. Sengupta'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAssessment(a);
                      setIsDetailOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete assessment"
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

      {/* View Detail Modal */}
      {selectedAssessment && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={selectedAssessment.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <StatusBadge status={selectedAssessment.status} />
              <StatusBadge status={selectedAssessment.riskLevel} />
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {selectedAssessment.environmentalCategory}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Infrastructure Project</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedAssessment.project?.name} ({selectedAssessment.project?.code})
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Assessment Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedAssessment.assessmentType}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1">Assessment Scope & Baseline</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedAssessment.description}
              </p>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1">Technical Findings & Baseline Impact</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedAssessment.findings || 'No severe unmitigated impact observed.'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1">Mandatory Mitigation Recommendations</span>
              <p className="leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
                {selectedAssessment.recommendations || 'Standard environmental management plan prescribed.'}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Author New Environmental Impact Assessment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Comprehensive EIA for Expressway Corridor"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Project *
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
                Assessment Type *
              </label>
              <select
                value={formData.assessmentType}
                onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Comprehensive Environmental Impact Assessment (EIA)">Comprehensive EIA</option>
                <option value="Environmental Management Plan (EMP)">Environmental Management Plan (EMP)</option>
                <option value="Biodiversity & Wildlife Impact Assessment">Biodiversity & Wildlife</option>
                <option value="Hydrological & Water Resource Study">Hydrological Study</option>
                <option value="Acoustic & Noise Impact Study">Acoustic & Noise Study</option>
                <option value="Air Dispersion Modeling Report">Air Dispersion Modeling</option>
                <option value="Carbon & Climate Resilience Audit">Carbon Resilience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.environmentalCategory}
                onChange={(e) => setFormData({ ...formData, environmentalCategory: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Category A (National MoEFCC Cleared)">Category A (National)</option>
                <option value="Category B1 (State Level SEIAA Scrutinized)">Category B1 (State)</option>
                <option value="Category B2 (State Level Exempted from Public Hearing)">Category B2 (State Exempt)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Risk Classification
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
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
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Scope Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline study radius, receptors, and baseline investigation methodology..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Findings
              </label>
              <textarea
                rows={2}
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                placeholder="Observed ecological findings..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recommendations
              </label>
              <textarea
                rows={2}
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Recommended mitigation measures..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              ></textarea>
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
              {submitting ? 'Creating...' : 'Save Assessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
