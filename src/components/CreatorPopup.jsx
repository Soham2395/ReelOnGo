import { useSettings } from '../SettingsContext.jsx';
import { getInitials } from '../config';
import { IconMapPin, IconSmartphone, IconHash, IconUser, IconClock, IconCamera, IconPhone, IconMail, IconExternalLink, IconX, IconCalendar } from './Icons';

export default function CreatorPopup({ creator, distance, onClose }) {
  const { settings, getStatusConfig } = useSettings();
  const status = getStatusConfig(creator.status);
  const rank = settings.RANK_CONFIG[creator.rank] || settings.RANK_CONFIG.Bronze;

  return (
    <div
      className="rounded-xl p-5 min-w-[300px] max-w-[340px] shadow-lg"
      style={{ background: settings.COLORS.surface, border: `1px solid ${settings.COLORS.border}` }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 z-10"
        style={{ background: settings.COLORS.surfaceLight || '#1c2029' }}
      >
        <IconX size={12} color={settings.COLORS.textMuted} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${status.color}80, ${status.color}40)` }}
        >
          {getInitials(creator.creatorName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-semibold text-sm truncate leading-tight">
              {creator.creatorName}
            </h3>
            {distance !== null && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                <span className="text-[10px] font-bold text-white/90 tabular-nums">
                  {distance.toFixed(1)} <span className="text-[8px] font-normal opacity-40 uppercase ml-px">km</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
            <span className="text-[10px]" style={{ color: rank.color }}>
              {rank.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs">
        <InfoRow icon={<IconMapPin size={12} color={settings.COLORS.textMuted} />} label="Location" value={creator.locationName || 'N/A'} settings={settings} />
        <InfoRow icon={<IconSmartphone size={12} color={settings.COLORS.textMuted} />} label="iPhone" value={creator.iPhoneModel || 'N/A'} settings={settings} />
        <InfoRow icon={<IconHash size={12} color={settings.COLORS.textMuted} />} label="Code" value={creator.creatorCode} settings={settings} />
        <InfoRow icon={<IconUser size={12} color={settings.COLORS.textMuted} />} label="Gender" value={creator.gender} settings={settings} />
        <InfoRow icon={<IconClock size={12} color={settings.COLORS.textMuted} />} label="Availability" value={creator.availability} settings={settings} />
        {creator.numberOfShoots > 0 && (
          <InfoRow icon={<IconCamera size={12} color={settings.COLORS.textMuted} />} label="Shoots" value={`${creator.numberOfShoots}`} settings={settings} />
        )}
        
        {/* Active Assignment Highlight */}
        {creator.activeAssignment?.isActive && (
          <div className="mt-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 transition-all hover:bg-blue-500/10">
            <div className="flex items-center gap-2 mb-1.5">
              <IconCalendar size={12} color="#60a5fa" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Active Assignment</span>
            </div>
            <p className="text-[11px] font-bold text-white mb-1 leading-tight">{creator.activeAssignment.eventName}</p>
            <div className="flex items-center gap-1.5 opacity-70">
              <IconMapPin size={10} color={settings.COLORS.textMuted} />
              <span className="text-[10px] font-medium" style={{ color: settings.COLORS.textSecondary }}>{creator.activeAssignment.venueName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${settings.COLORS.border}` }}>
        {creator.contactNumber && (
          <ActionBtn href={`tel:${creator.contactNumber}`} icon={<IconPhone size={12} />} label="Call" color={settings.COLORS.statusActive} />
        )}
        {creator.email && (
          <ActionBtn href={`mailto:${creator.email}`} icon={<IconMail size={12} />} label="Email" color={settings.COLORS.accent} />
        )}
        {creator.portfolio && creator.portfolio !== 'N/A' && (
          <ActionBtn href={creator.portfolio} icon={<IconExternalLink size={12} />} label="Portfolio" color={settings.COLORS.statusDemo} external />
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, settings }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 flex items-center justify-center shrink-0">{icon}</span>
      <span className="w-16 shrink-0" style={{ color: settings.COLORS.textMuted }}>{label}</span>
      <span className="truncate" style={{ color: settings.COLORS.textSecondary }}>{value}</span>
    </div>
  );
}

function ActionBtn({ href, icon, label, color, external }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={{ background: color + '12', color, border: `1px solid ${color}20` }}
    >
      {icon} {label}
    </a>
  );
}
