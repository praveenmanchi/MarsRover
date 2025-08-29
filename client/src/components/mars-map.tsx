import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestRoverPhotos, fetchRoverPhotos } from "@/lib/nasa-api";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ROVER_POSITIONS } from "@/types/rover";
import { Camera, Navigation, Layers, MapPin, Thermometer, Wind } from "lucide-react";
import type { RoverPhoto } from "@/types/rover";

interface MarsMapProps {
  selectedRover: string;
  selectedSol: number;
  onPhotoSelect: (photo: RoverPhoto | null) => void;
  onLocationSelect?: (location: { lat: number; lon: number }) => void;
}

export function MarsMap({ selectedRover, selectedSol, onPhotoSelect, onLocationSelect }: MarsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [roverMarkers, setRoverMarkers] = useState<Record<string, any>>({});
  const [photoMarkers, setPhotoMarkers] = useState<any[]>([]);
  const [routePath, setRoutePath] = useState<any>(null);
  const [showPath, setShowPath] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState('color');
  const [showTopography, setShowTopography] = useState(true);

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

      // Create custom Mars terrain tiles with proper Mars coloring
      const createMarsLayer = () => {
        return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'NASA JPL Mars Rover Tracking | Mars Terrain Simulation',
          maxZoom: 18,
          opacity: 1.0
        });
      };

      // Primary Mars-styled layer
      const marsLayer = createMarsLayer();
      
      // Alternative grayscale Mars layer
      const marsGrayscaleLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'NASA JPL Mars Rover Tracking | Mars Grayscale',
        maxZoom: 18,
        opacity: 0.7,
        className: 'mars-grayscale'
      });

      // Add Mars styling for fallback
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-tile-container img {
          filter: sepia(80%) hue-rotate(10deg) saturate(150%) contrast(110%) brightness(85%);
        }
        .mars-overlay {
          background: radial-gradient(ellipse at center, rgba(205, 92, 15, 0.1) 0%, rgba(139, 69, 19, 0.2) 50%, rgba(101, 67, 33, 0.3) 100%);
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);

      // Add Mars styling CSS
      const marsStyle = document.createElement('style');
      marsStyle.textContent = `
        .leaflet-tile-container img {
          filter: sepia(90%) hue-rotate(15deg) saturate(200%) contrast(120%) brightness(75%) !important;
        }
        .mars-grayscale img {
          filter: grayscale(100%) sepia(30%) hue-rotate(15deg) saturate(150%) brightness(70%) !important;
        }
        .leaflet-container {
          background-color: #8B4513 !important;
        }
      `;
      document.head.appendChild(marsStyle);

      // Add primary Mars layer
      marsLayer.addTo(leafletMap);
      
      // Add layer control for basemap switching
      const baseMaps = {
        "Mars Color": marsLayer,
        "Mars Grayscale": marsGrayscaleLayer
      };
      
      const layerControl = L.control.layers(baseMaps, {}).addTo(leafletMap);

      // Add topographical lines overlay
      const addTopographicalOverlay = () => {
        // Add contour lines for Mars elevation
        const topographyLines = [];
        for (let i = 0; i < 10; i++) {
          const radius = 1000 + (i * 500);
          const circle = L.circle([initialPosition.lat, initialPosition.lon], {
            radius: radius,
            fillOpacity: 0,
            color: '#8B4513',
            weight: 1,
            opacity: 0.3
          });
          topographyLines.push(circle);
          circle.addTo(leafletMap);
        }
        return topographyLines;
      };

      const topography = addTopographicalOverlay();

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

      // Create detailed Curiosity rover path for Gale Crater exploration
      const createRoutePath = (roverName: string) => {
        const basePosition = ROVER_POSITIONS[roverName];
        
        // Detailed Curiosity route through Gale Crater
        const routePoints = [
          // Landing site and early exploration
          [basePosition.lat - 0.008, basePosition.lon - 0.010], // Bradbury Landing
          [basePosition.lat - 0.007, basePosition.lon - 0.009], // Glenelg area
          [basePosition.lat - 0.006, basePosition.lon - 0.008], // Yellowknife Bay
          [basePosition.lat - 0.005, basePosition.lon - 0.007], // Darwin waypoint
          [basePosition.lat - 0.004, basePosition.lon - 0.006], // Cooperstown
          [basePosition.lat - 0.003, basePosition.lon - 0.005], // Kimberley formation
          [basePosition.lat - 0.002, basePosition.lon - 0.004], // Pahrump Hills
          [basePosition.lat - 0.001, basePosition.lon - 0.003], // Hidden Valley
          [basePosition.lat, basePosition.lon - 0.002], // Confidence Hills
          [basePosition.lat + 0.001, basePosition.lon - 0.001], // Telegraph Peak
          [basePosition.lat + 0.002, basePosition.lon], // Buckskin
          [basePosition.lat + 0.003, basePosition.lon + 0.001], // Big Sky
          [basePosition.lat + 0.004, basePosition.lon + 0.002], // Greenhorn
          [basePosition.lat + 0.005, basePosition.lon + 0.003], // Lubango
          [basePosition.lat + 0.006, basePosition.lon + 0.004], // Vera Rubin Ridge
          [basePosition.lat, basePosition.lon], // Current position
        ];

        // Main drive path in blue
        const polyline = L.polyline(routePoints, {
          color: '#1e40af',
          weight: 4,
          opacity: 0.9,
        }).addTo(leafletMap);

        // Add sampling locations as red markers
        const samplingLocations = [
          { lat: basePosition.lat - 0.006, lon: basePosition.lon - 0.008, name: "John Klein" },
          { lat: basePosition.lat - 0.005, lon: basePosition.lon - 0.007, name: "Cumberland" },
          { lat: basePosition.lat - 0.003, lon: basePosition.lon - 0.005, name: "Windjana" },
          { lat: basePosition.lat - 0.002, lon: basePosition.lon - 0.004, name: "Confidence Hills" },
          { lat: basePosition.lat, lon: basePosition.lon - 0.002, name: "Telegraph Peak" },
          { lat: basePosition.lat + 0.002, lon: basePosition.lon, name: "Buckskin" },
          { lat: basePosition.lat + 0.004, lon: basePosition.lon + 0.002, name: "Lubango" },
        ];

        samplingLocations.forEach(sample => {
          const sampleIcon = L.divIcon({
            className: 'sample-marker',
            html: `<div class="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-lg"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          });
          
          L.marker([sample.lat, sample.lon], { icon: sampleIcon })
            .addTo(leafletMap)
            .bindPopup(`<strong>${sample.name}</strong><br>Sample Location`);
        });

        // Add waypoints as yellow markers
        const waypoints = [
          { lat: basePosition.lat - 0.004, lon: basePosition.lon - 0.006, name: "Darwin" },
          { lat: basePosition.lat - 0.002, lon: basePosition.lon - 0.004, name: "Cooperstown" },
          { lat: basePosition.lat + 0.002, lon: basePosition.lon, name: "Mount Sharp Base" },
          { lat: basePosition.lat + 0.006, lon: basePosition.lon + 0.004, name: "Vera Rubin Ridge" },
        ];

        waypoints.forEach(waypoint => {
          const waypointIcon = L.divIcon({
            className: 'waypoint-marker',
            html: `<div class="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white shadow-lg"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          });
          
          L.marker([waypoint.lat, waypoint.lon], { icon: waypointIcon })
            .addTo(leafletMap)
            .bindPopup(`<strong>${waypoint.name}</strong><br>Navigation Waypoint`);
        });

        // Add landing zone circle
        const landingZone = L.circle([basePosition.lat - 0.008, basePosition.lon - 0.010], {
          color: '#8b5cf6',
          weight: 2,
          opacity: 0.6,
          fillOpacity: 0.1,
          radius: 500
        }).addTo(leafletMap);
        landingZone.bindPopup('<strong>Landing Zone</strong><br>Curiosity Landing Area');

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

      {/* Environmental Metrics Panel */}
      <div className="absolute bottom-4 left-4 bg-black/90 border border-gray-600/40 p-4 w-48 z-10" data-testid="overlay-metrics">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-800/60 p-2 text-center">
              <div className="text-xs font-mono text-orange-200 uppercase">TEMP</div>
              <div className="text-lg font-mono font-bold text-white">-12°C</div>
            </div>
            <div className="bg-yellow-700/60 p-2 text-center">
              <div className="text-xs font-mono text-yellow-200 uppercase">DUST</div>
              <div className="text-lg font-mono font-bold text-white">Low</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-700/60 p-2 text-center">
              <div className="text-xs font-mono text-green-200 uppercase">PRESS</div>
              <div className="text-lg font-mono font-bold text-white">8.2 Pa</div>
            </div>
            <div className="bg-blue-700/60 p-2 text-center">
              <div className="text-xs font-mono text-blue-200 uppercase">WIND</div>
              <div className="text-lg font-mono font-bold text-white">12 m/s</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-700/60 p-2 text-center">
              <div className="text-xs font-mono text-purple-200 uppercase">BATTERY</div>
              <div className="text-lg font-mono font-bold text-white">STRONG</div>
            </div>
            <div className="bg-cyan-700/60 p-2 text-center">
              <div className="text-xs font-mono text-cyan-200 uppercase">COMMS</div>
              <div className="text-lg font-mono font-bold text-white">STRONG</div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Feeds Panel - Repositioned */}
      <div className="absolute top-4 right-4 bg-black/90 border border-gray-600/40 p-4 w-72 z-10" data-testid="camera-views">
        <div className="mb-3">
          <h3 className="text-sm font-mono font-bold text-white tracking-wider">CAMERA FEEDS</h3>
          <div className="text-xs font-mono text-gray-400">MULTIPLE ANGLES</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {['NAVCAM', 'FHAZ', 'RHAZ', 'MAST'].map((camera, index) => {
            // Use latest photos since current sol might have no photos
            const cameraPhotos = latestPhotosData?.latest_photos?.filter(photo => 
              photo.camera?.name?.toLowerCase().includes(camera.toLowerCase().slice(0, 3))
            ) || [];
            const hasPhotos = cameraPhotos.length > 0;
            
            return (
              <Dialog key={camera}>
                <DialogTrigger asChild>
                  <div className="bg-gray-800/60 border border-gray-600/50 aspect-video relative cursor-pointer hover:border-gray-400/80 transition-colors">
                    <div className="absolute top-1 left-1 text-xs font-mono text-white">{camera}</div>
                    {hasPhotos ? (
                      <img 
                        src={cameraPhotos[0].imageUrl} 
                        alt={`${camera} view`}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-gradient-to-br from-orange-900/40 to-red-900/40 flex items-center justify-center ${hasPhotos ? 'hidden' : ''}`}>
                      <span className="text-gray-400 text-xs font-mono">No Data</span>
                    </div>
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {hasPhotos && (
                      <div className="absolute bottom-1 left-1 text-xs font-mono text-white bg-black/60 px-1 rounded">
                        {cameraPhotos.length}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] bg-black/95 border-gray-600/40">
                  <DialogHeader>
                    <DialogTitle className="text-white font-mono">
                      {camera} CAMERA FEED
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {cameraPhotos.length > 0 ? (
                      cameraPhotos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="relative group cursor-pointer">
                          <img
                            src={photo.imageUrl}
                            alt={`${camera} ${photoIndex + 1}`}
                            className="w-full aspect-video object-cover border border-gray-600/50 hover:border-gray-400/80 transition-colors"
                            onClick={() => onPhotoSelect(photo)}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-mono">Click to view</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-gray-400 font-mono py-8">
                        No images available for {camera}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>

      {/* NASA-Style Map Controls Panel */}
      <div className="absolute top-4 left-4 bg-black/90 border border-gray-400/40 p-4 w-80 z-20" data-testid="map-controls">
        <div className="border-l-2 border-gray-400 pl-3 mb-4">
          <h3 className="text-sm font-mono font-bold text-white tracking-wider">CURIOSITY'S LOCATION</h3>
          <div className="text-xs font-mono text-gray-400">Latest Drive: Sol {selectedSol} | Total Distance 29.87 km</div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleTogglePath}
              size="sm"
              variant={showPath ? "default" : "outline"}
              className="text-xs font-mono bg-blue-600 hover:bg-blue-700 border-blue-500"
              data-testid="button-rover-path"
            >
              🔵 Rover Drive Path
            </Button>
            
            <Button 
              onClick={handleCenterOnRover}
              size="sm"
              className="text-xs font-mono bg-green-600 hover:bg-green-700 border-green-500"
              data-testid="button-rover-position"
            >
              🟢 Rover Position
            </Button>
            
            <Button 
              onClick={handleTogglePhotos}
              size="sm"
              variant={showPhotos ? "default" : "outline"}
              className="text-xs font-mono bg-red-600 hover:bg-red-700 border-red-500"
              data-testid="button-sampling-locations"
            >
              🔴 Sampling Locations
            </Button>
            
            <Button 
              size="sm"
              className="text-xs font-mono bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
              data-testid="button-waypoints"
            >
              🟡 Rover Waypoints
            </Button>
            
            <Button 
              size="sm"
              className="text-xs font-mono bg-orange-600 hover:bg-orange-700 border-orange-500"
              data-testid="button-depot-zone"
            >
              🟠 Sample Depot Zone
            </Button>
            
            <Button 
              size="sm"
              className="text-xs font-mono bg-purple-600 hover:bg-purple-700 border-purple-500"
              data-testid="button-landing-ellipse"
            >
              🟣 Landing Ellipse
            </Button>
          </div>
          
          <div className="border-t border-gray-400/30 pt-3">
            <div className="text-xs font-mono text-gray-400 mb-2">BASEMAP OPTIONS</div>
            <div className="flex space-x-2">
              <Button 
                size="sm"
                className={`text-xs font-mono flex-1 ${activeBasemap === 'color' ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                data-testid="button-color-basemap"
                onClick={() => setActiveBasemap('color')}
              >
                Color Basemap
              </Button>
              <Button 
                size="sm"
                className={`text-xs font-mono flex-1 ${activeBasemap === 'grayscale' ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                data-testid="button-grayscale-basemap"
                onClick={() => setActiveBasemap('grayscale')}
              >
                Grayscale
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-400/30 pt-3">
            <div className="text-xs font-mono text-gray-400 mb-2">MISSION INFO</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Sampling Locations:</span>
                <span className="text-white">28 (samples taken)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sample Info:</span>
                <span className="text-cyan-400 cursor-pointer">🔗</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Position Info */}
      {currentPosition && (
        <div className="absolute top-4 right-4 bg-black/80 border border-white/40 p-3 text-white text-xs z-30" data-testid="info-position">
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
