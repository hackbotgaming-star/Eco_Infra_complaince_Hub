import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PERSONAS } from '../utils/permissions';

export const AccessDenied = ({
  moduleName = '',
  requiredPermission = '',
  customMessage = '',
}) => {
  const navigate = useNavigate();
  const { user, currentPersona, switchPersona } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-elevated text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 rounded-b-full"></div>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 inline-block mb-3">
          403 Forbidden &bull; Role-Based Access Control
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Access Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          {customMessage ||
            `Your current role is not authorized to access ${
              moduleName ? `the ${moduleName} module` : 'this resource'
            }.`}
        </p>

        {/* Current Active Persona Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {user?.name || 'Authenticated User'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {currentPersona?.badge || user?.role?.replace('_', ' ') || 'Guest Role'} &bull; {user?.department || 'Environmental Hub'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          {requiredPermission && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>Requires permission: <code className="font-mono text-rose-600 dark:text-rose-400 font-bold">{requiredPermission}</code></span>
            </div>
          )}
        </div>

        {/* Demo Fast Switcher (For convenience when testing) */}
        <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
            Switch to an Authorized Persona:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.values(DEMO_PERSONAS).map((p) => {
              const isActive = user?.role === p.key;
              return (
                <button
                  key={p.key}
                  disabled={isActive}
                  onClick={async () => {
                    await switchPersona(p.key);
                  }}
                  className={`p-2 rounded-xl text-left transition border ${
                    isActive
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent cursor-default'
                      : 'bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-bold truncate text-[11px]">{p.roleLabel}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.shortName}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm shadow-emerald-600/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
