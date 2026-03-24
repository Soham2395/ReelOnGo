import { useMemo } from 'react';
import { useSettings } from '../SettingsContext.jsx';
import { getCity } from '../config';

export default function StatsBar({ creators, allCreators, isMobile }) {
  const { settings, getStatusConfig } = useSettings();

  const stats = useMemo(() => {
    const active = creators.filter((c) => c.status === 'ACTIVE').length;
    const onboarded = creators.filter((c) => c.status === 'ONBOARDED').length;
    const workshop = creators.filter((c) => c.status === 'WORKSHOP_INITIATED').length;

    const cityCount = {};
    creators.forEach((c) => {
      const city = getCity(c.locationName);
      if (city !== 'Unknown') cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, isMobile ? 0 : 3);

    return { active, onboarded, workshop, topCities, total: creators.length };
  }, [creators, isMobile]);

  return (
    <div className={`absolute ${isMobile ? 'bottom-3' : 'bottom-5'} left-1/2 -translate-x-1/2 z-10 w-max max-w-[95vw]`}>
      <div
        className={`rounded-xl ${isMobile ? 'px-3 py-2 gap-2' : 'px-5 py-2.5 gap-4'} flex items-center shadow-2xl`}
        style={{ 
          background: 'rgba(22, 25, 33, 0.95)', 
          border: `1px solid ${settings.COLORS.border}`, 
          backdropFilter: 'blur(12px)' 
        }}
      >
        <StatItem label="Total" value={stats.total} color={settings.COLORS.accent} settings={settings} isMobile={isMobile} />
        <Divider settings={settings} isMobile={isMobile} />
        <StatItem label="Active" value={stats.active} color={getStatusConfig('ACTIVE').color} settings={settings} isMobile={isMobile} />
        <Divider settings={settings} isMobile={isMobile} />
        <StatItem label="Onboarded" value={stats.onboarded} color={getStatusConfig('ONBOARDED').color} settings={settings} isMobile={isMobile} />
        <Divider settings={settings} isMobile={isMobile} />
        <StatItem label="Workshop" value={stats.workshop} color={getStatusConfig('WORKSHOP_INITIATED').color} settings={settings} isMobile={isMobile} />
        
        {!isMobile && stats.topCities.length > 0 && (
          <>
            <Divider settings={settings} />
            <div className="flex items-center gap-3">
              {stats.topCities.map(([city, count]) => (
                <div key={city} className="text-center">
                  <div className="text-xs font-semibold text-white">{count}</div>
                  <div className="text-[10px] truncate max-w-[55px]" style={{ color: settings.COLORS.textMuted }}>{city}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, color, settings, isMobile }) {
  return (
    <div className={`text-center ${isMobile ? 'min-w-[32px]' : 'min-w-[44px]'}`}>
      <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold`} style={{ color }}>{value}</div>
      <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} uppercase tracking-wider font-semibold`} style={{ color: settings.COLORS.textMuted }}>{label}</div>
    </div>
  );
}

function Divider({ settings, isMobile }) {
  return <div className={`w-px ${isMobile ? 'h-5' : 'h-7'}`} style={{ background: settings.COLORS.border }} />;
}
