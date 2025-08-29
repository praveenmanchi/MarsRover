import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestRoverPhotos } from "@/lib/nasa-api";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROVER_POSITIONS } from "@/types/rover";
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
  const [showPath, setShowPath] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["/api/rovers", selectedRover, "latest_photos"],
    queryFn: () => fetchLatestRoverPhotos(selectedRover),
  });

  const photos = photosData?.latest_photos || [];

  useEffect(() => {
    if (!mapRef.current || map) return;

    // Import Leaflet dynamically
    import('leaflet').then((L) => {
      // Set default icon path for Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

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

      setMap(leafletMap);
      setIsMapLoaded(true);

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
    });

    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setIsMapLoaded(false);
      }
    };
  }, [mapRef.current]);

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
    setShowPath(!showPath);
    // TODO: Implement path visualization
  };

  const currentPosition = ROVER_POSITIONS[selectedRover];

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

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2" data-testid="controls-map">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <h4 className="text-sm font-semibold mb-2">Map Controls</h4>
            <div className="space-y-2">
              <Button 
                onClick={handleCenterOnRover}
                className="w-full text-sm"
                data-testid="button-center-rover"
              >
                Center on Rover
              </Button>
              <Button 
                onClick={handleTogglePath}
                variant="secondary"
                className="w-full text-sm"
                data-testid="button-show-path"
              >
                {showPath ? 'Hide Path' : 'Show Path'}
              </Button>
              <Button 
                variant="outline"
                className="w-full text-sm"
                data-testid="button-toggle-terrain"
              >
                Toggle Terrain
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Position Info */}
        {currentPosition && (
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <h4 className="text-sm font-semibold mb-2">Current Position</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lat:</span>
                  <span className="font-mono" data-testid="text-position-lat">
                    {Math.abs(currentPosition.lat).toFixed(4)}°{currentPosition.lat < 0 ? 'S' : 'N'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lon:</span>
                  <span className="font-mono" data-testid="text-position-lon">
                    {Math.abs(currentPosition.lon).toFixed(4)}°{currentPosition.lon < 0 ? 'W' : 'E'}
                  </span>
                </div>
                {currentPosition.elevation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elevation:</span>
                    <span className="font-mono" data-testid="text-position-elevation">{currentPosition.elevation}m</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Gallery Panel */}
      <div className="absolute bottom-4 left-4 w-80">
        <ImageGallery
          photos={photos}
          isLoading={photosLoading}
          onPhotoSelect={onPhotoSelect}
          selectedSol={selectedSol}
        />
      </div>
    </>
  );
}
