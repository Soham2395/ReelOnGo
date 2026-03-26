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
    const creatorCoords = creator.activeAssignment?.currentCoordinates || 
                         (creator.locationCoordinates || creator.location)?.coordinates;
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
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium px-1.5 py-px rounded shrink-0"
                style={{ color: status.color, background: status.bg }}
              >
                {status.label}
              </span>
              {!creator.activeAssignment?.isActive && creator.locationName && creator.locationName !== 'N/A' && (
                <span className="text-[10px] truncate opacity-50" style={{ color: settings.COLORS.textSecondary }}>
                  {creator.locationName.split(',')[0]}
                </span>
              )}
            </div>
            
            {creator.activeAssignment?.isActive && (
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 w-fit max-w-full">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tight shrink-0">At</span>
                  <span className="text-[10px] font-bold text-blue-400 truncate">
                    {creator.activeAssignment.venueName}
                  </span>
                </div>
                {creator.activeAssignment.assignmentEnd && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/5 border border-blue-500/10">
                    <span className="text-[9px] font-medium text-blue-400/80 tabular-nums">
                      {creator.activeAssignment.assignmentStart ? 
                        `${new Date(creator.activeAssignment.assignmentStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - ` : 
                        'Until '}
                      {new Date(creator.activeAssignment.assignmentEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                )}
              </div>
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
