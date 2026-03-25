import { useMemo, useRef, useEffect, useState } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  ScaleControl,
  Source,
  Layer
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MAP_CONFIG, 
  MARKER_CONFIG, 
  HEATMAP_CONFIG, 
  EVENT_CONFIG,
  getInitials 
} from '../config';
import { useSettings } from '../SettingsContext.jsx';
import { 
  IconMapPin,
  IconUser,
  IconCalendar,
  IconClock,
  IconMail
} from './Icons';

export default function MapView({ 
  creators, 
  events,
  eventRadius,
  filterByProximity,
  onEventClick,
  selectedCreator, 
  selectedEvent,
  onCreatorClick, 
  onMapClick, 
  flyTo, 
  viewMode, 
  sidebarOpen,
  isMobile 
}) {
  const mapRef = useRef();
  const { settings, getStatusConfig } = useSettings();
  const [hoveredCreator, setHoveredCreator] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Grouping creators into status-based clusters or heatmaps
  const heatmapData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: creators.map(c => ({
        type: 'Feature',
        geometry: (c.locationCoordinates || c.location),
        properties: { weight: 1 }
      }))
    };
  }, [creators]);

  // Event Radius Circle GeoJSON (Linked to Selected Event)
  const eventCircleGeoJSON = useMemo(() => {
    if (!selectedEvent?.venueLocation?.coordinates) return null;
    
    const [lon, lat] = selectedEvent.venueLocation.coordinates;
    const points = 64;
    const coords = [];
    
    // km to degrees (rough approximation)
    const km = eventRadius;
    const distanceX = km / (111.32 * Math.cos(lat * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([lon + x, lat + y]);
    }
    coords.push(coords[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };
  }, [selectedEvent, eventRadius]);

  // Handle flyTo changes
  useEffect(() => {
    if (flyTo && mapRef.current && isMapReady) {
      const center = flyTo.center || [flyTo.longitude, flyTo.latitude];
      
      if (center[0] && center[1]) {
        mapRef.current.flyTo({
          center: center,
          zoom: flyTo.zoom ?? 14,
          duration: flyTo.duration ?? MAP_CONFIG.flyToDuration,
          essential: true
        });
      }
    }
  }, [flyTo, isMapReady]);

  // Handle sidebar resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.getMap().resize();
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // Map Controls Position
  const controlsPosition = isMobile ? 'top-right' : 'bottom-right';

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        onLoad={() => setIsMapReady(true)}
        initialViewState={{
          longitude: MAP_CONFIG.center.longitude,
          latitude: MAP_CONFIG.center.latitude,
          zoom: MAP_CONFIG.center.zoom
        }}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle={settings.MAP_CONFIG.style}
        onClick={onMapClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position={controlsPosition} showCompass={false} />

        {/* Proximity Circle Layer */}
        {eventCircleGeoJSON && filterByProximity && (
          <Source id="event-radius" type="geojson" data={eventCircleGeoJSON}>
            <Layer 
              id="event-radius-fill"
              type="fill"
              paint={{
                'fill-color': EVENT_CONFIG.color,
                'fill-opacity': EVENT_CONFIG.circleOpacity
              }}
            />
            <Layer 
              id="event-radius-stroke"
              type="line"
              paint={{
                'line-color': EVENT_CONFIG.color,
                'line-width': 2,
                'line-opacity': EVENT_CONFIG.circleBorderOpacity,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* Heatmap Layer */}
        {viewMode === 'heatmap' && (
          <Source id="creators-heatmap" type="geojson" data={heatmapData}>
            <Layer
              id="heatmap-layer"
              type="heatmap"
              paint={{
                'heatmap-weight': HEATMAP_CONFIG.weight,
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  HEATMAP_CONFIG.intensityStops.minZoom,
                  HEATMAP_CONFIG.intensityStops.min,
                  HEATMAP_CONFIG.intensityStops.maxZoom,
                  HEATMAP_CONFIG.intensityStops.max
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  ...HEATMAP_CONFIG.colorStops.flat()
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  HEATMAP_CONFIG.radiusStops.minZoom,
                  HEATMAP_CONFIG.radiusStops.min,
                  HEATMAP_CONFIG.radiusStops.maxZoom,
                  HEATMAP_CONFIG.radiusStops.max
                ],
                'heatmap-opacity': HEATMAP_CONFIG.opacity
              }}
            />
          </Source>
        )}

        {/* Markers Layer */}
        {viewMode === 'markers' && creators.map((creator) => {
          const coords = (creator.locationCoordinates || creator.location)?.coordinates;
          if (!coords) return null;
          
          const isSelected = selectedCreator?._id === creator._id;
          const isHovered = hoveredCreator?._id === creator._id;
          const statusConfig = getStatusConfig(creator.status);
          const iconColor = settings.MARKER_CONFIG.useStatusColor ? statusConfig.color : settings.MARKER_CONFIG.customColor;
          
          return (
            <Marker
              key={creator._id}
              longitude={coords[0]}
              latitude={coords[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onCreatorClick(creator);
              }}
              style={{ cursor: 'pointer', zIndex: isSelected ? 10 : 1 }}
            >
              <div 
                className="relative flex flex-col items-center justify-center transition-all duration-300"
                onMouseEnter={() => setHoveredCreator(creator)}
                onMouseLeave={() => setHoveredCreator(null)}
                style={{ 
                  transform: `scale(${isSelected ? settings.MARKER_CONFIG.selectedScale : (isHovered ? settings.MARKER_CONFIG.hoverScale : 1)})`
                }}
              >
                {/* Visual Glow */}
                {(isSelected || isHovered) && (
                  <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{ background: iconColor, width: settings.MARKER_CONFIG.size, height: settings.MARKER_CONFIG.size, margin: 'auto' }} />
                )}
                
                {/* Marker Body */}
                <div 
                  className="rounded-full border-2 shadow-lg flex items-center justify-center bg-white transition-colors relative z-10"
                  style={{ 
                    width: settings.MARKER_CONFIG.size, 
                    height: settings.MARKER_CONFIG.size,
                    borderColor: isSelected ? settings.MARKER_CONFIG.selectedBorderColor : iconColor,
                    background: isSelected ? iconColor : '#fff'
                  }}
                >
                  <IconUser size={settings.MARKER_CONFIG.size * 0.7} color={isSelected ? '#fff' : iconColor} />
                </div>

                {/* Name Label */}
                <div 
                  className="absolute top-full mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap pointer-events-none shadow-xl border border-white/20 select-none transition-all z-20 backdrop-blur-md"
                  style={{ 
                    background: isSelected ? iconColor : 'rgba(22, 25, 33, 0.85)',
                    color: '#fff',
                    boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 8px ${iconColor}20`
                  }}
                >
                  {creator.creatorName}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Event Markers Layer */}
        {events.length > 0 && events.map((evt) => {
          const coords = evt.venueLocation?.coordinates;
          if (!coords) return null;
          const isSelected = selectedEvent?._id === evt._id;

          return (
            <Marker
              key={evt._id}
              longitude={coords[0]}
              latitude={coords[1]}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onEventClick(evt);
              }}
              style={{ cursor: 'pointer', zIndex: isSelected ? 10 : 5 }}
            >
              <div className="flex flex-col items-center group">
                {isSelected && (
                  <div 
                    className="px-2 py-1 mb-1 rounded bg-black/80 border border-white/20 whitespace-nowrap overflow-hidden max-w-[120px] shadow-xl animate-in fade-in duration-300"
                    style={{ borderColor: EVENT_CONFIG.color }}
                  >
                    <p className="text-[9px] font-bold text-white truncate">{evt.subeventName}</p>
                  </div>
                )}
                <div className="relative">
                  {isSelected && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30" />}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-110"
                    style={{ 
                      background: isSelected ? EVENT_CONFIG.color : '#262a36', 
                      border: `2px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.1)'}` 
                    }}
                  >
                     <IconMapPin size={isSelected ? 18 : 14} color="white" />
                  </div>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Popup for Selected Creator */}
        {selectedCreator && (
          <Popup
            longitude={(selectedCreator.locationCoordinates || selectedCreator.location).coordinates[0]}
            latitude={(selectedCreator.locationCoordinates || selectedCreator.location).coordinates[1]}
            anchor="bottom"
            offset={30}
            onClose={() => onMapClick()}
            closeButton={false}
            className="creator-popup"
            maxWidth="320px"
          >
            <div className="p-3 bg-[#161921] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full" style={{ background: getStatusConfig(selectedCreator.status).color }} />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg text-[10px] font-bold text-white transition-transform hover:scale-105" 
                    style={{ background: getStatusConfig(selectedCreator.status).color }}
                  >
                    {getInitials(selectedCreator.creatorName)}
                  </div>
                  <div 
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border" 
                    style={{ 
                      color: getStatusConfig(selectedCreator.status).color, 
                      borderColor: `${getStatusConfig(selectedCreator.status).color}30`, 
                      background: `${getStatusConfig(selectedCreator.status).color}10` 
                    }}
                  >
                    {getStatusConfig(selectedCreator.status).label}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedCreator.creatorName}</h3>
                  <p className="text-[10px] font-medium mt-1 text-white/50 truncate">
                    {selectedCreator.locationName || 'Location N/A'}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconMail size={12} color={getStatusConfig(selectedCreator.status).color} className="shrink-0" />
                    <p className="text-[9px] font-medium text-white/60 truncate">{selectedCreator.email || 'No email'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">{selectedCreator.creatorCode}</span>
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* Event Popup */}
        {selectedEvent && selectedEvent.venueLocation?.coordinates && (
          <Popup
            longitude={selectedEvent.venueLocation.coordinates[0]}
            latitude={selectedEvent.venueLocation.coordinates[1]}
            anchor="bottom"
            onClose={() => onMapClick()}
            closeButton={false}
            maxWidth="320px"
            className="event-popup"
            offset={30}
          >
            <div className="p-3 bg-[#161921] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full" style={{ background: EVENT_CONFIG.color }} />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: EVENT_CONFIG.color }}>
                    <IconMapPin size={16} color="white" />
                  </div>
                  <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border" style={{ color: EVENT_CONFIG.color, borderColor: `${EVENT_CONFIG.color}30`, background: `${EVENT_CONFIG.color}10` }}>
                    {selectedEvent.eventStatus}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedEvent.subeventName}</h3>
                  <p className="text-[10px] font-medium mt-1 text-white/50">{selectedEvent.location}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <IconCalendar size={12} color={EVENT_CONFIG.color} />
                    <div>
                      <p className="text-[10px] font-semibold text-white/90">{selectedEvent.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconClock size={12} color={EVENT_CONFIG.color} />
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-white/90">{selectedEvent.startTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
