import { type Rover, type InsertRover, type RoverPhoto, type InsertRoverPhoto } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Rover methods
  getRover(name: string): Promise<Rover | undefined>;
  getAllRovers(): Promise<Rover[]>;
  createRover(rover: InsertRover): Promise<Rover>;
  updateRover(id: string, rover: Partial<InsertRover>): Promise<Rover | undefined>;
  
  // Photo methods
  getRoverPhotos(roverName: string, sol?: number, earthDate?: string, limit?: number): Promise<RoverPhoto[]>;
  getLatestPhotos(roverName: string, limit?: number): Promise<RoverPhoto[]>;
  createRoverPhoto(photo: InsertRoverPhoto): Promise<RoverPhoto>;
  getPhotoById(id: string): Promise<RoverPhoto | undefined>;
  
  // Cache methods
  clearPhotoCache(roverName: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private rovers: Map<string, Rover>;
  private photos: Map<string, RoverPhoto>;

  constructor() {
    this.rovers = new Map();
    this.photos = new Map();
    this.initializeDefaultRovers();
  }

  private initializeDefaultRovers() {
    const defaultRovers: Rover[] = [
      {
        id: "perseverance",
        name: "perseverance",
        status: "active",
        landingDate: "2021-02-18",
        launchDate: "2020-07-30",
        maxSol: 4200,
        maxDate: "2024-12-22",
        totalPhotos: 0,
        location: "Jezero Crater",
        lastUpdated: new Date(),
      },
      {
        id: "curiosity",
        name: "curiosity",
        status: "active",
        landingDate: "2012-08-05",
        launchDate: "2011-11-26",
        maxSol: 4400,
        maxDate: "2024-12-22",
        totalPhotos: 0,
        location: "Gale Crater",
        lastUpdated: new Date(),
      },
      {
        id: "opportunity",
        name: "opportunity",
        status: "inactive",
        landingDate: "2004-01-25",
        launchDate: "2003-07-07",
        maxSol: 5352,
        maxDate: "2018-06-10",
        totalPhotos: 0,
        location: "Meridiani Planum",
        lastUpdated: new Date(),
      },
      {
        id: "spirit",
        name: "spirit",
        status: "inactive",
        landingDate: "2004-01-04",
        launchDate: "2003-06-10",
        maxSol: 2210,
        maxDate: "2010-03-22",
        totalPhotos: 0,
        location: "Gusev Crater",
        lastUpdated: new Date(),
      },
    ];

    defaultRovers.forEach(rover => {
      this.rovers.set(rover.name, rover);
    });
  }

  async getRover(name: string): Promise<Rover | undefined> {
    return this.rovers.get(name);
  }

  async getAllRovers(): Promise<Rover[]> {
    return Array.from(this.rovers.values());
  }

  async createRover(insertRover: InsertRover): Promise<Rover> {
    const id = insertRover.id || randomUUID();
    const rover: Rover = { 
      ...insertRover, 
      id,
      lastUpdated: new Date(),
    };
    this.rovers.set(rover.name, rover);
    return rover;
  }

  async updateRover(id: string, updateData: Partial<InsertRover>): Promise<Rover | undefined> {
    const existing = Array.from(this.rovers.values()).find(r => r.id === id);
    if (!existing) return undefined;

    const updated: Rover = {
      ...existing,
      ...updateData,
      id: existing.id,
      lastUpdated: new Date(),
    };
    
    this.rovers.set(updated.name, updated);
    return updated;
  }

  async getRoverPhotos(roverName: string, sol?: number, earthDate?: string, limit = 50): Promise<RoverPhoto[]> {
    const photos = Array.from(this.photos.values())
      .filter(photo => {
        if (photo.roverName !== roverName) return false;
        if (sol !== undefined && photo.sol !== sol) return false;
        if (earthDate && photo.earthDate !== earthDate) return false;
        return true;
      })
      .sort((a, b) => b.sol - a.sol)
      .slice(0, limit);

    return photos;
  }

  async getLatestPhotos(roverName: string, limit = 25): Promise<RoverPhoto[]> {
    const photos = Array.from(this.photos.values())
      .filter(photo => photo.roverName === roverName)
      .sort((a, b) => b.sol - a.sol)
      .slice(0, limit);

    return photos;
  }

  async createRoverPhoto(insertPhoto: InsertRoverPhoto): Promise<RoverPhoto> {
    const photo: RoverPhoto = {
      ...insertPhoto,
      createdAt: new Date(),
    };
    this.photos.set(photo.id, photo);
    return photo;
  }

  async getPhotoById(id: string): Promise<RoverPhoto | undefined> {
    return this.photos.get(id);
  }

  async clearPhotoCache(roverName: string): Promise<void> {
    const keysToDelete = Array.from(this.photos.keys())
      .filter(key => this.photos.get(key)?.roverName === roverName);
    
    keysToDelete.forEach(key => this.photos.delete(key));
  }
}

export const storage = new MemStorage();
