import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarsRoverMap } from "@/components/mars-rover-map";
import { RoverMetrics, EnvironmentalMetrics } from "@/components/minimalist-metrics";
import { MissionReports } from "@/components/mission-reports";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, Camera, Map, BarChart3, Moon, Sun, 
  ChevronRight, Globe, Calendar, Download, Grid3x3, List,
  Maximize2, Minimize2, Navigation, Info, Clock, Compass
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function Home() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number }>({ lat: -4.589, lon: 137.441 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme, setTheme } = useTheme();

  const { data: rovers = [], isLoading: roversLoading } = useQuery({
    queryKey: ["/api/rovers"],
    queryFn: async () => {
      const response = await fetch("/api/rovers");
      return response.json();
    },
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: [`/api/rovers/${selectedRover}/photos`, selectedSol],
    queryFn: async () => {
      const response = await fetch(`/api/rovers/${selectedRover}/photos?sol=${selectedSol}`);
      const data = await response.json();
      return data.photos || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: weather } = useQuery({
    queryKey: [`/api/weather/${selectedRover}`],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${selectedRover}`);
      return response.json();
    },
  });

  const currentRover = rovers.find((r: Rover) => r.name === selectedRover);

  const handleRoverSelect = (roverName: string) => {
    setSelectedRover(roverName);
    const rover = rovers.find((r: Rover) => r.name === roverName);
    if (rover) {
      setSelectedSol(rover.maxSol);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (roversLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground font-light">Loading mission data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Minimalist Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-extralight tracking-tight">
                    Mars Mission Control
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Real-time rover monitoring
                  </p>
                </div>
              </div>
            </div>

            {/* Rover Selection */}
            <nav className="hidden md:flex items-center gap-2">
              {rovers.map((rover: Rover) => (
                <Button
                  key={rover.name}
                  variant={selectedRover === rover.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleRoverSelect(rover.name)}
                  className={`font-light transition-all ${
                    selectedRover === rover.name ? 'shadow-lg' : ''
                  }`}
                >
                  {rover.name.charAt(0).toUpperCase() + rover.name.slice(1)}
                  {rover.status === "active" && (
                    <span className="ml-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </Button>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="text-muted-foreground hover:text-foreground"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-muted-foreground hover:text-foreground"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <RoverMetrics rover={selectedRover} sol={selectedSol} photos={photos} />
        </motion.div>

        {/* Environmental Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <EnvironmentalMetrics
            temperature={typeof weather?.temperature === 'object' ? weather.temperature.high : weather?.temperature || -15}
            pressure={typeof weather?.pressure === 'object' ? weather.pressure.value : weather?.pressure || 730}
            windSpeed={typeof weather?.wind === 'object' ? weather.wind.speed : weather?.windSpeed || 2.1}
          />
        </motion.div>

        {/* Sol Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Mission Sol</p>
                    <p className="text-2xl font-light">{selectedSol}</p>
                  </div>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <Slider
                    value={[selectedSol]}
                    onValueChange={(value) => setSelectedSol(value[0])}
                    max={currentRover?.maxSol || 5000}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Sol 0</span>
                    <span>Sol {currentRover?.maxSol || 5000}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 h-12 bg-secondary/20">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Map className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-secondary/5 overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-[600px]">
                    <MarsRoverMap
                      selectedRover={selectedRover}
                      selectedSol={selectedSol}
                      onPhotoSelect={setSelectedPhoto}
                      onLocationSelect={setSelectedLocation}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
                "space-y-4"
              }>
                <AnimatePresence mode="popLayout">
                  {photos.slice(0, 16).map((photo: RoverPhoto, index: number) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                        <div className={viewMode === "grid" ? "aspect-square" : "flex gap-4 p-4"}>
                          <div className={viewMode === "grid" ? 
                            "relative w-full h-full overflow-hidden bg-secondary" : 
                            "relative w-32 h-32 flex-shrink-0 overflow-hidden bg-secondary rounded-lg"
                          }>
                            <img
                              src={photo.imgSrc || photo.img_src}
                              alt={`Mars ${photo.camera?.name}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ncam/NLB_486265257EDR_F0481570NCAM00323M_.JPG';
                              }}
                            />
                            {viewMode === "grid" && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4">
                                  <p className="text-white text-sm font-medium">
                                    {photo.camera?.full_name || photo.cameraFullName}
                                  </p>
                                  <p className="text-white/80 text-xs mt-1">
                                    Sol {selectedSol} • {photo.earthDate || photo.earth_date}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          {viewMode === "list" && (
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">
                                {photo.camera?.full_name || photo.cameraFullName}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Photo ID: {photo.id}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Sol {selectedSol}</span>
                                <span>{photo.earthDate || photo.earth_date}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {photos.length === 0 && !photosLoading && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-light mb-2">No Photos Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Try selecting a different sol or rover
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mission Timeline */}
                <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-light">Mission Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { sol: 0, event: "Landing on Mars", location: "Gale Crater", date: "Aug 6, 2012" },
                        { sol: 56, event: "First drilling sample", location: "Yellowknife Bay", date: "Oct 2, 2012" },
                        { sol: 1000, event: "Reached Mount Sharp", location: "Pahrump Hills", date: "May 2015" },
                        { sol: 2000, event: "Organic molecules discovered", location: "Murray Buttes", date: "Mar 2018" },
                        { sol: 3000, event: "Clay minerals found", location: "Glen Torridon", date: "Jan 2021" },
                        { sol: selectedSol, event: "Current position", location: "Active exploration", date: "Present" }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 group"
                        >
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                            ${item.sol === selectedSol ? 
                              'bg-primary text-primary-foreground' : 
                              'bg-secondary text-secondary-foreground'
                            }
                          `}>
                            <span className="text-xs font-medium">{item.sol}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.event}</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mission Stats */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-light">Mission Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Total Photos</span>
                          <span className="font-medium text-lg">
                            {currentRover?.totalPhotos?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Mission Days</span>
                          <span className="font-medium text-lg">
                            {currentRover?.maxSol?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Landing</span>
                          <span className="font-medium text-sm">
                            {currentRover?.landingDate || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Launch</span>
                          <span className="font-medium text-sm">
                            {currentRover?.launchDate || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge 
                            variant={currentRover?.status === "active" ? "default" : "secondary"}
                            className="font-light"
                          >
                            {currentRover?.status || "unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-light">Mission Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <MissionReports rover={currentRover} photos={photos} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imgSrc || selectedPhoto.img_src}
                alt={`Mars ${selectedPhoto.camera?.name}`}
                className="w-full h-full object-contain rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setSelectedPhoto(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-lg font-light">{selectedPhoto.camera?.full_name || selectedPhoto.cameraFullName}</p>
                <p className="text-sm opacity-80">Sol {selectedSol} • {selectedPhoto.earthDate || selectedPhoto.earth_date}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}