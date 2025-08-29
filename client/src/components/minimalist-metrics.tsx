import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Activity, Thermometer, Wind, Gauge, Navigation, Calendar, Camera, Route, Target } from "lucide-react";
import { motion } from "framer-motion";

interface MetricData {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface MinimalistMetricsProps {
  metrics: MetricData[];
  className?: string;
}

export function MinimalistMetrics({ metrics, className }: MinimalistMetricsProps) {
  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      case "stable":
        return <Minus className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      case "stable":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  {metric.icon || <Activity className="w-5 h-5 text-primary" />}
                </div>
                {metric.trend && metric.trendValue && (
                  <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs font-medium">{metric.trendValue}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-light ${metric.color || 'text-foreground'}`}>
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-muted-foreground font-normal">
                      {metric.unit}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function RoverMetrics({ rover, sol, photos }: { rover: string; sol: number; photos: any[] }) {
  const metrics: MetricData[] = [
    {
      label: "Current Sol",
      value: sol.toLocaleString(),
      unit: "days",
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      color: "text-blue-600",
      trend: "up",
      trendValue: "+1"
    },
    {
      label: "Distance Traveled",
      value: (sol * 0.04).toFixed(2),
      unit: "km",
      icon: <Route className="w-5 h-5 text-green-500" />,
      color: "text-green-600",
      trend: "up",
      trendValue: "+0.04"
    },
    {
      label: "Photos Today",
      value: photos.length,
      unit: "images",
      icon: <Camera className="w-5 h-5 text-purple-500" />,
      color: "text-purple-600",
      trend: photos.length > 10 ? "up" : "stable",
      trendValue: photos.length > 10 ? "+12%" : "0%"
    },
    {
      label: "Battery Level",
      value: 89,
      unit: "%",
      icon: <Gauge className="w-5 h-5 text-yellow-500" />,
      color: "text-yellow-600",
      trend: "stable",
      trendValue: "0%"
    }
  ];

  return <MinimalistMetrics metrics={metrics} className="mb-6" />;
}

export function EnvironmentalMetrics({ temperature = -15, pressure = 730, windSpeed = 2.1 }: { temperature?: number; pressure?: number; windSpeed?: number }) {
  const metrics: MetricData[] = [
    {
      label: "Temperature",
      value: temperature,
      unit: "°C",
      icon: <Thermometer className="w-5 h-5 text-red-500" />,
      color: "text-red-600",
      trend: temperature > -20 ? "up" : "down",
      trendValue: temperature > -20 ? "+2°" : "-3°"
    },
    {
      label: "Pressure",
      value: pressure,
      unit: "Pa",
      icon: <Gauge className="w-5 h-5 text-blue-500" />,
      color: "text-blue-600",
      trend: "stable",
      trendValue: "0"
    },
    {
      label: "Wind Speed",
      value: windSpeed,
      unit: "m/s",
      icon: <Wind className="w-5 h-5 text-teal-500" />,
      color: "text-teal-600",
      trend: windSpeed > 5 ? "up" : "stable",
      trendValue: windSpeed > 5 ? "+1.2" : "0"
    },
    {
      label: "Visibility",
      value: "Clear",
      unit: "",
      icon: <Target className="w-5 h-5 text-green-500" />,
      color: "text-green-600",
      trend: "stable",
      trendValue: ""
    }
  ];

  return <MinimalistMetrics metrics={metrics} className="mb-6" />;
}