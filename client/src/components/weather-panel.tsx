import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Wind, Gauge, Cloud, Eye, Sun } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeatherData {
  sol: number;
  temperature: {
    high: number;
    low: number;
    unit: string;
  };
  pressure: {
    value: number;
    unit: string;
  };
  wind: {
    speed: number;
    direction: string;
    unit: string;
  };
  season: string;
  dustStorm: boolean;
  atmosphericOpacity: number;
}

interface WeatherPanelProps {
  rover: string;
  className?: string;
}

export function WeatherPanel({ rover, className }: WeatherPanelProps) {
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather", rover],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Mock historical data for chart
  const historicalData = Array.from({ length: 7 }, (_, i) => ({
    sol: (weather?.sol || 4100) - (6 - i),
    high: (weather?.temperature.high || -10) + Math.random() * 10 - 5,
    low: (weather?.temperature.low || -78) + Math.random() * 10 - 5,
  }));

  if (!weather) return null;

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          ATMOSPHERIC CONDITIONS - SOL {weather.sol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Conditions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-2">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 font-mono text-xs">TEMP</span>
            </div>
            <div className="text-white font-mono text-sm">
              {weather.temperature.high}° / {weather.temperature.low}°{weather.temperature.unit}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-2">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400 font-mono text-xs">PRESSURE</span>
            </div>
            <div className="text-white font-mono text-sm">
              {weather.pressure.value} {weather.pressure.unit}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-2">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-mono text-xs">WIND</span>
            </div>
            <div className="text-white font-mono text-sm">
              {weather.wind.speed} {weather.wind.unit} {weather.wind.direction}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-2">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-mono text-xs">OPACITY</span>
            </div>
            <div className="text-white font-mono text-sm">
              {(weather.atmosphericOpacity * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Season and Dust Storm Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-xs">{weather.season}</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-mono ${
            weather.dustStorm 
              ? 'bg-red-900/30 text-red-400 border border-red-500/30' 
              : 'bg-green-900/30 text-green-400 border border-green-500/30'
          }`}>
            {weather.dustStorm ? 'DUST STORM' : 'CLEAR'}
          </div>
        </div>

        {/* Temperature Trend Chart */}
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="sol" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '4px'
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}