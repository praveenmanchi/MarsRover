import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CommandCenter } from "@/components/command-center";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Camera, Gauge, Navigation, Target, Clock,
  ThermometerSun, Wind, Compass, ChevronRight, CheckCircle,
  AlertCircle, Play, Pause, RotateCw, Info, Eye, Download
} from "lucide-react";
import type { Rover, RoverPhoto } from "@/types/rover";

export default function Home() {
  const [selectedRover, setSelectedRover] = useState<string>("curiosity");
  const [selectedSol, setSelectedSol] = useState<number>(4156);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);

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

  // Get varied Mars photos
  const getPhotoUrl = (photo: any, index: number = 0) => {
    if (photo?.imgSrc || photo?.img_src) {
      return photo.imgSrc || photo.img_src;
    }
    // Different Mars images for variety
    const fallbackImages = [
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ncam/NLB_486265257EDR_F0481570NCAM00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000ML0044631200305217E01_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01500/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/02000/opgs/edr/rcam/RLB_486265257EDR_F0481570RHAZ00323M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/02500/mcam/2500ML0133870400803932C00_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/03000/opgs/edr/ncam/NLB_550818504EDR_F0540000NCAM00320M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/03500/mcam/3500ML0168200290709854C00_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04000/opgs/edr/fcam/FLB_645369149EDR_F0660000FHAZ00337M_.JPG",
      "https://mars.nasa.gov/msl-raw-images/msss/04100/mcam/4100ML0190000270105851C00_DXXX.jpg",
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04200/opgs/edr/ncam/NLB_672043927EDR_F0700000NCAM00372M_.JPG"
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Camera types
  const cameraTypes = ["NAVCAM", "FHAZ", "RHAZ", "MAST", "CHEMCAM"];

  // Mission log entries
  const logEntries = [
    { time: "10:24", message: "Surrounding view is active", type: "success" },
    { time: "10:20", message: "Detected soil not passed", type: "warning" },
    { time: "10:17", message: "Mars satellite is out of service", type: "error" },
    { time: "10:00", message: "Real engine was overheated", type: "warning" },
    { time: "10:00", message: "Peak speed was gained", type: "success" },
    { time: "10:00", message: "Low gas mission successful", type: "success" },
    { time: "10:00", message: "Battery current was passed", type: "success" }
  ];

  if (roversLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading mission data...</p>
        </div>
      </div>
    );
  }

  if (activeTab === "command") {
    return (
      <CommandCenter
        selectedRover={selectedRover}
        sol={selectedSol}
        photos={photos}
        weather={weather}
        onRoverSelect={setSelectedRover}
        onSolChange={setSelectedSol}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header with Mars background */}
      <div className="relative">
        <div className="absolute inset-0 h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#0a0a0a]"></div>
          <img 
            src="https://mars.nasa.gov/system/feature_items/images/6037_msl_banner.jpg"
            alt="Mars surface"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold">{selectedRover.charAt(0).toUpperCase() + selectedRover.slice(1)} Rover</h1>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`tab-item ${activeTab === "dashboard" ? "active" : ""}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("sensor")}
                  className={`tab-item ${activeTab === "sensor" ? "active" : ""}`}
                >
                  Sensor data
                </button>
                <button 
                  onClick={() => setActiveTab("missions")}
                  className={`tab-item ${activeTab === "missions" ? "active" : ""}`}
                >
                  Missions
                </button>
                <button 
                  onClick={() => setActiveTab("cameras")}
                  className={`tab-item ${activeTab === "cameras" ? "active" : ""}`}
                >
                  Cameras
                </button>
                <button 
                  onClick={() => setActiveTab("location")}
                  className={`tab-item ${activeTab === "location" ? "active" : ""}`}
                >
                  Location
                </button>
                <button 
                  onClick={() => setActiveTab("health")}
                  className={`tab-item ${activeTab === "health" ? "active" : ""}`}
                >
                  Health check
                </button>
                <button 
                  onClick={() => setActiveTab("log")}
                  className={`tab-item ${activeTab === "log" ? "active" : ""}`}
                >
                  Log
                </button>
                <button 
                  onClick={() => setActiveTab("command")}
                  className={`tab-item ${activeTab === "command" ? "active" : ""}`}
                >
                  Command Center
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">∞ m</span>
              <span className="text-gray-400">12 m</span>
              <span className="text-gray-400">95%</span>
              <span className="text-gray-400">Mon, 15 Oct</span>
              <span className="text-gray-400">10:24:35 UTC</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-3 space-y-6">
            {/* Sensor Data */}
            <Card className="command-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Sensor data</h3>
                <Badge variant="outline" className="status-active">
                  Active
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="data-card">
                  <div className="data-card-header">
                    <span>Temperature</span>
                    <span className="text-green-400">2%</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="data-card-value">
                      {weather?.temperature?.high || -10}
                    </span>
                    <span className="data-card-unit">°C</span>
                  </div>
                  <Progress value={75} className="h-1 mt-2 bg-gray-800">
                    <div className="h-full progress-fill-green" style={{width: '75%'}} />
                  </Progress>
                </div>

                <div className="data-card">
                  <div className="data-card-header">
                    <span>Dust</span>
                    <span className="text-orange-400">4%</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="data-card-value">
                      {weather?.atmosphericOpacity || 0.4}
                    </span>
                    <span className="data-card-unit">τ</span>
                  </div>
                  <Progress value={40} className="h-1 mt-2 bg-gray-800">
                    <div className="h-full progress-fill-orange" style={{width: '40%'}} />
                  </Progress>
                </div>

                <div className="space-y-2">
                  <div className="data-card">
                    <div className="data-card-header">
                      <span>Pressure</span>
                      <span className="text-gray-400">13%</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="data-card-value">
                        {typeof weather?.pressure === 'object' ? weather.pressure.value : weather?.pressure || 850}
                      </span>
                      <span className="data-card-unit">Pa</span>
                    </div>
                    <Progress value={85} className="h-1 mt-2 bg-gray-800">
                      <div className="h-full bg-gray-600" style={{width: '85%'}} />
                    </Progress>
                  </div>

                  <div className="data-card">
                    <div className="data-card-header">
                      <span>Radiation</span>
                      <span className="text-gray-400">1%</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="data-card-value">242</span>
                      <span className="data-card-unit">μGy/h</span>
                    </div>
                    <Progress value={24} className="h-1 mt-2 bg-gray-800">
                      <div className="h-full bg-gray-600" style={{width: '24%'}} />
                    </Progress>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                View all sensors →
              </button>
            </Card>

            {/* Missions */}
            <Card className="command-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Missions</h3>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sol collect</span>
                    <span className="text-gray-400">75%</span>
                  </div>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="36" fill="none" stroke="#1f2937" strokeWidth="8" />
                      <circle 
                        cx="48" cy="48" r="36" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="8"
                        strokeDasharray={`${75 * 2.26} 226`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-light">75%</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500">12:42:17</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sol analysis</span>
                    <span className="text-gray-400">50%</span>
                  </div>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="36" fill="none" stroke="#1f2937" strokeWidth="8" />
                      <circle 
                        cx="48" cy="48" r="36" 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="8"
                        strokeDasharray={`${50 * 2.26} 226`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-light">50%</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500">17:15:19</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Rock collect</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="36" fill="none" stroke="#1f2937" strokeWidth="8" />
                      <circle 
                        cx="48" cy="48" r="36" 
                        fill="none" 
                        stroke="#22c55e" 
                        strokeWidth="8"
                        strokeDasharray="226 226"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                View missions →
              </button>
            </Card>
          </div>

          {/* Center Column */}
          <div className="col-span-6 space-y-6">
            {/* Camera Views */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Surrounding Camera */}
                <Card className="command-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Surrounding camera</h3>
                    <Badge variant="outline" className="status-active">
                      Active
                    </Badge>
                  </div>
                  <div className="relative h-48 bg-gray-900 rounded-lg overflow-hidden">
                    <img 
                      src={photos[0] ? getPhotoUrl(photos[0], 0) : getPhotoUrl(null, 0)}
                      alt="Surrounding view"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPhotoUrl(null, 1);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <Badge className="text-xs bg-black/50">144m/h or 0m/t</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-800 rounded">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-800 rounded">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-800 rounded">
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="text-xs text-gray-400">Manual</button>
                  </div>
                </Card>

                {/* Active Camera */}
                <Card className="command-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Active camera</h3>
                    <Badge variant="outline" className="status-active">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="relative h-24 bg-gray-900 rounded overflow-hidden cursor-pointer hover:opacity-80">
                        <img 
                          src={getPhotoUrl(photo, index + 2)}
                          alt={`Camera ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPhotoUrl(null, index + 6);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Cameras Grid */}
              <Card className="command-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Cameras</h3>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                  {cameraTypes.map((camera, index) => (
                    <div key={camera} className="text-center">
                      <div className="relative h-20 bg-gray-900 rounded-lg overflow-hidden mb-2 cursor-pointer hover:ring-2 hover:ring-orange-500">
                        <img 
                          src={photos[index] ? getPhotoUrl(photos[index], index) : getPhotoUrl(null, index)}
                          alt={camera}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPhotoUrl(null, index + 5);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">{camera}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Current Location */}
              <Card className="command-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Current location</h3>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
                
                <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-red-900/20">
                    {/* Simple map visualization */}
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ff6b3520" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Rover path */}
                      <polyline 
                        points="50,200 100,180 150,160 200,140 250,120" 
                        fill="none" 
                        stroke="#ff6b35" 
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      
                      {/* Rover position */}
                      <circle cx="250" cy="120" r="8" fill="#ff6b35" className="animate-pulse" />
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded px-3 py-2">
                    <p className="text-xs text-gray-400">Coordinates</p>
                    <p className="text-sm font-mono">-52.3M, 86.1E</p>
                  </div>
                </div>
              </Card>

              {/* Featured Photos */}
              <Card className="command-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Featured photos</h3>
                  <Badge variant="outline" className="text-xs">
                    Gallery
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 12).map((photo, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square bg-gray-900 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-500"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img 
                        src={getPhotoUrl(photo, index)}
                        alt={`Sol ${selectedSol} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPhotoUrl(null, index + 3);
                        }}
                      />
                      <div className="absolute top-1 right-1">
                        <Badge className="text-[10px] px-1 py-0 bg-black/50">
                          Sol {photo.sol || selectedSol}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-3 space-y-6">
            {/* Health Check */}
            <Card className="command-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Health check</h3>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">All</span>
                    <span className="text-sm">Passed</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs text-gray-400">Failure 0</span>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Equipment</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2">15/10</td>
                      <td className="py-2">Battery test</td>
                      <td className="py-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      </td>
                      <td className="py-2">
                        <Badge className="text-[10px] bg-green-900/20 text-green-400">Low risk</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2">15/10</td>
                      <td className="py-2">Camera connection</td>
                      <td className="py-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      </td>
                      <td className="py-2">
                        <Badge className="text-[10px] bg-green-900/20 text-green-400">Low risk</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2">15/10</td>
                      <td className="py-2">Camera driver</td>
                      <td className="py-2">
                        <AlertCircle className="w-3 h-3 text-yellow-400" />
                      </td>
                      <td className="py-2">
                        <Badge className="text-[10px] bg-yellow-900/20 text-yellow-400">Med risk</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <button className="btn-orange w-full py-2 text-sm">
                  Show all →
                </button>
              </div>
            </Card>

            {/* Log */}
            <Card className="command-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Log</h3>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="text-gray-400">Time</span>
                  <span className="text-gray-400">Operations</span>
                </div>
                
                {logEntries.map((entry, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-time">{entry.time}</span>
                    <span className={`log-message ${
                      entry.type === 'success' ? 'log-success' : 
                      entry.type === 'error' ? 'log-error' : 
                      'log-warning'
                    }`}>
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                View all log →
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
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
              src={getPhotoUrl(selectedPhoto, 0)}
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
              <p className="text-lg">{selectedPhoto.camera?.full_name || selectedPhoto.cameraFullName}</p>
              <p className="text-sm opacity-80">Sol {selectedPhoto.sol || selectedSol} • {selectedPhoto.earthDate || selectedPhoto.earth_date}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}