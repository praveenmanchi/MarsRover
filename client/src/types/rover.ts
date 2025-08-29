export interface RoverPosition {
  lat: number;
  lon: number;
  elevation?: number;
}

export interface RoverCamera {
  id: number;
  name: string;
  full_name: string;
  rover_id: number;
}

export interface RoverPhoto {
  id: string;
  roverId: string;
  roverName: string;
  sol: number;
  earthDate: string;
  imgSrc: string;
  cameraId: number;
  cameraName: string;
  cameraFullName: string;
  metadata?: {
    rover: any;
    camera: any;
  };
  createdAt?: Date;
}

export interface Rover {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  landingDate: string;
  launchDate: string;
  maxSol: number;
  maxDate: string;
  totalPhotos: number;
  location: string;
  lastUpdated?: Date;
}

export interface RoverStats {
  currentSol: number;
  distanceDriven: string;
  totalDistance: string;
  samplesCollected?: number;
  lastContact: string;
}

// Known rover positions (approximate coordinates)
export const ROVER_POSITIONS: Record<string, RoverPosition> = {
  perseverance: {
    lat: 18.4447,
    lon: 77.4508,
    elevation: -2574,
  },
  curiosity: {
    lat: -4.5895,
    lon: 137.4417,
    elevation: -4505,
  },
  opportunity: {
    lat: -1.9462,
    lon: 354.4734,
    elevation: 1116,
  },
  spirit: {
    lat: -14.5684,
    lon: 175.4726,
    elevation: -1944,
  },
};
