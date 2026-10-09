import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  FileCheck2,
  Stamp,
  ShieldCheck,
  Leaf,
  CheckSquare,
  SearchCheck,
  FileText,
  Activity,
  BarChart3,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Clock,
  DollarSign,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { AccessDenied } from '../components/AccessDenied';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Related data tabs
  const [assessments, setAssessments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [mitigations, setMitigations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [monitoring, setMonitoring] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getProjectById(id);
      if (res.success) {
        setProject(res.data);
      }

      // Parallel fetch project linked records
      const [
        resAssessments,
        resApprovals,
        resCompliance,
        resMitigations,
        resTasks,
        resInspections,
        resDocs,
        resMonitoring,
      ] = await Promise.all([
        api.getAssessments({ project: id }),
        api.getApprovals({ project: id }),
        api.getCompliance({ project: id }),
        api.getMitigation({ project: id }),
        api.getTasks({ project: id }),
        api.getInspections({ project: id }),
        api.getDocuments({ project: id }),
        api.getMonitoring({ project: id }),
      ]);

      if (resAssessments.success) setAssessments(resAssessments.data || []);
      if (resApprovals.success) setApprovals(resApprovals.data || []);
      if (resCompliance.success) setCompliance(resCompliance.data || []);
      if (resMitigations.success) setMitigations(resMitigations.data || []);
      if (resTasks.success) setTasks(resTasks.data || []);
      if (resInspections.success) setInspections(resInspections.data || []);
      if (resDocs.success) setDocuments(resDocs.data || []);
      if (resMonitoring.success) setMonitoring(resMonitoring.data || []);
    } catch (err) {
      console.error('Error fetching project workspace:', err.message);
      setError(err.message || 'Access denied or project not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error && (error.toLowerCase().includes('denied') || error.toLowerCase().includes('authorized') || error.includes('403'))) {
    return (
      <AccessDenied
        moduleName="Project Workspace"
        customMessage={error}
      />
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Workspace Not Found"
        description="The requested infrastructure project record does not exist or has been archived."
        actionLabel="Return to Projects List"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderGit2, count: null },
    { id: 'assessments', label: 'Assessments', icon: FileCheck2, count: assessments.length },
    { id: 'approvals', label: 'Approvals', icon: Stamp, count: approvals.length },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck, count: compliance.length },
    { id: 'mitigation', label: 'Mitigation', icon: Leaf, count: mitigations.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'inspections', label: 'Inspections', icon: SearchCheck, count: inspections.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, count: monitoring.length },
    { id: 'reports', label: 'Reports', icon: BarChart3, count: null },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Breadcrumb header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
            {project.code}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {project.name}
          </h1>
        </div>
      </div>

      {/* Top Banner Workspace Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                {project.projectType}
              </span>
              <StatusBadge status={project.status} />
              <StatusBadge status={project.riskLevel} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Clearance: <strong className="text-slate-700 dark:text-slate-200">{project.environmentalClearanceStatus}</strong>
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {project.location}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Project Manager</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {project.manager?.name || 'Assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Capital Budget</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {project.estimatedCost}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Timeline</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(project.startDate).getFullYear()} - {new Date(project.endDate).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Gauge Card */}
          <div className="lg:col-span-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Statutory Health</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Real-Time
              </span>
            </div>

            <div className="my-4 text-center">
              <span className="text-4xl font-extrabold text-emerald-400">
                {project.compliancePercentage}%
              </span>
              <p className="text-xs text-slate-400 mt-1">Overall Statutory Compliance</p>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.compliancePercentage}%` }}
              ></div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>Completed Requirements</span>
              <strong className="text-white">
                {project.counts?.completedCompliance || 0} / {project.counts?.compliance || 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* Scope details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3">Environmental Context & Scope</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  This infrastructure corridor operates under strict environmental supervision. All construction activities, material batching, earth movement, and workforce accommodation facilities must adhere to the Environmental Management Plan (EMP) cleared by the Ministry of Environment, Forest & Climate Change.
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Environmental Category</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-1 block">Category A (National)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Permit Expiry Horizon</span>
                    <strong className="text-amber-600 dark:text-amber-400 mt-1 block">Active (Monitored)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Clearance Authority</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-1 block">MoEFCC / State SEIAA</strong>
                  </div>
                </div>
              </div>

              {/* Quick Summary of Active Conditions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Priority Compliance Requirements</h3>
                  <button onClick={() => setActiveTab('compliance')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                    View All Checklist &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {compliance.slice(0, 3).map((c) => (
                    <div key={c._id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.regulatoryCategory}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={c.status} size="xs" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.progressPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team & Key Stats Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Assigned Environmental Team</h3>
                <div className="space-y-3 text-xs">
                  {/* Lead Project Manager */}
                  {project.manager && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">
                        {project.manager.name?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.manager.name}</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                          Lead Project Manager
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Environmental Officer */}
                  {project.environmentalOfficer && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center">
                        {project.environmentalOfficer.name?.charAt(0) || 'E'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.environmentalOfficer.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                          Environmental Officer
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Compliance Staff */}
                  {project.complianceStaff && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center">
                        {project.complianceStaff.name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.complianceStaff.name}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                          Compliance Staff
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional team members */}
                  {project.assignedTeam && project.assignedTeam.filter(m => 
                    m._id !== project.manager?._id && 
                    m._id !== project.environmentalOfficer?._id && 
                    m._id !== project.complianceStaff?._id
                  ).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-slate-600/10 text-slate-700 dark:text-slate-400 font-bold flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                          {member.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!project.manager && !project.environmentalOfficer && !project.complianceStaff && (!project.assignedTeam || project.assignedTeam.length === 0) && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Team members assigned during initialization</p>
                  )}
                </div>
              </div>

              <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-900 shadow-xl">
                <h4 className="font-bold text-sm text-emerald-400 mb-2">Need a Comprehensive Audit Summary?</h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed mb-4">
                  Generate an official PDF-ready statutory compliance report for ministry submission.
                </p>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md"
                >
                  Generate Project Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ASSESSMENTS TAB */}
        {activeTab === 'assessments' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Environmental Impact Assessments</h3>
              <Link to="/assessments" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Open Full Assessment Module &rarr;
              </Link>
            </div>
            {assessments.length === 0 ? (
              <EmptyState title="No Assessments Filed" description="Create an assessment to record EIA/EMP findings." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments.map((a) => (
                  <div key={a._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded">
                        {a.environmentalCategory}
                      </span>
                      <StatusBadge status={a.status} size="xs" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{a.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{a.findings || a.description}</p>
                    <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      Evaluated on: {new Date(a.assessmentDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Clearances, Permits & Authorizations</h3>
              <Link to="/approvals" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Manage Permits &rarr;
              </Link>
            </div>
            {approvals.length === 0 ? (
              <EmptyState title="No Approvals Logged" description="Track statutory clearances and permit expiry dates." />
            ) : (
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div key={app._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{app.referenceNumber}</span>
                        <StatusBadge status={app.status} size="xs" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{app.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Authority: {app.authority}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Validity Expiry</span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {new Date(app.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Statutory Compliance Conditions</h3>
              <Link to="/compliance" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Manage Requirements &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {compliance.map((c) => (
                <div key={c._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{c.regulatoryCategory}</span>
                    <StatusBadge status={c.status} size="xs" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{c.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Due: {new Date(c.dueDate).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.progressPercentage}% Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MITIGATION TAB */}
        {activeTab === 'mitigation' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Environmental Mitigation Measures</h3>
              <Link to="/mitigation" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                All Mitigation Actions &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mitigations.map((m) => (
                <div key={m._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={m.status} size="xs" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Effectiveness: {m.effectiveness}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{m.measureTitle}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.environmentalImpact}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Notes: {m.notes || 'Operating under approved EMP protocol.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Compliance & Mitigation Tasks</h3>
              <Link to="/tasks" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Full Kanban View &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Assigned to: {t.assignedTo?.name || 'Staff'} &bull; Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.priority} size="xs" />
                    <StatusBadge status={t.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. INSPECTIONS TAB */}
        {activeTab === 'inspections' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Field Inspection Reports</h3>
              <Link to="/inspections" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Log New Inspection &rarr;
              </Link>
            </div>
            <div className="space-y-4">
              {inspections.map((ins) => (
                <div key={ins._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ins.inspectionType}</span>
                    <StatusBadge status={ins.status} size="xs" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{ins.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ins.findings}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Location: {ins.location} &bull; Inspector: {ins.inspector?.name} &bull; Date: {new Date(ins.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Project Documents & Clearances</h3>
              <Link to="/documents" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Document Repository &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {documents.map((d) => (
                <div key={d._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{d.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {d.category} &bull; {d.fileSize}
                      </p>
                    </div>
                  </div>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. MONITORING TAB */}
        {activeTab === 'monitoring' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Environmental Telemetry & Quality Logs</h3>
              <Link to="/monitoring" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Live Parameter Charts &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Measured Value</th>
                    <th className="p-3">Allowed Regulatory Limit</th>
                    <th className="p-3">Compliance Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monitoring.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{m.parameter}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.measuredValue} {m.unit}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{m.allowedLimit} {m.unit}</td>
                      <td className="p-3"><StatusBadge status={m.complianceStatus} size="xs" /></td>
                      <td className="p-3 text-slate-400 dark:text-slate-500">{new Date(m.monitoringDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Project Compliance Executive Certification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official statutory dossier generated for regulatory filing</p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-emerald-500 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Total Statutory Conditions</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{compliance.length}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Completed & Verified</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {compliance.filter(c => c.status === 'Completed').length}
                </p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Active Statutory Clearances</span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{approvals.length}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Field Inspections Logged</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{inspections.length}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Certified that the project <strong className="text-slate-800 dark:text-slate-200">{project.name}</strong> ({project.code}) is executing environmental mitigation, afforestation, dust suppression, and noise reduction under the prescribed guidelines of MoEFCC.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
