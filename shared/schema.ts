import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  returnDate: timestamp("return_date"),
  passengers: integer("passengers").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  serviceType: text("service_type").notNull(), // "one_way" | "round_trip"
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }).notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "sedan" | "suv" | "van" | "bus"
  capacity: integer("capacity").notNull(),
  luggageCapacity: integer("luggage_capacity").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  imageUrl: text("image_url"),
  available: boolean("available").default(true),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  includes: json("includes").$type<string[]>().notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // "adventure" | "cultural" | "beach" | "nature"
  popular: boolean("popular").default(false),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerInitials: text("customer_initials").notNull(),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  date: text("date").notNull(),
  verified: boolean("verified").default(true),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  serviceInterest: text("service_interest").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("new"), // "new" | "contacted" | "resolved"
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Tour = typeof tours.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
