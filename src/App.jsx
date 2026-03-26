import { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import { API_URL, EVENT_API_URL, calculateDistance, EVENT_CONFIG } from './config';
import { IconMenu } from './components/Icons';
import { SettingsProvider, useSettings } from './SettingsContext.jsx';

function AppContent() {
  const { settings } = useSettings();
  const [creators, setCreators] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventRadius, setEventRadius] = useState(EVENT_CONFIG.radius);
  const [filterByProximity, setFilterByProximity] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    gender: 'ALL',
    availability: 'ALL',
  });
  const [viewMode, setViewMode] = useState('markers');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);

    // Format current date for API query (DD-MM-YYYY)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    const FILTERED_API_URL = `${API_URL}?date=${dateStr}`;

    console.log('Fetching creators with date filter:', FILTERED_API_URL);

    Promise.all([
      fetch(FILTERED_API_URL).then(res => res.json()),
      fetch(EVENT_API_URL).then(res => res.json())
    ])
      .then(([creatorsData, eventData]) => {
        if (eventData.success) {
          const fetchedEvents = Array.isArray(eventData.data) ? eventData.data : [eventData.data];
          setEvents(fetchedEvents);
          
          if (fetchedEvents.length > 0) {
            const firstEvent = fetchedEvents[0];
            setSelectedEvent(firstEvent);
            if (firstEvent.venueLocation?.coordinates) {
              setFlyTo({
                center: firstEvent.venueLocation.coordinates,
                zoom: 13,
                duration: 1500 
              });
            }
          }
        }

        if (creatorsData.success) {
          const processedCreators = creatorsData.data
            .filter(c => 
              c.status === 'ACTIVE' || 
              c.status === 'ONBOARDED' || 
              c.status === 'ONBOARDING_STARTED' ||
              (c.activeAssignments && c.activeAssignments.length > 0)
            )
            .map(c => {
              const nativeCoords = (c.locationCoordinates || c.location)?.coordinates;
              const mainAssignment = c.activeAssignments?.find(a => a.isActive || a.isCurrentlyAssigned) || c.activeAssignments?.[0];
              const assignmentCoords = mainAssignment?.currentCoordinates;
              const venueName = mainAssignment?.venueName || mainAssignment?.eventName || mainAssignment?.address?.split(',')[0] || 'Venue';
              
              const normalizedCoordinates = assignmentCoords || nativeCoords;

              const baseCreator = {
                ...c,
                locationName: (assignmentCoords && venueName) 
                  ? venueName 
                  : (c.locationName || c.address || 'N/A'),
                normalizedCoordinates: normalizedCoordinates,
                // Map missing fields from production API to UI expectations
                creatorCode: c.creatorCode || (c._id ? `ROGC-${c._id.slice(-4).toUpperCase()}` : 'N/A'),
                gender: c.gender || 'Check Profile',
                availability: c.availability || 'Check Schedule',
                iPhoneModel: c.iPhoneModel || 'Verified',
                contactNumber: c.contactNumber || 'Contact Office',
                email: c.email || 'N/A',
                rank: c.rank || 'Bronze',
                numberOfShoots: c.numberOfShoots || 0
              };

              if (mainAssignment) {
                return {
                  ...baseCreator,
                  activeAssignment: {
                    ...mainAssignment,
                    venueName: venueName,
                    // Use both flags to be safe
                    isActive: mainAssignment.isActive || mainAssignment.isCurrentlyAssigned
                  }
                };
              }
              return baseCreator;
            });
          
          setCreators(processedCreators);
        }
        
        if (!creatorsData.success && !eventData.success) {
          setError('Failed to fetch data');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  // Remove the previous useEffect (lines 65-77)
  const filteredCreators = creators.filter((c) => {
    // 1. Basic Filters
    const q = filters.search.toLowerCase();
    const matchesSearch =
      !q ||
      c.creatorName?.toLowerCase().includes(q) ||
      c.locationName?.toLowerCase().includes(q) ||
      c.creatorCode?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);
    const matchesStatus = filters.status === 'ALL' || c.status === filters.status;
    const matchesGender = filters.gender === 'ALL' || c.gender === filters.gender;
    const matchesAvailability = filters.availability === 'ALL' || c.availability === filters.availability;
    
    // 2. Proximity Filter (Linked to Selected Event)
    let matchesProximity = true;
    if (filterByProximity && selectedEvent?.venueLocation?.coordinates) {
      const coords = c.normalizedCoordinates;
      if (coords && Array.isArray(coords) && coords.length >= 2) {
        const dist = calculateDistance(
          selectedEvent.venueLocation.coordinates[1],
          selectedEvent.venueLocation.coordinates[0],
          coords[1],
          coords[0]
        );
        matchesProximity = dist <= eventRadius;
      } else {
        matchesProximity = false; 
      }
    }

    return matchesSearch && matchesStatus && matchesGender && matchesAvailability && matchesProximity;
  });

  const handleCreatorClick = useCallback((creator) => {
    setSelectedCreator(creator);
    setSelectedEvent(null);
    if (isMobile) setSidebarOpen(false);
    
    const coords = creator.normalizedCoordinates;
                   
    if (coords && Array.isArray(coords) && coords.length >= 2) {
      console.log('Flying to creator:', creator.creatorName, coords);
      setFlyTo({
        center: [coords[0], coords[1]],
        zoom: 15,
        duration: 1200,
        id: Date.now()
      });
    } else {
      console.warn('No coordinates found for creator:', creator.creatorName);
    }
  }, [isMobile]);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setSelectedCreator(null);
    const coords = event?.venueLocation?.coordinates;
    if (coords) {
      setFlyTo({
        longitude: coords[0],
        latitude: coords[1],
        zoom: 14,
        id: Date.now(),
      });
    }
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedCreator(null);
    setSelectedEvent(null);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: settings.COLORS.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#262a36] border-t-[#4f7df9] animate-spin" />
          <p className="text-[#9498a6] text-sm">Loading data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: settings.COLORS.bg }}>
        <div className="p-8 rounded-xl text-center max-w-sm" style={{ background: settings.COLORS.surface, border: `1px solid ${settings.COLORS.border}` }}>
          <h2 className="text-lg font-semibold text-white mb-2">Connection Error</h2>
          <p className="text-[#9498a6] text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(79,125,249,0.1)', color: settings.COLORS.accent, border: `1px solid rgba(79,125,249,0.2)` }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex relative overflow-hidden" style={{ background: settings.COLORS.bg }}>
      <div 
        className={`${isMobile ? 'absolute inset-y-0 left-0 z-40' : 'relative'}`}
        style={{ pointerEvents: isMobile && !sidebarOpen ? 'none' : 'auto' }}
      >
        <Sidebar
          creators={filteredCreators}
          allCreators={creators}
          events={events}
          eventRadius={eventRadius}
          onEventRadiusChange={setEventRadius}
          filterByProximity={filterByProximity}
          onFilterByProximityChange={setFilterByProximity}
          onEventClick={handleEventClick}
          selectedCreator={selectedCreator}
          selectedEvent={selectedEvent}
          onCreatorClick={handleCreatorClick}
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
      </div>

      <div className="flex-1 relative">
        <MapView
          creators={filteredCreators}
          events={events}
          eventRadius={eventRadius}
          filterByProximity={filterByProximity}
          onEventClick={handleEventClick}
          selectedCreator={selectedCreator}
          selectedEvent={selectedEvent}
          onCreatorClick={handleCreatorClick}
          onMapClick={handleMapClick}
          flyTo={flyTo}
          viewMode={viewMode}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        <StatsBar creators={filteredCreators} allCreators={creators} isMobile={isMobile} />

        {(!sidebarOpen || isMobile) && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2.5 rounded-lg transition-transform hover:scale-105 active:scale-95"
            style={{ 
              background: 'rgba(22, 25, 33, 0.9)', 
              border: `1px solid ${settings.COLORS.border}`,
              opacity: isMobile && sidebarOpen ? 0 : 1,
              pointerEvents: isMobile && sidebarOpen ? 'none' : 'auto'
            }}
            title="Open sidebar"
          >
            <IconMenu size={18} color={settings.COLORS.textSecondary} />
          </button>
        )}

        {/* Mobile Overlay Backdrop */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-30 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
