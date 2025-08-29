import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Satellite, 
  Database, 
  ExternalLink,
  Image,
  FileText,
  Calendar
} from 'lucide-react';

interface OrbitalDataPanelProps {
  selectedLocation: { lat: number; lon: number } | null;
  className?: string;
}

// Simulated HiRISE/MRO data based on location
const getOrbitalData = (location: { lat: number; lon: number } | null) => {
  if (!location) return null;
  
  const lat = location.lat;
  const lon = location.lon;
  
  return {
    hiRiseImages: Math.floor(Math.random() * 15) + 5,
    ctxImages: Math.floor(Math.random() * 25) + 10,
    mroObservations: Math.floor(Math.random() * 50) + 20,
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    resolution: '25 cm/pixel (HiRISE)',
    coverage: `${(Math.random() * 10 + 5).toFixed(1)} km²`,
    dataSize: `${(Math.random() * 500 + 100).toFixed(0)} MB`,
    coordinates: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`
  };
};

export function OrbitalDataPanel({ selectedLocation, className }: OrbitalDataPanelProps) {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orbitalData, setOrbitalData] = useState<any>(null);

  useEffect(() => {
    if (selectedLocation) {
      setOrbitalData(getOrbitalData(selectedLocation));
    }
  }, [selectedLocation]);

  const handleDownloadOrbitalData = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsDownloading(false);
          
          // Create and download the orbital data file
          const orbitalDataFile = {
            metadata: {
              title: "Mars Orbital Imagery Collection",
              location: orbitalData?.coordinates,
              generated: new Date().toISOString(),
              source: "NASA/JPL HiRISE & MRO Missions"
            },
            datasets: {
              hirise: {
                images: orbitalData?.hiRiseImages,
                resolution: "25-30 cm/pixel",
                mission: "Mars Reconnaissance Orbiter",
                instrument: "HiRISE Camera",
                dataPortal: "https://hirise.lpl.arizona.edu/",
                downloadInstructions: "Search by coordinates and download directly from NASA/JPL archives"
              },
              mroCtx: {
                images: orbitalData?.ctxImages,
                resolution: "6 m/pixel", 
                mission: "Mars Reconnaissance Orbiter",
                instrument: "Context Camera (CTX)",
                dataPortal: "https://www.malin.com/ctx/",
                downloadInstructions: "Free access through USGS Astrogeology portal"
              },
              accessInformation: {
                portalUrls: [
                  "https://pds-imaging.jpl.nasa.gov/",
                  "https://astrogeology.usgs.gov/",
                  "https://hirise.lpl.arizona.edu/",
                  "https://www.malin.com/ctx/"
                ],
                dataFormats: ["IMG", "JP2", "TIFF", "PDS"],
                freeAccess: true,
                registrationRequired: false
              }
            }
          };

          const blob = new Blob([JSON.stringify(orbitalDataFile, null, 2)], {
            type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mars_orbital_data_${orbitalData?.coordinates.replace(/[°,\s]/g, '_')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  if (!selectedLocation || !orbitalData) {
    return (
      <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-cyan-400 font-mono flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            ORBITAL DATA ACCESS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-gray-400 py-4">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Click map location to access<br/>NASA orbital imagery</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-cyan-400 font-mono flex items-center gap-2">
          <Satellite className="w-4 h-4" />
          NASA ORBITAL DATA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Location Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Location:</span>
            <span className="font-mono text-cyan-400">{orbitalData.coordinates}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Coverage:</span>
            <span className="font-mono text-green-400">{orbitalData.coverage}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Resolution:</span>
            <span className="font-mono text-orange-400">{orbitalData.resolution}</span>
          </div>
        </div>

        {/* Available Datasets */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-gray-300 border-b border-gray-700 pb-1">
            AVAILABLE DATASETS
          </h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-300">HiRISE Images</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {orbitalData.hiRiseImages}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-300">CTX Images</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {orbitalData.ctxImages}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-300">MRO Observations</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {orbitalData.mroObservations}
            </Badge>
          </div>
        </div>

        {/* Data Access Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Est. Size:</span>
            <span className="font-mono text-purple-400">{orbitalData.dataSize}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Last Updated:</span>
            <span className="font-mono text-gray-400">
              {orbitalData.lastUpdated.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Download Progress */}
        {isDownloading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-400">Preparing download...</span>
              <span className="font-mono text-cyan-400">{downloadProgress.toFixed(0)}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleDownloadOrbitalData}
            disabled={isDownloading}
            size="sm"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
            data-testid="button-download-orbital-data"
          >
            <Download className="w-3 h-3 mr-2" />
            {isDownloading ? 'Preparing...' : 'Download Data Info'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => window.open('https://hirise.lpl.arizona.edu/', '_blank')}
              variant="outline"
              size="sm"
              className="text-xs bg-black/50 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              data-testid="button-hirise-portal"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              HiRISE
            </Button>
            
            <Button
              onClick={() => window.open('https://astrogeology.usgs.gov/', '_blank')}
              variant="outline"
              size="sm"
              className="text-xs bg-black/50 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              data-testid="button-usgs-portal"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              USGS
            </Button>
          </div>
        </div>

        {/* Free Access Notice */}
        <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
            <div className="text-xs text-green-300">
              <strong>Free Access:</strong> All NASA Mars orbital imagery is available for free download through official data portals. No registration required.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}