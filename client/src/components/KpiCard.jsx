import React from 'react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  colorScheme = 'emerald',
  onClick,
}) => {
  const schemeStyles = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      glow: 'hover:shadow-glow-emerald',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      glow: '',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
      border: 'hover:border-amber-300 dark:hover:border-amber-700',
      glow: '',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      glow: '',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      border: 'hover:border-slate-300 dark:hover:border-slate-600',
      glow: '',
    },
  }[colorScheme] || {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    glow: '',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card transition-all duration-200 hover:shadow-soft ${schemeStyles.border} ${schemeStyles.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${schemeStyles.bg} transition-colors flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend}
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs target/benchmark</span>
        </div>
      )}
    </div>
  );
};
