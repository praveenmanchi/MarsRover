import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Satellite, Radio, Shield, Battery, Thermometer, 
  Wind, Gauge, Camera, Map, Activity, Navigation,
  Clock, Calendar, MapPin, Zap, Signal, Globe,
  ChevronRight, Play, Pause, RotateCw, Maximize2,
  Settings, Info, Download, Eye, Target, Crosshair
} from "lucide-react";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function AlternativeLayout() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [activePanel, setActivePanel] = useState("telemetry");

  const { data: rovers = [] } = useQuery({
    queryKey: ["/api/rovers"],
    queryFn: async () => {
      const response = await fetch("/api/rovers");
      return response.json();
    },
  });

  const { data: photos = [] } = useQuery({
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

  // Get varied Mars photos
  const getPhotoUrl = (photo: any, index: number = 0) => {
    if (photo?.imgSrc || photo?.img_src) {
      return photo.imgSrc || photo.img_src;
    }
    const fallbackImages = [
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ncam/NLB_486265257EDR_F0481570NCAM00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000ML0044631200305217E01_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01500/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/02000/opgs/edr/rcam/RLB_486265257EDR_F0481570RHAZ00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/02500/mcam/2500ML0133870400803932C00_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/03000/opgs/edr/ncam/NLB_550818504EDR_F0540000NCAM00320M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/03500/mcam/3500ML0168200290709854C00_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04000/opgs/edr/fcam/FLB_645369149EDR_F0660000FHAZ00337M_.JPG"
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MARS CONTROL</h1>
                <p className="text-sm text-gray-400">Mission Command Interface</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={selectedRover}
              onChange={(e) => setSelectedRover(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {rovers.map((rover: Rover) => (
                <option key={rover.name} value={rover.name}>
                  {rover.name.charAt(0).toUpperCase() + rover.name.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-gray-900/30 backdrop-blur-md border-r border-gray-800/50 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Mission Status */}
            <Card className="glass-dark border-orange-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-orange-500" />
                  Mission Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Sol</span>
                  <span className="text-xl font-bold text-orange-400">{selectedSol}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mission Progress</span>
                    <span className="text-green-400">78%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Camera className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-lg font-bold">{photos.length}</div>
                    <div className="text-xs text-gray-400">Photos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <MapPin className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-lg font-bold">12.4</div>
                    <div className="text-xs text-gray-400">km traveled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telemetry */}
            <Card className="glass-dark border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radio className="w-5 h-5 text-blue-500" />
                  Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{weather?.temperature?.high || -10}°C</div>
                    <div className="text-xs text-gray-400">Surface</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Pressure</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{typeof weather?.pressure === 'object' ? weather.pressure.value : weather?.pressure || 850}</div>
                    <div className="text-xs text-gray-400">Pa</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Wind Speed</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{typeof weather?.wind === 'object' ? weather.wind.speed : weather?.windSpeed || 5.2}</div>
                    <div className="text-xs text-gray-400">m/s</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Power</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">87%</div>
                    <div className="text-xs text-gray-400">Battery</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="glass-dark border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { system: "Navigation", status: "NOMINAL", color: "text-green-400" },
                    { system: "Communications", status: "OPTIMAL", color: "text-green-400" },
                    { system: "Power Systems", status: "GOOD", color: "text-yellow-400" },
                    { system: "Thermal Control", status: "NOMINAL", color: "text-green-400" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{item.system}</span>
                      <Badge className={`${item.color} bg-gray-800/30 text-xs`}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sol Control */}
            <Card className="glass-dark border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Sol Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{selectedSol}</div>
                    <div className="text-sm text-gray-400">Current Sol</div>
                  </div>
                  <Slider
                    value={[selectedSol]}
                    onValueChange={(value) => setSelectedSol(value[0])}
                    max={4200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Sol 0</span>
                    <span>Sol 4200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Panel - Main Display */}
        <div className="flex-1 flex flex-col">
          {/* Main View */}
          <div className="flex-1 p-6">
            <Tabs value={activePanel} onValueChange={setActivePanel} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-800/30">
                <TabsTrigger value="telemetry" className="data-[state=active]:bg-orange-500/20">
                  <Radio className="w-4 h-4 mr-2" />
                  Telemetry
                </TabsTrigger>
                <TabsTrigger value="cameras" className="data-[state=active]:bg-blue-500/20">
                  <Camera className="w-4 h-4 mr-2" />
                  Cameras
                </TabsTrigger>
                <TabsTrigger value="navigation" className="data-[state=active]:bg-green-500/20">
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigation
                </TabsTrigger>
                <TabsTrigger value="samples" className="data-[state=active]:bg-purple-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Samples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="telemetry" className="h-full">
                <div className="grid grid-cols-2 gap-6 h-full">
                  {/* Primary Camera Feed */}
                  <Card className="glass-dark relative overflow-hidden">
                    <CardHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white">Primary Camera Feed</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="h-full">
                      <img 
                        src={getPhotoUrl(photos[0], 0)}
                        alt="Primary camera feed"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPhotoUrl(null, 1);
                        }}
                      />
                    </div>
                  </Card>

                  {/* Environmental Data */}
                  <div className="space-y-6">
                    <Card className="glass-dark">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          Environmental Conditions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                            <Thermometer className="w-6 h-6 mx-auto mb-2 text-red-400" />
                            <div className="text-2xl font-bold">{weather?.temperature?.high || -10}°C</div>
                            <div className="text-sm text-gray-400">Temperature</div>
                          </div>
                          <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <Gauge className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                            <div className="text-2xl font-bold">{typeof weather?.pressure === 'object' ? weather.pressure.value : weather?.pressure || 850}</div>
                            <div className="text-sm text-gray-400">Pressure (Pa)</div>
                          </div>
                          <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <Wind className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                            <div className="text-2xl font-bold">{typeof weather?.wind === 'object' ? weather.wind.speed : weather?.windSpeed || 5.2}</div>
                            <div className="text-sm text-gray-400">Wind (m/s)</div>
                          </div>
                          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <Eye className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                            <div className="text-2xl font-bold">{weather?.atmosphericOpacity || 0.4}</div>
                            <div className="text-sm text-gray-400">Dust (τ)</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-dark">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Signal className="w-5 h-5 text-green-400" />
                          Communication Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Signal Strength</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                              </div>
                              <span className="text-sm text-green-400">Strong</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Data Rate</span>
                            <span className="text-sm text-blue-400">256 kbps</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Next Contact</span>
                            <span className="text-sm text-yellow-400">12:34 UTC</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cameras" className="h-full">
                <div className="grid grid-cols-3 gap-6 h-full">
                  {photos.slice(0, 9).map((photo, index) => (
                    <Card 
                      key={index} 
                      className="glass-dark cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img 
                          src={getPhotoUrl(photo, index)}
                          alt={`Camera ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPhotoUrl(null, index + 3);
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/70 text-white text-xs">
                            Sol {selectedSol}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium">Camera {index + 1}</div>
                        <div className="text-xs text-gray-400">
                          {photo?.camera?.name || `CAM${index + 1}`}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="navigation" className="h-full">
                <Card className="glass-dark h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-green-500" />
                      Mars Surface Navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <div className="relative h-full bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg overflow-hidden">
                      <div className="absolute inset-0">
                        <svg className="w-full h-full opacity-30">
                          <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ff6b35" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>
                      
                      {/* Rover path */}
                      <svg className="absolute inset-0 w-full h-full">
                        <polyline 
                          points="100,400 150,350 200,300 280,250 350,200 420,180" 
                          fill="none" 
                          stroke="#ff6b35" 
                          strokeWidth="3"
                          strokeDasharray="10,5"
                        />
                        <circle cx="420" cy="180" r="12" fill="#ff6b35" className="animate-pulse" />
                      </svg>
                      
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-sm text-gray-300 mb-1">Current Position</div>
                        <div className="font-mono text-lg">-4.5896°S, 137.4417°E</div>
                        <div className="text-xs text-gray-400 mt-1">Gale Crater, Mars</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="samples" className="h-full">
                <div className="grid grid-cols-2 gap-6 h-full">
                  <Card className="glass-dark">
                    <CardHeader>
                      <CardTitle>Sample Analysis Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: "Rock Sample A47", progress: 85, status: "Processing" },
                        { name: "Soil Sample B23", progress: 100, status: "Complete" },
                        { name: "Drill Sample C12", progress: 45, status: "Analyzing" },
                        { name: "Atmospheric Sample", progress: 70, status: "Processing" }
                      ].map((sample, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{sample.name}</span>
                            <Badge variant="outline" className={
                              sample.status === "Complete" ? "text-green-400" : 
                              sample.status === "Processing" ? "text-blue-400" : "text-yellow-400"
                            }>
                              {sample.status}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                sample.status === "Complete" ? "bg-green-500" : 
                                sample.status === "Processing" ? "bg-blue-500" : "bg-yellow-500"
                              }`}
                              style={{width: `${sample.progress}%`}}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400">{sample.progress}% complete</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-dark">
                    <CardHeader>
                      <CardTitle>Composition Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { element: "Silicon", percentage: 42, color: "#3b82f6" },
                          { element: "Iron", percentage: 18, color: "#ef4444" },
                          { element: "Aluminum", percentage: 15, color: "#10b981" },
                          { element: "Magnesium", percentage: 12, color: "#f59e0b" },
                          { element: "Calcium", percentage: 8, color: "#8b5cf6" },
                          { element: "Others", percentage: 5, color: "#6b7280" }
                        ].map((element, index) => (
                          <div key={index} className="text-center p-3 bg-gray-800/30 rounded-lg">
                            <div 
                              className="text-2xl font-bold mb-1"
                              style={{ color: element.color }}
                            >
                              {element.percentage}%
                            </div>
                            <div className="text-sm text-gray-400">{element.element}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - System Info */}
        <div className="w-64 bg-gray-900/30 backdrop-blur-md border-l border-gray-800/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            <Card className="glass-dark border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  Mission Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {[
                  { time: "14:32", event: "Photo sequence complete", type: "success" },
                  { time: "14:28", event: "Sample drill initiated", type: "info" },
                  { time: "14:15", event: "Navigation waypoint reached", type: "success" },
                  { time: "14:02", event: "Weather data collected", type: "info" },
                  { time: "13:45", event: "System diagnostics passed", type: "success" }
                ].map((log, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded bg-gray-800/20">
                    <span className="text-gray-500 min-w-[35px]">{log.time}</span>
                    <span className={
                      log.type === "success" ? "text-green-400" : 
                      log.type === "warning" ? "text-yellow-400" : "text-blue-400"
                    }>
                      {log.event}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-dark border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
                  Take Photo
                </Button>
                <Button size="sm" className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                  Analyze Sample
                </Button>
                <Button size="sm" className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400">
                  Move Forward
                </Button>
                <Button size="sm" className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
                  Run Diagnostics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
                src={getPhotoUrl(selectedPhoto)}
                alt="Mars photo"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}