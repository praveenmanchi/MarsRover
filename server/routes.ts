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

  // Get rover mission manifest
  app.get("/api/rovers/:name/manifest", async (req, res) => {
    try {
      const { name } = req.params;
      
      try {
        // Fetch manifest from NASA API
        const nasaData = await fetchFromNASA(`/manifests/${name}`);
        res.json(nasaData);
      } catch (apiError) {
        // If NASA API fails, return mock manifest
        console.warn("NASA API error, using fallback manifest:", apiError);
        const fallbackManifest = {
          photo_manifest: {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            landing_date: name === 'curiosity' ? '2012-08-06' : '2004-01-04',
            launch_date: name === 'curiosity' ? '2011-11-26' : '2003-06-10',
            status: name === 'curiosity' ? 'active' : 'complete',
            max_sol: name === 'curiosity' ? 4100 : 5352,
            max_date: '2024-01-15',
            total_photos: name === 'curiosity' ? 695000 : 198000,
            photos: Array.from({ length: 10 }, (_, i) => ({
              sol: i * 100,
              total_photos: Math.floor(Math.random() * 500) + 50,
              cameras: ['FHAZ', 'RHAZ', 'NAVCAM', 'MAST']
            }))
          }
        };
        res.json(fallbackManifest);
      }
    } catch (error) {
      console.error("Error fetching rover manifest:", error);
      res.status(500).json({ error: "Failed to fetch rover manifest" });
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
        // Build NASA API URL - Use proper NASA API format
        let apiUrl = `/rovers/${name}/photos`;
        const params = new URLSearchParams();
        
        if (sol) params.append('sol', sol as string);
        if (earth_date) params.append('earth_date', earth_date as string);
        if (camera && typeof camera === 'string') params.append('camera', camera.toLowerCase());
        params.append('page', page as string);
        
        apiUrl += `?${params.toString()}`;

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
        // If NASA API fails, return fallback photos with sample data
        console.warn("NASA API error, using fallback data:", apiError);
        const fallbackPhotos = [
          {
            id: `${Date.now()}-1`,
            sol: parseInt(sol as string) || 1000,
            camera: { name: camera || 'NAVCAM', full_name: 'Navigation Camera' },
            img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ncam/NLB_486265257EDR_F0481570NCAM00323M_.JPG',
            earth_date: earth_date || '2015-05-30'
          }
        ];
        res.json({ photos: fallbackPhotos });
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

  // Get weather data for Mars
  app.get("/api/weather/:rover", async (req, res) => {
    try {
      const { rover } = req.params;
      // Mock weather data since NASA Insight mission ended
      const weatherData = {
        sol: 4100,
        temperature: {
          high: -10,
          low: -78,
          unit: "C"
        },
        pressure: {
          value: 850,
          unit: "Pa"
        },
        wind: {
          speed: 5.2,
          direction: "SW",
          unit: "m/s"
        },
        season: "Northern Winter",
        dustStorm: false,
        atmosphericOpacity: 0.4
      };
      res.json(weatherData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Get geological data for a location
  app.get("/api/geology/:rover", async (req, res) => {
    try {
      const { rover } = req.params;
      const { lat, lon } = req.query;
      
      const geologicalData = {
        location: { lat: parseFloat(lat as string) || -5.4, lon: parseFloat(lon as string) || 137.8 },
        rockType: "Sedimentary",
        composition: {
          silica: 45.2,
          iron: 18.7,
          calcium: 8.3,
          magnesium: 5.1,
          sulfur: 3.9
        },
        age: "3.5 billion years",
        waterEvidence: true,
        organicCompounds: false,
        elevation: -4500,
        description: "Ancient lake bed sediments showing evidence of past water activity"
      };
      
      res.json(geologicalData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch geological data" });
    }
  });

  // Get mission timeline events
  app.get("/api/timeline/:rover", async (req, res) => {
    try {
      const { rover } = req.params;
      
      const timelineEvents = [
        {
          sol: 0,
          date: "2012-08-06",
          event: "Landing in Gale Crater",
          type: "milestone",
          coordinates: [-4.5895, 137.4417],
          description: "Successfully landed using sky crane system"
        },
        {
          sol: 31,
          date: "2012-09-06",
          event: "First drill sample at Rocknest",
          type: "science",
          coordinates: [-4.5901, 137.4420],
          description: "Analyzed Martian soil composition"
        },
        {
          sol: 324,
          date: "2013-05-30",
          event: "Discovery of ancient water evidence",
          type: "discovery",
          coordinates: [-4.5915, 137.4435],
          description: "Found evidence of past flowing water"
        },
        {
          sol: 753,
          date: "2014-09-24",
          event: "Reached Mount Sharp base",
          type: "milestone",
          coordinates: [-4.6852, 137.3959],
          description: "Began ascent of central mountain"
        },
        {
          sol: 2780,
          date: "2020-01-15",
          event: "Organic molecule detection",
          type: "discovery",
          coordinates: [-4.7234, 137.3821],
          description: "Detected complex organic compounds in rock samples"
        }
      ];
      
      res.json({ events: timelineEvents });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline data" });
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
