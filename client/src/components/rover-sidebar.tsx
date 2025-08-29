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
    return status === "active" ? "bg-green-500" : "bg-gray-500";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "ACTIVE" : "INACTIVE";
  };

  const formatDistance = (rover: Rover) => {
    // Mock distance calculations based on rover
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

  return (
    <aside className="w-80 bg-card border-r border-border overflow-y-auto" data-testid="sidebar-rovers">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Active Missions</h2>
        
        {rovers.map((rover) => (
          <Card
            key={rover.id}
            className={`mb-4 cursor-pointer hover:bg-accent transition-colors ${
              selectedRover === rover.name ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onRoverSelect(rover.name)}
            data-testid={`card-rover-${rover.name}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground capitalize">{rover.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rover.name === "perseverance" && "Mars 2020 Mission"}
                    {rover.name === "curiosity" && "Mars Science Laboratory"}
                    {(rover.name === "opportunity" || rover.name === "spirit") && "Mars Exploration Rover"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${getStatusColor(rover.status)} rounded-full`}></div>
                  <Badge variant={rover.status === "active" ? "default" : "secondary"} className="text-xs">
                    {getStatusText(rover.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-mono">{rover.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sol:</span>
                  <span className="font-mono" data-testid={`text-${rover.name}-sol`}>{rover.maxSol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-mono" data-testid={`text-${rover.name}-distance`}>{formatDistance(rover)}</span>
                </div>
                {getSamples(rover) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samples:</span>
                    <span className="font-mono" data-testid={`text-${rover.name}-samples`}>{getSamples(rover)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* API Configuration */}
        <div className="border-t border-border pt-4 mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">NASA API Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">API Key Status</label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-mono text-green-600" data-testid="text-api-status">Connected</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Endpoint</label>
              <p className="text-xs font-mono text-muted-foreground mt-1">api.nasa.gov/mars-photos</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Rate Limit</label>
              <p className="text-xs font-mono text-muted-foreground mt-1" data-testid="text-rate-limit">847/1000 requests/hour</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
