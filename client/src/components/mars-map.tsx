import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestRoverPhotos, fetchRoverPhotos } from "@/lib/nasa-api";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROVER_POSITIONS } from "@/types/rover";
import { Camera, Navigation, Layers, MapPin, Thermometer, Wind } from "lucide-react";
import type { RoverPhoto } from "@/types/rover";

interface MarsMapProps {
  selectedRover: string;
  selectedSol: number;
  onPhotoSelect: (photo: RoverPhoto | null) => void;
}

export function MarsMap({ selectedRover, selectedSol, onPhotoSelect }: MarsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [roverMarkers, setRoverMarkers] = useState<Record<string, any>>({});
  const [photoMarkers, setPhotoMarkers] = useState<any[]>([]);
  const [routePath, setRoutePath] = useState<any>(null);
  const [showPath, setShowPath] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["/api/rovers", selectedRover, "photos", selectedSol],
    queryFn: () => fetchRoverPhotos(selectedRover, { sol: selectedSol }),
  });

  const { data: latestPhotosData } = useQuery({
    queryKey: ["/api/rovers", selectedRover, "latest_photos"],
    queryFn: () => fetchLatestRoverPhotos(selectedRover),
  });

  const photos = photosData?.photos || [];
  const latestPhotos = latestPhotosData?.latest_photos || [];

  useEffect(() => {
    if (!mapRef.current || map) return;

    let isMounted = true;

    // Import Leaflet dynamically
    import('leaflet').then((L) => {
      // Set default icon path for Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!isMounted) return;

      const initialPosition = ROVER_POSITIONS[selectedRover];
      const leafletMap = L.map(mapRef.current!).setView([initialPosition.lat, initialPosition.lon], 12);

      // Use a Mars-themed tile layer
      L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        attribution: 'NASA JPL Mars Trek | Mars rover tracking',
        opacity: 0.8,
      }).addTo(leafletMap);

      // Add Mars terrain overlay
      const marsOverlay = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        opacity: 0.3,
      }).addTo(leafletMap);

      if (isMounted) {
        setMap(leafletMap);
        setIsMapLoaded(true);
      }

      // Add rover markers
      const markers: Record<string, any> = {};
      Object.entries(ROVER_POSITIONS).forEach(([roverName, position]) => {
        const markerColor = roverName === selectedRover ? '#3b82f6' : '#6b7280';
        
        const roverIcon = L.divIcon({
          className: 'rover-marker',
          html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${markerColor}"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([position.lat, position.lon], { icon: roverIcon })
          .addTo(leafletMap)
          .bindPopup(`<strong class="capitalize">${roverName}</strong><br>${ROVER_POSITIONS[roverName].elevation ? `Elevation: ${ROVER_POSITIONS[roverName].elevation}m` : ''}`);
        
        markers[roverName] = marker;
      });

      setRoverMarkers(markers);

      // Create mock route path for selected rover
      const createRoutePath = (roverName: string) => {
        const basePosition = ROVER_POSITIONS[roverName];
        const routePoints = [
          [basePosition.lat, basePosition.lon],
          [basePosition.lat + 0.001, basePosition.lon + 0.0015],
          [basePosition.lat + 0.002, basePosition.lon + 0.003],
          [basePosition.lat + 0.0015, basePosition.lon + 0.0045],
          [basePosition.lat + 0.003, basePosition.lon + 0.006],
        ];

        const polyline = L.polyline(routePoints, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 10'
        }).addTo(leafletMap);

        return polyline;
      };

      const initialPath = createRoutePath(selectedRover);
      setRoutePath(initialPath);
    });

    return () => {
      isMounted = false;
      if (map) {
        try {
          map.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        setMap(null);
        setIsMapLoaded(false);
        setRoverMarkers({});
        setPhotoMarkers([]);
        setRoutePath(null);
      }
    };
  }, []);

  useEffect(() => {
    if (map && roverMarkers[selectedRover]) {
      const position = ROVER_POSITIONS[selectedRover];
      map.setView([position.lat, position.lon], 12);
      
      // Update marker colors
      Object.entries(roverMarkers).forEach(([roverName, marker]) => {
        const markerColor = roverName === selectedRover ? '#3b82f6' : '#6b7280';
        const icon = marker.getIcon();
        icon.options.html = `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${markerColor}"></div>`;
        marker.setIcon(icon);
      });
    }
  }, [selectedRover, map, roverMarkers]);

  const handleCenterOnRover = () => {
    if (map && ROVER_POSITIONS[selectedRover]) {
      const position = ROVER_POSITIONS[selectedRover];
      map.setView([position.lat, position.lon], 15);
    }
  };

  const handleTogglePath = () => {
    if (map && routePath) {
      if (showPath) {
        map.removeLayer(routePath);
      } else {
        map.addLayer(routePath);
      }
      setShowPath(!showPath);
    }
  };

  const handleTogglePhotos = () => {
    if (map && photoMarkers.length > 0) {
      photoMarkers.forEach(marker => {
        if (showPhotos) {
          map.removeLayer(marker);
        } else {
          map.addLayer(marker);
        }
      });
      setShowPhotos(!showPhotos);
    }
  };

  // Add photo markers when photos change
  useEffect(() => {
    if (!map || !photos.length) return;

    // Clear existing photo markers
    photoMarkers.forEach(marker => map.removeLayer(marker));

    const newPhotoMarkers = photos.slice(0, 10).map((photo, index) => {
      const basePosition = ROVER_POSITIONS[selectedRover];
      // Create random positions near the rover
      const lat = basePosition.lat + (Math.random() - 0.5) * 0.01;
      const lon = basePosition.lon + (Math.random() - 0.5) * 0.01;

      const photoIcon = window.L?.divIcon({
        className: 'photo-marker',
        html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                 <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                 </svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (photoIcon) {
        const marker = window.L?.marker([lat, lon], { icon: photoIcon })
          .bindPopup(`
            <div class="text-center">
              <img src="${photo.imgSrc}" alt="Mars Photo" class="w-32 h-24 object-cover rounded mb-2" />
              <p class="text-sm font-semibold">${photo.cameraFullName}</p>
              <p class="text-xs text-gray-600">Sol ${photo.sol} • ${photo.earthDate}</p>
            </div>
          `)
          .on('click', () => onPhotoSelect(photo));

        if (marker && showPhotos) {
          marker.addTo(map);
        }
        return marker;
      }
      return null;
    }).filter(Boolean);

    setPhotoMarkers(newPhotoMarkers);
  }, [map, photos, selectedRover, showPhotos]);

  const currentPosition = ROVER_POSITIONS[selectedRover];

  const getEnvironmentData = (roverName: string) => {
    const envData: Record<string, any> = {
      perseverance: { temperature: "-18°C", dustLevel: "Moderate", pressure: "12.4 Pa", windSpeed: "15 m/s" },
      curiosity: { temperature: "-12°C", dustLevel: "Low", pressure: "8.2 Pa", windSpeed: "12 m/s" },
      opportunity: { temperature: "-25°C", dustLevel: "High", pressure: "6.1 Pa", windSpeed: "20 m/s" },
      spirit: { temperature: "-22°C", dustLevel: "High", pressure: "5.8 Pa", windSpeed: "18 m/s" }
    };
    return envData[roverName] || envData.perseverance;
  };

  const envData = getEnvironmentData(selectedRover);

  return (
    <>
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gradient-to-br from-red-900 to-orange-800"
        data-testid="map-mars"
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="loader mx-auto mb-4"></div>
              <p className="text-foreground">Loading Mars terrain data...</p>
              <p className="text-sm text-muted-foreground">Initializing interactive map</p>
            </div>
          </div>
        )}
      </div>

      {/* Transparent Metrics Overlay */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white" data-testid="overlay-metrics">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs opacity-80">Temperature</p>
              <p className="font-mono">{envData.temperature}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs opacity-80">Dust Level</p>
              <p className="font-mono">{envData.dustLevel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded-full"></div>
            <div>
              <p className="text-xs opacity-80">Pressure</p>
              <p className="font-mono">{envData.pressure}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <div>
              <p className="text-xs opacity-80">Wind Speed</p>
              <p className="font-mono">{envData.windSpeed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Icon-Only Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2" data-testid="controls-map">
        <Button 
          onClick={handleCenterOnRover}
          size="sm"
          className="w-10 h-10 p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20"
          data-testid="button-center-rover"
          title="Center on Rover"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={handleTogglePath}
          size="sm"
          variant={showPath ? "default" : "outline"}
          className="w-10 h-10 p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20"
          data-testid="button-show-path"
          title={showPath ? 'Hide Path' : 'Show Path'}
        >
          <MapPin className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={handleTogglePhotos}
          size="sm"
          variant={showPhotos ? "default" : "outline"}
          className="w-10 h-10 p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20"
          data-testid="button-toggle-photos"
          title={showPhotos ? 'Hide Photos' : 'Show Photos'}
        >
          <Camera className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20"
          data-testid="button-toggle-terrain"
          title="Toggle Terrain"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Position Info */}
      {currentPosition && (
        <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-xs" data-testid="info-position">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="opacity-80">Lat:</span>
              <span className="font-mono" data-testid="text-position-lat">
                {Math.abs(currentPosition.lat).toFixed(4)}°{currentPosition.lat < 0 ? 'S' : 'N'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Lon:</span>
              <span className="font-mono" data-testid="text-position-lon">
                {Math.abs(currentPosition.lon).toFixed(4)}°{currentPosition.lon < 0 ? 'W' : 'E'}
              </span>
            </div>
            {currentPosition.elevation && (
              <div className="flex justify-between">
                <span className="opacity-80">Elevation:</span>
                <span className="font-mono" data-testid="text-position-elevation">{currentPosition.elevation}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Gallery Panel */}
      <div className="absolute bottom-4 left-4 w-80">
        <ImageGallery
          photos={latestPhotos}
          isLoading={photosLoading}
          onPhotoSelect={onPhotoSelect}
          selectedSol={selectedSol}
        />
      </div>
    </>
  );
}
