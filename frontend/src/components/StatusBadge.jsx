import { HiCheckCircle, HiXCircle, HiExclamationCircle } from 'react-icons/hi';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    VALID: { class: 'badge-valid', icon: HiCheckCircle, label: 'Valid' },
    REVOKED: { class: 'badge-revoked', icon: HiXCircle, label: 'Revoked' },
    INVALID: { class: 'badge-invalid', icon: HiXCircle, label: 'Invalid' },
    PENDING: { class: 'badge-pending', icon: HiExclamationCircle, label: 'Pending' },
    APPROVED: { class: 'badge-valid', icon: HiCheckCircle, label: 'Approved' },
    SUSPENDED: { class: 'badge-revoked', icon: HiXCircle, label: 'Suspended' },
    REJECTED: { class: 'badge-invalid', icon: HiXCircle, label: 'Rejected' },
  };

  const config = configs[status] || configs.INVALID;
  const Icon = config.icon;
  const sizeClasses = size === 'lg' ? 'px-5 py-2.5 text-base' : size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';

  return (
    <span className={`${config.class} ${sizeClasses} rounded-full font-semibold inline-flex items-center gap-1.5`}>
      <Icon className={size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'} />
      {config.label}
    </span>
  );
}
