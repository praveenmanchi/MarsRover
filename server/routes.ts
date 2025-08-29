import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRoverPhotoSchema, nasaPhotosResponseSchema, nasaLatestPhotosResponseSchema } from "@shared/schema";
import { z } from "zod";

const NASA_API_BASE = "https://api.nasa.gov/mars-photos/api/v1";
const NASA_API_KEY = process.env.NASA_API_KEY || process.env.VITE_NASA_API_KEY || "DEMO_KEY";

async function fetchFromNASA(url: string) {
  const response = await fetch(`${NASA_API_BASE}${url}${url.includes('?') ? '&' : '?'}api_key=${NASA_API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all rovers
  app.get("/api/rovers", async (req, res) => {
    try {
      const rovers = await storage.getAllRovers();
      res.json(rovers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rovers" });
    }
  });

  // Get specific rover
  app.get("/api/rovers/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const rover = await storage.getRover(name);
      
      if (!rover) {
        return res.status(404).json({ error: "Rover not found" });
      }
      
      res.json(rover);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rover" });
    }
  });

  // Get rover photos by sol or earth date
  app.get("/api/rovers/:name/photos", async (req, res) => {
    try {
      const { name } = req.params;
      const { sol, earth_date, page = "1", camera } = req.query;
      
      // Check if rover exists
      const rover = await storage.getRover(name);
      if (!rover) {
        return res.status(404).json({ error: "Rover not found" });
      }

      // First try to get cached photos
      const cachedPhotos = await storage.getRoverPhotos(name, sol ? parseInt(sol as string) : undefined, earth_date as string);
      
      if (cachedPhotos.length > 0) {
        return res.json({ photos: cachedPhotos });
      }

      try {
        // Build NASA API URL
        let apiUrl = `/rovers/${name}/photos`;
        const params = new URLSearchParams();
        
        if (sol) params.append('sol', sol as string);
        if (earth_date) params.append('earth_date', earth_date as string);
        if (camera) params.append('camera', camera as string);
        if (page) params.append('page', page as string);
        
        if (params.toString()) {
          apiUrl += `?${params.toString()}`;
        }

        // Fetch from NASA API
        const nasaData = await fetchFromNASA(apiUrl);
        const validatedData = nasaPhotosResponseSchema.parse(nasaData);

        // Cache photos in storage
        const newCachedPhotos = await Promise.all(
          validatedData.photos.map(async (nasaPhoto) => {
            const photoData = {
              id: nasaPhoto.id.toString(),
              roverId: nasaPhoto.rover.id.toString(),
              roverName: nasaPhoto.rover.name.toLowerCase(),
              sol: nasaPhoto.sol,
              earthDate: nasaPhoto.earth_date,
              imgSrc: nasaPhoto.img_src,
              cameraId: nasaPhoto.camera.id,
              cameraName: nasaPhoto.camera.name,
              cameraFullName: nasaPhoto.camera.full_name,
              metadata: {
                rover: nasaPhoto.rover,
                camera: nasaPhoto.camera,
              },
            };

            try {
              return await storage.createRoverPhoto(photoData);
            } catch (error) {
              // Photo might already exist, return the existing one
              return photoData;
            }
          })
        );

        res.json({ photos: newCachedPhotos });
      } catch (apiError) {
        // If NASA API fails, return empty photos array (fallback)
        console.warn("NASA API error, using fallback data:", apiError);
        res.json({ photos: [] });
      }
    } catch (error) {
      console.error("Error fetching rover photos:", error);
      res.status(500).json({ error: "Failed to fetch rover photos" });
    }
  });

  // Get latest rover photos
  app.get("/api/rovers/:name/latest_photos", async (req, res) => {
    try {
      const { name } = req.params;
      
      // Check if rover exists
      const rover = await storage.getRover(name);
      if (!rover) {
        return res.status(404).json({ error: "Rover not found" });
      }

      // First try to get cached latest photos
      const cachedPhotos = await storage.getLatestPhotos(name);
      
      if (cachedPhotos.length > 0) {
        return res.json({ latest_photos: cachedPhotos });
      }

      try {
        // Fetch from NASA API
        const nasaData = await fetchFromNASA(`/rovers/${name}/latest_photos`);
        const validatedData = nasaLatestPhotosResponseSchema.parse(nasaData);

        // Cache photos in storage
        const newCachedPhotos = await Promise.all(
          validatedData.latest_photos.map(async (nasaPhoto) => {
            const photoData = {
              id: nasaPhoto.id.toString(),
              roverId: nasaPhoto.rover.id.toString(),
              roverName: nasaPhoto.rover.name.toLowerCase(),
              sol: nasaPhoto.sol,
              earthDate: nasaPhoto.earth_date,
              imgSrc: nasaPhoto.img_src,
              cameraId: nasaPhoto.camera.id,
              cameraName: nasaPhoto.camera.name,
              cameraFullName: nasaPhoto.camera.full_name,
              metadata: {
                rover: nasaPhoto.rover,
                camera: nasaPhoto.camera,
              },
            };

            try {
              return await storage.createRoverPhoto(photoData);
            } catch (error) {
              // Photo might already exist, return the existing one
              return photoData;
            }
          })
        );

        res.json({ latest_photos: newCachedPhotos });
      } catch (apiError) {
        // If NASA API fails, return cached photos as fallback
        console.warn("NASA API error, using cached data:", apiError);
        const fallbackPhotos = await storage.getLatestPhotos(name);
        res.json({ latest_photos: fallbackPhotos });
      }
    } catch (error) {
      console.error("Error fetching latest rover photos:", error);
      res.status(500).json({ error: "Failed to fetch latest rover photos" });
    }
  });

  // Get specific photo
  app.get("/api/photos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const photo = await storage.getPhotoById(id);
      
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  // Clear photo cache for a rover
  app.delete("/api/rovers/:name/cache", async (req, res) => {
    try {
      const { name } = req.params;
      await storage.clearPhotoCache(name);
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
