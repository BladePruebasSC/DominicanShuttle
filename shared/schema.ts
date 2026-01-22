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
  originPlaceId: text("origin_place_id"),
  destinationPlaceId: text("destination_place_id"),
  originCoords: json("origin_coords").$type<{ lat: number; lng: number }>(),
  destinationCoords: json("destination_coords").$type<{ lat: number; lng: number }>(),
  pickupDate: timestamp("pickup_date").notNull(),
  returnDate: timestamp("return_date"),
  passengers: integer("passengers").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  serviceType: text("service_type").notNull(), // "one_way" | "round_trip"
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  paymentStatus: text("payment_status").default("pending"), // "pending" | "paid" | "refunded" | "failed"
  paymentMethod: text("payment_method"),
  vehicleId: text("vehicle_id"),
  driverId: text("driver_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "sedan" | "suv" | "van" | "bus"
  capacity: integer("capacity").notNull(),
  luggageCapacity: integer("luggage_capacity").notNull(),
  capacityText: text("capacity_text"),
  luggageText: text("luggage_text"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  imageUrl: text("image_url"),
  licensePlate: text("license_plate"),
  year: integer("year"),
  color: text("color"),
  available: boolean("available").default(true),
  driverId: text("driver_id"),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  includes: json("includes").$type<string[]>().notNull(),
  highlights: json("highlights").$type<string[]>(),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // "adventure" | "cultural" | "beach" | "nature" | "city"
  popular: boolean("popular").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviews: integer("reviews"),
  maxParticipants: integer("max_participants"),
  minParticipants: integer("min_participants"),
  difficultyLevel: text("difficulty_level"), // "easy" | "medium" | "hard"
  isActive: boolean("is_active").default(true),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerInitials: text("customer_initials").notNull(),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  date: text("date").notNull(),
  verified: boolean("verified").default(true),
  source: text("source"), // "Google" | "TripAdvisor" | "Facebook" | "Other"
  bookingId: text("booking_id"),
  isFeatured: boolean("is_featured").default(false),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  serviceInterest: text("service_interest").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"), // "new" | "contacted" | "resolved" | "closed"
  priority: text("priority").default("normal"), // "low" | "normal" | "high" | "urgent"
  assignedTo: text("assigned_to"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourReviews = pgTable("tour_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: text("tour_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  verified: boolean("verified").default(false),
  source: text("source").default("website"), // "website" | "Google" | "TripAdvisor" | "Facebook"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourBookings = pgTable("tour_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: text("tour_id").notNull(),
  tourName: text("tour_name").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  tourDate: timestamp("tour_date").notNull(),
  participants: integer("participants").notNull().default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "completed" | "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export const insertTourReviewSchema = createInsertSchema(tourReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTourBookingSchema = createInsertSchema(tourBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type InsertTour = z.infer<typeof insertTourSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertTourReview = z.infer<typeof insertTourReviewSchema>;
export type TourReview = typeof tourReviews.$inferSelect;
export type InsertTourBooking = z.infer<typeof insertTourBookingSchema>;
export type TourBooking = typeof tourBookings.$inferSelect;