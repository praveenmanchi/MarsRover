import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roverPhotos = pgTable("rover_photos", {
  id: varchar("id").primaryKey(),
  roverId: varchar("rover_id").notNull(),
  roverName: text("rover_name").notNull(),
  sol: integer("sol").notNull(),
  earthDate: text("earth_date").notNull(),
  imgSrc: text("img_src").notNull(),
  cameraId: integer("camera_id").notNull(),
  cameraName: text("camera_name").notNull(),
  cameraFullName: text("camera_full_name").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const rovers = pgTable("rovers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull(),
  landingDate: text("landing_date").notNull(),
  launchDate: text("launch_date").notNull(),
  maxSol: integer("max_sol").notNull(),
  maxDate: text("max_date").notNull(),
  totalPhotos: integer("total_photos").notNull(),
  location: text("location").notNull(),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const insertRoverPhotoSchema = createInsertSchema(roverPhotos).omit({
  createdAt: true,
});

export const insertRoverSchema = createInsertSchema(rovers).omit({
  lastUpdated: true,
});

export type InsertRoverPhoto = z.infer<typeof insertRoverPhotoSchema>;
export type RoverPhoto = typeof roverPhotos.$inferSelect;
export type InsertRover = z.infer<typeof insertRoverSchema>;
export type Rover = typeof rovers.$inferSelect;

// NASA API response types
export const nasaPhotoSchema = z.object({
  id: z.number(),
  sol: z.number(),
  earth_date: z.string(),
  img_src: z.string(),
  camera: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    rover_id: z.number(),
  }),
  rover: z.object({
    id: z.number(),
    name: z.string(),
    landing_date: z.string(),
    launch_date: z.string(),
    status: z.string(),
  }),
});

export const nasaPhotosResponseSchema = z.object({
  photos: z.array(nasaPhotoSchema),
});

export const nasaLatestPhotosResponseSchema = z.object({
  latest_photos: z.array(nasaPhotoSchema),
});

export type NasaPhoto = z.infer<typeof nasaPhotoSchema>;
export type NasaPhotosResponse = z.infer<typeof nasaPhotosResponseSchema>;
export type NasaLatestPhotosResponse = z.infer<typeof nasaLatestPhotosResponseSchema>;
