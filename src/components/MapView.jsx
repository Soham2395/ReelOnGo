import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  ScaleControl,
  Source,
  Layer
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import SuperclusterModule from 'supercluster';
const SuperclusterClass = SuperclusterModule.default || SuperclusterModule;
import { 
  MAP_CONFIG, 
  MARKER_CONFIG, 
  HEATMAP_CONFIG, 
  EVENT_CONFIG,
  getInitials,
  calculateDistance
} from '../config';
import { useSettings } from '../SettingsContext.jsx';
import { 
  IconMapPin,
  IconUser,
  IconCalendar,
  IconClock,
  IconMail
} from './Icons';
import CreatorPopup from './CreatorPopup';

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
  const [zoom, setZoom] = useState(MAP_CONFIG.zoom || 9);
  const [bounds, setBounds] = useState(null);

  const indexRef = useRef(null);
  const [clusters, setClusters] = useState([]);

  // Convert creators to GeoJSON features for supercluster
  const points = useMemo(() => {
    return creators
      .map(creator => {
        const coords = creator.normalizedCoordinates;
        if (!coords || !Array.isArray(coords) || coords.length < 2) return null;
        
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        
        if (isNaN(lng) || isNaN(lat)) return null;
        
        return {
          type: "Feature",
          properties: { 
            cluster: false, 
            creatorId: creator._id, 
            creator: creator, 
            category: creator.status 
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat]
          }
        };
      })
      .filter(Boolean);
  }, [creators]);

  // Single atomic effect: build index AND compute clusters in one pass
  // This eliminates any race condition between index creation and cluster computation
  useEffect(() => {
    if (!points || points.length === 0 || !bounds || bounds.length !== 4 || bounds.some(b => b == null || isNaN(b))) {
      indexRef.current = null;
      setClusters([]);
      return;
    }
    try {
      const sc = new SuperclusterClass({
        radius: settings.MAP_CONFIG.clusterRadius || 50,
        maxZoom: 16,
        minZoom: 0
      });
      sc.load(points);
      indexRef.current = sc;

      const safeZoom = Math.max(0, Math.min(16, Math.floor(zoom)));
      if (sc.trees[safeZoom]) {
        setClusters(sc.getClusters(bounds, safeZoom));
      } else {
        setClusters([]);
      }
    } catch (e) {
      console.error("Clustering error:", e);
      indexRef.current = null;
      setClusters([]);
    }
  }, [points, bounds, zoom, settings.MAP_CONFIG.clusterRadius]);

  // Function to handle cluster click
  const handleClusterClick = useCallback((clusterId, latitude, longitude) => {
    if (!indexRef.current) return;
    try {
      const expansionZoom = Math.min(
        indexRef.current.getClusterExpansionZoom(clusterId),
        16
      );
      
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: expansionZoom,
          duration: 1000
        });
      }
    } catch (e) {
      console.error("Cluster expansion error:", e);
    }
  }, []);

  // Update bounds on move
  const onMove = useCallback((evt) => {
    const nextZoom = evt.viewState.zoom || MAP_CONFIG.zoom || 9;
    setZoom(nextZoom);
    try {
      const b = evt.target.getBounds().toArray().flat();
      if (b && b.length === 4 && !b.some(isNaN)) {
        setBounds(b);
      }
    } catch (e) {
      console.warn("Bounds update error:", e);
    }
  }, []);

  // Update bounds initially when map is ready
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      try {
        const b = mapRef.current.getBounds().toArray().flat();
        if (b && b.length === 4 && !b.some(isNaN)) {
          setBounds(b);
        }
      } catch (e) {
        console.warn("Initial bounds error:", e);
      }
    }
  }, [isMapReady]);

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
        onLoad={() => {
          setIsMapReady(true);
        }}
        onMove={onMove}
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
        {viewMode === 'markers' && clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleClusterClick(cluster.id, latitude, longitude);
                }}
              >
                <div 
                  className="flex items-center justify-center rounded-full border-2 border-white/40 text-white font-bold cursor-pointer transition-all hover:scale-110 shadow-2xl backdrop-blur-md"
                  style={{
                    width: `${Math.max(32, Math.min(32 + pointCount * 0.5, 48))}px`,
                    height: `${Math.max(32, Math.min(32 + pointCount * 0.5, 48))}px`,
                    background: settings.COLORS.accent,
                    fontSize: '11px',
                    boxShadow: `0 0 15px ${settings.COLORS.accent}60`
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const creator = cluster.properties.creator;
          const isSelected = selectedCreator?._id === creator?._id;
          const isHovered = hoveredCreator?._id === creator?._id;
          const statusConfig = getStatusConfig(creator.status);
          const iconColor = settings.MARKER_CONFIG.useStatusColor ? statusConfig.color : settings.MARKER_CONFIG.customColor;
          
          return (
            <Marker
              key={creator._id}
              longitude={longitude}
              latitude={latitude}
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

                {/* Assignment Pulse */}
                {creator.activeAssignment?.isActive && (
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40" style={{ width: settings.MARKER_CONFIG.size, height: settings.MARKER_CONFIG.size, margin: 'auto' }} />
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
                  {selectedEvent && (
                    <span className="ml-1 opacity-50 tabular-nums">
                      • {calculateDistance(
                        selectedEvent.venueLocation.coordinates[1],
                        selectedEvent.venueLocation.coordinates[0],
                        (creator.activeAssignment?.currentCoordinates ? creator.activeAssignment.currentCoordinates[1] : (creator.locationCoordinates || creator.location).coordinates[1]),
                        (creator.activeAssignment?.currentCoordinates ? creator.activeAssignment.currentCoordinates[0] : (creator.locationCoordinates || creator.location).coordinates[0])
                      ).toFixed(1)}km
                    </span>
                  )}
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
                {/* Label removed as per request */}
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
            longitude={selectedCreator.normalizedCoordinates?.[0] || 78.45}
            latitude={selectedCreator.normalizedCoordinates?.[1] || 17.45}
            anchor="bottom"
            offset={30}
            onClose={() => onMapClick()}
            closeButton={false}
            className="creator-popup-wrapper"
            maxWidth="360px"
            style={{ zIndex: 1000 }}
          >
            <CreatorPopup 
              creator={selectedCreator} 
              onClose={() => onMapClick()}
              distance={selectedEvent?.venueLocation?.coordinates ? calculateDistance(
                selectedEvent.venueLocation.coordinates[1],
                selectedEvent.venueLocation.coordinates[0],
                (selectedCreator.normalizedCoordinates?.[1] || 17.45),
                (selectedCreator.normalizedCoordinates?.[0] || 78.45)
              ) : null}
            />
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
            style={{ zIndex: 1000 }}
          >
            <div className="p-4 bg-[#161921] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[300px]">
              <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full" style={{ background: EVENT_CONFIG.color }} />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: EVENT_CONFIG.color }}>
                    <IconMapPin size={16} color="white" />
                  </div>
                  <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border" style={{ color: EVENT_CONFIG.color, borderColor: `${EVENT_CONFIG.color}30`, background: `${EVENT_CONFIG.color}10` }}>
                    EVENT
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedEvent.subeventName}</h3>
                  <p className="text-[10px] font-medium mt-1 text-white/50">{selectedEvent.venue?.split(',')[0] || 'Venue'}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  {selectedEvent.subeventStart && (
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={12} color={EVENT_CONFIG.color} />
                      <p className="text-[10px] font-semibold text-white/90">
                        {new Date(selectedEvent.subeventStart).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {selectedEvent.subeventStart && selectedEvent.subeventEnd && (
                    <div className="flex items-center gap-1.5">
                      <IconClock size={12} color={EVENT_CONFIG.color} />
                      <p className="text-[10px] font-semibold text-white/90">
                        {new Date(selectedEvent.subeventStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
