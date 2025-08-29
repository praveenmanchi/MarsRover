import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, ZoomIn, ZoomOut, Mountain, Maximize2 } from "lucide-react";

interface TerrainViewerProps {
  location?: { lat: number; lon: number };
  className?: string;
}

export function TerrainViewer({ location = { lat: -5.4, lon: 137.8 }, className }: TerrainViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [elevation, setElevation] = useState(30);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate terrain data based on location
  const generateTerrainData = () => {
    const size = 50;
    const terrain = [];
    const centerLat = location.lat;
    const centerLon = location.lon;
    
    for (let x = 0; x < size; x++) {
      terrain[x] = [];
      for (let z = 0; z < size; z++) {
        // Create realistic Mars terrain with craters and elevation changes
        const distFromCenter = Math.sqrt((x - size/2) ** 2 + (z - size/2) ** 2);
        const baseElevation = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 50;
        const craterEffect = Math.max(0, 30 - distFromCenter * 2) * -1;
        const noise = (Math.random() - 0.5) * 20;
        
        terrain[x][z] = baseElevation + craterEffect + noise;
      }
    }
    return terrain;
  };

  const [terrainData] = useState(() => generateTerrainData());

  // Simple 3D rendering using Canvas 2D
  const drawTerrain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = zoom * 2;

    // Draw terrain mesh
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 0.5;

    const size = terrainData.length;
    const angleRad = (rotation * Math.PI) / 180;
    const elevationRad = (elevation * Math.PI) / 180;

    // Draw terrain grid
    for (let x = 0; x < size - 1; x++) {
      for (let z = 0; z < size - 1; z++) {
        const points = [
          [x, terrainData[x][z], z],
          [x + 1, terrainData[x + 1][z], z],
          [x + 1, terrainData[x + 1][z + 1], z + 1],
          [x, terrainData[x][z + 1], z + 1]
        ];

        // Project 3D to 2D
        const projectedPoints = points.map(([px, py, pz]) => {
          // Center the coordinates
          px -= size / 2;
          pz -= size / 2;
          
          // Apply rotation
          const rotatedX = px * Math.cos(angleRad) - pz * Math.sin(angleRad);
          const rotatedZ = px * Math.sin(angleRad) + pz * Math.cos(angleRad);
          
          // Apply elevation view
          const projectedY = py * Math.cos(elevationRad) - rotatedZ * Math.sin(elevationRad);
          const projectedZ = py * Math.sin(elevationRad) + rotatedZ * Math.cos(elevationRad);
          
          return [
            centerX + rotatedX * scale,
            centerY - projectedY * scale * 0.5 - projectedZ * scale * 0.3
          ];
        });

        // Draw quad
        ctx.beginPath();
        ctx.moveTo(projectedPoints[0][0], projectedPoints[0][1]);
        for (let i = 1; i < projectedPoints.length; i++) {
          ctx.lineTo(projectedPoints[i][0], projectedPoints[i][1]);
        }
        ctx.closePath();
        
        // Color based on elevation
        const avgElevation = points.reduce((sum, [, y]) => sum + y, 0) / 4;
        const normalizedElev = (avgElevation + 100) / 200; // Normalize to 0-1
        const hue = Math.max(0, Math.min(60, normalizedElev * 60)); // Red to yellow
        ctx.fillStyle = `hsla(${hue}, 70%, ${30 + normalizedElev * 20}%, 0.3)`;
        ctx.fill();
        ctx.stroke();
      }
    }

    // Draw rover position marker
    const roverX = centerX;
    const roverY = centerY + 20;
    
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    
    // Draw rover as a simple square with antenna
    ctx.fillRect(roverX - 3, roverY - 3, 6, 6);
    ctx.strokeRect(roverX - 3, roverY - 3, 6, 6);
    
    // Antenna
    ctx.beginPath();
    ctx.moveTo(roverX, roverY - 3);
    ctx.lineTo(roverX, roverY - 8);
    ctx.stroke();
    
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(roverX, roverY - 8, 1, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    drawTerrain();
  }, [rotation, elevation, zoom, terrainData]);

  const resetView = () => {
    setRotation(0);
    setElevation(30);
    setZoom(1);
  };

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 font-mono text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4" />
            3D TERRAIN VIEW
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen-3d"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 3D Canvas */}
        <div className="relative bg-black border border-cyan-500/20 rounded">
          <canvas
            ref={canvasRef}
            width={isFullscreen ? 800 : 280}
            height={isFullscreen ? 600 : 200}
            className="w-full"
            data-testid="canvas-3d-terrain"
          />
          
          {/* Overlay info */}
          <div className="absolute top-2 left-2 text-xs">
            <div className="bg-black/80 rounded px-2 py-1 text-cyan-400 font-mono">
              LAT: {location.lat.toFixed(4)}°
            </div>
            <div className="bg-black/80 rounded px-2 py-1 text-cyan-400 font-mono mt-1">
              LON: {location.lon.toFixed(4)}°
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs w-16">ROTATION</span>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
              max={360}
              step={5}
              className="flex-1"
              data-testid="slider-rotation"
            />
            <span className="text-cyan-400 text-xs font-mono w-8">{rotation}°</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs w-16">ELEVATION</span>
            <Slider
              value={[elevation]}
              onValueChange={(value) => setElevation(value[0])}
              min={0}
              max={90}
              step={5}
              className="flex-1"
              data-testid="slider-elevation"
            />
            <span className="text-cyan-400 text-xs font-mono w-8">{elevation}°</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs w-16">ZOOM</span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                onClick={resetView}
                data-testid="button-reset-view"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}