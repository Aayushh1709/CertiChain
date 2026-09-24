import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { HiSearch, HiUpload, HiQrcode, HiDocumentSearch, HiClipboardCopy } from 'react-icons/hi';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('id');
  const [certificateId, setCertificateId] = useState(searchParams.get('id') || '');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;
      if (mode === 'id') {
        if (!certificateId.trim()) { setError('Please enter a certificate ID'); setLoading(false); return; }
        response = await verifyAPI.byId(certificateId.trim());
      } else if (mode === 'file') {
        if (!file) { setError('Please select a certificate file'); setLoading(false); return; }
        response = await verifyAPI.byFile(file);
      }
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if ID is passed in URL query param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setCertificateId(id);
      setLoading(true);
      verifyAPI.byId(id)
        .then(res => setResult(res.data))
        .catch(err => setError(err.response?.data?.error || 'Certificate not found'))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const modes = [
    { key: 'id', icon: HiSearch, label: 'Certificate ID' },
    { key: 'file', icon: HiUpload, label: 'Upload File' },
    { key: 'qr', icon: HiQrcode, label: 'QR Code' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <HiDocumentSearch className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Verify Certificate</h1>
          <p className="text-[var(--color-text-secondary)] text-base max-w-xl mx-auto">
            Instantly verify academic credentials against the immutable simulated blockchain ledger.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2.5 mb-8 justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setResult(null); setError(''); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer
                ${mode === m.key ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10' : 'border-white/10 text-[var(--color-text-muted)] hover:border-white/20 hover:text-white'}`}
            >
              <m.icon className="text-base" /> {m.label}
            </button>
          ))}
        </div>

        {/* Verification Form */}
        <div className="glass-card p-6 sm:p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleVerify}>
            {mode === 'id' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Certificate ID</label>
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xl" />
                  <input
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="input-field !pl-12 text-base font-mono"
                    placeholder="e.g. CC-DEMO0001"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'file' && (
              <div className="mb-6">
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-10 text-center hover:border-indigo-500/60 transition-colors cursor-pointer bg-indigo-500/5"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <HiUpload className="text-5xl text-indigo-400 mx-auto mb-3" />
                  {file ? (
                    <p className="text-indigo-300 font-semibold text-base">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-white font-semibold text-base">Drop your certificate file here</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">or click to browse (PDF, JPEG, PNG)</p>
                    </>
                  )}
                  <input id="file-input" type="file" className="hidden" onChange={handleFileDrop} accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
            )}

            {mode === 'qr' && (
              <div className="mb-6 text-center py-10 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                <HiQrcode className="text-6xl text-indigo-400 mx-auto mb-3 animate-pulse" />
                <p className="text-white font-semibold">Scan QR Code</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Use your camera or switch to Certificate ID mode.</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/25 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            {mode !== 'qr' && (
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 text-base font-semibold disabled:opacity-50">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><HiDocumentSearch className="text-xl" /> Verify Certificate</>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mt-8 glass-card p-6 sm:p-8 animate-fade-in">
            {/* Status Banner */}
            <div className={`p-6 rounded-2xl mb-6 text-center ${
              result.status === 'VALID' ? 'bg-emerald-950/40 border border-emerald-500/40' :
              result.status === 'REVOKED' ? 'bg-red-950/40 border border-red-500/40' :
              'bg-red-950/40 border border-red-500/40'
            }`}>
              <StatusBadge status={result.status} size="lg" />
              <p className="mt-3 text-sm font-medium text-slate-200">{result.message}</p>
            </div>

            {/* Certificate Details */}
            {(result.status === 'VALID' || result.status === 'REVOKED') && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">Certificate Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label="Certificate ID" value={result.certificateUid} isMono />
                  <InfoRow label="Student Name" value={result.studentName} />
                  <InfoRow label="Course / Degree" value={result.courseName} />
                  <InfoRow label="Grade / Score" value={result.grade} />
                  <InfoRow label="Issue Date" value={result.issueDate} />
                  <InfoRow label="Issuing Institution" value={result.institutionName} />
                </div>

                {result.status === 'REVOKED' && (
                  <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Revocation Notice</p>
                    <p className="text-sm text-red-200 mt-1">{result.revocationReason}</p>
                    {result.revokedAt && <p className="text-xs text-red-400/70 mt-1">Revoked on: {result.revokedAt}</p>}
                  </div>
                )}

                {/* Blockchain Proof */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Blockchain Verification Proof</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="overflow-hidden mr-2">
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">Transaction Hash</p>
                        <p className="text-xs font-mono text-indigo-300 truncate">{result.txHash}</p>
                      </div>
                      <button onClick={() => copyToClipboard(result.txHash)} className="text-slate-400 hover:text-indigo-300 transition-colors p-2 shrink-0">
                        <HiClipboardCopy className="text-lg" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">Block Number</p>
                        <p className="text-sm font-mono text-white">#{result.blockNumber}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Confirmed</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="overflow-hidden mr-2">
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">SHA-256 Digest</p>
                        <p className="text-xs font-mono text-slate-300 truncate">{result.certificateHash}</p>
                      </div>
                      <button onClick={() => copyToClipboard(result.certificateHash)} className="text-slate-400 hover:text-indigo-300 transition-colors p-2 shrink-0">
                        <HiClipboardCopy className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, isMono = false }) {
  if (!value) return null;
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
      <p className={`text-sm font-semibold text-white ${isMono ? 'font-mono text-indigo-300' : ''}`}>{value}</p>
    </div>
  );
}
