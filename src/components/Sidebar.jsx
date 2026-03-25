import { useState } from 'react';
import { 
  IconMap, 
  IconLayers, 
  IconChevronsLeft, 
  IconX,
  IconInfo,
  IconUser,
  IconMapPin,
  IconSearch
} from './Icons';
import FilterControls from './FilterControls';
import EventCard from './EventCard';
import CreatorCard from './CreatorCard';
import { useSettings } from '../SettingsContext.jsx';
import { STATUS_CONFIG, EVENT_CONFIG } from '../config';

export default function Sidebar({ 
  creators, 
  allCreators, 
  events,
  selectedEvent,
  eventRadius,
  onEventRadiusChange,
  filterByProximity,
  onFilterByProximityChange,
  onEventClick,
  selectedCreator, 
  onCreatorClick, 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange,
  isOpen,
  onToggle,
  isMobile 
}) {
  const { settings, updateSettings, getStatusConfig } = useSettings();
  const [activeTab, setActiveTab] = useState('events');
  const [showConfig, setShowConfig] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Group by status for stats
  const statusCounts = allCreators.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Unique values for filters
  const statuses = [...new Set(allCreators.map(c => c.status).filter(Boolean))].sort();
  const genders = [...new Set(allCreators.map(c => c.gender).filter(Boolean))].sort();
  const availabilities = [...new Set(allCreators.map(c => c.availability).filter(Boolean))].sort();

  const sidebarWidth = isMobile ? 'calc(100vw - 48px)' : '380px';

  const handleMarkerChange = (key, value) => {
    updateSettings(`MARKER_CONFIG.${key}`, value);
  };

  const handleMapStyleChange = (style) => {
    updateSettings('MAP_CONFIG.style', style);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ViewSwitcher = () => (
    <div className="relative">
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-0 text-[13px] font-bold uppercase tracking-[0.2em] text-white/90 hover:text-white transition-all group focus:outline-none"
      >
        <span>{activeTab === 'events' ? 'Active Events' : 'All Creators'}</span>
        <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity ml-1">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {isDropdownOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-56 py-2 rounded-2xl shadow-2xl border z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ 
            background: 'rgba(22, 25, 33, 0.98)', 
            borderColor: settings.COLORS.border,
            backdropFilter: 'blur(20px)'
          }}
        >
          {[
            { id: 'events', label: 'Active Events', count: events.length, icon: '📅' },
            { id: 'creators', label: 'All Creators', count: creators.length, icon: '👥' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setActiveTab(option.id);
                setIsDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5 ${activeTab === option.id ? 'bg-white/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{option.icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === option.id ? 'text-white' : 'text-white/40'}`}>{option.label}</span>
              </div>
              <span className="text-[10px] font-mono opacity-30">{option.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside 
      className={`h-full flex flex-col border-r transition-all duration-300 ease-in-out z-50 overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ 
        width: isOpen ? sidebarWidth : '0px', 
        background: settings.COLORS.surface, 
        borderColor: settings.COLORS.border,
        boxShadow: isMobile && isOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: settings.COLORS.border }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${settings.COLORS.accent}20` }}>
              <IconMap size={18} color={settings.COLORS.accent} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">ReelOnGo</h1>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: settings.COLORS.textMuted }}>Map Locator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-1.5 rounded-md transition-colors"
                style={{ 
                background: showStats ? `${settings.COLORS.accent}15` : 'transparent',
                color: showStats ? settings.COLORS.accent : settings.COLORS.textMuted 
              }}
              title="Show Statistics"
            >
              <IconInfo size={17} />
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md transition-colors hover:bg-white/5"
              title="Close sidebar"
            >
              {isMobile ? <IconX size={16} color={settings.COLORS.textMuted} /> : <IconChevronsLeft size={16} color={settings.COLORS.textMuted} />}
            </button>
          </div>
        </div>

        {/* Global Stats Summary (Info Card Overlay) */}
        {showStats && (
          <div className="absolute inset-x-0 top-[65px] z-30 px-4 animate-slide-down">
            <div 
              className="p-5 rounded-2xl shadow-2xl border flex flex-col gap-4 relative overflow-hidden"
              style={{ 
                background: 'rgba(22, 25, 33, 0.98)', 
                borderColor: settings.COLORS.border,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ background: settings.COLORS.accent }} />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Creator Analytics</h3>
                  <p className="text-[10px]" style={{ color: settings.COLORS.textMuted }}>Overview of all platform creators</p>
                </div>
                <button 
                  onClick={() => setShowStats(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <IconX size={14} color={settings.COLORS.textMuted} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-xl border bg-white/[0.03]" style={{ borderColor: settings.COLORS.border }}>
                  <div className="text-[10px] uppercase font-bold text-white/30 mb-1">Total Network</div>
                  <div className="text-2xl font-bold text-white tracking-tight">{allCreators.length}</div>
                </div>
                <div className="p-3 rounded-xl border bg-white/[0.03]" style={{ borderColor: settings.COLORS.border }}>
                  <div className="text-[10px] uppercase font-bold text-white/30 mb-1">Filtered</div>
                  <div className="text-2xl font-bold text-white tracking-tight">{creators.length}</div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] italic leading-relaxed" style={{ color: settings.COLORS.textMuted }}>
                  Showing current network of verified active creators.
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Global Search & Filters & View Switcher */}
          <div className="p-4 space-y-4 shadow-sm z-10 border-b" style={{ borderColor: settings.COLORS.border }}>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#4f7df9]" style={{ color: settings.COLORS.textMuted }}>
                <IconSearch size={14} />
              </div>
              <input
                type="text"
                placeholder="Search creators, locations..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none transition-all border"
                style={{ 
                  background: settings.COLORS.surfaceLight, 
                  color: settings.COLORS.textPrimary,
                  borderColor: settings.COLORS.border
                }}
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              />
              {filters.search && (
                <button 
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
                  style={{ color: settings.COLORS.textMuted }}
                >
                  <IconX size={12} />
                </button>
              )}
            </div>

            <FilterControls 
              filters={filters} 
              onFiltersChange={onFiltersChange} 
              statuses={statuses}
              genders={genders}
              availabilities={availabilities}
            />

            {/* Integrated Configuration Section */}
            <div className="pt-2 border-t" style={{ borderColor: settings.COLORS.border }}>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors py-1 px-1"
              >
                <span>Map Settings</span>
                <IconLayers size={14} className={`transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
              </button>
              
              {showConfig && (
                <div className="mt-4 space-y-5 pb-2">
                  {/* View Mode Selector */}
                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      <span>Visualization</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { id: 'markers', label: 'Markers' },
                        { id: 'heatmap', label: 'Heatmap' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => onViewModeChange(mode.id)}
                          className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md border transition-all ${viewMode === mode.id ? 'shadow-sm' : ''}`}
                          style={{ 
                            background: viewMode === mode.id ? `${settings.COLORS.accent}20` : settings.COLORS.surfaceLight,
                            color: viewMode === mode.id ? settings.COLORS.accent : settings.COLORS.textMuted,
                            borderColor: viewMode === mode.id ? `${settings.COLORS.accent}40` : settings.COLORS.border
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Map Style Selector */}
                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      <span>Background Style</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { id: 'mapbox://styles/mapbox/dark-v11', label: 'Dark' },
                        { id: 'mapbox://styles/mapbox/light-v11', label: 'Light' },
                        { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Sat' }
                      ].map(style => (
                        <button
                          key={style.id}
                          onClick={() => handleMapStyleChange(style.id)}
                          className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md border transition-all ${settings.MAP_CONFIG.style === style.id ? 'shadow-sm' : ''}`}
                          style={{ 
                            background: settings.MAP_CONFIG.style === style.id ? `${settings.COLORS.accent}20` : settings.COLORS.surfaceLight,
                            color: settings.MAP_CONFIG.style === style.id ? settings.COLORS.accent : settings.COLORS.textMuted,
                            borderColor: settings.MAP_CONFIG.style === style.id ? `${settings.COLORS.accent}40` : settings.COLORS.border
                          }}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marker Controls */}
                  <div className="space-y-4 px-1">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                        <span>Marker Size</span>
                        <span className="text-white/60 font-mono">{settings.MARKER_CONFIG.size}px</span>
                      </div>
                      <input 
                        type="range" min="8" max="24" value={settings.MARKER_CONFIG.size} 
                        onChange={(e) => handleMarkerChange('size', parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f7df9]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Use Status Colors</span>
                      <button
                        onClick={() => handleMarkerChange('useStatusColor', !settings.MARKER_CONFIG.useStatusColor)}
                        className="w-7 h-3.5 rounded-full relative transition-colors"
                        style={{ background: settings.MARKER_CONFIG.useStatusColor ? settings.COLORS.accent : '#262a36' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: settings.MARKER_CONFIG.useStatusColor ? '14px' : '2px' }} />
                      </button>
                    </div>

                    {!settings.MARKER_CONFIG.useStatusColor && (
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-white/[0.02]" style={{ borderColor: settings.COLORS.border }}>
                        <span className="text-[10px] font-bold text-white/40 uppercase">Custom color</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-white/40">{settings.MARKER_CONFIG.customColor}</span>
                          <input 
                            type="color" 
                            value={settings.MARKER_CONFIG.customColor} 
                            onChange={(e) => handleMarkerChange('customColor', e.target.value)}
                            className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                        <span>Cluster Aggression</span>
                        <span className="text-white/60 font-mono">{settings.MAP_CONFIG.clusterRadius}</span>
                      </div>
                      <input 
                        type="range" min="20" max="100" value={settings.MAP_CONFIG.clusterRadius} 
                        onChange={(e) => updateSettings('MAP_CONFIG.clusterRadius', parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f7df9]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'creators' ? (
              <>
              {/* Creator List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                <div className="flex items-center justify-between mb-4 mt-6">
                  <ViewSwitcher />
                </div>
                
                {creators.length > 0 ? (
                  creators.map((creator) => (
                    <CreatorCard
                      key={creator._id}
                      creator={creator}
                      isSelected={selectedCreator?._id === creator._id}
                      onClick={() => onCreatorClick(creator)}
                      statusConfig={getStatusConfig(creator.status)}
                      selectedEvent={selectedEvent}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center px-6" style={{ background: `${settings.COLORS.surfaceLight}40`, borderRadius: '12px' }}>
                    <p className="text-sm" style={{ color: settings.COLORS.textMuted }}>No creators found</p>
                    <p className="text-[10px] mt-1" style={{ color: `${settings.COLORS.textMuted}60` }}>
                      {filterByProximity ? `Try increasing the search radius or adjusting filters` : `Try adjusting your filters`}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Events Tab Content (Simplified) */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar space-y-6">
                <div className="flex items-center justify-between mb-4 mt-6 px-1">
                  <ViewSwitcher />
                </div>
                
                <div className="space-y-3">
                  {events.length > 0 ? (
                    events.map((evt) => (
                      <EventCard 
                        key={evt._id}
                        event={evt} 
                        isSelected={selectedEvent?._id === evt._id} 
                        onClick={() => onEventClick(evt)} 
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center" style={{ background: `${settings.COLORS.surfaceLight}40`, borderRadius: '12px' }}>
                      <p className="text-sm text-white/40">No events found</p>
                    </div>
                  )}
                </div>

                {selectedEvent && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30 px-1">Proximity Controls</h4>
                    <div className="p-5 rounded-2xl border space-y-6" style={{ background: settings.COLORS.surfaceLight, borderColor: settings.COLORS.border }}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0 flex-1 pr-4">
                          <p className="text-xs font-bold text-white truncate">{selectedEvent.subeventName}</p>
                          <p className="text-[10px]" style={{ color: settings.COLORS.textMuted }}>Limit creators to this radius</p>
                        </div>
                        <button
                          onClick={() => onFilterByProximityChange(!filterByProximity)}
                          className="w-10 h-5 rounded-full relative transition-colors shrink-0"
                          style={{ background: filterByProximity ? EVENT_CONFIG.color : '#262a36' }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all" style={{ left: filterByProximity ? '22px' : '3px' }} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                          <span>Search Range</span>
                          <span className="text-white/80 tabular-nums font-mono">{eventRadius}km</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 px-1">
                          {[5, 10, 15, 20, 25].map(val => (
                            <button
                              key={val}
                              onClick={() => onEventRadiusChange(val)}
                              className="py-2.5 text-[10px] font-bold rounded-xl border transition-all duration-200"
                              style={{ 
                                background: eventRadius === val ? `${EVENT_CONFIG.color}20` : 'rgba(255,255,255,0.03)',
                                color: eventRadius === val ? EVENT_CONFIG.color : 'rgba(255,255,255,0.4)',
                                borderColor: eventRadius === val ? `${EVENT_CONFIG.color}40` : 'rgba(255,255,255,0.05)',
                                boxShadow: eventRadius === val ? `0 0 12px ${EVENT_CONFIG.color}15` : 'none'
                              }}
                            >
                              {val}km
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </aside>
  );
}
