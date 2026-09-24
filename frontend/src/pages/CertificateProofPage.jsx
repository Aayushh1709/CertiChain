import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';
import { HiArrowLeft, HiClipboardCopy, HiDownload } from 'react-icons/hi';

export default function CertificateProofPage() {
  const { uid } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateAPI.getByUid(uid)
      .then(res => setCert(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = async () => {
    try {
      const response = await certificateAPI.downloadPdf(uid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${uid}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cert) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-2xl font-bold text-white mb-2">Certificate Not Found</p>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6">The requested certificate UID does not exist on CertiChain.</p>
      <Link to="/verify" className="btn-primary">Go to Verification Page</Link>
    </div>
  );

  const verifyUrl = `${window.location.origin}/verify?id=${cert.certificateUid}`;

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <Link to="/verify" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-indigo-300 transition-colors mb-6 font-medium">
          <HiArrowLeft /> Back to Verification
        </Link>

        <div className="glass-card p-6 sm:p-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Blockchain Proof of Credential</h1>
              <p className="text-indigo-300 font-mono text-sm font-semibold">{cert.certificateUid}</p>
            </div>
            <StatusBadge status={cert.status} size="lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Certificate Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBlock label="Student Name" value={cert.studentName} />
                <InfoBlock label="Roll Number" value={cert.studentRollNo} />
                <InfoBlock label="Course / Degree" value={cert.courseName} />
                <InfoBlock label="Grade / Score" value={cert.grade} isGreen />
                <InfoBlock label="Issue Date" value={cert.issueDate} />
                <InfoBlock label="Issuing Institution" value={cert.institutionName} />
              </div>

              {cert.status === 'REVOKED' && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Revocation Details</p>
                  <p className="text-sm text-red-200">{cert.revocationReason}</p>
                  {cert.revokedAt && <p className="text-xs text-red-400/70 mt-1">Revoked on: {new Date(cert.revokedAt).toLocaleString()}</p>}
                </div>
              )}

              {/* Blockchain Proof */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Immutable Ledger Records</h3>
                <div className="space-y-3">
                  <ProofRow label="Transaction Hash" value={cert.txHash} onCopy={copyToClipboard} />
                  <ProofRow label="Block Number" value={`#${cert.blockNumber}`} />
                  <ProofRow label="SHA-256 Digest" value={cert.certificateHash} onCopy={copyToClipboard} />
                  <ProofRow label="Anchored Timestamp" value={new Date(cert.createdAt).toLocaleString()} />
                </div>
              </div>
            </div>

            {/* QR Code & Actions Sidebar */}
            <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Scan to Verify</p>
                <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                  <QRCodeSVG value={verifyUrl} size={150} level="H" />
                </div>
              </div>

              <div className="w-full space-y-3">
                <button onClick={handleDownload} className="btn-primary w-full justify-center text-sm font-semibold !py-3">
                  <HiDownload className="text-lg" /> Download PDF Proof
                </button>
                <button onClick={() => copyToClipboard(verifyUrl)} className="btn-secondary w-full justify-center text-sm font-semibold !py-3">
                  <HiClipboardCopy className="text-lg" /> Copy Verification URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, isGreen = false }) {
  if (!value) return null;
  return (
    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${isGreen ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function ProofRow({ label, value, onCopy }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
      <div className="overflow-hidden mr-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        <p className="font-mono text-indigo-300 truncate">{value}</p>
      </div>
      {onCopy && (
        <button onClick={() => onCopy(value)} className="text-slate-400 hover:text-indigo-300 transition-colors p-1.5 shrink-0">
          <HiClipboardCopy className="text-base" />
        </button>
      )}
    </div>
  );
}
