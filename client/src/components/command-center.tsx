import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Home, Target, Send, Settings, LogOut, HelpCircle, FileText,
  Camera, Navigation, Activity, AlertCircle, CheckCircle,
  Thermometer, Gauge, Wind, MapPin, Clock, ChevronRight,
  RotateCw, Pause, Play, ZoomIn, ZoomOut, Eye, Maximize2
} from "lucide-react";

interface CommandCenterProps {
  selectedRover: string;
  sol: number;
  photos: any[];
  weather: any;
  onRoverSelect: (rover: string) => void;
  onSolChange: (sol: number) => void;
}

export function CommandCenter({
  selectedRover,
  sol,
  photos,
  weather,
  onRoverSelect,
  onSolChange
}: CommandCenterProps) {
  const [activeView, setActiveView] = useState("overview");
  const [selectedCamera, setSelectedCamera] = useState("NAVCAM");
  
  // Get real Mars photos with variety
  const getPhotoUrl = (index: number) => {
    if (photos && photos[index]) {
      return photos[index].imgSrc || photos[index].img_src;
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
      "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04000/opgs/edr/fcam/FLB_645369149EDR_F0660000FHAZ00337M_.JPG"
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Sidebar navigation items
  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "missions", label: "Missions", icon: Target },
    { id: "commands", label: "Commands", icon: Send },
  ];

  // Mission data
  const missions = [
    { name: "Sol collect", progress: 75, status: "active" },
    { name: "Sol analysis", progress: 50, status: "active" },
    { name: "Rock collect", progress: 100, status: "complete" },
    { name: "Panorama ground", progress: 100, status: "complete" }
  ];

  // Soil analysis data
  const soilData = [
    { label: "Silicates", value: 14, color: "#ff6b35" },
    { label: "Minerals", value: 20, color: "#f7931e" },
    { label: "Iron oxides", value: 20, color: "#ff6b35" },
    { label: "Carbonates", value: 42, color: "#f7931e" }
  ];

  const mountainData = [
    { label: "Silicates", value: 10, color: "#ff6b35" },
    { label: "Minerals", value: 38, color: "#f7931e" },
    { label: "Iron oxides", value: 14, color: "#ff6b35" },
    { label: "Carbonates", value: 38, color: "#f7931e" }
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-gray-800/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-lg font-semibold">Marover</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item w-full mb-2 ${activeView === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-800/50">
          <button className="nav-item w-full mb-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="nav-item w-full mb-2">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
          
          <div className="mt-4 pt-4 border-t border-gray-800/50">
            <button className="nav-item w-full mb-2">
              <HelpCircle className="w-5 h-5" />
              <span>Need help?</span>
            </button>
            <p className="text-xs text-gray-500 px-4 mt-2">Please check our docs</p>
            
            <div className="mt-4 px-4">
              <p className="text-xs text-gray-600 mb-2">Documentation</p>
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-900/30 to-red-900/30 overflow-hidden">
                <img 
                  src={getPhotoUrl(0)} 
                  alt="Mars"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/30 backdrop-blur-md border-b border-gray-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Command Center</h1>
              <p className="text-sm text-gray-400 mt-1">
                Here is your stats for July 12, 10:55
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-64 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <button className="relative">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                  <img 
                    src={getPhotoUrl(1)} 
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm">Sarah Patel</p>
                  <p className="text-xs text-gray-400">Planetary Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Map and Camera */}
            <div className="col-span-8 space-y-6">
              {/* Topographic Map */}
              <Card className="command-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Topographic map</h3>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    {/* Topographic lines */}
                    <svg className="w-full h-full opacity-20">
                      <defs>
                        <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                          <path d="M 0 50 Q 25 30 50 50 T 100 50" stroke="#ff6b35" strokeWidth="0.5" fill="none" />
                          <path d="M 0 70 Q 25 50 50 70 T 100 70" stroke="#ff6b35" strokeWidth="0.5" fill="none" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#topo)" />
                    </svg>
                  </div>
                  
                  {/* Rover positions */}
                  <div className="absolute top-1/3 left-1/3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-6 left-4 text-xs text-gray-400 whitespace-nowrap">
                        Current position<br />
                        -42.1233, 34.4455
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 left-1/2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <div className="absolute -bottom-6 left-4 text-xs text-gray-400 whitespace-nowrap">
                        Next point<br />
                        -52.1233, 64.4455
                      </div>
                    </div>
                  </div>
                  
                  {/* Path line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="33%" y1="33%" x2="50%" y2="50%" stroke="#ff6b35" strokeWidth="1" strokeDasharray="2,2" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button className="btn-orange px-6 py-2">
                    Start moving
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Distance: 12.93 km</span>
                    <span>•</span>
                    <span>Time: 34 min</span>
                  </div>
                </div>
              </Card>

              {/* Camera View */}
              <Card className="command-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Camera view</h3>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="relative h-80 bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={getPhotoUrl(0)}
                    alt="Mars surface"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ncam/NLB_486265257EDR_F0481570NCAM00323M_.JPG';
                    }}
                  />
                  
                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <RotateCw className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <ChevronRight className="w-4 h-4 text-white rotate-180" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <Pause className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <ZoomOut className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Stats and Analysis */}
            <div className="col-span-4 space-y-6">
              {/* Location Input */}
              <Card className="command-card p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Enter first point:</label>
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="X" 
                        value="42.1233"
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm"
                        readOnly
                      />
                      <input 
                        type="text" 
                        placeholder="Y" 
                        value="34.4455"
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm"
                        readOnly
                      />
                    </div>
                    <button className="text-xs text-orange-500 mt-1">Choose on map</button>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Enter second point:</label>
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="X" 
                        value="52.1233"
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm"
                        readOnly
                      />
                      <input 
                        type="text" 
                        placeholder="Y" 
                        value="64.4455"
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm"
                        readOnly
                      />
                    </div>
                    <button className="text-xs text-orange-500 mt-1">Choose on map</button>
                  </div>
                </div>
              </Card>

              {/* Battery and Health */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="command-card p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Battery level</p>
                  <div className="text-2xl font-light mb-2">88%</div>
                  <Progress value={88} className="h-2 bg-gray-800">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{width: '88%'}} />
                  </Progress>
                </Card>
                
                <Card className="command-card p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Health status</p>
                  <div className="text-2xl font-light mb-2">9.12</div>
                  <Progress value={91} className="h-2 bg-gray-800">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{width: '91%'}} />
                  </Progress>
                </Card>
              </div>

              {/* Soil Analysis */}
              <Card className="command-card p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Soil analysis</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Surface data</p>
                    <div className="flex items-center justify-center">
                      <DonutChart data={soilData} size={120} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {soilData.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-gray-300 ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Mountain data</p>
                    <div className="flex items-center justify-center">
                      <DonutChart data={mountainData} size={120} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {mountainData.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-gray-300 ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, size = 100 }: { data: any[], size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercentage = 0;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {data.map((segment, index) => {
        const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -accumulatedPercentage * circumference / 100;
        accumulatedPercentage += segment.value;
        
        return (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        );
      })}
    </svg>
  );
}