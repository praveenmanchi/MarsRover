import { apiRequest } from "./queryClient";

export class NASAApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "NASAApiError";
  }
}

export async function fetchRovers() {
  const response = await apiRequest("GET", "/api/rovers");
  return response.json();
}

export async function fetchRover(name: string) {
  const response = await apiRequest("GET", `/api/rovers/${name}`);
  return response.json();
}

export async function fetchRoverPhotos(
  roverName: string, 
  options: {
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  } = {}
) {
  const params = new URLSearchParams();
  
  if (options.sol) params.append('sol', options.sol.toString());
  if (options.earth_date) params.append('earth_date', options.earth_date);
  if (options.camera) params.append('camera', options.camera);
  if (options.page) params.append('page', options.page.toString());
  
  const url = `/api/rovers/${roverName}/photos${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function fetchLatestRoverPhotos(roverName: string) {
  const response = await apiRequest("GET", `/api/rovers/${roverName}/latest_photos`);
  return response.json();
}

export async function fetchPhoto(id: string) {
  const response = await apiRequest("GET", `/api/photos/${id}`);
  return response.json();
}

export async function clearRoverCache(roverName: string) {
  const response = await apiRequest("DELETE", `/api/rovers/${roverName}/cache`);
  return response.json();
}
