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
    <div className="bg-card border-t border-border p-4" data-testid="timeline-controls">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Mission Timeline</h3>
          <div className="flex items-center space-x-2 text-sm">
            <Button
              variant={timelineMode === "sol" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimelineMode("sol")}
              data-testid="button-timeline-sol"
            >
              Sol View
            </Button>
            <Button
              variant={timelineMode === "earth" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimelineMode("earth")}
              data-testid="button-timeline-earth"
            >
              Earth Date
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlay}
            data-testid="button-play-timeline"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            data-testid="button-reset-timeline"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="relative mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            <span data-testid="text-timeline-start">Sol 1</span>
          </div>
          
          <div className="flex-1 relative">
            <Slider
              value={[selectedSol]}
              onValueChange={(value) => onSolChange(value[0])}
              max={currentRover.maxSol}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-timeline"
            />
            
            {/* Timeline markers */}
            <div className="absolute top-6 left-0 w-full flex justify-between text-xs text-muted-foreground">
              <div className="flex flex-col items-center">
                <div className="w-1 h-4 bg-primary rounded-full mb-1"></div>
                <span>Landing</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1 h-4 bg-chart-3 rounded-full mb-1"></div>
                <span>First Sample</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1 h-4 bg-chart-2 rounded-full mb-1"></div>
                <span>Flight Zone</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1 h-4 bg-chart-1 rounded-full mb-1"></div>
                <span>Current</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <span data-testid="text-timeline-current">Sol {currentRover.maxSol}</span>
          </div>
        </div>
      </div>

      {/* Timeline Details */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Selected Sol</span>
              <span className="font-mono font-semibold" data-testid="text-selected-sol">{selectedSol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Earth Date</span>
              <span className="font-mono" data-testid="text-selected-earth-date">{formatEarthDate(selectedSol)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Photos Available</span>
              <span className="font-mono font-semibold" data-testid="text-photos-count">{photos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cameras Active</span>
              <span className="font-mono" data-testid="text-cameras-active">
                {new Set(photos.map(p => p.cameraId)).size}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Distance Driven</span>
              <span className="font-mono font-semibold" data-testid="text-distance-driven">{getDistanceDriven()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Distance</span>
              <span className="font-mono" data-testid="text-total-distance">{getTotalDistance()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Status</span>
              <Badge 
                variant={currentRover.status === "active" ? "default" : "secondary"}
                className="font-mono font-semibold"
                data-testid="badge-mission-status"
              >
                {currentRover.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Contact</span>
              <span className="font-mono" data-testid="text-last-contact">{getLastContact()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
