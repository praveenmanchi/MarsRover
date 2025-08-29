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
      {/* Mission Environment Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {/* Distance from Sun */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Distance from Sun</p>
            <p className="text-lg font-mono font-bold text-foreground">143.495.712</p>
            <p className="text-xs text-primary font-medium">MI KM</p>
          </CardContent>
        </Card>

        {/* Light Time */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">One way light time to sun</p>
            <p className="text-lg font-mono font-bold text-foreground">12.838551</p>
            <p className="text-xs text-primary font-medium">MINS</p>
          </CardContent>
        </Card>

        {/* Length of Year */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Length of Year</p>
            <p className="text-lg font-mono font-bold text-foreground">687</p>
            <p className="text-xs text-primary font-medium">EARTH DAYS</p>
          </CardContent>
        </Card>

        {/* Planet Type */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Planet Type</p>
            <p className="text-lg font-mono font-bold text-foreground">TERRESTRIAL</p>
          </CardContent>
        </Card>

        {/* Current Sol */}
        <Card className="bg-primary/20 border-primary/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-primary/80 uppercase tracking-wide mb-1">Mission Sol</p>
            <p className="text-lg font-mono font-bold text-primary" data-testid="text-selected-sol">{selectedSol}</p>
            <p className="text-xs text-primary/80 font-medium">CURRENT</p>
          </CardContent>
        </Card>

        {/* Rover Status */}
        <Card className={`${currentRover.status === 'active' ? 'bg-chart-2/20 border-chart-2/50' : 'bg-muted/30 border-border/50'}`}>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rover Status</p>
            <Badge 
              variant={currentRover.status === "active" ? "default" : "secondary"}
              className={`font-mono font-semibold text-xs ${currentRover.status === 'active' ? 'bg-chart-2 text-chart-2-foreground' : ''}`}
              data-testid="badge-mission-status"
            >
              {currentRover.status === 'active' ? 'OPERATIONAL' : 'OFFLINE'}
            </Badge>
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

      {/* Mission Details */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Earth Date</span>
                <span className="font-mono text-foreground" data-testid="text-selected-earth-date">{formatEarthDate(selectedSol)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Photos</span>
                <span className="font-mono text-foreground" data-testid="text-photos-count">{photos.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Cameras</span>
                <span className="font-mono text-foreground" data-testid="text-cameras-active">
                  {new Set(photos.map(p => p.cameraId)).size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Last Contact</span>
                <span className="font-mono text-foreground" data-testid="text-last-contact">{getLastContact()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Distance Driven</span>
                <span className="font-mono text-foreground" data-testid="text-distance-driven">{getDistanceDriven()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Total Distance</span>
                <span className="font-mono text-foreground" data-testid="text-total-distance">{getTotalDistance()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Location</span>
                <span className="font-mono text-foreground">{currentRover.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">Mode</span>
                <span className="font-mono text-chart-2">AUTO</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
