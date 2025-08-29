import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Microscope, Beaker, Mountain, Droplets } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface GeologicalData {
  location: {
    lat: number;
    lon: number;
  };
  rockType: string;
  composition: {
    silica: number;
    iron: number;
    calcium: number;
    magnesium: number;
    sulfur: number;
  };
  age: string;
  waterEvidence: boolean;
  organicCompounds: boolean;
  elevation: number;
  description: string;
}

interface GeologicalAnalysisProps {
  rover: string;
  selectedLocation?: { lat: number; lon: number };
  className?: string;
}

const COLORS = ['#06b6d4', '#f97316', '#eab308', '#22c55e', '#a855f7'];

export function GeologicalAnalysis({ rover, selectedLocation, className }: GeologicalAnalysisProps) {
  const { data: geology } = useQuery<GeologicalData>({
    queryKey: ["/api/geology", rover, selectedLocation?.lat, selectedLocation?.lon],
    enabled: !!selectedLocation,
  });

  if (!geology) {
    return (
      <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
            <Microscope className="w-4 h-4" />
            GEOLOGICAL ANALYSIS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 font-mono text-sm text-center py-4">
            Click on map to analyze location
          </div>
        </CardContent>
      </Card>
    );
  }

  const compositionData = Object.entries(geology.composition).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
          <Microscope className="w-4 h-4" />
          GEOLOGICAL ANALYSIS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">LAT:</span>
            <span className="text-white font-mono ml-1">{geology.location.lat.toFixed(4)}°</span>
          </div>
          <div>
            <span className="text-gray-400">LON:</span>
            <span className="text-white font-mono ml-1">{geology.location.lon.toFixed(4)}°</span>
          </div>
          <div>
            <span className="text-gray-400">ELEV:</span>
            <span className="text-white font-mono ml-1">{geology.elevation}m</span>
          </div>
          <div>
            <span className="text-gray-400">AGE:</span>
            <span className="text-white font-mono ml-1">{geology.age}</span>
          </div>
        </div>

        {/* Rock Type and Features */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-orange-500/50 text-orange-400 font-mono">
            <Mountain className="w-3 h-3 mr-1" />
            {geology.rockType}
          </Badge>
          {geology.waterEvidence && (
            <Badge variant="outline" className="border-blue-500/50 text-blue-400 font-mono">
              <Droplets className="w-3 h-3 mr-1" />
              H2O Evidence
            </Badge>
          )}
          {geology.organicCompounds && (
            <Badge variant="outline" className="border-green-500/50 text-green-400 font-mono">
              <Beaker className="w-3 h-3 mr-1" />
              Organic
            </Badge>
          )}
        </div>

        {/* Composition Chart */}
        <div>
          <h4 className="text-cyan-400 font-mono text-xs mb-2">MINERAL COMPOSITION</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-cyan-400 font-mono text-xs mb-1">ANALYSIS NOTES</h4>
          <p className="text-gray-300 text-xs leading-relaxed">
            {geology.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}