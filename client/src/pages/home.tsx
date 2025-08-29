import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRovers } from "@/lib/nasa-api";
import { RoverSidebar } from "@/components/rover-sidebar";
import { MarsMap } from "@/components/mars-map";
import { TimelineControls } from "@/components/timeline-controls";
import { ImageLightbox } from "@/components/image-lightbox";
import { SensorDashboard } from "@/components/sensor-dashboard";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function Home() {
  const [selectedRover, setSelectedRover] = useState<string>("perseverance");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const { data: rovers = [], isLoading: roversLoading } = useQuery({
    queryKey: ["/api/rovers"],
    queryFn: fetchRovers,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRoverSelect = (roverName: string) => {
    setSelectedRover(roverName);
    const rover = rovers.find((r: Rover) => r.name === roverName);
    if (rover) {
      setSelectedSol(rover.maxSol);
    }
  };

  const handleSolChange = (sol: number) => {
    setSelectedSol(sol);
  };

  const handlePhotoSelect = (photo: RoverPhoto | null) => {
    setSelectedPhoto(photo);
  };

  if (roversLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">Loading NASA API Data...</p>
          <p className="text-sm text-muted-foreground">Fetching rover information</p>
        </div>
      </div>
    );
  }

  const currentRover = rovers.find((r: Rover) => r.name === selectedRover);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur border-b border-border px-6 py-3" data-testid="header-main">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
                NASA
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-wide">MARS</h1>
                <p className="text-primary text-xs font-medium">The Red Planet</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-primary font-medium">ROVER:</span>
                <span className="text-foreground font-mono uppercase">{selectedRover}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">DASHBOARD</span>
                <span className="text-muted-foreground">ENVIRONMENT</span>
                <span className="text-muted-foreground">MANAGEMENT CONTROL SYSTEM</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">Mission Day</p>
              <p className="text-sm font-mono font-semibold text-foreground">SOL</p>
              <p className="text-lg font-mono font-bold text-primary" data-testid="text-current-sol">{selectedSol}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">Time</p>
              <p className="text-lg font-mono font-semibold text-foreground" data-testid="text-current-time">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <RoverSidebar
          rovers={rovers}
          selectedRover={selectedRover}
          onRoverSelect={handleRoverSelect}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Sensor Dashboard */}
          <div className="bg-card/30 backdrop-blur border-b border-border p-4">
            <SensorDashboard
              currentRover={currentRover}
              selectedSol={selectedSol}
            />
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MarsMap
              selectedRover={selectedRover}
              selectedSol={selectedSol}
              onPhotoSelect={handlePhotoSelect}
            />
          </div>

          {/* Timeline Controls */}
          <TimelineControls
            currentRover={currentRover}
            selectedSol={selectedSol}
            onSolChange={handleSolChange}
          />
        </main>
      </div>

      {/* Image Lightbox */}
      {selectedPhoto && (
        <ImageLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
