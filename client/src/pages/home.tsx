import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRovers } from "@/lib/nasa-api";
import { RoverSidebar } from "@/components/rover-sidebar";
import { MarsMap } from "@/components/mars-map";
import { TimelineControls } from "@/components/timeline-controls";
import { ImageLightbox } from "@/components/image-lightbox";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Sun, Moon } from "lucide-react";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function Home() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // Theme hook must be called at top level
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-black text-white font-mono">
      {/* FUI Header */}
      <header className="bg-black/90 border-b border-cyan-500/30 px-6 py-2" data-testid="header-main">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-sm flex items-center justify-center">
                <span className="text-black text-xs font-bold">MSL</span>
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold text-cyan-400 tracking-wider">CURIOSITY</h1>
                <p className="text-cyan-500/60 text-xs font-mono">MARS SCIENCE LABORATORY</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs font-mono text-cyan-500/60 uppercase">STATUS</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono font-bold text-green-400">OPERATIONAL</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-cyan-500/60 uppercase">LOCATION</p>
                <span className="text-sm font-mono font-bold text-white">GALE CRATER</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xs font-mono text-cyan-500/60 uppercase">SOL</p>
              <p className="text-xl font-mono font-bold text-cyan-400" data-testid="text-current-sol">{selectedSol}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-cyan-500/60 uppercase">EARTH TIME</p>
              <p className="text-sm font-mono font-bold text-white" data-testid="text-current-time">{currentTime}</p>
            </div>
            <div className="h-8 w-px bg-cyan-500/30"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              data-testid="button-theme-toggle"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-screen overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <MarsMap
              key={`map-${selectedRover}`}
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
