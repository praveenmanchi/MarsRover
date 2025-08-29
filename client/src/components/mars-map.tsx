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

      // Use OpenStreetMap as base layer for Mars simulation
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'NASA JPL Mars Rover Tracking | Simulated Mars Terrain',
        opacity: 0.6,
        // Apply Mars-like color filter
        className: 'mars-terrain'
      }).addTo(leafletMap);

      // Add custom Mars terrain styling
      const style = document.createElement('style');
      style.textContent = `
        .mars-terrain {
          filter: sepia(100%) hue-rotate(10deg) saturate(200%) contrast(120%) brightness(90%);
        }
      `;
      document.head.appendChild(style);

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
      perseverance: { 
        temperature: "-18°C", 
        dustLevel: "Moderate", 
        pressure: "12.4 Pa", 
        windSpeed: "15 m/s",
        battery: "88%",
        connection: "Stable",
        health: "Nominal"
      },
      curiosity: { 
        temperature: "-12°C", 
        dustLevel: "Low", 
        pressure: "8.2 Pa", 
        windSpeed: "12 m/s",
        battery: "92%",
        connection: "Stable", 
        health: "Nominal"
      },
      opportunity: { 
        temperature: "-25°C", 
        dustLevel: "High", 
        pressure: "6.1 Pa", 
        windSpeed: "20 m/s",
        battery: "0%",
        connection: "Lost",
        health: "Offline"
      },
      spirit: { 
        temperature: "-22°C", 
        dustLevel: "High", 
        pressure: "5.8 Pa", 
        windSpeed: "18 m/s",
        battery: "0%",
        connection: "Lost",
        health: "Offline"
      }
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

      {/* FUI Metrics Panel */}
      <div className="absolute top-4 left-4 bg-black/80 border border-cyan-400/40 p-4 min-w-[300px]" data-testid="overlay-metrics">
        <div className="border-l-2 border-cyan-400 pl-3 mb-4">
          <h3 className="text-sm font-mono font-bold text-cyan-400 tracking-wider">SENSOR DATA</h3>
          <div className="text-xs font-mono text-cyan-400/60">REAL-TIME MONITORING</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 p-2">
            <div className="text-xs font-mono text-blue-400/80 uppercase">TEMP</div>
            <div className="text-lg font-mono font-bold text-blue-400">{envData.temperature}</div>
            <div className="w-full h-1 bg-blue-500/20 mt-1">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-2">
            <div className="text-xs font-mono text-yellow-400/80 uppercase">DUST</div>
            <div className="text-lg font-mono font-bold text-yellow-400">{envData.dustLevel}</div>
            <div className="w-full h-1 bg-yellow-500/20 mt-1">
              <div className="h-full bg-yellow-500 w-1/2"></div>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 p-2">
            <div className="text-xs font-mono text-red-400/80 uppercase">PRESS</div>
            <div className="text-lg font-mono font-bold text-red-400">{envData.pressure}</div>
            <div className="w-full h-1 bg-red-500/20 mt-1">
              <div className="h-full bg-red-500 w-2/3"></div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 p-2">
            <div className="text-xs font-mono text-green-400/80 uppercase">WIND</div>
            <div className="text-lg font-mono font-bold text-green-400">{envData.windSpeed}</div>
            <div className="w-full h-1 bg-green-500/20 mt-1">
              <div className="h-full bg-green-500 w-3/5"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-cyan-400/20">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-cyan-400/60">BATTERY:</span>
            <span className="text-cyan-400">{envData.battery}</span>
          </div>
          <div className="flex justify-between text-xs font-mono mt-1">
            <span className="text-cyan-400/60">SIGNAL:</span>
            <span className="text-green-400">{envData.connection}</span>
          </div>
        </div>
      </div>

      {/* Camera Views Panel */}
      <div className="absolute top-4 right-4 bg-black/80 border border-cyan-400/40 p-4 w-80" data-testid="camera-views">
        <div className="border-l-2 border-cyan-400 pl-3 mb-4">
          <h3 className="text-sm font-mono font-bold text-cyan-400 tracking-wider">CAMERA FEEDS</h3>
          <div className="text-xs font-mono text-cyan-400/60">MULTIPLE ANGLES</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/50 border border-cyan-400/30 aspect-video relative">
            <div className="absolute top-1 left-1 text-xs font-mono text-cyan-400">NAVCAM</div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 to-red-900/50"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="bg-gray-800/50 border border-cyan-400/30 aspect-video relative">
            <div className="absolute top-1 left-1 text-xs font-mono text-cyan-400">FHAZ</div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-orange-900/50"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="bg-gray-800/50 border border-cyan-400/30 aspect-video relative">
            <div className="absolute top-1 left-1 text-xs font-mono text-cyan-400">RHAZ</div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-800/50 to-red-800/50"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="bg-gray-800/50 border border-cyan-400/30 aspect-video relative">
            <div className="absolute top-1 left-1 text-xs font-mono text-cyan-400">MAST</div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-800/50 to-orange-700/50"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* FUI Map Controls */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-2" data-testid="controls-map">
        <Button 
          onClick={handleCenterOnRover}
          size="sm"
          className="w-10 h-10 p-0 bg-black/80 hover:bg-cyan-400/20 border border-cyan-400/40 text-cyan-400"
          data-testid="button-center-rover"
          title="Center on Rover"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={handleTogglePath}
          size="sm"
          className={`w-10 h-10 p-0 bg-black/80 border border-cyan-400/40 ${showPath ? 'text-cyan-400 bg-cyan-400/20' : 'text-cyan-400/60 hover:bg-cyan-400/10'}`}
          data-testid="button-show-path"
          title={showPath ? 'Hide Path' : 'Show Path'}
        >
          <MapPin className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={handleTogglePhotos}
          size="sm"
          className={`w-10 h-10 p-0 bg-black/80 border border-cyan-400/40 ${showPhotos ? 'text-cyan-400 bg-cyan-400/20' : 'text-cyan-400/60 hover:bg-cyan-400/10'}`}
          data-testid="button-toggle-photos"
          title={showPhotos ? 'Hide Photos' : 'Show Photos'}
        >
          <Camera className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm"
          className="w-10 h-10 p-0 bg-black/80 hover:bg-cyan-400/10 border border-cyan-400/40 text-cyan-400/60"
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
