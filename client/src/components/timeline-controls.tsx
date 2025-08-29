import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRoverPhotos } from "@/lib/nasa-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { Rover } from "@/types/rover";

interface TimelineControlsProps {
  currentRover?: Rover;
  selectedSol: number;
  onSolChange: (sol: number) => void;
}

export function TimelineControls({ currentRover, selectedSol, onSolChange }: TimelineControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineMode, setTimelineMode] = useState<"sol" | "earth">("sol");

  const { data: photosData } = useQuery({
    queryKey: ["/api/rovers", currentRover?.name, "photos", { sol: selectedSol }],
    queryFn: () => currentRover ? fetchRoverPhotos(currentRover.name, { sol: selectedSol }) : null,
    enabled: !!currentRover,
  });

  const photos = photosData?.photos || [];

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement timeline animation
  };

  const handleReset = () => {
    if (currentRover) {
      onSolChange(1);
    }
    setIsPlaying(false);
  };

  const formatEarthDate = (sol: number) => {
    if (!currentRover) return "";
    
    // Approximate earth date calculation
    const landingDate = new Date(currentRover.landingDate);
    const earthDate = new Date(landingDate.getTime() + (sol - 1) * 24.6 * 60 * 60 * 1000);
    return earthDate.toISOString().split('T')[0];
  };

  const getDistanceDriven = () => {
    // Mock calculation based on sol progression
    return `${(selectedSol * 0.006).toFixed(1)}m`;
  };

  const getTotalDistance = () => {
    const distances: Record<string, string> = {
      perseverance: "30.12km",
      curiosity: "31.47km",
      opportunity: "45.16km",
      spirit: "7.73km",
    };
    return currentRover ? distances[currentRover.name] || "0km" : "0km";
  };

  const getLastContact = () => {
    return "2h 14m ago"; // Mock value
  };

  if (!currentRover) {
    return (
      <div className="bg-card border-t border-border p-4">
        <div className="text-center text-muted-foreground">
          <p>Select a rover to view timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/90 border-t border-cyan-500/30 p-4" data-testid="timeline-controls">
      {/* FUI Mission Status Grid */}
      <div className="grid grid-cols-8 gap-2 mb-6">
        <div className="bg-black/60 border border-cyan-400/30 p-2">
          <div className="text-xs font-mono text-cyan-400/60 uppercase">Earth Date</div>
          <div className="text-sm font-mono text-cyan-400 font-bold" data-testid="text-selected-earth-date">{formatEarthDate(selectedSol)}</div>
        </div>
        
        <div className="bg-black/60 border border-green-400/30 p-2">
          <div className="text-xs font-mono text-green-400/60 uppercase">Photos</div>
          <div className="text-sm font-mono text-green-400 font-bold" data-testid="text-photos-count">{photos.length}</div>
        </div>
        
        <div className="bg-black/60 border border-blue-400/30 p-2">
          <div className="text-xs font-mono text-blue-400/60 uppercase">Cameras</div>
          <div className="text-sm font-mono text-blue-400 font-bold" data-testid="text-cameras-active">
            {new Set(photos.map(p => p.cameraId)).size}
          </div>
        </div>
        
        <div className="bg-black/60 border border-yellow-400/30 p-2">
          <div className="text-xs font-mono text-yellow-400/60 uppercase">Contact</div>
          <div className="text-sm font-mono text-yellow-400 font-bold" data-testid="text-last-contact">{getLastContact()}</div>
        </div>
        
        <div className="bg-black/60 border border-purple-400/30 p-2">
          <div className="text-xs font-mono text-purple-400/60 uppercase">Driven</div>
          <div className="text-sm font-mono text-purple-400 font-bold" data-testid="text-distance-driven">{getDistanceDriven()}</div>
        </div>
        
        <div className="bg-black/60 border border-orange-400/30 p-2">
          <div className="text-xs font-mono text-orange-400/60 uppercase">Total</div>
          <div className="text-sm font-mono text-orange-400 font-bold" data-testid="text-total-distance">{getTotalDistance()}</div>
        </div>
        
        <div className="bg-black/60 border border-red-400/30 p-2">
          <div className="text-xs font-mono text-red-400/60 uppercase">Location</div>
          <div className="text-sm font-mono text-red-400 font-bold">{currentRover.location}</div>
        </div>
        
        <div className="bg-black/60 border border-emerald-400/30 p-2">
          <div className="text-xs font-mono text-emerald-400/60 uppercase">Mode</div>
          <div className="text-sm font-mono text-emerald-400 font-bold">AUTO</div>
        </div>
      </div>

      {/* FUI Timeline Control */}
      <div className="border border-cyan-400/40 bg-black/60 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="border-l-2 border-cyan-400 pl-3">
            <h3 className="text-sm font-mono font-bold text-cyan-400 tracking-wider">MISSION TIMELINE</h3>
            <div className="text-xs font-mono text-cyan-400/60">SOL NAVIGATION</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              data-testid="button-play-timeline"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/40"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-timeline"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/40"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-xs text-cyan-400/60 font-mono bg-black/60 border border-cyan-400/30 px-2 py-1">
            <span data-testid="text-timeline-start">SOL 1</span>
          </div>
          
          <div className="flex-1 relative">
            <Slider
              value={[selectedSol]}
              onValueChange={(value) => onSolChange(value[0])}
              max={currentRover.maxSol}
              min={1}
              step={1}
              className="w-full [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400"
              data-testid="slider-timeline"
            />
          </div>
          
          <div className="text-xs text-cyan-400/60 font-mono bg-black/60 border border-cyan-400/30 px-2 py-1">
            <span data-testid="text-timeline-current">SOL {currentRover.maxSol}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
