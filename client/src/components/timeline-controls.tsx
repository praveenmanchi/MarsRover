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
    <div className="bg-card/50 backdrop-blur border-t border-border p-4" data-testid="timeline-controls">
      {/* Mission Details - Above Timeline */}
      <div className="grid grid-cols-8 gap-3 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Earth Date</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-selected-earth-date">{formatEarthDate(selectedSol)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Photos</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-photos-count">{photos.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Cameras</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-cameras-active">
                {new Set(photos.map(p => p.cameraId)).size}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Last Contact</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-last-contact">{getLastContact()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Distance Driven</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-distance-driven">{getDistanceDriven()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Total Distance</span>
              <p className="font-mono text-foreground font-semibold" data-testid="text-total-distance">{getTotalDistance()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Location</span>
              <p className="font-mono text-foreground font-semibold">{currentRover.location}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase">Mode</span>
              <p className="font-mono text-chart-2 font-semibold">AUTO</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Slider */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Mission Timeline</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              data-testid="button-play-timeline"
              className="text-muted-foreground hover:text-primary"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-timeline"
              className="text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-xs text-muted-foreground font-mono">
            <span data-testid="text-timeline-start">SOL 1</span>
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
          </div>
          
          <div className="text-xs text-muted-foreground font-mono">
            <span data-testid="text-timeline-current">SOL {currentRover.maxSol}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
