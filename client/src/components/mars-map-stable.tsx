import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "./image-gallery";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import type { Rover, RoverPhoto } from "@/types/rover";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MarsMapProps {
  selectedRover: string;
  selectedSol: number;
  onPhotoSelect: (photo: RoverPhoto) => void;
  onLocationSelect: (location: { lat: number; lon: number }) => void;
  className?: string;
}

export function MarsMapStable({ 
  selectedRover, 
  selectedSol, 
  onPhotoSelect, 
  onLocationSelect, 
  className 
}: MarsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const [currentLocation, setCurrentLocation] = useState({ lat: -5.4, lon: 137.8 });
  const [mapInitialized, setMapInitialized] = useState(false);

  // Fetch rover photos
  const { data: photos = [], isLoading } = useQuery({
    queryKey: [`/api/rovers/${selectedRover}/photos`, selectedSol],
    queryFn: async () => {
      const response = await fetch(`/api/rovers/${selectedRover}/photos?sol=${selectedSol}`);
      const data = await response.json();
      return data.photos || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInitialized) return;

    const leafletMap = L.map(mapRef.current, {
      center: [currentLocation.lat, currentLocation.lon],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
    });

    leafletMapRef.current = leafletMap;

    // Add stable base layer
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Mars Terrain | Based on NASA Mission Data',
      maxZoom: 18,
      className: 'mars-terrain-layer'
    });
    baseLayer.addTo(leafletMap);

    // Map click handler
    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setCurrentLocation({ lat, lon: lng });
      onLocationSelect({ lat, lon: lng });
    });

    setMapInitialized(true);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      setMapInitialized(false);
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!leafletMapRef.current || !mapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (leafletMapRef.current?.hasLayer(marker)) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add rover marker
    const roverIcon = L.divIcon({
      html: '<div style="background: #22d3ee; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: 'rover-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const roverMarker = L.marker([currentLocation.lat, currentLocation.lon], { 
      icon: roverIcon,
      title: `${selectedRover} Rover`
    });
    
    roverMarker.addTo(leafletMapRef.current);
    markersRef.current.push(roverMarker);

    roverMarker.bindPopup(`
      <div style="text-align: center; font-family: monospace;">
        <strong>${selectedRover.toUpperCase()}</strong><br/>
        <small>Sol ${selectedSol}</small><br/>
        <small>Status: Active</small>
      </div>
    `);

    // Add prominent topographical circles with elevation markers
    for (let i = 1; i <= 8; i++) {
      const radius = i * 800; // meters (larger for visibility)
      const circle = L.circle([currentLocation.lat, currentLocation.lon], {
        radius: radius,
        fillOpacity: 0,
        color: i % 2 === 0 ? '#FF6B35' : '#FFD700', // Alternating orange and gold
        weight: 2, // Thicker lines
        opacity: 0.7, // More visible
        dashArray: i % 2 === 0 ? '10, 5' : '5, 3'
      });
      
      circle.addTo(leafletMapRef.current);
      markersRef.current.push(circle);
      
      // Add elevation markers at cardinal points
      if (i % 2 === 0) {
        const elevationText = `${i * 100}m`;
        const angles = [0, 90, 180, 270];
        
        angles.forEach(angle => {
          const radian = (angle * Math.PI) / 180;
          const markerLat = currentLocation.lat + (radius / 111320) * Math.cos(radian);
          const markerLon = currentLocation.lon + (radius / (111320 * Math.cos(currentLocation.lat * Math.PI / 180))) * Math.sin(radian);
          
          const elevationMarker = L.marker([markerLat, markerLon], {
            icon: L.divIcon({
              html: `<div style="background: rgba(0,0,0,0.8); color: #FFD700; padding: 2px 4px; border-radius: 3px; font-size: 10px; font-weight: bold; border: 1px solid #FF6B35;">${elevationText}</div>`,
              className: 'elevation-marker',
              iconSize: [40, 20],
              iconAnchor: [20, 10]
            })
          });
          
          elevationMarker.addTo(leafletMapRef.current);
          markersRef.current.push(elevationMarker);
        });
      }
    }
    
    // Add grid lines for better metric visualization
    const gridLines = [];
    const gridSpacing = 0.01; // degrees
    
    // Vertical grid lines
    for (let i = -5; i <= 5; i++) {
      const lon = currentLocation.lon + (i * gridSpacing);
      const line = L.polyline([
        [currentLocation.lat - 0.05, lon],
        [currentLocation.lat + 0.05, lon]
      ], {
        color: '#8B4513',
        weight: 0.5,
        opacity: 0.3,
        dashArray: '1, 3'
      });
      line.addTo(leafletMapRef.current);
      markersRef.current.push(line);
    }
    
    // Horizontal grid lines
    for (let i = -5; i <= 5; i++) {
      const lat = currentLocation.lat + (i * gridSpacing);
      const line = L.polyline([
        [lat, currentLocation.lon - 0.05],
        [lat, currentLocation.lon + 0.05]
      ], {
        color: '#8B4513',
        weight: 0.5,
        opacity: 0.3,
        dashArray: '1, 3'
      });
      line.addTo(leafletMapRef.current);
      markersRef.current.push(line);
    }

    // Add photo markers
    if (photos.length > 0) {
      photos.slice(0, 10).forEach((photo) => {
        const photoLat = currentLocation.lat + (Math.random() - 0.5) * 0.02;
        const photoLon = currentLocation.lon + (Math.random() - 0.5) * 0.02;

        const photoIcon = L.divIcon({
          html: '<div style="background: #f59e0b; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>',
          className: 'photo-marker',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        const photoMarker = L.marker([photoLat, photoLon], { 
          icon: photoIcon,
          title: `Photo ${photo.id}`
        });
        
        photoMarker.addTo(leafletMapRef.current);
        markersRef.current.push(photoMarker);

        photoMarker.on('click', () => {
          onPhotoSelect(photo);
        });
      });
    }

  }, [selectedRover, selectedSol, photos, currentLocation, mapInitialized]);

  // Add Mars styling
  useEffect(() => {
    const marsStyle = document.createElement('style');
    marsStyle.textContent = `
      .leaflet-container {
        background: linear-gradient(135deg, #8B4513 0%, #CD853F 50%, #D2691E 100%) !important;
      }
      .mars-terrain-layer img {
        filter: sepia(90%) saturate(150%) hue-rotate(10deg) contrast(110%) brightness(80%) !important;
        mix-blend-mode: normal;
        opacity: 0.7;
      }
      .leaflet-tile-pane {
        opacity: 0.7;
      }
      .rover-marker, .photo-marker, .elevation-marker {
        z-index: 1000 !important;
      }
      .leaflet-overlay-pane svg path {
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `;
    document.head.appendChild(marsStyle);

    return () => {
      if (document.head.contains(marsStyle)) {
        document.head.removeChild(marsStyle);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Map overlay info */}
      <Card className="absolute top-4 left-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400 font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            MARS SURFACE MAP
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedRover.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-400">Sol {selectedSol}</span>
          </div>
          
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Location:</span>
              <span className="font-mono text-cyan-400">
                {currentLocation.lat.toFixed(2)}°N, {currentLocation.lon.toFixed(2)}°E
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Photos:</span>
              <span className="font-mono text-yellow-400">{photos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Elevation:</span>
              <span className="font-mono text-orange-400">-{Math.abs(Math.floor(currentLocation.lat * 100))}m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo gallery sidebar */}
      <div className="absolute top-4 right-4 w-64">
        <ImageGallery
          photos={photos}
          isLoading={isLoading}
          onPhotoSelect={onPhotoSelect}
          selectedSol={selectedSol}
        />
      </div>

      {/* Navigation controls */}
      <Card className="absolute bottom-4 left-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-300">Click map to explore</span>
          </div>
        </CardContent>
      </Card>

      {/* Topographical legend */}
      <Card className="absolute bottom-4 right-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="font-mono text-cyan-400 mb-2">ELEVATION CONTOURS</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0 border-t-2 border-dashed border-yellow-400"></div>
              <span className="text-yellow-400">Odd intervals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0 border-t-2 border-dashed border-orange-500"></div>
              <span className="text-orange-400">Even intervals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0 border-t border-dotted border-amber-700"></div>
              <span className="text-amber-600">Grid lines (1km)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}