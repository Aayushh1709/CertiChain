import { HiX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative glass-card p-6 max-w-lg w-full animate-fade-in bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
          >
            <HiX className="text-xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
