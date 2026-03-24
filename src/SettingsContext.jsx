import React, { createContext, useContext, useState, useEffect } from 'react';
import * as defaultConfig from './config';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('reelongo_map_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default config to ensure new settings are present
        return {
          ...defaultConfig,
          COLORS: { ...defaultConfig.COLORS, ...parsed.COLORS },
          MARKER_CONFIG: { ...defaultConfig.MARKER_CONFIG, ...parsed.MARKER_CONFIG },
          MAP_CONFIG: { ...defaultConfig.MAP_CONFIG, ...parsed.MAP_CONFIG },
          STATUS_CONFIG: { ...defaultConfig.STATUS_CONFIG, ...parsed.STATUS_CONFIG },
          RANK_CONFIG: { ...defaultConfig.RANK_CONFIG, ...parsed.RANK_CONFIG },
          SIDEBAR_CONFIG: { ...defaultConfig.SIDEBAR_CONFIG, ...parsed.SIDEBAR_CONFIG },
        };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('reelongo_map_settings', JSON.stringify({
      COLORS: settings.COLORS,
      MARKER_CONFIG: settings.MARKER_CONFIG,
      MAP_CONFIG: settings.MAP_CONFIG,
      STATUS_CONFIG: settings.STATUS_CONFIG,
      RANK_CONFIG: settings.RANK_CONFIG,
      SIDEBAR_CONFIG: settings.SIDEBAR_CONFIG,
    }));
  }, [settings]);

  const updateSettings = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultConfig);
    localStorage.removeItem('reelongo_map_settings');
  };

  // Helper functions derived from settings
  const getStatusConfig = (status) => {
    return settings.STATUS_CONFIG[status] || {
      label: status?.replace(/_/g, ' ') || 'Unknown',
      color: settings.COLORS.textMuted,
      bg: 'rgba(107, 112, 128, 0.1)',
    };
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, getStatusConfig }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
