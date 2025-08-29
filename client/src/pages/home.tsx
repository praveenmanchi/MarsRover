import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRovers } from "@/lib/nasa-api";
import { RoverSidebar } from "@/components/rover-sidebar";
import { MarsMapStable as MarsMap } from "@/components/mars-map-stable";
import { TimelineControls } from "@/components/timeline-controls";
import { ImageLightbox } from "@/components/image-lightbox";
import { WeatherPanel } from "@/components/weather-panel";
import { GeologicalAnalysis } from "@/components/geological-analysis";
import { TerrainViewer } from "@/components/3d-terrain-viewer";
import { AnimatedTimeline } from "@/components/animated-timeline";
import { ExportControls } from "@/components/export-controls";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { MobileControls } from "@/components/mobile-controls";
import { DayNightOverlay } from "@/components/day-night-overlay";
import { EnhancedUILayout } from "@/components/enhanced-ui-layout";
import { ThreeTerrainViewer } from "@/components/three-terrain-viewer";
import { MissionReports } from "@/components/mission-reports";
import { ARMobileOverlay } from "@/components/ar-mobile-overlay";
import { Activity, Map, Camera, Clock, Zap, FileText } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function Home() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [timelineEvent, setTimelineEvent] = useState<any>(null);
  const [arActive, setArActive] = useState(false);
  
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

  const handleLocationSelect = (location: { lat: number; lon: number }) => {
    setSelectedLocation(location);
  };

  const handleTimelineEvent = (event: any) => {
    setTimelineEvent(event);
    setSelectedLocation({ lat: event.coordinates[0], lon: event.coordinates[1] });
  };

  // Keyboard shortcuts handlers
  const handleCenterRover = useCallback(() => {
    setSelectedLocation({ lat: -5.4, lon: 137.8 });
  }, []);

  const handleToggleLayers = useCallback(() => {
    setShowLayers(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleRefreshData = useCallback(() => {
    window.location.reload();
  }, []);

  const handleToggleTimeline = useCallback(() => {
    // Could add timeline play/pause logic here
  }, []);

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
    <div className={`min-h-screen bg-black text-white font-mono ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* FUI Header */}
      <header className={`bg-black/90 border-b border-cyan-500/30 px-6 py-2 ${isFullscreen ? 'hidden' : ''}`} data-testid="header-main">
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
            <div className="hidden md:flex items-center space-x-6">
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
            <div className="hidden sm:block text-center">
              <p className="text-xs font-mono text-cyan-500/60 uppercase">EARTH TIME</p>
              <p className="text-sm font-mono font-bold text-white" data-testid="text-current-time">{currentTime}</p>
            </div>
            <div className="h-8 w-px bg-cyan-500/30 hidden sm:block"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFullscreen}
              data-testid="button-fullscreen"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
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

      <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-screen'} overflow-hidden`}>
        {/* Desktop Layout */}
        <div className="hidden md:block flex-1 relative">
          <EnhancedUILayout
            leftPanels={[
              {
                component: <DayNightOverlay />,
                title: "ENV",
                icon: <Zap className="w-4 h-4" />,
                tooltip: "Environmental controls and day/night cycle simulation"
              },
              {
                component: <WeatherPanel rover={selectedRover} />,
                title: "WEATHER",
                icon: <Activity className="w-4 h-4" />,
                tooltip: "Real-time Martian weather data and atmospheric conditions"
              },
              {
                component: <ThreeTerrainViewer location={selectedLocation || { lat: -5.4, lon: 137.8 }} />,
                title: "3D",
                icon: <Map className="w-4 h-4" />,
                tooltip: "Interactive 3D terrain visualization with Three.js"
              }
            ]}
            rightPanels={[
              {
                component: (
                  <GeologicalAnalysis 
                    rover={selectedRover} 
                    selectedLocation={selectedLocation || undefined}
                  />
                ),
                title: "GEO",
                icon: <Map className="w-4 h-4" />,
                tooltip: "Geological analysis and surface composition data"
              },
              {
                component: (
                  <AnimatedTimeline 
                    rover={selectedRover}
                    onEventSelect={handleTimelineEvent}
                  />
                ),
                title: "TIME",
                icon: <Clock className="w-4 h-4" />,
                tooltip: "Mission timeline and key events"
              },
              {
                component: (
                  <MissionReports 
                    rover={currentRover}
                    photos={[]}
                  />
                ),
                title: "TOOLS",
                icon: <FileText className="w-4 h-4" />,
                tooltip: "Download mission reports and image collections"
              }
            ]}
          >
            <MarsMap
              key={`map-${selectedRover}`}
              selectedRover={selectedRover}
              selectedSol={selectedSol}
              onPhotoSelect={handlePhotoSelect}
              onLocationSelect={handleLocationSelect}
            />
          </EnhancedUILayout>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 relative">
          {/* Mobile Map */}
          <div className="absolute inset-0">
            <MarsMap
              key={`map-${selectedRover}-mobile`}
              selectedRover={selectedRover}
              selectedSol={selectedSol}
              onPhotoSelect={handlePhotoSelect}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Mobile Controls */}
          <MobileControls
            children={{
              cameras: (
                <div className="text-center text-gray-400 py-4">
                  Camera feeds optimized for desktop
                </div>
              ),
              weather: <WeatherPanel rover={selectedRover} />,
              geology: (
                <GeologicalAnalysis 
                  rover={selectedRover} 
                  selectedLocation={selectedLocation || undefined}
                />
              ),
              timeline: (
                <AnimatedTimeline 
                  rover={selectedRover}
                  onEventSelect={handleTimelineEvent}
                />
              ),
              terrain3d: (
                <TerrainViewer location={selectedLocation || { lat: -5.4, lon: 137.8 }} />
              ),
              export: (
                <ExportControls 
                  roverData={currentRover}
                  currentPhotos={[]}
                />
              )
            }}
          />
        </div>

        {/* Timeline Controls - Always visible at bottom */}
        {!isFullscreen && (
          <TimelineControls
            currentRover={currentRover}
            selectedSol={selectedSol}
            onSolChange={handleSolChange}
          />
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onCenterRover={handleCenterRover}
        onToggleLayers={handleToggleLayers}
        onToggleFullscreen={handleToggleFullscreen}
        onRefreshData={handleRefreshData}
        onToggleTimeline={handleToggleTimeline}
      />

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
