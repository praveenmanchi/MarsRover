import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoverPhoto } from "@/types/rover";

interface ImageGalleryProps {
  photos: RoverPhoto[];
  isLoading: boolean;
  onPhotoSelect: (photo: RoverPhoto) => void;
  selectedSol: number;
}

export function ImageGallery({ photos, isLoading, onPhotoSelect, selectedSol }: ImageGalleryProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg" data-testid="gallery-loading">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Latest Images</h4>
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
          <div className="mt-3">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!photos.length) {
    return (
      <Card className="shadow-lg" data-testid="gallery-empty">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Latest Images</h4>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No images available</p>
            <p className="text-xs text-muted-foreground">Try selecting a different rover or sol</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayPhotos = photos.slice(0, 3);

  return (
    <Card className="shadow-lg" data-testid="gallery-images">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Latest Images</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary hover:text-primary/80"
            data-testid="button-view-all"
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPhotoSelect(photo)}
              data-testid={`image-gallery-${index}`}
            >
              <img 
                src={photo.imgSrc} 
                alt={`Mars surface - ${photo.cameraFullName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for broken images
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`;
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <p data-testid="text-photo-count">{photos.length} images</p>
          <p data-testid="text-sol-date">Sol {selectedSol} • Earth Date: {photos[0]?.earthDate || 'Unknown'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
