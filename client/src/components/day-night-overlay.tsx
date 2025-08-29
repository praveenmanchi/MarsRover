import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon, CloudDrizzle, Eye } from "lucide-react";

interface DayNightOverlayProps {
  onLightingChange?: (lighting: number) => void;
  onDustStormToggle?: (active: boolean) => void;
  className?: string;
}

export function DayNightOverlay({ onLightingChange, onDustStormToggle, className }: DayNightOverlayProps) {
  const [marsTime, setMarsTime] = useState(12); // Mars hour (0-24)
  const [isDustStorm, setIsDustStorm] = useState(false);
  const [opacity, setOpacity] = useState(0.3);
  const [isRealTime, setIsRealTime] = useState(false);

  // Calculate Mars lighting based on time
  const calculateLighting = (hour: number) => {
    // Mars day is roughly 24.6 Earth hours
    const normalizedHour = hour % 24.6;
    if (normalizedHour < 6 || normalizedHour > 18) {
      // Night time - darker
      return Math.max(0.1, 0.3 - Math.abs(normalizedHour - 12) * 0.02);
    } else {
      // Day time - brighter
      return Math.min(1, 0.8 - Math.abs(normalizedHour - 12) * 0.03);
    }
  };

  // Real-time Mars time simulation
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setMarsTime(prev => (prev + 0.1) % 24.6);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isRealTime]);

  // Update lighting when time changes
  useEffect(() => {
    const lighting = calculateLighting(marsTime);
    onLightingChange?.(lighting);
  }, [marsTime, onLightingChange]);

  const isDayTime = marsTime >= 6 && marsTime <= 18;
  const lightingLevel = calculateLighting(marsTime);

  const formatMarsTime = (hour: number) => {
    const marsHour = Math.floor(hour);
    const marsMinute = Math.floor((hour % 1) * 60);
    return `${marsHour.toString().padStart(2, '0')}:${marsMinute.toString().padStart(2, '0')}`;
  };

  const handleDustStormToggle = () => {
    const newStormState = !isDustStorm;
    setIsDustStorm(newStormState);
    onDustStormToggle?.(newStormState);
  };

  return (
    <>
      {/* Day/Night Overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-10 transition-all duration-1000 ${
          isDayTime ? 'bg-yellow-500/5' : 'bg-blue-900/20'
        }`}
        style={{ 
          opacity: opacity * (1 - lightingLevel),
          background: isDayTime 
            ? `linear-gradient(to bottom, rgba(255,223,0,0.1) 0%, transparent 30%)`
            : `linear-gradient(to bottom, rgba(0,50,150,0.3) 0%, rgba(0,20,60,0.2) 100%)`
        }}
      />

      {/* Dust Storm Overlay */}
      {isDustStorm && (
        <div 
          className="fixed inset-0 pointer-events-none z-15 bg-orange-900/30 animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(139,69,19,0.4) 0%, rgba(160,82,45,0.2) 50%, transparent 100%)`,
            animation: 'dustStorm 8s ease-in-out infinite'
          }}
        />
      )}

      {/* Controls Panel */}
      <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
            {isDayTime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            MARS LIGHTING - {formatMarsTime(marsTime)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Real-time toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">REAL-TIME</span>
            <Button
              variant="outline"
              size="sm"
              className={`h-6 px-2 font-mono text-xs ${
                isRealTime 
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : 'border-gray-500/50 text-gray-400'
              }`}
              onClick={() => setIsRealTime(!isRealTime)}
              data-testid="button-realtime-toggle"
            >
              {isRealTime ? 'ON' : 'OFF'}
            </Button>
          </div>

          {/* Time Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-12">TIME</span>
              <Slider
                value={[marsTime]}
                onValueChange={(value) => !isRealTime && setMarsTime(value[0])}
                max={24.6}
                step={0.1}
                className="flex-1"
                disabled={isRealTime}
                data-testid="slider-mars-time"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-12">LIGHT</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${lightingLevel * 100}%` }}
                />
              </div>
              <span className="text-cyan-400 text-xs font-mono w-8">
                {Math.round(lightingLevel * 100)}%
              </span>
            </div>
          </div>

          {/* Environmental Effects */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-16">OPACITY</span>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
                data-testid="slider-overlay-opacity"
              />
              <span className="text-cyan-400 text-xs font-mono w-8">
                {Math.round(opacity * 100)}%
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`w-full font-mono text-xs ${
                isDustStorm
                  ? 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                  : 'border-gray-500/50 text-gray-400'
              }`}
              onClick={handleDustStormToggle}
              data-testid="button-dust-storm"
            >
              <CloudDrizzle className="w-3 h-3 mr-2" />
              DUST STORM: {isDustStorm ? 'ACTIVE' : 'CLEAR'}
            </Button>
          </div>

          {/* Lighting Info */}
          <div className="bg-gray-900/50 rounded border border-cyan-500/20 p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400">VISIBILITY</span>
              </div>
              <span className="text-white font-mono">
                {isDustStorm ? 'REDUCED' : lightingLevel > 0.7 ? 'EXCELLENT' : 'GOOD'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">SEASON</span>
              <span className="text-white font-mono">Northern Winter</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for dust storm animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dustStorm {
            0%, 100% { 
              opacity: 0.3;
              transform: translateX(0px) translateY(0px);
            }
            25% {
              opacity: 0.5;
              transform: translateX(-10px) translateY(-5px);
            }
            50% {
              opacity: 0.4;
              transform: translateX(10px) translateY(5px);
            }
            75% {
              opacity: 0.6;
              transform: translateX(-5px) translateY(-10px);
            }
          }
        `
      }} />
    </>
  );
}