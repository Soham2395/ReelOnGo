import { useState } from 'react';
import { 
  IconMap, 
  IconLayers, 
  IconChevronsLeft, 
  IconX,
  IconInfo,
  IconUser,
  IconMapPin
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
  const [activeTab, setActiveTab] = useState('creators');
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

              <div className="space-y-2.5 relative z-10 px-1">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: config.color }} />
                      <span className="text-[11px] font-medium text-white/70 group-hover:text-white transition-colors capitalize">{config.label.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            background: config.color, 
                            width: `${(statusCounts[key] || 0) / allCreators.length * 100}%` 
                          }} 
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white/90 min-w-[20px] text-right">{statusCounts[key] || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex px-4 pt-4 border-b gap-6" style={{ borderColor: settings.COLORS.border }}>
          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative ${activeTab === 'creators' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
          >
            <div className="flex items-center gap-2">
              <IconUser size={13} />
              <span>Creators</span>
            </div>
            {activeTab === 'creators' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: settings.COLORS.accent }} />
            )}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative ${activeTab === 'events' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
          >
            <div className="flex items-center gap-2">
              <IconMapPin size={13} />
              <span>Events</span>
            </div>
            {activeTab === 'events' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: EVENT_CONFIG.color }} />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'creators' ? (
            <>
              {/* Primary Navigation & Search */}
              <div className="p-4 space-y-4 shadow-sm z-10 border-b" style={{ borderColor: settings.COLORS.border }}>
                <FilterControls 
                  filters={filters} 
                  onFiltersChange={onFiltersChange} 
                  statuses={statuses}
                  genders={genders}
                  availabilities={availabilities}
                />
              </div>

              {/* Integrated Configuration Section */}
              <div className="px-4 py-3 border-b" style={{ borderColor: settings.COLORS.border }}>
                 <button 
                   onClick={() => setShowConfig(!showConfig)}
                   className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
                 >
                   <span>Map Settings</span>
                   <IconLayers size={14} className={`transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
                 </button>
                 
                 {showConfig && (
                   <div className="mt-4 space-y-5 pb-2">
                      {/* View Mode Selector */}
                      <div className="space-y-2">
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
                      <div className="space-y-2">
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
                      <div className="space-y-4">
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

              {/* Creator List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                <div className="flex items-center justify-between mb-1 mt-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Creators ({creators.length})</h2>
                </div>
                
                {creators.length > 0 ? (
                  creators.map((creator) => (
                    <CreatorCard
                      key={creator._id}
                      creator={creator}
                      isSelected={selectedCreator?._id === creator._id}
                      onClick={() => onCreatorClick(creator)}
                      statusConfig={getStatusConfig(creator.status)}
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
              <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-6">
                <div className="space-y-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 px-1">Active Events ({events.length})</h2>
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

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-white/40 uppercase">Search Range</span>
                          <span className="text-xl font-bold text-white tabular-nums">{eventRadius}<span className="text-xs font-normal text-white/40 ml-0.5">km</span></span>
                        </div>
                        <input 
                          type="range" min="1" max="50" step="1"
                          value={eventRadius} 
                          onChange={(e) => onEventRadiusChange(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d4d]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
