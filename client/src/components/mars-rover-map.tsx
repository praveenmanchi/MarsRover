import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "./image-gallery";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Route, Camera, Target } from "lucide-react";
import type { RoverPhoto } from "@/types/rover";

interface MarsMapProps {
  selectedRover: string;
  selectedSol: number;
  onPhotoSelect: (photo: RoverPhoto) => void;
  onLocationSelect: (location: { lat: number; lon: number }) => void;
  className?: string;
}

// Rover route waypoints for demonstration
const ROVER_ROUTES = {
  curiosity: [
    { sol: 0, lat: -4.589, lon: 137.441, name: "Bradbury Landing" },
    { sol: 56, lat: -4.590, lon: 137.442, name: "Glenelg" },
    { sol: 450, lat: -4.600, lon: 137.430, name: "Darwin" },
    { sol: 1000, lat: -4.650, lon: 137.380, name: "Pahrump Hills" },
    { sol: 2000, lat: -4.730, lon: 137.350, name: "Murray Buttes" },
    { sol: 3000, lat: -4.780, lon: 137.320, name: "Vera Rubin Ridge" },
    { sol: 4000, lat: -4.800, lon: 137.300, name: "Glen Torridon" },
    { sol: 4156, lat: -4.820, lon: 137.280, name: "Current Location" }
  ],
  perseverance: [
    { sol: 0, lat: 18.445, lon: 77.451, name: "Octavia E. Butler Landing" },
    { sol: 100, lat: 18.447, lon: 77.453, name: "Séítah" },
    { sol: 400, lat: 18.450, lon: 77.455, name: "Three Forks" },
    { sol: 800, lat: 18.455, lon: 77.460, name: "Delta Front" },
    { sol: 1000, lat: 18.460, lon: 77.465, name: "Current Location" }
  ],
  opportunity: [
    { sol: 0, lat: -1.946, lon: 354.473, name: "Eagle Crater" },
    { sol: 900, lat: -1.950, lon: 354.470, name: "Endurance Crater" },
    { sol: 2000, lat: -2.000, lon: 354.400, name: "Victoria Crater" },
    { sol: 3500, lat: -2.100, lon: 354.300, name: "Endeavour Crater" },
    { sol: 5111, lat: -2.200, lon: 354.200, name: "Final Location" }
  ],
  spirit: [
    { sol: 0, lat: -14.568, lon: 175.473, name: "Columbia Memorial Station" },
    { sol: 500, lat: -14.570, lon: 175.475, name: "Husband Hill" },
    { sol: 1000, lat: -14.580, lon: 175.480, name: "Home Plate" },
    { sol: 1892, lat: -14.590, lon: 175.485, name: "Troy" },
    { sol: 2210, lat: -14.600, lon: 175.490, name: "Final Location" }
  ]
};

export function MarsRoverMap({ 
  selectedRover, 
  selectedSol, 
  onPhotoSelect, 
  onLocationSelect, 
  className 
}: MarsMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: -4.589, lon: 137.441 });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);

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

  // Draw Mars terrain and rover route
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Prevent infinite redraws
    const drawMap = () => {

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw Mars terrain background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#CD853F');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw terrain features
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 10;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#A0522D';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw elevation contours
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, i * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Get rover route
    const route = ROVER_ROUTES[selectedRover as keyof typeof ROVER_ROUTES] || ROVER_ROUTES.curiosity;
    
    // Calculate position based on current sol
    let currentPos = route[0];
    for (let i = 0; i < route.length - 1; i++) {
      if (selectedSol >= route[i].sol && selectedSol <= route[i + 1].sol) {
        const progress = (selectedSol - route[i].sol) / (route[i + 1].sol - route[i].sol);
        currentPos = {
          sol: selectedSol,
          lat: route[i].lat + (route[i + 1].lat - route[i].lat) * progress,
          lon: route[i].lon + (route[i + 1].lon - route[i].lon) * progress,
          name: "Current Position"
        };
        break;
      } else if (selectedSol > route[i + 1].sol) {
        currentPos = route[i + 1];
      }
    }
    
    setCurrentLocation({ lat: currentPos.lat, lon: currentPos.lon });

    // Convert lat/lon to canvas coordinates
    const latLonToCanvas = (lat: number, lon: number) => {
      const centerLat = route[0].lat;
      const centerLon = route[0].lon;
      const scale = 5000; // Scale factor
      
      const x = canvas.width / 2 + (lon - centerLon) * scale;
      const y = canvas.height / 2 - (lat - centerLat) * scale;
      
      return { x, y };
    };

    // Draw rover route path
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    route.forEach((point, index) => {
      const { x, y } = latLonToCanvas(point.lat, point.lon);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw waypoints
    route.forEach((point, index) => {
      const { x, y } = latLonToCanvas(point.lat, point.lon);
      
      // Waypoint circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = point.sol <= selectedSol ? '#00FF00' : '#FF6B35';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Waypoint label
      if (hoveredPoint === index || index === 0 || index === route.length - 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(point.name, x + 10, y - 10);
        ctx.fillText(`Sol ${point.sol}`, x + 10, y + 20);
        ctx.shadowBlur = 0;
      }
    });

    // Draw current rover position
    const { x: roverX, y: roverY } = latLonToCanvas(currentPos.lat, currentPos.lon);
    
    // Rover icon
    ctx.save();
    ctx.translate(roverX, roverY);
    ctx.rotate(Date.now() / 1000 % (Math.PI * 2));
    
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-8, 8);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fillStyle = '#00FFFF';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();

    // Draw photo locations
    if (photos.length > 0) {
      photos.slice(0, 20).forEach((photo, index) => {
        const photoLat = currentPos.lat + (Math.random() - 0.5) * 0.01;
        const photoLon = currentPos.lon + (Math.random() - 0.5) * 0.01;
        const { x, y } = latLonToCanvas(photoLat, photoLon);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
      });
    }

    // Handle canvas click
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if clicked on a photo marker
      if (photos.length > 0) {
        const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
        onPhotoSelect(photo);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
    };
    
    // Use requestAnimationFrame to prevent excessive redraws
    const animationId = requestAnimationFrame(drawMap);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [selectedRover, selectedSol, photos.length, hoveredPoint, onPhotoSelect]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Mars terrain canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-lg cursor-crosshair"
        style={{ background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)' }}
      />
      
      {/* Map info overlay */}
      <Card className="absolute top-4 left-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm max-w-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400 font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            MARS ROVER ROUTE MAP
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
                {currentLocation.lat.toFixed(3)}°, {currentLocation.lon.toFixed(3)}°
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Photos:</span>
              <span className="font-mono text-yellow-400">{photos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Distance:</span>
              <span className="font-mono text-green-400">
                {Math.floor(selectedSol * 0.04)}km
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo gallery */}
      <div className="absolute top-4 right-4 w-64 max-h-[calc(100%-2rem)] overflow-y-auto">
        <ImageGallery
          photos={photos}
          isLoading={isLoading}
          onPhotoSelect={onPhotoSelect}
          selectedSol={selectedSol}
        />
      </div>

      {/* Navigation instructions */}
      <Card className="absolute bottom-4 left-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm">
        <CardContent className="p-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-300">Click map to view photos</span>
        </CardContent>
      </Card>

      {/* Route legend */}
      <Card className="absolute bottom-4 right-4 bg-black/90 border-cyan-500/30 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="font-mono text-cyan-400 mb-2">ROUTE LEGEND</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Visited waypoints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Future waypoints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              <span>Current position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Photo locations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}