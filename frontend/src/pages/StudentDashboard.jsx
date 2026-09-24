import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { HiDownload, HiShare, HiExternalLink, HiDocumentText, HiClipboardCopy, HiAcademicCap } from 'react-icons/hi';

export default function StudentDashboard({ showToast }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null);

  useEffect(() => {
    certificateAPI.getMine()
      .then(res => setCertificates(res.data))
      .catch(err => showToast?.('Failed to load certificates', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (uid) => {
    try {
      const response = await certificateAPI.downloadPdf(uid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${uid}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast?.('Certificate PDF download started!', 'success');
    } catch (err) {
      showToast?.('Download failed. Please try again.', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast?.('Verification link copied to clipboard!', 'success');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="mb-8 animate-fade-in border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Credentials</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">View, download, and share your blockchain-anchored academic certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card p-12 sm:p-16 text-center animate-fade-in max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5">
            <HiAcademicCap className="text-4xl text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">No Certificates Found</h3>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-md mx-auto">
            Your verified academic credentials will automatically appear here once your issuing university registers them on CertiChain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card p-6 flex flex-col justify-between group">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0">
                    <HiDocumentText className="text-2xl text-indigo-400" />
                  </div>
                  <StatusBadge status={cert.status} size="sm" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{cert.courseName}</h3>
                <p className="text-xs font-semibold text-indigo-400 mb-3">{cert.institutionName}</p>

                <div className="space-y-2 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[var(--color-text-secondary)] mb-6">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Certificate ID:</span>
                    <span className="font-mono font-semibold text-white">{cert.certificateUid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Grade / Score:</span>
                    <span className="font-semibold text-emerald-400">{cert.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Issue Date:</span>
                    <span className="font-medium text-slate-300">{cert.issueDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                <Link
                  to={`/certificate/${cert.certificateUid}`}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <HiExternalLink className="text-base text-indigo-400" /> View
                </Link>
                <button
                  onClick={() => handleDownload(cert.certificateUid)}
                  className="p-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <HiDownload className="text-base" /> PDF
                </button>
                <button
                  onClick={() => setShareModal(cert)}
                  className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <HiShare className="text-base" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <Modal title="Share Verification Proof" onClose={() => setShareModal(null)}>
          <div className="space-y-6 text-center">
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <QRCodeSVG
                value={`${window.location.origin}/verify?id=${shareModal.certificateUid}`}
                size={180}
                level="H"
              />
            </div>

            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-2">Public Verification Link</p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/verify?id=${shareModal.certificateUid}`}
                  className="bg-transparent text-indigo-300 w-full outline-none"
                />
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/verify?id=${shareModal.certificateUid}`)}
                  className="btn-secondary text-xs !py-1.5 !px-3 shrink-0"
                >
                  <HiClipboardCopy /> Copy
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
