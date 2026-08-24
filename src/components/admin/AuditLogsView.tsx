import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpDb } from '../../services/db';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Terminal,
  Activity,
  UserCheck,
  Calendar,
  ShieldAlert,
  Bug,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { SecurityAttackLog } from '../../server/securityLog';

export const AuditLogsView: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'ALL' | 'SECURITY_ALERTS'>('ALL');
  const [serverThreatLogs, setServerThreatLogs] = useState<SecurityAttackLog[]>([]);
  const [loadingThreatLogs, setLoadingThreatLogs] = useState<boolean>(false);

  const localLogs = erpDb.getAuditLogs(currentSchool.id) || [];

  // Fetch server threat logs
  const fetchServerSecurityLogs = async () => {
    setLoadingThreatLogs(true);
    try {
      const res = await fetch('/api/auth/security-logs?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setServerThreatLogs(data.logs);
        }
      }
    } catch {
      // In standalone / client mode, fallback to local DB logs
    } finally {
      setLoadingThreatLogs(false);
    }
  };

  useEffect(() => {
    fetchServerSecurityLogs();
  }, []);

  const filteredLocalLogs = (localLogs || []).filter((l) => {
    if (viewTab === 'SECURITY_ALERTS') {
      const isSecurity =
        l.action.includes('SECURITY') ||
        l.action.includes('ATTACK') ||
        l.action.includes('FAILED') ||
        l.action.includes('REJECTED') ||
        l.resource_type.includes('AUTH') ||
        l.user_id.includes('ANONYMOUS');
      if (!isSecurity) return false;
    }

    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user_name.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.resource_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Security &amp; RLS Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident system activity log recording all data mutations, server-side Zod input validation rejections, and threat mitigations for {currentSchool.name}.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Activity ({localLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('SECURITY_ALERTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewTab === 'SECURITY_ALERTS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Blocked Attacks &amp; Rejections</span>
          </button>
        </div>
      </div>

      {/* Threat Guard Summary Banner if viewing Security Alerts */}
      {viewTab === 'SECURITY_ALERTS' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>Server-Side Threat Defense Active</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                  GENERIC ERRORS ENFORCED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every login, signup, and token endpoint re-checks input via server Zod schemas. XSS script tags, SQLi probes, and malformed inputs are strictly rejected without leaking internal error specifics to clients.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchServerSecurityLogs}
            disabled={loadingThreatLogs}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingThreatLogs ? 'animate-spin' : ''}`} />
            <span>Sync Server Logs</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs by action, user, or resource..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold">
              {viewTab === 'SECURITY_ALERTS' ? 'Security & Attack Guard Stream' : `System Audit Stream (school_id = ${currentSchool.id})`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            RLS &amp; ZOD HARDENED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[650px] w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User / Source</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Threat / Operation Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocalLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLocalLogs.map((log) => {
                  const isThreat =
                    log.action.includes('SECURITY') ||
                    log.action.includes('ATTACK') ||
                    log.action.includes('REJECTED') ||
                    log.action.includes('FAILED');

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 font-mono text-[11px] ${
                        isThreat ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{log.user_name}</span>
                        <span className="block text-[10px] text-blue-600 uppercase font-sans font-semibold">
                          {log.user_role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                            isThreat
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 uppercase font-semibold">
                        {log.resource_type}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
