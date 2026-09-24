import { useState, useEffect } from 'react';
import { certificateAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { HiPlus, HiDocumentText, HiCheckCircle, HiXCircle, HiTrash, HiClipboardCopy, HiExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function InstitutionDashboard({ showToast }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeModal, setRevokeModal] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const [issueForm, setIssueForm] = useState({
    studentId: '', studentName: '', studentRollNo: '',
    courseName: '', grade: '', issueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [certsRes, studentsRes] = await Promise.all([
        certificateAPI.getInstitution(),
        certificateAPI.getStudents()
      ]);
      setCertificates(certsRes.data);
      setStudents(studentsRes.data);
      
      if (user.institutionId) {
        const auditRes = await dashboardAPI.getInstitutionAudit(user.institutionId);
        setAuditLogs(auditRes.data);
      }
    } catch (err) {
      showToast?.('Failed to load institution data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await certificateAPI.issue({
        ...issueForm,
        studentId: parseInt(issueForm.studentId)
      });
      showToast?.('Certificate issued and anchored on blockchain successfully!', 'success');
      setIssueForm({ studentId: '', studentName: '', studentRollNo: '', courseName: '', grade: '', issueDate: new Date().toISOString().split('T')[0] });
      setTab('certificates');
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to issue certificate', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      showToast?.('Please provide a revocation reason', 'error');
      return;
    }
    try {
      await certificateAPI.revoke(revokeModal.id, revokeReason);
      showToast?.('Certificate revoked successfully', 'info');
      setRevokeModal(null);
      setRevokeReason('');
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to revoke certificate', 'error');
    }
  };

  const handleStudentSelect = (e) => {
    const student = students.find(s => String(s.id) === e.target.value);
    if (student) {
      setIssueForm({ ...issueForm, studentId: String(student.id), studentName: student.fullName });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast?.('Copied to clipboard!', 'info');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const validCount = certificates.filter(c => c.status === 'VALID').length;
  const revokedCount = certificates.filter(c => c.status === 'REVOKED').length;

  const tabs = [
    { key: 'certificates', label: `Issued Certificates (${certificates.length})` },
    { key: 'issue', label: 'Issue New Certificate' },
    { key: 'audit', label: 'Institution Audit Log' },
  ];

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Institution Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">{user.institutionName || 'Authorized Institution Admin'}</p>
        </div>
        <button onClick={() => setTab('issue')} className="btn-primary text-sm flex items-center gap-2">
          <HiPlus className="text-lg" /> Issue Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 shrink-0">
            <HiDocumentText className="text-2xl text-indigo-400" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{certificates.length}</p>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Certificates Issued</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-white/10 shrink-0">
            <HiCheckCircle className="text-2xl text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{validCount}</p>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Active & Valid</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center border border-white/10 shrink-0">
            <HiXCircle className="text-2xl text-red-400" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{revokedCount}</p>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Revoked Credentials</p>
          </div>
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

      {tab === 'certificates' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Certificate ID</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Student Name</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Course / Degree</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Issue Date</th>
                  <th className="text-left px-6 py-4 text-[var(--color-text-muted)] font-semibold">Status</th>
                  <th className="text-right px-6 py-4 text-[var(--color-text-muted)] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-indigo-300 font-semibold">{cert.certificateUid}</td>
                    <td className="px-6 py-4 text-white font-medium">{cert.studentName}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">{cert.courseName}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)] text-xs">{cert.issueDate}</td>
                    <td className="px-6 py-4"><StatusBadge status={cert.status} size="sm" /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/certificate/${cert.certificateUid}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 transition-colors" title="View Proof">
                          <HiExternalLink className="text-lg" />
                        </Link>
                        <button onClick={() => copyToClipboard(cert.certificateUid)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Copy ID">
                          <HiClipboardCopy className="text-lg" />
                        </button>
                        {cert.status === 'VALID' && (
                          <button onClick={() => setRevokeModal(cert)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Revoke Certificate">
                            <HiTrash className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {certificates.length === 0 && (
            <p className="p-10 text-center text-[var(--color-text-muted)] text-base font-medium">No certificates issued yet. Click "Issue New Certificate" above.</p>
          )}
        </div>
      )}

      {tab === 'issue' && (
        <div className="glass-card p-6 sm:p-8 max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Issue New Certificate</h2>
          <form onSubmit={handleIssue} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Select Registered Student</label>
                <select onChange={handleStudentSelect} className="input-field" required>
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Student Full Name</label>
                <input type="text" value={issueForm.studentName} onChange={e => setIssueForm({...issueForm, studentName: e.target.value})} className="input-field" placeholder="Student Name" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Roll Number / Registration No.</label>
                <input type="text" value={issueForm.studentRollNo} onChange={e => setIssueForm({...issueForm, studentRollNo: e.target.value})} className="input-field" placeholder="e.g. 2024CS101" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Course / Degree Name</label>
                <input type="text" value={issueForm.courseName} onChange={e => setIssueForm({...issueForm, courseName: e.target.value})} className="input-field" placeholder="e.g. Bachelor of Technology in Computer Science" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Grade / CGPA</label>
                <input type="text" value={issueForm.grade} onChange={e => setIssueForm({...issueForm, grade: e.target.value})} className="input-field" placeholder="e.g. 9.4 / 10.0 or First Class with Distinction" required />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Issue Date</label>
                <input type="date" value={issueForm.issueDate} onChange={e => setIssueForm({...issueForm, issueDate: e.target.value})} className="input-field" required />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center !py-3.5 text-base font-semibold mt-4">
              <HiPlus className="text-xl" /> Issue & Anchor on Blockchain
            </button>
          </form>
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
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5"><StatusBadge status={log.action === 'ISSUED' ? 'VALID' : 'REVOKED'} size="sm" /></td>
                    <td className="px-6 py-3.5 text-white font-medium">{log.performedBy}</td>
                    <td className="px-6 py-3.5 text-[var(--color-text-secondary)] max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-3.5 text-[var(--color-text-muted)] text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditLogs.length === 0 && (
            <p className="p-10 text-center text-[var(--color-text-muted)] text-base font-medium">No institution audit logs recorded yet</p>
          )}
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModal && (
        <Modal title="Revoke Certificate" onClose={() => setRevokeModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Are you sure you want to revoke certificate <span className="font-mono text-indigo-300 font-semibold">{revokeModal.certificateUid}</span> for <span className="text-white font-semibold">{revokeModal.studentName}</span>?
            </p>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Revocation Reason</label>
              <textarea
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Reason for revocation (e.g., Disciplinary action, Error in student record)"
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-3">
              <button onClick={() => setRevokeModal(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleRevoke} className="btn-danger text-sm">Revoke Credential</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
