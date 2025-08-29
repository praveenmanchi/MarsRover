import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Rover } from "@/types/rover";

interface RoverSidebarProps {
  rovers: Rover[];
  selectedRover: string;
  onRoverSelect: (roverName: string) => void;
}

export function RoverSidebar({ rovers, selectedRover, onRoverSelect }: RoverSidebarProps) {
  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-chart-2" : "bg-muted-foreground";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "OPERATIONAL" : "MISSION COMPLETE";
  };

  const formatDistance = (rover: Rover) => {
    const distances: Record<string, string> = {
      perseverance: "30.12 km",
      curiosity: "31.47 km", 
      opportunity: "45.16 km",
      spirit: "7.73 km",
    };
    return distances[rover.name] || "0 km";
  };

  const getSamples = (rover: Rover) => {
    return rover.name === "perseverance" ? 24 : undefined;
  };

  const getEnvironmentData = (roverName: string) => {
    const envData: Record<string, any> = {
      perseverance: {
        temperature: "-107°C",
        pressure: "12.4B",
        oxygen: "20.97",
        dustLevel: "Moderate"
      },
      curiosity: {
        temperature: "-95°C", 
        pressure: "8.2B",
        oxygen: "N/A",
        dustLevel: "Low"
      },
      opportunity: {
        temperature: "-80°C",
        pressure: "6.1B", 
        oxygen: "N/A",
        dustLevel: "High"
      },
      spirit: {
        temperature: "-75°C",
        pressure: "5.8B",
        oxygen: "N/A", 
        dustLevel: "High"
      }
    };
    return envData[roverName] || envData.perseverance;
  };

  const selectedRoverData = rovers.find(r => r.name === selectedRover);
  const envData = getEnvironmentData(selectedRover);

  return (
    <aside className="w-80 bg-sidebar/95 backdrop-blur border-r border-sidebar-border overflow-y-auto" data-testid="sidebar-rovers">
      <div className="p-4">
        {/* Mission Selection */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">Active Missions</h2>
          
          {rovers.map((rover) => (
            <Card
              key={rover.id}
              className={`mb-2 cursor-pointer transition-all ${
                selectedRover === rover.name 
                  ? "bg-sidebar-accent border-sidebar-primary shadow-lg" 
                  : "bg-sidebar/50 hover:bg-sidebar-accent/50 border-sidebar-border"
              }`}
              onClick={() => onRoverSelect(rover.name)}
              data-testid={`card-rover-${rover.name}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sidebar-foreground uppercase text-sm tracking-wide">{rover.name}</h3>
                    <p className="text-xs text-sidebar-foreground/60">
                      {rover.name === "perseverance" && "Mars 2020"}
                      {rover.name === "curiosity" && "MSL"}
                      {(rover.name === "opportunity" || rover.name === "spirit") && "MER"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${getStatusColor(rover.status)} rounded-full`}></div>
                    <Badge 
                      variant={rover.status === "active" ? "default" : "secondary"} 
                      className="text-xs bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30"
                    >
                      {getStatusText(rover.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-sidebar-foreground/60">Location:</span>
                    <span className="font-mono text-sidebar-foreground">{rover.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sidebar-foreground/60">Sol:</span>
                    <span className="font-mono text-sidebar-foreground" data-testid={`text-${rover.name}-sol`}>{rover.maxSol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sidebar-foreground/60">Images:</span>
                    <span className="font-mono text-sidebar-foreground">{rover.totalPhotos}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Environment Panel */}
        {selectedRoverData && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">Environment</h3>
            <Card className="bg-sidebar/50 border-sidebar-border">
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-sidebar-foreground/60 uppercase">Temp</p>
                      <p className="text-sm font-mono font-semibold text-sidebar-foreground">{envData.temperature}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-sidebar-foreground/60 uppercase">Pressure</p>
                      <p className="text-sm font-mono font-semibold text-sidebar-foreground">{envData.pressure}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-sidebar-foreground/60 uppercase">Oxygen</p>
                      <p className="text-sm font-mono font-semibold text-sidebar-foreground">{envData.oxygen}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-sidebar-foreground/60 uppercase">Dust</p>
                      <p className="text-sm font-mono font-semibold text-sidebar-foreground">{envData.dustLevel}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connection Status */}
        <div className="border-t border-sidebar-border pt-4">
          <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">HELIOS Control</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sidebar-foreground/60">Connected:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                <span className="text-xs font-mono text-chart-2" data-testid="text-api-status">ONLINE</span>
              </div>
            </div>
            <div className="text-xs text-sidebar-foreground/60 font-mono">
              000119200048QTC-2.4D920Q0.00-3
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
