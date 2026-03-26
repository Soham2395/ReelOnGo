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
              className="text-[10px] font-bold px-1.5 py-px rounded border"
              style={{ color: EVENT_CONFIG.color, borderColor: `${EVENT_CONFIG.color}30`, background: `${EVENT_CONFIG.color}10` }}
            >
              EVENT
            </span>
            <span className="text-[10px] truncate" style={{ color: settings.COLORS.textMuted }}>
              {event.subeventStart ? new Date(event.subeventStart).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
            </span>
          </div>
          {event.subeventStart && event.subeventEnd && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-white/40 tabular-nums">
                {new Date(event.subeventStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(event.subeventEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>
          )}
          {event.venue && (
            <div className="text-[9px] text-white/30 mt-1 truncate max-w-[200px]">
               {event.venue.split(',')[0]}
            </div>
          )}
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
