import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarsRoverMap } from "@/components/mars-rover-map";
import { ImageGallery } from "@/components/image-gallery";
import { RoverMetrics, EnvironmentalMetrics } from "@/components/minimalist-metrics";
import { MissionReports } from "@/components/mission-reports";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Camera, Map, BarChart3, Settings, Moon, Sun, 
  ChevronRight, Globe, Compass, Thermometer, Wind, Calendar,
  Download, Share2, Filter, Grid3x3, List
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function HomeMinimalist() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number }>({ lat: -4.589, lon: 137.441 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
  });

  const { data: weather } = useQuery({
    queryKey: [`/api/weather/${selectedRover}`],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${selectedRover}`);
      return response.json();
    },
  });

  const currentRover = rovers.find((r: Rover) => r.name === selectedRover);

  if (roversLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading mission data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-extralight tracking-tight">
                  Mars Mission Control
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time rover monitoring and analysis
                </p>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                {rovers.map((rover: Rover) => (
                  <Button
                    key={rover.name}
                    variant={selectedRover === rover.name ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedRover(rover.name)}
                    className="font-normal"
                  >
                    {rover.name.toUpperCase()}
                    {rover.status === "active" && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="text-muted-foreground"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RoverMetrics rover={selectedRover} sol={selectedSol} photos={photos} />
        </motion.div>

        {/* Environmental Metrics */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnvironmentalMetrics
              temperature={weather.temperature?.high || -15}
              pressure={weather.pressure || 730}
              windSpeed={weather.windSpeed || 2.1}
            />
          </motion.div>
        )}

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="map" className="mt-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-secondary/30">
              <TabsTrigger value="map" className="data-[state=active]:bg-background">
                <Map className="h-4 w-4 mr-2" />
                Map
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-background">
                <Camera className="h-4 w-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-background">
                <BarChart3 className="h-4 w-4 mr-2" />
                Data
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-background">
                <Download className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-secondary/5">
                <CardContent className="p-0">
                  <div className="h-[600px] rounded-lg overflow-hidden">
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

            <TabsContent value="photos" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {photos.slice(0, 12).map((photo: RoverPhoto, index: number) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                        <div className="aspect-square relative overflow-hidden bg-secondary">
                          <img
                            src={photo.imgSrc || photo.img_src}
                            alt={`Mars ${photo.camera?.name}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-sm font-medium">
                                {photo.camera?.full_name || photo.cameraFullName}
                              </p>
                              <p className="text-white/80 text-xs mt-1">
                                Sol {selectedSol} • {photo.earthDate || photo.earth_date}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-light mb-4">Mission Timeline</h3>
                    <div className="space-y-4">
                      {[
                        { sol: 0, event: "Landing on Mars", location: "Gale Crater" },
                        { sol: 56, event: "First drilling sample", location: "Yellowknife Bay" },
                        { sol: 1000, event: "Reached Mount Sharp", location: "Pahrump Hills" },
                        { sol: 2000, event: "Discovered organic molecules", location: "Murray Buttes" },
                        { sol: selectedSol, event: "Current position", location: "Glen Torridon" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">{item.sol}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.event}</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-light mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Photos</span>
                        <span className="font-medium">{currentRover?.totalPhotos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Mission Days</span>
                        <span className="font-medium">{currentRover?.maxSol.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Landing Date</span>
                        <span className="font-medium">{currentRover?.landingDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Launch Date</span>
                        <span className="font-medium">{currentRover?.launchDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={currentRover?.status === "active" ? "default" : "secondary"}>
                          {currentRover?.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <MissionReports rover={currentRover} photos={photos} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}