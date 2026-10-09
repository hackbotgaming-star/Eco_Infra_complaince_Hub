import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  LayoutGrid,
  List,
  Users,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [status, setStatus] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  // Form state
  const initialFormState = {
    name: '',
    code: '',
    projectType: 'Highway & Expressways',
    location: '',
    state: 'National',
    startDate: '',
    endDate: '',
    estimatedCost: '$150M',
    status: 'Active',
    riskLevel: 'Medium',
    description: '',
    manager: '',
    environmentalOfficer: '',
    complianceStaff: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProjects();
  }, [search, projectType, status, riskLevel, sort]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res.success && res.data) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error('Failed to load users for assignment:', err.message);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects({
        search,
        projectType,
        status,
        riskLevel,
        sort,
      });
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group and sort available personnel for selection
  const projectManagers = usersList.filter(
    (u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN'
  );
  const environmentalOfficers = usersList.filter(
    (u) => u.role === 'ENVIRONMENTAL_OFFICER'
  );
  const complianceStaffList = usersList.filter(
    (u) => u.role === 'COMPLIANCE_STAFF'
  );

  const handleOpenModal = () => {
    const defaultPm =
      user?.role === 'PROJECT_MANAGER'
        ? (user._id || user.id)
        : projectManagers.find((u) => u.role === 'PROJECT_MANAGER')?._id ||
          projectManagers[0]?._id ||
          '';

    const defaultEo = environmentalOfficers[0]?._id || '';
    const defaultStaff = complianceStaffList[0]?._id || '';

    setFormData({
      ...initialFormState,
      manager: defaultPm,
      environmentalOfficer: defaultEo,
      complianceStaff: defaultStaff,
    });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createProject(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        fetchProjects();
      }
    } catch (err) {
      alert(err.message || 'Error registering project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Infrastructure Projects Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage infrastructure assets, environmental impact scopes, and statutory compliance status.
          </p>
        </div>

        {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Infrastructure Project</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, corridor code, or location..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          {/* Type filter */}
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Sectors</option>
            <option value="Highway & Expressways">Highway & Expressways</option>
            <option value="Railway & Dedicated Freight Corridor">Railway Corridor</option>
            <option value="Solar & Renewable Power">Solar & Renewable</option>
            <option value="Industrial & Petrochemical Facility">Industrial & Petrochemical</option>
            <option value="Airport & Port Logistics">Airport & Port</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Risk Level filter */}
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
          >
            <option value="-createdAt">Newest First</option>
            <option value="name">Project Name (A-Z)</option>
            <option value="compliance-desc">Compliance: Highest First</option>
            <option value="compliance-asc">Compliance: Lowest First</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No infrastructure projects match your search"
          description="Try adjusting your filter options or create a new infrastructure project."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setProjectType('all');
            setStatus('all');
            setRiskLevel('all');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const complianceScore = p.compliancePercentage || 0;
            const progressColor =
              complianceScore >= 80 ? 'bg-emerald-500' : complianceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                      {p.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={p.status} size="xs" />
                      <StatusBadge status={p.riskLevel} size="xs" />
                    </div>
                  </div>

                  {/* Title & Type */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {p.projectType}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Location & Dates */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span>
                        {new Date(p.startDate).toLocaleDateString()} &ndash;{' '}
                        {new Date(p.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compliance Progress Bar & Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Compliance Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white">{complianceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${complianceScore}%` }}
                    ></div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        Manager: <strong className="text-slate-700 dark:text-slate-200">{p.manager?.name || 'Assigned'}</strong>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    {(p.environmentalOfficer || p.complianceStaff) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                        {p.environmentalOfficer && (
                          <span className="truncate" title={`Environmental Officer: ${p.environmentalOfficer.name}`}>
                            🌿 {p.environmentalOfficer.name}
                          </span>
                        )}
                        {p.environmentalOfficer && p.complianceStaff && <span>&bull;</span>}
                        {p.complianceStaff && (
                          <span className="truncate" title={`Compliance Staff: ${p.complianceStaff.name}`}>
                            📋 {p.complianceStaff.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Project Name</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Risk</th>
                  <th className="px-5 py-3.5">Compliance</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/projects/${p._id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{p.code}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.name}</td>
                    <td className="px-5 py-4 text-emerald-700 dark:text-emerald-400 font-medium">{p.projectType}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{p.location}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} size="xs" /></td>
                    <td className="px-5 py-4"><StatusBadge status={p.riskLevel} size="xs" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${p.compliancePercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.compliancePercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                        Details &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Infrastructure Project"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. NH-52 Expressway Expansion"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unique Project Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. EXP-NH52"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none uppercase font-mono text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Sector / Type *
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Highway & Expressways">Highway & Expressways</option>
                <option value="Railway & Dedicated Freight Corridor">Railway Corridor</option>
                <option value="Solar & Renewable Power">Solar & Renewable</option>
                <option value="Thermal & Hydro Power">Thermal & Hydro Power</option>
                <option value="Oil & Gas Pipeline">Oil & Gas Pipeline</option>
                <option value="Industrial & Petrochemical Facility">Industrial & Petrochemical</option>
                <option value="Airport & Port Logistics">Airport & Port</option>
                <option value="Urban Metro & Transit System">Urban Metro & Transit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Capital Budget
              </label>
              <input
                type="text"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="$200M / ₹1,500 Cr"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location / Corridor Chainage *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Pune to Kolhapur Section"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Region
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Environmental Risk Classification
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
          </div>

          {/* Project Governance & Key Personnel Assignment (Admin / PM selection) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Project Governance & Assigned Personnel
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Designate responsible project manager, environmental officer, and compliance staff
                  </p>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Admin Authority
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Project Manager Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Manager *
                </label>
                <select
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition font-medium"
                >
                  <option value="">Select Project Manager</option>
                  {projectManagers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} {u.role === 'ADMIN' ? '(Admin)' : '(PM)'}
                    </option>
                  ))}
                  {projectManagers.length === 0 && (
                    <option value="">No PM accounts found</option>
                  )}
                </select>
              </div>

              {/* Environmental Officer Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Environmental Officer *
                </label>
                <select
                  required
                  value={formData.environmentalOfficer}
                  onChange={(e) => setFormData({ ...formData, environmentalOfficer: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition font-medium"
                >
                  <option value="">Select Environmental Officer</option>
                  {environmentalOfficers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} (Officer)
                    </option>
                  ))}
                  {environmentalOfficers.length === 0 && (
                    <option value="">No Officers found</option>
                  )}
                </select>
              </div>

              {/* Compliance Staff Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Compliance Staff *
                </label>
                <select
                  required
                  value={formData.complianceStaff}
                  onChange={(e) => setFormData({ ...formData, complianceStaff: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition font-medium"
                >
                  <option value="">Select Compliance Staff</option>
                  {complianceStaffList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} (Staff)
                    </option>
                  ))}
                  {complianceStaffList.length === 0 && (
                    <option value="">No Staff found</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Environmental Project Description & Scope *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline environmental sensitivities, sensitive zones, and main construction activities..."
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
              {submitting ? 'Creating...' : 'Register Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
