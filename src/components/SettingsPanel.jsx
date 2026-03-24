import React from 'react';
import { useSettings } from '../SettingsContext.jsx';
import { IconX, IconChevronsLeft } from './Icons';

export default function SettingsPanel({ onClose }) {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleColorChange = (key, value) => {
    updateSettings(`COLORS.${key}`, value);
  };

  const handleMarkerChange = (key, value) => {
    updateSettings(`MARKER_CONFIG.${key}`, value);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: settings.COLORS.surface }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: settings.COLORS.border }}>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <IconChevronsLeft size={16} color={settings.COLORS.textMuted} />
          </button>
          <h2 className="text-sm font-semibold text-white">Customization</h2>
        </div>
        <button 
          onClick={resetSettings}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 transition-colors"
          style={{ color: settings.COLORS.accent }}
        >
          Reset
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Colors Section */}
        <section className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: settings.COLORS.textMuted }}>
            Theme Colors
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <ColorInput 
              label="Accent color" 
              value={settings.COLORS.accent} 
              onChange={(val) => handleColorChange('accent', val)} 
              settings={settings}
            />
            <ColorInput 
              label="Surface" 
              value={settings.COLORS.surface} 
              onChange={(val) => handleColorChange('surface', val)} 
              settings={settings}
            />
          </div>
        </section>

        {/* Markers Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: settings.COLORS.textMuted }}>
            Map Elements
          </h3>
          
          <RangeInput 
            label="Marker Size" 
            value={settings.MARKER_CONFIG.size} 
            min={8} 
            max={24} 
            onChange={(val) => handleMarkerChange('size', parseInt(val))} 
            settings={settings}
          />

          <div className="space-y-3 p-3 rounded-lg border" style={{ borderColor: settings.COLORS.border, background: settings.COLORS.surfaceLight }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: settings.COLORS.textSecondary }}>Use Status Colors</span>
              <button
                onClick={() => handleMarkerChange('useStatusColor', !settings.MARKER_CONFIG.useStatusColor)}
                className="w-8 h-4 rounded-full relative transition-colors"
                style={{ background: settings.MARKER_CONFIG.useStatusColor ? settings.COLORS.accent : settings.COLORS.border }}
              >
                <div 
                  className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{ left: settings.MARKER_CONFIG.useStatusColor ? '18px' : '2px' }}
                />
              </button>
            </div>
            
            {!settings.MARKER_CONFIG.useStatusColor && (
              <ColorInput 
                label="Marker Color" 
                value={settings.MARKER_CONFIG.customColor} 
                onChange={(val) => handleMarkerChange('customColor', val)} 
                settings={settings}
                compact
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: settings.COLORS.textSecondary }}>Marker Pulse</span>
            <button
              onClick={() => handleMarkerChange('pulseEnabled', !settings.MARKER_CONFIG.pulseEnabled)}
              className="w-8 h-4 rounded-full relative transition-colors"
              style={{ background: settings.MARKER_CONFIG.pulseEnabled ? settings.COLORS.accent : settings.COLORS.border }}
            >
              <div 
                className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: settings.MARKER_CONFIG.pulseEnabled ? '18px' : '2px' }}
              />
            </button>
          </div>

          <RangeInput 
            label="Cluster Aggression" 
            value={settings.MAP_CONFIG.clusterRadius} 
            min={20} 
            max={100} 
            onChange={(val) => updateSettings('MAP_CONFIG.clusterRadius', parseInt(val))} 
            settings={settings}
          />
        </section>

        {/* Map Style Section */}
        <section className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: settings.COLORS.textMuted }}>
            Map Style
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <StyleOption 
              label="Dark Professional" 
              active={settings.MAP_CONFIG.style === 'mapbox://styles/mapbox/dark-v11'}
              onClick={() => updateSettings('MAP_CONFIG.style', 'mapbox://styles/mapbox/dark-v11')}
              settings={settings}
            />
            <StyleOption 
              label="Light Minimal" 
              active={settings.MAP_CONFIG.style === 'mapbox://styles/mapbox/light-v11'}
              onClick={() => updateSettings('MAP_CONFIG.style', 'mapbox://styles/mapbox/light-v11')}
              settings={settings}
            />
            <StyleOption 
              label="Satellite Streets" 
              active={settings.MAP_CONFIG.style === 'mapbox://styles/mapbox/satellite-streets-v12'}
              onClick={() => updateSettings('MAP_CONFIG.style', 'mapbox://styles/mapbox/satellite-streets-v12')}
              settings={settings}
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 text-[10px] text-center" style={{ color: settings.COLORS.textMuted, borderTop: `1px solid ${settings.COLORS.border}` }}>
        Settings are saved automatically to your browser.
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange, settings }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: settings.COLORS.border, background: settings.COLORS.surfaceLight }}>
      <span className="text-xs" style={{ color: settings.COLORS.textSecondary }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono" style={{ color: settings.COLORS.textMuted }}>{value}</span>
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer p-0 overflow-hidden"
        />
      </div>
    </div>
  );
}

function RangeInput({ label, value, min, max, onChange, settings }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: settings.COLORS.textSecondary }}>{label}</span>
        <span className="text-[10px] font-mono" style={{ color: settings.COLORS.textMuted }}>{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1 rounded-lg appearance-none cursor-pointer"
        style={{ background: settings.COLORS.border }}
      />
    </div>
  );
}

function StyleOption({ label, active, onClick, settings }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
      style={{ 
        background: active ? settings.COLORS.accentBg : settings.COLORS.surfaceLight,
        color: active ? settings.COLORS.accent : settings.COLORS.textSecondary,
        border: `1px solid ${active ? settings.COLORS.accentBorder : settings.COLORS.border}`
      }}
    >
      {label}
    </button>
  );
}
