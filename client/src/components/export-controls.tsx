import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage, FileText, Share2, Camera, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportControlsProps {
  roverData?: any;
  currentPhotos?: any[];
  mapRef?: React.RefObject<any>;
  className?: string;
}

export function ExportControls({ roverData, currentPhotos, mapRef, className }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>("");
  const { toast } = useToast();

  const handleExportPhotos = async () => {
    if (!currentPhotos || currentPhotos.length === 0) {
      toast({
        title: "No photos to export",
        description: "Please load some photos first",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      // Create a JSON file with photo metadata
      const exportData = {
        export_date: new Date().toISOString(),
        rover: roverData?.name || 'curiosity',
        total_photos: currentPhotos.length,
        photos: currentPhotos.map(photo => ({
          id: photo.id,
          sol: photo.sol,
          earth_date: photo.earthDate || photo.earth_date,
          camera: photo.cameraName || photo.camera?.name,
          img_src: photo.imgSrc || photo.img_src
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mars-rover-photos-${roverData?.name || 'curiosity'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Photos exported successfully",
        description: `Exported ${currentPhotos.length} photos metadata`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export photos",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMap = async () => {
    setIsExporting(true);
    try {
      // Capture map screenshot (simplified version)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      canvas.width = 1200;
      canvas.height = 800;
      
      // Simple map export - in a real app, you'd capture the actual map
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22d3ee';
      ctx.font = '20px monospace';
      ctx.fillText('Mars Rover Mission Map', 50, 50);
      ctx.fillText(`Rover: ${roverData?.name || 'Curiosity'}`, 50, 80);
      ctx.fillText(`Export Date: ${new Date().toLocaleDateString()}`, 50, 110);

      // Draw a simple representation
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(600, 400, 200, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(590, 390, 20, 20);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mars-map-${roverData?.name || 'curiosity'}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Map exported successfully",
          description: "Map screenshot saved to downloads"
        });
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export map",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const reportData = `
# Mars Rover Mission Report
**Generated:** ${new Date().toLocaleString()}
**Rover:** ${roverData?.name || 'Curiosity'}

## Mission Statistics
- **Status:** ${roverData?.status || 'Active'}
- **Landing Date:** ${roverData?.landing_date || '2012-08-06'}
- **Total Photos:** ${currentPhotos?.length || 0} (current session)

## Current Location
- **Latitude:** -5.4°
- **Longitude:** 137.8°
- **Elevation:** -4,500m

## Recent Activity
${currentPhotos?.slice(0, 10).map(photo => 
  `- SOL ${photo.sol || 'N/A'}: ${photo.camera?.full_name || photo.cameraFullName || 'Camera'} image captured`
).join('\\n') || 'No recent photos'}

---
*Report generated by Mars Rover Mission Control*
`;

      const blob = new Blob([reportData], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission-report-${roverData?.name || 'curiosity'}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report exported successfully",
        description: "Mission report saved to downloads"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Mars Rover ${roverData?.name || 'Curiosity'} Mission`,
      text: `Check out the current mission status of NASA's ${roverData?.name || 'Curiosity'} rover on Mars!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Mission link shared"
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Mission URL copied to clipboard"
      });
    }
  };

  return (
    <Card className={`bg-black/90 border-cyan-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          EXPORT & SHARE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono"
              data-testid="button-export-photos"
            >
              <FileImage className="w-4 h-4 mr-2" />
              Export Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-mono">Export Photos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="bg-black border-cyan-500/30 text-white">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-cyan-500/30">
                  <SelectItem value="json">JSON Metadata</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="txt">Text List</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportPhotos}
                disabled={isExporting}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-confirm-export-photos"
              >
                {isExporting ? 'Exporting...' : `Export ${currentPhotos?.length || 0} Photos`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono"
          onClick={handleExportMap}
          disabled={isExporting}
          data-testid="button-export-map"
        >
          <Map className="w-4 h-4 mr-2" />
          Export Map
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono"
          onClick={handleExportReport}
          disabled={isExporting}
          data-testid="button-export-report"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 font-mono"
          onClick={handleShare}
          data-testid="button-share-mission"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Mission
        </Button>
      </CardContent>
    </Card>
  );
}