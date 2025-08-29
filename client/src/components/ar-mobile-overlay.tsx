import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Crosshair, 
  MapPin, 
  Activity, 
  Thermometer,
  Wind,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import type { Rover } from '@/types/rover';

interface ARMobileOverlayProps {
  rover: Rover;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

export function ARMobileOverlay({ rover, isActive, onToggle, className }: ARMobileOverlayProps) {
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [locationData, setLocationData] = useState<{ lat: number; lon: number } | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request camera and device orientation permissions for AR
  useEffect(() => {
    if (isActive && 'mediaDevices' in navigator) {
      requestCameraPermission();
      requestOrientationPermission();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission('granted');
      }
    } catch (error) {
      console.warn('Camera access denied:', error);
      setCameraPermission('denied');
    }
  };

  const requestOrientationPermission = async () => {
    if ('DeviceOrientationEvent' in window) {
      try {
        // For iOS devices, request permission
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            startOrientationTracking();
          }
        } else {
          // For Android devices, start immediately
          startOrientationTracking();
        }
      } catch (error) {
        console.warn('Device orientation permission denied:', error);
      }
    }
  };

  const startOrientationTracking = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  };

  // Simulated rover data overlay positions based on orientation
  const getRoverARData = () => {
    const { alpha } = deviceOrientation;
    
    // Simulate rover position relative to user's orientation
    const roverBearing = 45; // Degrees from north
    const relativeAngle = (roverBearing - alpha + 360) % 360;
    
    // Calculate screen position (0-100% of screen width)
    const screenX = ((relativeAngle + 180) % 360) / 360 * 100;
    
    return {
      distance: '2.3 km',
      bearing: roverBearing,
      screenX: Math.max(10, Math.min(90, screenX)),
      screenY: 40, // Fixed vertical position
      visible: relativeAngle > 270 || relativeAngle < 90 // Visible in front 180 degrees
    };
  };

  const arData = getRoverARData();

  if (!isActive) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-20 right-4 z-50 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg md:hidden"
        data-testid="button-ar-activate"
      >
        <Eye className="w-4 h-4 mr-2" />
        AR View
      </Button>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black md:hidden ${className}`}>
      {/* Camera feed background */}
      {cameraPermission === 'granted' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-orange-900 to-red-900 flex items-center justify-center">
          <div className="text-center text-white">
            {cameraPermission === 'denied' ? (
              <>
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Camera access required for AR</p>
                <p className="text-sm opacity-75">Please enable camera permissions</p>
              </>
            ) : (
              <>
                <div className="animate-pulse mb-4">
                  <Camera className="w-16 h-16 mx-auto" />
                </div>
                <p>Initializing AR Camera...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* AR Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Crosshair/Targeting reticle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="w-8 h-8 text-cyan-400 opacity-75" />
        </div>

        {/* Rover AR marker */}
        {arData.visible && (
          <div 
            className="absolute pointer-events-auto transform -translate-x-1/2"
            style={{ 
              left: `${arData.screenX}%`, 
              top: `${arData.screenY}%` 
            }}
          >
            <Card className="bg-black/80 border-cyan-500/50 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400 mr-1" />
                  <Badge variant="secondary" className="text-xs">
                    {rover.name.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-xs text-white space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="opacity-75">Distance:</span>
                    <span className="text-cyan-400 font-mono">{arData.distance}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="opacity-75">Bearing:</span>
                    <span className="text-cyan-400 font-mono">{arData.bearing}°</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">ACTIVE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection line to rover */}
            <div className="absolute top-full left-1/2 w-px h-8 bg-cyan-400/50"></div>
          </div>
        )}

        {/* Environmental data overlay */}
        <Card className="absolute top-4 left-4 bg-black/80 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-3">
            <h3 className="text-xs text-cyan-400 font-mono mb-2">ENVIRONMENTAL</h3>
            <div className="space-y-1 text-xs text-white">
              <div className="flex items-center gap-2">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span>-15°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-3 h-3 text-blue-400" />
                <span>12 km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-yellow-400" />
                <span>Sol 4156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device orientation debug (development) */}
        <Card className="absolute top-4 right-4 bg-black/80 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-3">
            <h3 className="text-xs text-cyan-400 font-mono mb-2">ORIENTATION</h3>
            <div className="space-y-1 text-xs text-white font-mono">
              <div>α: {deviceOrientation.alpha.toFixed(1)}°</div>
              <div>β: {deviceOrientation.beta.toFixed(1)}°</div>
              <div>γ: {deviceOrientation.gamma.toFixed(1)}°</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AR Controls */}
      <div className="absolute bottom-4 inset-x-4 pointer-events-auto">
        <div className="flex items-center justify-between">
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="bg-black/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
            data-testid="button-ar-exit"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Exit AR
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="bg-black/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              data-testid="button-ar-recalibrate"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AR Instructions */}
      <Card className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 border-cyan-500/30 backdrop-blur-sm pointer-events-auto">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-white">
            Point your device toward Mars to locate the rover
          </p>
          <p className="text-xs text-cyan-400 mt-1">
            {arData.visible ? 'Rover in view' : 'Rover out of view - rotate device'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}