import { useState } from 'react';
import { 
  IconMap, 
  IconLayers, 
  IconChevronsLeft, 
  IconX 
} from './Icons';
import FilterControls from './FilterControls';
import CreatorCard from './CreatorCard';
import SettingsPanel from './SettingsPanel';
import { useSettings } from '../SettingsContext.jsx';
import { STATUS_CONFIG } from '../config';

export default function Sidebar({ 
  creators, 
  allCreators, 
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
  const { settings, getStatusConfig } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  // Group by status for stats
  const statusCounts = allCreators.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const sidebarWidth = isMobile ? 'calc(100vw - 48px)' : '380px';

  return (
    <aside 
      className={`h-full flex flex-col border-r transition-all duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md transition-colors hover:bg-white/5"
              style={{ color: showSettings ? settings.COLORS.accent : settings.COLORS.textMuted }}
              title="Settings"
            >
              <IconLayers size={16} />
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

        {/* Customization Panel Overlay */}
        {showSettings && (
          <div className="absolute inset-0 z-20 flex flex-col" style={{ background: settings.COLORS.surface }}>
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        )}

        {/* Global Stats Summary */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b" style={{ borderColor: settings.COLORS.border }}>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div 
              key={key}
              className="px-2.5 py-1.5 rounded-lg flex items-center gap-2 shrink-0 border transition-colors"
                style={{ 
                background: `${config.color}08`, 
                borderColor: `${config.color}20`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
              <span className="text-[10px] font-semibold text-white/90">{statusCounts[key] || 0}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4 shadow-sm z-10">
          <FilterControls filters={filters} onFiltersChange={onFiltersChange} />
          
          <div className="flex rounded-lg p-1" style={{ background: settings.COLORS.surfaceLight }}>
            <button
              onClick={() => onViewModeChange('markers')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'markers' ? 'shadow-sm' : ''}`}
              style={{ 
                background: viewMode === 'markers' ? settings.COLORS.surface : 'transparent',
                color: viewMode === 'markers' ? '#fff' : settings.COLORS.textMuted
              }}
            >
              Markers
            </button>
            <button
              onClick={() => onViewModeChange('heatmap')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'heatmap' ? 'shadow-sm' : ''}`}
              style={{ 
                background: viewMode === 'heatmap' ? settings.COLORS.surface : 'transparent',
                color: viewMode === 'heatmap' ? '#fff' : settings.COLORS.textMuted
              }}
            >
              Heatmap
            </button>
          </div>
        </div>

        {/* Creator List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-1 mt-2">
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
            <div className="py-12 text-center" style={{ background: `${settings.COLORS.surfaceLight}40`, borderRadius: '12px' }}>
              <p className="text-sm" style={{ color: settings.COLORS.textMuted }}>No creators found</p>
              <p className="text-[10px] mt-1" style={{ color: `${settings.COLORS.textMuted}60` }}>Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
