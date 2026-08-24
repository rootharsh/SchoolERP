import React from 'react';
import { LucideIcon, ShieldCheck, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
}) => {
  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      {(subtitle || change) && (
        <div className="mt-3 flex items-center text-xs space-x-2">
          {change && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                changeType === 'positive'
                  ? 'text-emerald-700 bg-emerald-50'
                  : changeType === 'negative'
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-slate-700 bg-slate-100'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-700">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 print:static print:p-0 print:bg-white print:backdrop-blur-none print:z-auto print:overflow-visible print:block">
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xl w-full ${maxWidthClass} overflow-hidden my-8 max-h-[90vh] flex flex-col print:shadow-none print:border-none print:my-0 print:max-h-none print:max-w-full print:rounded-none print:overflow-visible print:block`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-700 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible">{children}</div>
      </div>
    </div>
  );
};

export const RlsShieldBadge: React.FC<{ schoolName: string; role: string }> = ({ schoolName, role }) => {
  return (
    <div className="hidden lg:flex items-center space-x-2 bg-blue-950/40 text-sky-200 border border-blue-800/60 px-3 py-1.5 rounded-lg text-xs">
      <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
      <span>
        <span className="font-semibold text-white">Postgres RLS:</span> {schoolName} • <span className="text-sky-300 font-mono">{role}</span>
      </span>
    </div>
  );
};
