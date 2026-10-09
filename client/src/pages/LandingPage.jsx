import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Leaf,
  BarChart3,
  FileCheck,
  Stamp,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Users,
  SearchCheck,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [activeFeatureTab, setActiveFeatureTab] = useState('compliance');

  const handleDemoAccess = async (role) => {
    await quickLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-lg leading-tight">
                Eco Infra<span className="text-emerald-400"> Compliance Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                Infrastructure SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                Go to Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => handleDemoAccess('ADMIN')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>1-Click Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise Environmental Compliance Management
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Systematic Environmental Compliance for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            Mega Infrastructure
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Centralize environmental impact assessments, regulatory clearance permits, statutory compliance requirements, mitigation measures, and automated monitoring for roads, railways, pipelines, and renewable energy.
        </p>

        {/* Quick Launch Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleDemoAccess('ADMIN')}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 flex items-center gap-2"
          >
            Launch Live Demo (Admin) <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDemoAccess('PROJECT_MANAGER')}
            className="px-5 py-3.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm hover:bg-slate-700/80 transition"
          >
            Explore as Project Manager
          </button>
        </div>

        {/* Hero Metric Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {[
            { label: 'Regulatory Coverage', value: '100%', sub: 'MoEFCC, CPCB & SPCB Acts' },
            { label: 'Clearance Tracking', value: '0 Missed', sub: 'Automated 60-day expiry alert' },
            { label: 'Field Auditing', value: 'Continuous', sub: 'Geotagged inspections' },
            { label: 'Audit Trail', value: 'Tamper-Evident', sub: 'Comprehensive action history' },
          ].map((m, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 backdrop-blur-sm">
              <span className="text-2xl font-bold text-emerald-400">{m.value}</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">{m.label}</p>
              <p className="text-[11px] text-slate-500">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 bg-slate-950 border-y border-slate-800 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              The Critical Challenge
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-white">
              Why Traditional Compliance Fails Infrastructure Projects
            </p>
            <p className="mt-3 text-slate-400 text-sm">
              Infrastructure developers face heavy regulatory fines, stop-work notices, and litigation due to fragmented tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Fragmented Excel Sheets & Emails',
                desc: 'Permit conditions and mitigation schedules are buried across individual team spreadsheets, leading to overlooked requirements.',
                icon: AlertTriangle,
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
              },
              {
                title: 'Unmonitored Clearance Expiries',
                desc: 'Consents to Establish (CTE) and Forest Clearances expire unnoticed, causing statutory halts and severe reputational damage.',
                icon: Clock,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
              {
                title: 'Disconnected Field Inspections',
                desc: 'Site inspection findings, photos, and contractor remediation evidence are isolated in paper binders and lost over project lifecycles.',
                icon: FileText,
                color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
              },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${p.color} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            The Eco Infra Compliance Hub Solution
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white">
            Unified Environmental Intelligence & Workflow Platform
          </p>
          <p className="mt-3 text-slate-400 text-sm">
            Everything your project directors, environmental engineers, and regulatory inspectors need in one synchronized space.
          </p>
        </div>

        {/* Feature Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Tab Selector */}
          <div className="lg:col-span-5 space-y-2">
            {[
              {
                id: 'compliance',
                title: 'Statutory Compliance Tracking',
                desc: 'Track condition-by-condition adherence across Air, Water, Forest, and Wildlife Protection Acts.',
                icon: ShieldCheck,
              },
              {
                id: 'approvals',
                title: 'Permit & Clearance Lifecycle',
                desc: 'Continuous countdown tracking of EC, CTE, CTO, and Forest clearance validity with 60-day alerts.',
                icon: Stamp,
              },
              {
                id: 'mitigation',
                title: 'Mitigation Measures & Impact',
                desc: 'Monitor wildlife corridors, dust suppression cannons, ZLD treatment, and compensatory afforestation.',
                icon: Leaf,
              },
              {
                id: 'inspections',
                title: 'Field Inspections & Violations',
                desc: 'Log site observations, attach evidence photos, assign corrective tasks, and verify closeouts.',
                icon: SearchCheck,
              },
              {
                id: 'monitoring',
                title: 'Continuous Telemetry & IoT Logs',
                desc: 'Record ambient PM2.5, PM10, noise, and water parameters against allowed statutory thresholds.',
                icon: Activity,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {tab.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tab.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Preview Mockup Box */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="ml-2 text-xs font-mono text-slate-400">
                  Eco Infra Compliance Hub / NH-48 Expressway
                </span>
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                88% Compliant
              </span>
            </div>

            {/* Simulated Live UI Card */}
            <div className="mt-6 space-y-4 font-sans text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Clearances</p>
                  <p className="text-lg font-bold text-white mt-1">4 Active</p>
                  <p className="text-[10px] text-amber-400 font-medium mt-0.5">1 Expiring in 30d</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Mitigation</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">3 Implemented</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">High Effectiveness</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Telemetry</p>
                  <p className="text-lg font-bold text-white mt-1">PM2.5: 42</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Limit: 60 µg/m³</p>
                </div>
              </div>

              {/* Requirement Checklist Simulation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Dust Suppression Mist Cannons at Batching Plant
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    80% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Air Act Statutory Condition</span>
                  <span>Due: Oct 15, 2026</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    Forest Clearance Stage-II (42 Ha Divergence)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ref: FC-MAH-2023/8892 &bull; MoEFCC Central Division
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                  Expires in 30 Days
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Ready to explore full live platform?</span>
              <button
                onClick={() => handleDemoAccess('ADMIN')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                Access Full Workspace &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Personas Showcase */}
      <section className="py-20 bg-slate-950 border-t border-slate-800 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Role-Based Access Control
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white">
            Tailored Experiences Across the Project Hierarchy
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                role: 'ADMIN',
                title: 'System Administrator',
                name: 'Dr. Vikram Sengupta',
                duties: ['User administration & role mapping', 'Full organization compliance oversight', 'Audit trail inspection', 'System settings & thresholds'],
              },
              {
                role: 'PROJECT_MANAGER',
                title: 'Project Manager',
                name: 'Sarah Jenkins, PMP',
                duties: ['Assigned project lifecycle', 'Task delegation & deadline tracking', 'Mitigation progress review', 'Project compliance scorecards'],
              },
              {
                role: 'ENVIRONMENTAL_OFFICER',
                title: 'Environmental Officer',
                name: 'Arunabh Sharma',
                duties: ['EIA/EMP assessment authoring', 'Regulatory permit conditions', 'Site inspections & photo logs', 'Environmental monitoring inputs'],
              },
              {
                role: 'COMPLIANCE_STAFF',
                title: 'Compliance Staff',
                name: 'Elena Rodriguez',
                duties: ['Assigned field task execution', 'Uploading compliance verification evidence', 'Status updates', 'Deadline tracking'],
              },
            ].map((p, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                      {p.role}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mb-4">{p.name}</p>
                  <ul className="space-y-2 text-xs text-slate-400 mb-6">
                    {p.duties.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleDemoAccess(p.role)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-semibold text-xs transition border border-slate-700 hover:border-emerald-500 text-center"
                >
                  Log In As {p.title.split(' ')[0]} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 px-6 border-t border-slate-800 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Streamline Infrastructure Environmental Compliance?
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Launch the full MERN application instantly with preloaded infrastructure projects, permits, tasks, and telemetry data.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleDemoAccess('ADMIN')}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 flex items-center gap-2"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-12 text-xs text-slate-600">
            Eco Infra Compliance Hub &bull; Environmental Compliance Management Platform for Infrastructure Projects &bull; MERN Stack (React, Vite, Node, Express, MongoDB, Mongoose)
          </p>
        </div>
      </footer>
    </div>
  );
};
