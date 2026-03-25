import { useMemo } from 'react';
import { useSettings } from '../SettingsContext.jsx';
import { getInitials, calculateDistance } from '../config';
import { IconChevronRight } from './Icons';

export default function CreatorCard({ creator, isSelected, onClick, selectedEvent }) {
  const { settings, getStatusConfig } = useSettings();
  const status = getStatusConfig(creator.status);

  const distance = useMemo(() => {
    if (!selectedEvent?.venueLocation?.coordinates) return null;
    const [eventLon, eventLat] = selectedEvent.venueLocation.coordinates;
    const creatorCoords = (creator.locationCoordinates || creator.location)?.coordinates;
    if (!creatorCoords) return null;
    return calculateDistance(eventLat, eventLon, creatorCoords[1], creatorCoords[0]);
  }, [selectedEvent, creator]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-lg transition-all duration-150 group"
      style={{
        background: isSelected ? settings.COLORS.accentBg : 'transparent',
        border: `1px solid ${isSelected ? settings.COLORS.accentBorder : 'transparent'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0 transition-transform duration-150 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${status.color}70, ${status.color}35)` }}
        >
          {getInitials(creator.creatorName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[13px] font-medium text-white truncate">{creator.creatorName}</h4>
            {distance !== null && (
              <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 shrink-0">
                <span className="text-[9px] font-bold text-white/40 tabular-nums">{distance.toFixed(1)}km</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-medium px-1.5 py-px rounded"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
            {creator.locationName && creator.locationName !== 'N/A' && (
              <span className="text-[10px] truncate" style={{ color: settings.COLORS.textMuted }}>
                {creator.locationName.split(',')[0]}
              </span>
            )}
          </div>
        </div>

        <IconChevronRight
          size={14}
          color={isSelected ? settings.COLORS.accent : settings.COLORS.textMuted}
          className={`shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>
    </button>
  );
}
