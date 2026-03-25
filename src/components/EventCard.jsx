import { useSettings } from '../SettingsContext.jsx';
import { EVENT_CONFIG } from '../config';
import { IconChevronRight, IconMapPin } from './Icons';

export default function EventCard({ event, isSelected, onClick }) {
  const { settings } = useSettings();

  if (!event) return null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-lg transition-all duration-150 group"
      style={{
        background: isSelected ? `${EVENT_CONFIG.color}15` : 'transparent',
        border: `1px solid ${isSelected ? `${EVENT_CONFIG.color}30` : 'transparent'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0 transition-transform duration-150 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${EVENT_CONFIG.color}, ${EVENT_CONFIG.color}cc)` }}
        >
          <IconMapPin size={14} color="white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-medium text-white truncate">{event.subeventName}</h4>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-medium px-1.5 py-px rounded border"
              style={{ color: EVENT_CONFIG.color, borderColor: `${EVENT_CONFIG.color}30`, background: `${EVENT_CONFIG.color}10` }}
            >
              {event.eventStatus}
            </span>
            <span className="text-[10px] truncate" style={{ color: settings.COLORS.textMuted }}>
              {event.startDate || 'No date'}
            </span>
          </div>
        </div>

        <IconChevronRight
          size={14}
          color={isSelected ? EVENT_CONFIG.color : settings.COLORS.textMuted}
          className={`shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>
    </button>
  );
}
