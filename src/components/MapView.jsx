import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import CreatorPopup from './CreatorPopup';
import { useSettings } from '../SettingsContext.jsx';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ 
  creators, 
  selectedCreator, 
  onCreatorClick, 
  onMapClick, 
  flyTo, 
  viewMode, 
  sidebarOpen,
  isMobile 
}) {
  const { settings, getStatusConfig } = useSettings();
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: settings.MAP_CONFIG.center.longitude,
    latitude: settings.MAP_CONFIG.center.latitude,
    zoom: settings.MAP_CONFIG.zoom,
    pitch: settings.MAP_CONFIG.pitch,
    bearing: settings.MAP_CONFIG.bearing,
  });
  const [popupCreator, setPopupCreator] = useState(null);

  // Heatmap layer style derived from settings
  const heatmapLayer = useMemo(() => ({
    id: 'heatmap-layer',
    type: 'heatmap',
    paint: {
      'heatmap-weight': settings.HEATMAP_CONFIG.weight,
      'heatmap-intensity': [
        'interpolate', ['linear'], ['zoom'],
        settings.HEATMAP_CONFIG.intensityStops.minZoom, settings.HEATMAP_CONFIG.intensityStops.min,
        settings.HEATMAP_CONFIG.intensityStops.maxZoom, settings.HEATMAP_CONFIG.intensityStops.max,
      ],
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        ...settings.HEATMAP_CONFIG.colorStops.flat(),
      ],
      'heatmap-radius': [
        'interpolate', ['linear'], ['zoom'],
        settings.HEATMAP_CONFIG.radiusStops.minZoom, settings.HEATMAP_CONFIG.radiusStops.min,
        settings.HEATMAP_CONFIG.radiusStops.maxZoom, settings.HEATMAP_CONFIG.radiusStops.max,
      ],
      'heatmap-opacity': settings.HEATMAP_CONFIG.opacity,
    },
  }), [settings.HEATMAP_CONFIG]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.getMap().resize();
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.getMap().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyTo.longitude, flyTo.latitude],
        zoom: flyTo.zoom || 14,
        duration: settings.MAP_CONFIG.flyToDuration,
        essential: true,
      });
    }
  }, [flyTo, settings.MAP_CONFIG.flyToDuration]);

  useEffect(() => {
    setPopupCreator(selectedCreator);
  }, [selectedCreator]);

  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: creators
      .filter((c) => (c.locationCoordinates || c.location)?.coordinates)
      .map((c) => ({
        type: 'Feature',
        geometry: c.locationCoordinates || c.location,
        properties: { id: c._id },
      })),
  }), [creators]);

  const getClusteredMarkers = useCallback(() => {
    const zoom = viewState.zoom;
    if (zoom >= settings.MAP_CONFIG.clusterThreshold) {
      return {
        singles: creators.filter((c) => (c.locationCoordinates || c.location)?.coordinates),
        clusters: [],
      };
    }

    const clusters = [];
    const used = new Set();
    const threshold = ((settings.MAP_CONFIG.clusterRadius || 50) / 512) * (360 / Math.pow(2, zoom));
    
    const valid = creators.filter((c) => (c.locationCoordinates || c.location)?.coordinates);

    for (let i = 0; i < valid.length; i++) {
      if (used.has(i)) continue;
      const creatorI = valid[i];
      const coordsI = (creatorI.locationCoordinates || creatorI.location).coordinates;
      
      const group = [creatorI];
      used.add(i);

      for (let j = i + 1; j < valid.length; j++) {
        if (used.has(j)) continue;
        const creatorJ = valid[j];
        const coordsJ = (creatorJ.locationCoordinates || creatorJ.location).coordinates;
        
        const dx = coordsI[0] - coordsJ[0];
        const dy = coordsI[1] - coordsJ[1];
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          group.push(creatorJ);
          used.add(j);
        }
      }

      if (group.length > 1) {
        const avgLng = group.reduce((s, c) => s + (c.locationCoordinates || c.location).coordinates[0], 0) / group.length;
        const avgLat = group.reduce((s, c) => s + (c.locationCoordinates || c.location).coordinates[1], 0) / group.length;
        clusters.push({ items: group, longitude: avgLng, latitude: avgLat, count: group.length });
      } else {
        const coords = (group[0].locationCoordinates || group[0].location).coordinates;
        clusters.push({
          items: group,
          longitude: coords[0],
          latitude: coords[1],
          count: 1,
        });
      }
    }

    return {
      singles: clusters.filter((c) => c.count === 1).map((c) => c.items[0]),
      clusters: clusters.filter((c) => c.count > 1),
    };
  }, [creators, viewState.zoom, settings.MAP_CONFIG]);

  const { singles, clusters } = getClusteredMarkers();

  const handleClusterClick = (cluster) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [cluster.longitude, cluster.latitude],
        zoom: viewState.zoom + settings.MAP_CONFIG.clusterExpandZoom,
        duration: 1200,
      });
    }
  };

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={settings.MAP_CONFIG.style}
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
      maxZoom={settings.MAP_CONFIG.maxZoom}
      minZoom={settings.MAP_CONFIG.minZoom}
    >
      <NavigationControl position={isMobile ? "top-right" : "bottom-right"} showCompass={false} />
      <GeolocateControl position={isMobile ? "top-right" : "bottom-right"} />

      {viewMode === 'heatmap' && (
        <Source id="heatmap-data" type="geojson" data={geojson}>
          <Layer {...heatmapLayer} />
        </Source>
      )}

      {viewMode === 'markers' && (
        <>
          {clusters.map((cluster, i) => {
            const sz = Math.max(
              settings.MARKER_CONFIG.clusterMinSize,
              Math.min(settings.MARKER_CONFIG.clusterMaxSize, settings.MARKER_CONFIG.clusterMinSize + cluster.count * settings.MARKER_CONFIG.clusterSizePerItem)
            );
            return (
              <Marker key={`c-${i}`} longitude={cluster.longitude} latitude={cluster.latitude} anchor="center">
                <div
                  className="cluster-marker"
                  style={{
                    width: sz,
                    height: sz,
                    background: settings.MARKER_CONFIG.clusterBg,
                    border: `2px solid ${settings.MARKER_CONFIG.clusterBorder}`,
                    color: settings.MARKER_CONFIG.clusterTextColor,
                    fontSize: settings.MARKER_CONFIG.clusterFontSize,
                    fontWeight: settings.MARKER_CONFIG.clusterFontWeight,
                    boxShadow: `0 2px 12px ${settings.MARKER_CONFIG.clusterBorder}`,
                  }}
                  onClick={(e) => { e.stopPropagation(); handleClusterClick(cluster); }}
                >
                  {cluster.count}
                </div>
              </Marker>
            );
          })}

          {singles.map((creator) => {
            const status = getStatusConfig(creator.status);
            const isSelected = selectedCreator?._id === creator._id;
            const shouldPulse = settings.MARKER_CONFIG.pulseEnabled && settings.MARKER_CONFIG.pulseStatuses.includes(creator.status);
            const coords = (creator.locationCoordinates || creator.location).coordinates;
            const markerColor = settings.MARKER_CONFIG.useStatusColor ? status.color : settings.MARKER_CONFIG.customColor;

            return (
              <Marker
                key={creator._id}
                longitude={coords[0]}
                latitude={coords[1]}
                anchor="center"
              >
                <div
                  className={`relative cursor-pointer transition-transform duration-200 ${shouldPulse ? 'marker-pulse' : ''}`}
                  style={{
                    width: settings.MARKER_CONFIG.size,
                    height: settings.MARKER_CONFIG.size,
                    transform: `scale(${isSelected ? settings.MARKER_CONFIG.selectedScale : 1})`,
                    zIndex: isSelected ? 100 : 1,
                  }}
                  onClick={(e) => { e.stopPropagation(); onCreatorClick(creator); }}
                >
                  {/* Dot */}
                  <div
                    className="absolute inset-0 rounded-full border-2 transition-all duration-300 hover:scale-125"
                    style={{
                      backgroundColor: markerColor,
                      borderColor: settings.MARKER_CONFIG.selectedBorderColor,
                      boxShadow: `0 0 ${settings.MARKER_CONFIG.glowRadius}px ${markerColor}60`,
                    }}
                  />
                </div>
              </Marker>
            );
          })}
        </>
      )}

      {popupCreator && (popupCreator.locationCoordinates || popupCreator.location)?.coordinates && (
        <Popup
          longitude={(popupCreator.locationCoordinates || popupCreator.location).coordinates[0]}
          latitude={(popupCreator.locationCoordinates || popupCreator.location).coordinates[1]}
          anchor="bottom"
          offset={isMobile ? 10 : 20}
          closeOnClick={false}
          onClose={() => setPopupCreator(null)}
        >
          <CreatorPopup creator={popupCreator} onClose={() => setPopupCreator(null)} />
        </Popup>
      )}
    </Map>
  );
}
