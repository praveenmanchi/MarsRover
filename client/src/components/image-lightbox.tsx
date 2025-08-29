import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { ROVER_POSITIONS } from "@/types/rover";
import type { RoverPhoto } from "@/types/rover";

interface ImageLightboxProps {
  photo: RoverPhoto;
  onClose: () => void;
}

export function ImageLightbox({ photo, onClose }: ImageLightboxProps) {
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = photo.imgSrc;
    link.download = `mars_${photo.roverName}_sol_${photo.sol}_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mars Photo from ${photo.roverName}`,
          text: `Photo taken by ${photo.cameraFullName} on Sol ${photo.sol}`,
          url: photo.imgSrc,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(photo.imgSrc);
    }
  };

  const roverPosition = ROVER_POSITIONS[photo.roverName];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="lightbox-image"
    >
      {/* Image Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative max-w-full max-h-full">
          {imageError ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Failed to load image</p>
              <p className="text-sm text-muted-foreground mt-2">Image may not be available</p>
            </div>
          ) : (
            <img 
              src={photo.imgSrc}
              alt={`Mars surface - ${photo.cameraFullName}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={() => setImageError(true)}
              data-testid="lightbox-main-image"
            />
          )}
          
          {/* Navigation arrows - TODO: Implement navigation between photos */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            data-testid="button-previous-image"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            data-testid="button-next-image"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Image Metadata Panel */}
      <div className="w-80 bg-card text-card-foreground overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Image Details</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-lightbox"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Image ID</label>
              <p className="font-mono text-sm" data-testid="text-image-id">{photo.id}</p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Camera</label>
              <p className="font-semibold" data-testid="text-camera-name">{photo.cameraFullName}</p>
              <p className="text-sm text-muted-foreground">{photo.cameraName}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Rover</label>
              <div className="flex items-center space-x-2">
                <p className="font-semibold capitalize" data-testid="text-rover-name">{photo.roverName}</p>
                <Badge variant="outline">ID: {photo.roverId}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Sol</label>
                <p className="font-mono" data-testid="text-photo-sol">{photo.sol}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Earth Date</label>
                <p className="font-mono text-sm" data-testid="text-photo-earth-date">{photo.earthDate}</p>
              </div>
            </div>
            
            {roverPosition && (
              <div>
                <label className="text-sm text-muted-foreground">Rover Position</label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="font-mono" data-testid="text-photo-lat">
                      {Math.abs(roverPosition.lat).toFixed(4)}°{roverPosition.lat < 0 ? 'S' : 'N'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="font-mono" data-testid="text-photo-lon">
                      {Math.abs(roverPosition.lon).toFixed(4)}°{roverPosition.lon < 0 ? 'W' : 'E'}
                    </span>
                  </div>
                  {roverPosition.elevation && (
                    <div className="flex justify-between">
                      <span>Elevation:</span>
                      <span className="font-mono">{roverPosition.elevation}m</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm text-muted-foreground">Image Details</label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-mono">JPEG</span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-mono text-xs">NASA/JPL-Caltech</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Button 
                onClick={handleDownload}
                className="w-full"
                data-testid="button-download-image"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </Button>
              <Button 
                onClick={handleShare}
                variant="secondary"
                className="w-full"
                data-testid="button-share-image"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
