import { useState, useEffect } from 'react';
import { dashboardAPI, institutionAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { HiAcademicCap, HiDocumentText, HiShieldCheck, HiUserGroup, HiCheckCircle, HiXCircle, HiClock, HiEye } from 'react-icons/hi';

export default function SuperAdminDashboard({ showToast }) {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, pendingRes, auditRes] = await Promise.all([
        dashboardAPI.getStats(),
        institutionAPI.getPending(),
        dashboardAPI.getPlatformAudit()
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setAuditLogs(auditRes.data);
    } catch (err) {
      showToast?.('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await institutionAPI.approve(id);
      showToast?.('Institution approved and authorized as issuer!', 'success');
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await institutionAPI.reject(id);
      showToast?.('Institution application rejected', 'info');
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to reject', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { icon: HiDocumentText, label: 'Total Certificates', value: stats?.totalCertificates || 0, color: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-400' },
    { icon: HiCheckCircle, label: 'Valid Certificates', value: stats?.validCertificates || 0, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
    { icon: HiXCircle, label: 'Revoked Certificates', value: stats?.revokedCertificates || 0, color: 'from-red-500/20 to-pink-500/20', iconColor: 'text-red-400' },
    { icon: HiAcademicCap, label: 'Approved Institutions', value: stats?.approvedInstitutions || 0, color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400' },
    { icon: HiClock, label: 'Pending Approvals', value: stats?.pendingInstitutions || 0, color: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-400' },
    { icon: HiUserGroup, label: 'Registered Students', value: stats?.totalStudents || 0, color: 'from-cyan-500/20 to-teal-500/20', iconColor: 'text-cyan-400' },
    { icon: HiEye, label: 'Total Verifications', value: stats?.totalVerifications || 0, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400' },
    { icon: HiShieldCheck, label: 'Total Institutions', value: stats?.totalInstitutions || 0, color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-400' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'pending', label: `Pending Applications (${pending.length})` },
    { key: 'audit', label: 'Platform Audit Log' },
  ];

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Platform oversight, institutional approvals, and blockchain verification audits</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Active (100%)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
              ${tab === t.key ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10' : 'border-white/10 text-[var(--color-text-muted)] hover:border-white/20 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
          {statCards.map((card, i) => (
            <div key={i} className="glass-card p-6" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 border border-white/10`}>
                <card.icon className={`text-2xl ${card.iconColor}`} />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{card.value}</p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-4 animate-fade-in">
          {pending.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-[var(--color-text-muted)] text-base font-medium">No pending institution applications</p>
            </div>
          ) : (
            pending.map((inst) => (
              <div key={inst.id} className="glass-card p-6">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">{inst.name}</h3>
                      <StatusBadge status="PENDING" size="sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-[var(--color-text-secondary)]">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                        <p className="font-medium text-white truncate">{inst.contactEmail}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-[var(--color-text-muted)]">Accreditation ID</p>
                        <p className="font-medium text-white truncate">{inst.accreditationId || 'N/A'}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-[var(--color-text-muted)]">Address</p>
                        <p className="font-medium text-white truncate">{inst.address || 'N/A'}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-[var(--color-text-muted)]">Website</p>
                        <p className="font-medium text-indigo-300 truncate">{inst.website || 'N/A'}</p>
                      </div>
                    </div>
                    {inst.description && <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">{inst.description}</p>}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => handleApprove(inst.id)} className="btn-success text-sm flex items-center gap-1.5 !px-5">
                      <HiCheckCircle className="text-lg" /> Approve
                    </button>
                    <button onClick={() => handleReject(inst.id)} className="btn-danger text-sm flex items-center gap-1.5 !px-5">
                      <HiXCircle className="text-lg" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Action</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Performed By</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Details</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.slice(0, 50).map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5"><StatusBadge status={log.action === 'ISSUED' ? 'VALID' : log.action === 'REVOKED' ? 'REVOKED' : log.action === 'VERIFIED' ? 'VALID' : 'PENDING'} size="sm" /></td>
                    <td className="px-6 py-3.5 text-white font-medium">{log.performedBy}</td>
                    <td className="px-6 py-3.5 text-[var(--color-text-secondary)] max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-3.5 text-[var(--color-text-muted)] text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditLogs.length === 0 && (
            <p className="p-8 text-center text-[var(--color-text-muted)]">No platform audit logs recorded yet</p>
          )}
        </div>
      )}
    </div>
  );
}
