import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Rover } from "@/types/rover";

interface SensorDashboardProps {
  currentRover?: Rover;
  selectedSol: number;
}

export function SensorDashboard({ currentRover, selectedSol }: SensorDashboardProps) {
  if (!currentRover) {
    return null;
  }

  const getSensorData = (roverName: string) => {
    const sensorData: Record<string, any> = {
      perseverance: {
        temperature: { value: 1.78, unit: "°C", status: "normal" },
        dust: { value: 689, unit: "ppm", status: "moderate" },
        pressure: { value: 12.48, unit: "Pa", status: "normal" },
        radiation: { value: 242, unit: "μSv/h", status: "low" },
        oxygen: { value: 20.97, unit: "%", status: "optimal" },
        wind: { value: 40, unit: "mph", status: "moderate" },
        battery: { value: 88, unit: "%", status: "good" },
        connection: { value: "Stable", status: "connected" }
      },
      curiosity: {
        temperature: { value: -1.2, unit: "°C", status: "normal" },
        dust: { value: 234, unit: "ppm", status: "low" },
        pressure: { value: 8.2, unit: "Pa", status: "normal" },
        radiation: { value: 180, unit: "μSv/h", status: "low" },
        oxygen: { value: 0, unit: "%", status: "none" },
        wind: { value: 35, unit: "mph", status: "low" },
        battery: { value: 92, unit: "%", status: "excellent" },
        connection: { value: "Stable", status: "connected" }
      },
      opportunity: {
        temperature: { value: -15.5, unit: "°C", status: "cold" },
        dust: { value: 1200, unit: "ppm", status: "high" },
        pressure: { value: 6.1, unit: "Pa", status: "low" },
        radiation: { value: 310, unit: "μSv/h", status: "moderate" },
        oxygen: { value: 0, unit: "%", status: "none" },
        wind: { value: 65, unit: "mph", status: "high" },
        battery: { value: 0, unit: "%", status: "offline" },
        connection: { value: "Lost", status: "disconnected" }
      },
      spirit: {
        temperature: { value: -18.2, unit: "°C", status: "cold" },
        dust: { value: 980, unit: "ppm", status: "high" },
        pressure: { value: 5.8, unit: "Pa", status: "low" },
        radiation: { value: 285, unit: "μSv/h", status: "moderate" },
        oxygen: { value: 0, unit: "%", status: "none" },
        wind: { value: 45, unit: "mph", status: "moderate" },
        battery: { value: 0, unit: "%", status: "offline" },
        connection: { value: "Lost", status: "disconnected" }
      }
    };
    return sensorData[roverName] || sensorData.perseverance;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      excellent: "bg-chart-2",
      good: "bg-chart-2", 
      optimal: "bg-chart-2",
      normal: "bg-chart-3",
      moderate: "bg-chart-3",
      low: "bg-chart-4",
      high: "bg-primary",
      cold: "bg-chart-4",
      none: "bg-muted-foreground",
      offline: "bg-destructive",
      connected: "bg-chart-2",
      disconnected: "bg-destructive"
    };
    return colors[status] || "bg-muted-foreground";
  };

  const sensorData = getSensorData(currentRover.name);

  return (
    <div className="grid grid-cols-4 gap-4" data-testid="sensor-dashboard">
      {/* Temperature */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Temperature</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.temperature.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.temperature.value > 0 ? '+' : ''}{sensorData.temperature.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.temperature.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Dust Level */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Dust</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.dust.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.dust.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.dust.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pressure */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Pressure</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.pressure.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.pressure.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.pressure.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Radiation */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Radiation</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.radiation.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.radiation.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.radiation.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Wind Speed */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Wind</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.wind.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.wind.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.wind.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Battery */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Battery</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.battery.status)} rounded-full`}></div>
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {sensorData.battery.value}
            <span className="text-sm text-muted-foreground ml-1">{sensorData.battery.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Connection */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Connection</span>
            <div className={`w-2 h-2 ${getStatusColor(sensorData.connection.status)} rounded-full`}></div>
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            {sensorData.connection.value}
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Health</span>
            <Badge 
              variant={currentRover.status === "active" ? "default" : "secondary"}
              className={`text-xs ${currentRover.status === 'active' ? 'bg-chart-2 text-chart-2-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {currentRover.status === 'active' ? 'NOMINAL' : 'OFFLINE'}
            </Badge>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            100%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}