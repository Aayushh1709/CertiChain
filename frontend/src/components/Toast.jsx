import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';

export default function Toast({ message, type = 'info', onClose }) {
  const configs = {
    success: { bg: 'bg-green-900/80 border-green-500/50', icon: HiCheckCircle, iconColor: 'text-green-400' },
    error: { bg: 'bg-red-900/80 border-red-500/50', icon: HiXCircle, iconColor: 'text-red-400' },
    info: { bg: 'bg-blue-900/80 border-blue-500/50', icon: HiInformationCircle, iconColor: 'text-blue-400' },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`fixed top-20 right-4 z-50 animate-slide-in ${config.bg} border backdrop-blur-lg rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-3 max-w-sm`}>
      <Icon className={`text-xl flex-shrink-0 ${config.iconColor}`} />
      <p className="text-sm text-white font-medium">{message}</p>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
        <HiX className="text-lg" />
      </button>
    </div>
  );
}
