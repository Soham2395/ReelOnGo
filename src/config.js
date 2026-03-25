export const API_URL = 'https://staging-api.reelongo.com/crm/creators/map-locator/locations';
export const EVENT_API_URL = 'https://staging-api.reelongo.com/crm/events/subevent/subevent-map-locator/ROGL2510-E76-S1';

export const MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/dark-v11',
  center: { longitude: 78.45, latitude: 17.45 },
  zoom: 9,
  minZoom: 3,
  maxZoom: 18,
  pitch: 0,
  bearing: 0,
  flyToDuration: 2000,       // ms for fly-to animation
  clusterExpandZoom: 3,       // zoom levels to add on cluster click
  clusterThreshold: 11,       // zoom level above which clusters break apart
  clusterRadius: 50,          // radius of each cluster in pixels
};

export const COLORS = {
  // Base grays
  bg: '#0f1117',
  surface: '#161921',
  surfaceLight: '#1c2029',
  border: '#262a36',
  borderLight: '#2f3442',
  textPrimary: '#e2e4ea',
  textSecondary: '#9498a6',
  textMuted: '#6b7080',

  // Brand accent
  accent: '#4f7df9',
  accentMuted: '#3a62cc',
  accentBg: 'rgba(79, 125, 249, 0.08)',
  accentBorder: 'rgba(79, 125, 249, 0.2)',

  // Status colors — professional muted tones
  statusActive: '#34c77b',
  statusOnboarded: '#4f7df9',
  statusWorkshop: '#e5a842',
  statusDemo: '#b06ce4',
  statusApplication: '#e07a4f',
  statusAwaiting: '#7b8a9e',
  statusChecked: '#3ebdd6',
};

export const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: COLORS.statusActive,
    bg: 'rgba(52, 199, 123, 0.1)',
  },
  ONBOARDED: {
    label: 'Onboarded',
    color: COLORS.statusOnboarded,
    bg: 'rgba(79, 125, 249, 0.1)',
  },
  WORKSHOP_INITIATED: {
    label: 'Workshop',
    color: COLORS.statusWorkshop,
    bg: 'rgba(229, 168, 66, 0.1)',
  },
  DEMO_INITIATED: {
    label: 'Demo',
    color: COLORS.statusDemo,
    bg: 'rgba(176, 108, 228, 0.1)',
  },
  APPLICATION_RECIEVED: {
    label: 'Application',
    color: COLORS.statusApplication,
    bg: 'rgba(224, 122, 79, 0.1)',
  },
  AWAITING_WORKSHOP_SUBMISSION: {
    label: 'Awaiting',
    color: COLORS.statusAwaiting,
    bg: 'rgba(123, 138, 158, 0.1)',
  },
  CHECKED_WHATSAPP_PREFERENCE: {
    label: 'Checked',
    color: COLORS.statusChecked,
    bg: 'rgba(62, 189, 214, 0.1)',
  },
};

// ── MARKER CONFIG ────────────────────────────────────────
export const MARKER_CONFIG = {
  // Individual marker
  size: 14,                     
  borderWidth: 2,                
  glowRadius: 8,               
  selectedScale: 1.4,            
  hoverScale: 1.2,             
  selectedBorderColor: '#ffffff',
  pulseEnabled: true,           
  pulseStatuses: ['ACTIVE'],   
  useStatusColor: true,          
  customColor: '#4f7df9',     

  // Cluster
  clusterMinSize: 34,           
  clusterMaxSize: 56,          
  clusterSizePerItem: 2.5,     
  clusterBg: 'rgba(79, 125, 249, 0.65)',
  clusterBorder: 'rgba(79, 125, 249, 0.35)',
  clusterTextColor: '#ffffff',
  clusterFontSize: 12,
  clusterFontWeight: 600,
};

// ── HEATMAP CONFIG ───────────────────────────────────────
export const HEATMAP_CONFIG = {
  weight: 1,
  intensityStops: { min: 1, max: 3, minZoom: 0, maxZoom: 15 },
  colorStops: [
    [0, 'rgba(0,0,0,0)'],
    [0.1, 'rgba(79, 125, 249, 0.15)'],
    [0.3, 'rgba(79, 125, 249, 0.35)'],
    [0.5, 'rgba(62, 189, 214, 0.45)'],
    [0.7, 'rgba(52, 199, 123, 0.55)'],
    [1, 'rgba(229, 168, 66, 0.7)'],
  ],
  radiusStops: { min: 20, max: 40, minZoom: 0, maxZoom: 15 },
  opacity: 0.75,
};

// ── RANK CONFIG ──────────────────────────────────────────
export const RANK_CONFIG = {
  Bronze: { label: 'Bronze', color: '#b08d5e' },
  Silver: { label: 'Silver', color: '#9498a6' },
  Gold: { label: 'Gold', color: '#d4a843' },
  Platinum: { label: 'Platinum', color: '#8fa3b8' },
};

// ── EVENT CONFIG ──────────────────────────────────────────
export const EVENT_CONFIG = {
  radius: 10,                 
  color: '#ff4d4d',       
  markerSize: 24,
  circleOpacity: 0.15,
  circleBorderOpacity: 0.4,
};

// ── SIDEBAR CONFIG ───────────────────────────────────────
export const SIDEBAR_CONFIG = {
  width: 380,                // px
  animationDuration: 400,    // ms
};

// ── HELPERS (derived from config) ────────────────────────
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || {
    label: status?.replace(/_/g, ' ') || 'Unknown',
    color: COLORS.textMuted,
    bg: 'rgba(107, 112, 128, 0.1)',
  };
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getCity(locationName) {
  if (!locationName) return 'Unknown';
  if (/^\d+\.\d+,\s*\d+\.\d+$/.test(locationName.trim())) return 'Unknown';
  return locationName.split(',')[0].trim() || 'Unknown';
}

export function getUniqueValues(creators, key) {
  return [...new Set(creators.map((c) => c[key]).filter(Boolean))].sort();
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
