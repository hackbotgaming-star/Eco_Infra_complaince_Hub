import React, { useState, useEffect } from 'react';
import {
  Printer,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const ReportsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.success && res.data.length > 0) {
        setProjects(res.data);
        setSelectedProjectId(res.data[0]._id);
        fetchProjectSummary(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSummary = async (pId) => {
    try {
      setLoading(true);
      const res = await api.getProjectSummaryReport(pId);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (e) => {
    const id = e.target.value;
    setSelectedProjectId(id);
    fetchProjectSummary(id);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={4} />
        <LoadingSkeleton type="table" count={4} />
      </div>
    );
  }

  const { project, summary, compliance, approvals, mitigations } = reportData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header - Not printed */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Environmental Regulatory Dossier & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate formal statutory compliance summaries for MoEFCC, State Pollution Control Boards, and executive leadership.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={handleProjectSelect}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none shadow-sm"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-card space-y-8">
        {/* Report Official Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900 dark:border-slate-700">
          <div>
            <div className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
              Statutory Compliance Certification Dossier
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Project Identifier: {project?.code} &bull; Sector: {project?.projectType}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
            <p>Generated: <strong>{new Date().toLocaleDateString()}</strong></p>
            <p className="mt-0.5">Project Manager: <strong className="text-slate-700 dark:text-slate-300">{project?.manager?.name || 'Directorate'}</strong></p>
            <p className="mt-0.5">Status: <strong className="text-emerald-700 dark:text-emerald-400">{project?.status}</strong></p>
          </div>
        </div>

        {/* Executive Scorecard Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Overall Compliance Score</span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
              {summary?.complianceScore}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Target benchmark: 85%</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Statutory Conditions</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white block mt-1">
              {summary?.completedRequirements} / {summary?.totalRequirements}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Conditions verified</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Regulatory Clearances</span>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 block mt-1">
              {summary?.approvalsApproved} / {summary?.approvalsTotal}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">EC, CTE & FC Authorizations</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Open Audit Violations</span>
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 block mt-1">
              {summary?.openViolations || 0}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Pending closeouts</span>
          </div>
        </div>

        {/* Section 1: Regulatory Clearances & Expiration Status */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            1. Environmental Clearances & Permits Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-2.5">Clearance Title</th>
                  <th className="p-2.5">Reference Number</th>
                  <th className="p-2.5">Issuing Authority</th>
                  <th className="p-2.5">Validity Expiration</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {approvals && approvals.map((app) => (
                  <tr key={app._id}>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{app.name}</td>
                    <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{app.referenceNumber}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{app.authority}</td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      {new Date(app.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-2.5 font-semibold text-emerald-700 dark:text-emerald-400">{app.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Statutory Compliance Conditions Checklist */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            2. Statutory Conditions Adherence (Air, Water, Forest, Wildlife Acts)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="p-2.5">Condition Scope</th>
                  <th className="p-2.5">Governing Act</th>
                  <th className="p-2.5">Due Date</th>
                  <th className="p-2.5">Progress</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {compliance && compliance.map((c) => (
                  <tr key={c._id}>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 max-w-sm">{c.title}</td>
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400 font-medium">{c.regulatoryCategory}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{new Date(c.dueDate).toLocaleDateString()}</td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{c.progressPercentage}%</td>
                    <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Mitigation Measures & Engineering Controls */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            3. Environmental Management Plan (EMP) Mitigation Measures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mitigations && mitigations.map((m) => (
              <div key={m._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{m.measureTitle}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">{m.status}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{m.environmentalImpact}</p>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[11px]">
                  <span>Effectiveness: <strong className="text-slate-700 dark:text-slate-300">{m.effectiveness}</strong></span>
                  <span>Target: <strong className="text-slate-700 dark:text-slate-300">{new Date(m.targetDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Sign-off Footer */}
        <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">Eco Infra Compliance Hub — Compliance Verification System</p>
            <p className="mt-0.5">Automated timestamped cryptographic certification record.</p>
          </div>

          <div className="text-center sm:text-right">
            <div className="w-48 border-b border-slate-400 dark:border-slate-600 mb-2"></div>
            <p className="font-bold text-slate-800 dark:text-slate-200">Environmental Officer / Auditor Signature</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Dr. Vikram Sengupta / Arunabh Sharma</p>
          </div>
        </div>
      </div>
    </div>
  );
};
