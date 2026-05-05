import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBookingSchema,
  insertContactMessageSchema,
  insertTourBookingSchema,
  insertTourSchema,
  insertVehicleSchema,
  insertTestimonialSchema,
} from "@shared/schema";
import { notificationService } from "./notifications";
import { z } from "zod";
import { getSupabaseAdmin } from "./supabase-admin";
import { emitAutomationEvent, getAutomationInboundSecret } from "./zapier";

function mapBookingRow(row: any) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    origin: row.origin,
    destination: row.destination,
    originPlaceId: row.origin_place_id ?? null,
    destinationPlaceId: row.destination_place_id ?? null,
    originCoords: row.origin_coords ?? null,
    destinationCoords: row.destination_coords ?? null,
    pickupDate: row.pickup_date,
    returnDate: row.return_date ?? null,
    passengers: row.passengers,
    vehicleType: row.vehicle_type,
    serviceType: row.service_type,
    estimatedPrice: row.estimated_price,
    finalPrice: row.final_price ?? null,
    specialRequests: row.special_requests ?? null,
    status: row.status,
    paymentStatus: row.payment_status ?? "pending",
    paymentMethod: row.payment_method ?? null,
    vehicleId: row.vehicle_id ?? null,
    driverId: row.driver_id ?? null,
    notes: row.notes ?? null,
    leadSource: row.lead_source ?? null,
    zapierLeadId: row.zapier_lead_id ?? null,
    hubspotDealId: row.hubspot_deal_id ?? null,
    hubspotContactId: row.hubspot_contact_id ?? null,
    confirmedAt: row.confirmed_at ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapTourBookingRow(row: any) {
  return {
    id: row.id,
    tourId: row.tour_id,
    tourName: row.tour_name,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? null,
    tourDate: row.tour_date,
    participants: row.participants ?? 1,
    totalPrice: row.total_price ?? null,
    currency: row.currency ?? "USD",
    paymentMethod: row.payment_method ?? null,
    paymentStatus: row.payment_status ?? "pending",
    status: row.status ?? "pending",
    notes: row.notes ?? null,
    leadSource: row.lead_source ?? null,
    zapierLeadId: row.zapier_lead_id ?? null,
    hubspotDealId: row.hubspot_deal_id ?? null,
    hubspotContactId: row.hubspot_contact_id ?? null,
    confirmedAt: row.confirmed_at ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapContactMessageRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    serviceInterest: row.service_interest,
    message: row.message,
    status: row.status ?? "new",
    priority: row.priority ?? "normal",
    assignedTo: row.assigned_to ?? null,
    response: row.response ?? null,
    leadSource: row.lead_source ?? null,
    zapierLeadId: row.zapier_lead_id ?? null,
    hubspotDealId: row.hubspot_deal_id ?? null,
    hubspotContactId: row.hubspot_contact_id ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapTripRow(row: any) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    hypertrackTripId: row.hypertrack_trip_id ?? null,
    status: row.status ?? "pending",
    startTime: row.start_time ?? null,
    endTime: row.end_time ?? null,
    durationReal: row.duration_real ?? null,
    clientShared: row.client_shared ?? false,
    metadata: row.metadata ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * Página simple (HTML) para que Lyro (Tidio AI) pueda "aprender" productos/servicios.
   * Ideal para añadir como fuente en Tidio: https://tu-dominio.com/kb/products
   */
  app.get("/kb/products", async (_req, res) => {
    try {
      const [tours, vehicles] = await Promise.all([
        storage.getAllTours(),
        storage.getAllVehicles(),
      ]);

      const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Productos y Servicios | Dominican Transport Pro</title>
    <meta name="description" content="Catálogo de tours y transportes: descripciones, duración, qué incluye, capacidades y precios base." />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; margin: 24px; color: #111; }
      h1,h2,h3 { line-height: 1.2; }
      .muted { color: #444; }
      .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px 16px; }
      ul { margin: 8px 0 0; padding-left: 18px; }
      code { background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }
      @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } }
    </style>
  </head>
  <body>
    <h1>Productos y Servicios</h1>
    <p class="muted">Esta página es una base de conocimiento para el asistente (Lyro/Tidio) y se mantiene actualizada desde el sistema.</p>

    <h2>Tours</h2>
    <div class="grid">
      ${tours
        .filter((t: any) => t?.isActive !== false)
        .map((t: any) => {
          const includes = Array.isArray(t?.includes) ? t.includes : [];
          const highlights = Array.isArray(t?.highlights) ? t.highlights : [];
          const rating = t?.rating ?? null;
          const reviews = t?.reviews ?? null;
          return `<div class="card">
            <h3>${escapeHtml(t?.name)}</h3>
            <p class="muted">${escapeHtml(t?.description)}</p>
            <p><strong>Duración:</strong> ${escapeHtml(t?.duration)} &nbsp; <strong>Precio:</strong> USD ${escapeHtml(t?.price)}</p>
            <p><strong>Categoría:</strong> ${escapeHtml(t?.category)} ${t?.popular ? " • <strong>Popular</strong>" : ""}</p>
            ${
              rating !== null || reviews !== null
                ? `<p><strong>Rating:</strong> ${escapeHtml(rating)} / 5 &nbsp; <strong>Reseñas:</strong> ${escapeHtml(reviews)}</p>`
                : ""
            }
            ${includes.length ? `<p><strong>Incluye:</strong></p><ul>${includes.map((x: any) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}
            ${highlights.length ? `<p><strong>Destacados:</strong></p><ul>${highlights.map((x: any) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}
          </div>`;
        })
        .join("")}
    </div>

    <h2>Transportes (Vehículos)</h2>
    <p class="muted">Los precios aquí son <strong>precio base</strong>. El precio final depende de ruta, horario y tipo de servicio.</p>
    <div class="grid">
      ${vehicles
        .filter((v: any) => v?.available !== false)
        .map((v: any) => {
          const features = Array.isArray(v?.features) ? v.features : [];
          return `<div class="card">
            <h3>${escapeHtml(v?.name)}</h3>
            <p><strong>Tipo:</strong> ${escapeHtml(v?.type)} &nbsp; <strong>Capacidad:</strong> ${escapeHtml(v?.capacity)} pax &nbsp; <strong>Maletas:</strong> ${escapeHtml(v?.luggageCapacity)}</p>
            <p><strong>Precio base:</strong> USD ${escapeHtml(v?.basePrice)}</p>
            ${features.length ? `<p><strong>Incluye:</strong></p><ul>${features.map((x: any) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}
          </div>`;
        })
        .join("")}
    </div>

    <h2>Cómo reservar</h2>
    <ul>
      <li><strong>Transporte:</strong> usa la página <code>/booking</code> para crear tu reserva.</li>
      <li><strong>Tours:</strong> mira los tours en <code>/tours</code> y contáctanos para disponibilidad.</li>
    </ul>

    <h2>Políticas rápidas</h2>
    <ul>
      <li>Operamos 24/7 según disponibilidad.</li>
      <li>Recomendamos reservar con anticipación.</li>
      <li>Si el vuelo se retrasa, notifica al equipo (si aplica) para coordinar.</li>
    </ul>
  </body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
    } catch (e) {
      res.status(500).send("Error generando knowledge base.");
    }
  });

  // Get all vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Get all tours
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getAllTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  // Get all testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Create testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create testimonial" });
      }
    }
  });

  // Update testimonial
  app.put("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.updateTestimonial(req.params.id, req.body);
      if (!testimonial) {
        res.status(404).json({ message: "Testimonial not found" });
        return;
      }
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  // Delete testimonial
  app.delete("/api/testimonials/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Testimonial not found" });
        return;
      }
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  // Create tour
  app.post("/api/tours", async (req, res) => {
    try {
      const validatedData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tour" });
      }
    }
  });

  // Update tour
  app.put("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.updateTour(req.params.id, req.body);
      if (!tour) {
        res.status(404).json({ message: "Tour not found" });
        return;
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tour" });
    }
  });

  // Delete tour
  app.delete("/api/tours/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTour(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Tour not found" });
        return;
      }
      res.json({ message: "Tour deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tour" });
    }
  });

  // Create vehicle
  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create vehicle" });
      }
    }
  });

  // Update vehicle
  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  // Delete vehicle
  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const supabase = getSupabaseAdmin();

      let booking: any;
      if (supabase) {
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            customer_name: validatedData.customerName,
            customer_email: validatedData.customerEmail,
            customer_phone: validatedData.customerPhone,
            origin: validatedData.origin,
            destination: validatedData.destination,
            origin_place_id: validatedData.originPlaceId ?? null,
            destination_place_id: validatedData.destinationPlaceId ?? null,
            origin_coords: validatedData.originCoords ?? null,
            destination_coords: validatedData.destinationCoords ?? null,
            pickup_date: validatedData.pickupDate.toISOString(),
            return_date: validatedData.returnDate ? validatedData.returnDate.toISOString() : null,
            passengers: validatedData.passengers,
            vehicle_type: validatedData.vehicleType,
            service_type: validatedData.serviceType,
            estimated_price: validatedData.estimatedPrice as any,
            final_price: (validatedData as any).finalPrice ?? null,
            special_requests: (validatedData as any).specialRequests ?? null,
            payment_status: (validatedData as any).paymentStatus ?? "pending",
            payment_method: (validatedData as any).paymentMethod ?? null,
            notes: (validatedData as any).notes ?? null,
            lead_source: (validatedData as any).leadSource ?? "dashboard",
            zapier_lead_id: (validatedData as any).zapierLeadId ?? null,
          })
          .select("*")
          .single();

        if (error) {
          res.status(500).json({ message: "Failed to create booking", error: error.message });
          return;
        }
        booking = mapBookingRow(data);
      } else {
        booking = await storage.createBooking(validatedData);
      }
      
      // Enviar notificación WhatsApp
      try {
        const forNotif = {
          ...booking,
          pickupDate: booking?.pickupDate instanceof Date ? booking.pickupDate : new Date(booking.pickupDate),
          returnDate: booking?.returnDate ? new Date(booking.returnDate) : null,
        };
        await notificationService.sendBookingNotification(forNotif as any);
      } catch (notificationError) {
        console.error('Error enviando notificación de reserva:', notificationError);
        // No fallar la reserva si la notificación falla
      }

      // Emitir a Zapier (Lead/Deal creation en HubSpot suele ocurrir allá)
      await emitAutomationEvent("booking.created", booking);
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Update booking payment status (para pago confirmado / fallido / reembolso)
  app.patch("/api/bookings/:id/payment", async (req, res) => {
    const schema = z.object({
      paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]),
      paymentMethod: z.string().optional().nullable(),
      finalPrice: z.union([z.string(), z.number()]).optional().nullable(),
    });

    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const body = schema.parse(req.body);
      const nowIso = new Date().toISOString();

      const update: Record<string, any> = {
        payment_status: body.paymentStatus,
        payment_method: body.paymentMethod ?? null,
        updated_at: nowIso,
      };
      if (body.finalPrice !== undefined) update.final_price = body.finalPrice;
      if (body.paymentStatus === "paid") update.paid_at = nowIso;

      const { data, error } = await supabase
        .from("bookings")
        .update(update)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update booking payment", error: error.message });
        return;
      }

      const mapped = mapBookingRow(data);
      if (body.paymentStatus === "paid") {
        await emitAutomationEvent("booking.paid", mapped);
      }

      res.json(mapped);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update booking payment" });
      }
    }
  });

  // Asignar vehículo/chofer/placa a una reserva y disparar automatización
  app.patch("/api/bookings/:id/assignment", async (req, res) => {
    const schema = z.object({
      vehicleId: z.string().optional().nullable(),
      vehicleType: z.string().optional().nullable(),
      driverId: z.string().optional().nullable(),
      plate: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
    });

    try {
      const body = schema.parse(req.body);
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { data: previousRow, error: previousError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", req.params.id)
        .single();
      if (previousError || !previousRow) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      const nowIso = new Date().toISOString();
      const existingNotes = String(previousRow.notes ?? "");
      const noteWithoutPlate = existingNotes.replace(/(?:^|\n)\s*plate\s*:\s*[^\n]*/gi, "").trim();
      const plateLine = body.plate ? `plate:${body.plate}` : "";
      const mergedNotes = [noteWithoutPlate, body.notes ?? null, plateLine]
        .filter((x) => x && String(x).trim().length > 0)
        .join("\n")
        .trim();

      const update: Record<string, any> = {
        updated_at: nowIso,
      };
      if (body.vehicleId !== undefined) update.vehicle_id = body.vehicleId;
      if (body.vehicleType !== undefined) update.vehicle_type = body.vehicleType;
      if (body.driverId !== undefined) update.driver_id = body.driverId;
      if (body.status) update.status = body.status;
      if (mergedNotes.length > 0) update.notes = mergedNotes;

      const { data, error } = await supabase
        .from("bookings")
        .update(update)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update booking assignment", error: error.message });
        return;
      }

      const mapped = mapBookingRow(data);

      const hadVehicleBefore = Boolean(previousRow.vehicle_id || previousRow.vehicle_type);
      const hasVehicleNow = Boolean(data.vehicle_id || data.vehicle_type);
      const justAssigned = !hadVehicleBefore && hasVehicleNow;

      if (justAssigned) {
        await emitAutomationEvent("booking.vehicle_assigned", {
          ...mapped,
          plate: body.plate ?? null,
        });
      }

      res.json({
        ...mapped,
        plate: body.plate ?? null,
        assignmentEventTriggered: justAssigned,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assignment payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update booking assignment" });
      }
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from("bookings").select("*").order("pickup_date", { ascending: false });
        if (error) {
          res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
          return;
        }
        res.json((data ?? []).map(mapBookingRow));
        return;
      }

      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase.from("bookings").select("*").eq("id", req.params.id).single();
        if (error) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }
        res.json(mapBookingRow(data));
        return;
      }

      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Obtener último trip de una reserva
  app.get("/api/trips/booking/:bookingId", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("booking_id", req.params.bookingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        res.status(500).json({ message: "Failed to fetch trip", error: error.message });
        return;
      }
      if (!data) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }
      res.json(mapTripRow(data));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  // Iniciar viaje tracking (base funcional para pruebas)
  app.post("/api/trips/start", async (req, res) => {
    const schema = z.object({
      bookingId: z.string().uuid(),
      deviceId: z.string().optional().nullable(),
      clientShared: z.boolean().optional(),
      metadata: z.record(z.any()).optional(),
    });

    try {
      const body = schema.parse(req.body);
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const nowIso = new Date().toISOString();
      const { data: existing, error: findError } = await supabase
        .from("trips")
        .select("*")
        .eq("booking_id", body.bookingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (findError) {
        res.status(500).json({ message: "Failed to check existing trip", error: findError.message });
        return;
      }

      const mergedMetadata = {
        ...(existing?.metadata ?? {}),
        ...(body.metadata ?? {}),
        ...(body.deviceId ? { device_id: body.deviceId } : {}),
      };

      if (existing) {
        const { data, error } = await supabase
          .from("trips")
          .update({
            status: "in_progress",
            start_time: existing.start_time ?? nowIso,
            client_shared: body.clientShared ?? existing.client_shared ?? false,
            metadata: mergedMetadata,
            updated_at: nowIso,
          })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (error) {
          res.status(500).json({ message: "Failed to start trip", error: error.message });
          return;
        }
        const mappedTrip = mapTripRow(data);
        await emitAutomationEvent("trip.started", {
          ...mappedTrip,
          bookingId: body.bookingId,
          deviceId: body.deviceId ?? null,
        });
        res.json(mappedTrip);
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .insert({
          booking_id: body.bookingId,
          status: "in_progress",
          start_time: nowIso,
          client_shared: body.clientShared ?? false,
          metadata: mergedMetadata,
        })
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to create trip", error: error.message });
        return;
      }

      const mappedTrip = mapTripRow(data);
      await emitAutomationEvent("trip.started", {
        ...mappedTrip,
        bookingId: body.bookingId,
        deviceId: body.deviceId ?? null,
      });
      res.status(201).json(mappedTrip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid trip start payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to start trip" });
      }
    }
  });

  // Actualizar ubicación del viaje
  app.patch("/api/trips/:id/location", async (req, res) => {
    const schema = z.object({
      lat: z.number(),
      lng: z.number(),
      accuracy: z.number().optional().nullable(),
      speed: z.number().optional().nullable(),
      bearing: z.number().optional().nullable(),
    });

    try {
      const body = schema.parse(req.body);
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { data: current, error: currentError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", req.params.id)
        .single();
      if (currentError) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }

      const nowIso = new Date().toISOString();
      const previousHistory = Array.isArray((current.metadata as any)?.location_history)
        ? ((current.metadata as any).location_history as any[])
        : [];
      const nextPoint = {
        lat: body.lat,
        lng: body.lng,
        accuracy: body.accuracy ?? null,
        speed: body.speed ?? null,
        bearing: body.bearing ?? null,
        at: nowIso,
      };
      const locationHistory = [...previousHistory, nextPoint].slice(-500);
      const metadata = {
        ...(current.metadata ?? {}),
        latest_location: nextPoint,
        location_history: locationHistory,
      };

      const { data, error } = await supabase
        .from("trips")
        .update({
          metadata,
          updated_at: nowIso,
        })
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update location", error: error.message });
        return;
      }

      res.json(mapTripRow(data));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid location payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update location" });
      }
    }
  });

  // Completar viaje
  app.patch("/api/trips/:id/complete", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { data: current, error: currentError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", req.params.id)
        .single();
      if (currentError) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }

      const now = new Date();
      const start = current.start_time ? new Date(current.start_time) : null;
      const durationReal = start ? Math.max(0, Math.round((now.getTime() - start.getTime()) / 1000)) : null;

      const { data, error } = await supabase
        .from("trips")
        .update({
          status: "completed",
          end_time: now.toISOString(),
          duration_real: durationReal,
          updated_at: now.toISOString(),
        })
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to complete trip", error: error.message });
        return;
      }

      const mappedTrip = mapTripRow(data);
      await emitAutomationEvent("trip.completed", mappedTrip);
      res.json(mappedTrip);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete trip" });
    }
  });

  // Guardar encuesta post-viaje
  app.post("/api/feedback", async (req, res) => {
    const schema = z.object({
      // Acepta UUID y también IDs legibles tipo "CL-48291"
      bookingId: z.string().trim().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(500).optional().nullable(),
      improvement: z.string().max(500).optional().nullable(),
      source: z.string().optional().nullable(),
    });

    try {
      const body = schema.parse(req.body);
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      let booking: { id: string; customer_name: string; customer_email: string } | null = null;

      const findBy = async (column: "id" | "zapier_lead_id" | "hubspot_deal_id", value: string) => {
        const { data } = await supabase
          .from("bookings")
          .select("id, customer_name, customer_email")
          .eq(column, value)
          .maybeSingle();
        return data as { id: string; customer_name: string; customer_email: string } | null;
      };

      booking = await findBy("id", body.bookingId);
      if (!booking) booking = await findBy("zapier_lead_id", body.bookingId);
      if (!booking) booking = await findBy("hubspot_deal_id", body.bookingId);
      if (!booking) {
        // Fallback: si el enlace viene con id de trip, resolver su booking_id
        const { data: tripRef } = await supabase
          .from("trips")
          .select("id, booking_id")
          .eq("id", body.bookingId)
          .maybeSingle();
        if (tripRef?.booking_id) {
          booking = await findBy("id", tripRef.booking_id);
        }
      }

      if (!booking) {
        res.status(404).json({
          message: "Booking not found",
          bookingId: body.bookingId,
          hint: "Verifica que el enlace /feedback/:id use el ID real de bookings.id o un ID alterno registrado (zapier/hubspot/trip).",
        });
        return;
      }

      const { data, error } = await supabase
        .from("feedback")
        .insert({
          booking_id: booking.id,
          rating: body.rating,
          comment: body.comment ?? null,
          improvement: body.improvement ?? null,
          source: body.source ?? "internal",
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to save feedback", error: error.message });
        return;
      }

      const payload = {
        id: data.id,
        bookingId: booking.id,
        bookingRef: body.bookingId,
        rating: body.rating,
        comment: body.comment ?? null,
        improvement: body.improvement ?? null,
        source: body.source ?? "internal",
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        createdAt: data.created_at ?? new Date().toISOString(),
      };
      await emitAutomationEvent("feedback.created", payload);
      res.status(201).json(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save feedback" });
      }
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      
      const supabase = getSupabaseAdmin();
      let booking: any;
      if (supabase) {
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
          .from("bookings")
          .update({
            status,
            updated_at: nowIso,
            ...(status === "confirmed" ? { confirmed_at: nowIso } : {}),
          })
          .eq("id", req.params.id)
          .select("*")
          .single();
        if (error) {
          res.status(500).json({ message: "Failed to update booking status", error: error.message });
          return;
        }
        booking = mapBookingRow(data);
      } else {
        booking = await storage.updateBookingStatus(req.params.id, status);
      }
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      if (status === "confirmed") {
        await emitAutomationEvent("booking.confirmed", booking);
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Create tour booking (centralizado para poder emitir a Zapier)
  app.post("/api/tour-bookings", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const validated = insertTourBookingSchema.parse(req.body);

      const { data, error } = await supabase
        .from("tour_bookings")
        .insert({
          tour_id: validated.tourId,
          tour_name: validated.tourName,
          customer_name: validated.customerName,
          customer_email: validated.customerEmail,
          customer_phone: (validated as any).customerPhone ?? null,
          tour_date: (validated as any).tourDate instanceof Date ? (validated as any).tourDate.toISOString() : (validated as any).tourDate,
          participants: (validated as any).participants ?? 1,
          total_price: (validated as any).totalPrice ?? null,
          currency: (validated as any).currency ?? "USD",
          payment_method: (validated as any).paymentMethod ?? null,
          payment_status: (validated as any).paymentStatus ?? "pending",
          notes: (validated as any).notes ?? null,
          status: "pending",
          lead_source: (validated as any).leadSource ?? "dashboard",
          zapier_lead_id: (validated as any).zapierLeadId ?? null,
        })
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to create tour booking", error: error.message });
        return;
      }

      const mapped = mapTourBookingRow(data);
      await emitAutomationEvent("tour_booking.created", mapped);

      res.status(201).json(mapped);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tour booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tour booking" });
      }
    }
  });

  app.patch("/api/tour-bookings/:id/status", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const { status } = z
        .object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) })
        .parse(req.body);

      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("tour_bookings")
        .update({
          status,
          updated_at: nowIso,
          ...(status === "confirmed" ? { confirmed_at: nowIso } : {}),
        })
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update tour booking status", error: error.message });
        return;
      }

      const mapped = mapTourBookingRow(data);
      if (status === "confirmed") {
        await emitAutomationEvent("tour_booking.confirmed", mapped);
      }

      res.json(mapped);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update tour booking status" });
      }
    }
  });

  app.patch("/api/tour-bookings/:id/payment", async (req, res) => {
    const schema = z.object({
      paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]),
      paymentMethod: z.string().optional().nullable(),
      totalPrice: z.union([z.string(), z.number()]).optional().nullable(),
    });

    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const body = schema.parse(req.body);
      const nowIso = new Date().toISOString();

      const update: Record<string, any> = {
        payment_status: body.paymentStatus,
        payment_method: body.paymentMethod ?? null,
        updated_at: nowIso,
      };
      if (body.totalPrice !== undefined) update.total_price = body.totalPrice;
      if (body.paymentStatus === "paid") update.paid_at = nowIso;

      const { data, error } = await supabase
        .from("tour_bookings")
        .update(update)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        res.status(500).json({ message: "Failed to update tour booking payment", error: error.message });
        return;
      }

      const mapped = mapTourBookingRow(data);
      if (body.paymentStatus === "paid") {
        await emitAutomationEvent("tour_booking.paid", mapped);
      }

      res.json(mapped);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update tour booking payment" });
      }
    }
  });

  // Create contact message
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const supabase = getSupabaseAdmin();
      let message: any;
      if (supabase) {
        const { data, error } = await supabase
          .from("contact_messages")
          .insert({
            name: validatedData.name,
            email: validatedData.email,
            phone: (validatedData as any).phone ?? null,
            service_interest: validatedData.serviceInterest,
            message: validatedData.message,
            status: "new",
            lead_source: (validatedData as any).leadSource ?? "dashboard",
            zapier_lead_id: (validatedData as any).zapierLeadId ?? null,
          })
          .select("*")
          .single();

        if (error) {
          res.status(500).json({ message: "Failed to create contact message", error: error.message });
          return;
        }
        message = mapContactMessageRow(data);
      } else {
        message = await storage.createContactMessage(validatedData);
      }
      
      // Enviar notificación WhatsApp
      try {
        await notificationService.sendContactNotification(message as any);
      } catch (notificationError) {
        console.error('Error enviando notificación de contacto:', notificationError);
        // No fallar el mensaje si la notificación falla
      }

      await emitAutomationEvent("lead.created", message);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact message" });
      }
    }
  });

  // Get all contact messages
  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Update contact message status
  app.patch("/api/contact/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["new", "contacted", "resolved"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      
      const message = await storage.updateContactMessageStatus(req.params.id, status);
      if (!message) {
        res.status(404).json({ message: "Contact message not found" });
        return;
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact message status" });
    }
  });

  // Update company contact info
  app.put("/api/contact-info", async (req, res) => {
    try {
      // En una implementación real, esto guardaría en la base de datos
      // Por ahora, solo retornamos éxito
      res.json({ message: "Contact information updated successfully", data: req.body });
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact information" });
    }
  });

  // Webhook inbound desde Make/Zapier (actualizar IDs HubSpot / estados)
  const inboundAutomationHandler = async (req: any, res: any) => {
    const secret = getAutomationInboundSecret();
    const provided = String(
      req.header("x-make-secret") ||
      req.header("x-automation-secret") ||
      req.header("x-zapier-secret") ||
      req.query.secret ||
      "",
    );
    if (secret && provided !== secret) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const raw = (req.body && typeof req.body === "object" && req.body.data) ? req.body.data : (req.body || {});
    const get = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v != null && v !== "") return v;
      }
      for (const key of Object.keys(obj || {})) {
        if (keys.some(k => key.trim().replace(/\r\n/g, "") === k)) return obj[key];
      }
      return undefined;
    };
    const normalized = {
      entityType: get(raw, "entityType", "entity_type"),
      entityId: get(raw, "entityId", "entity_id"),
      customerEmail: get(raw, "customerEmail", "customer_email"),
      hubspotDealId: get(raw, "hubspotDealId", "hubspot_deal_id"),
      hubspotContactId: get(raw, "hubspotContactId", "hubspot_contact_id"),
      status: get(raw, "status"),
      paymentStatus: get(raw, "paymentStatus", "payment_status"),
      zapierLeadId: get(raw, "zapierLeadId", "zapier_lead_id"),
    };
    console.log("[automation/inbound] Received:", JSON.stringify(raw), "-> normalized:", JSON.stringify(normalized));

    const schema = z.object({
      entityType: z.enum(["booking", "tour_booking", "contact_message"]),
      entityId: z.string().min(1).optional(),
      customerEmail: z.string().email().optional(),
      hubspotDealId: z.string().min(1).optional().nullable(),
      hubspotContactId: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      paymentStatus: z.string().optional().nullable(),
      zapierLeadId: z.string().optional().nullable(),
    }).refine(data => (data.entityId && data.entityId.length > 0) || (data.customerEmail && data.customerEmail.length > 0) || (data.hubspotDealId && data.hubspotDealId.length > 0), {
      message: "Either entityId, customerEmail, or hubspotDealId is required",
    });

    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const body = schema.parse(normalized);
      const nowIso = new Date().toISOString();

      const table =
        body.entityType === "booking"
          ? "bookings"
          : body.entityType === "tour_booking"
            ? "tour_bookings"
            : "contact_messages";

      const update: Record<string, any> = { updated_at: nowIso };
      if (body.hubspotDealId !== undefined) update.hubspot_deal_id = body.hubspotDealId;
      if (body.hubspotContactId !== undefined) update.hubspot_contact_id = body.hubspotContactId;
      if (body.zapierLeadId !== undefined) update.zapier_lead_id = body.zapierLeadId;

      // Solo aplicar status/payment si vienen (y si las tablas lo soportan)
      if (body.entityType !== "contact_message") {
        if (body.status) {
          update.status = body.status;
          if (body.status === "confirmed") update.confirmed_at = nowIso;
        }
        if (body.paymentStatus) {
          update.payment_status = body.paymentStatus;
          if (body.paymentStatus === "paid") update.paid_at = nowIso;
        }
      }

      let matchColumn: string;
      let matchValue: string;
      if (body.entityId && body.entityId.length > 0) {
        matchColumn = "id";
        matchValue = body.entityId;
      } else if (body.customerEmail && body.customerEmail.length > 0) {
        matchColumn = "customer_email";
        matchValue = body.customerEmail;
      } else if (body.hubspotDealId && body.hubspotDealId.length > 0) {
        matchColumn = "hubspot_deal_id";
        matchValue = body.hubspotDealId;
      } else {
        res.status(400).json({ message: "Either entityId, customerEmail, or hubspotDealId is required" });
        return;
      }

      console.log("[automation/inbound] Updating", table, "where", matchColumn, "=", matchValue);
      const { data, error } = await supabase
        .from(table)
        .update(update)
        .eq(matchColumn, matchValue)
        .select("*")
        .maybeSingle();
      if (error) {
        console.error("[automation/inbound] Supabase error:", error.code, error.message, { matchColumn, matchValue });
        res.status(500).json({ message: "Failed to apply inbound webhook", error: error.message });
        return;
      }
      if (!data) {
        console.error("[automation/inbound] No row found for", matchColumn, "=", matchValue, "in", table);
        res.status(404).json({ message: "Record not found. Verify the ID exists in the " + table + " table." });
        return;
      }

      const mapped =
        body.entityType === "booking"
          ? mapBookingRow(data)
          : body.entityType === "tour_booking"
            ? mapTourBookingRow(data)
            : mapContactMessageRow(data);

      res.json({ ok: true, updated: mapped });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid webhook payload", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to apply inbound webhook" });
      }
    }
  };
  app.post("/api/zapier/inbound", inboundAutomationHandler); // backward compatibility
  app.post("/api/make/inbound", inboundAutomationHandler);
  app.post("/api/automations/inbound", inboundAutomationHandler);

  // Estadísticas básicas (para dashboard y reporte diario Zapier/HubSpot)
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        res.status(501).json({ message: "Supabase admin no está configurado en el servidor" });
        return;
      }

      const q = z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .parse(req.query);

      const fromIso = q.from ? new Date(String(q.from)).toISOString() : null;
      const toIso = q.to ? new Date(String(q.to)).toISOString() : null;

      const applyRange = (query: any, column: string) => {
        let qq = query;
        if (fromIso) qq = qq.gte(column, fromIso);
        if (toIso) qq = qq.lte(column, toIso);
        return qq;
      };

      const [transportRes, toursRes] = await Promise.all([
        applyRange(
          supabase.from("bookings").select("status,payment_status,estimated_price,final_price,created_at,pickup_date"),
          "created_at",
        ),
        applyRange(
          supabase.from("tour_bookings").select("status,payment_status,total_price,created_at,tour_date"),
          "created_at",
        ),
      ]);

      if (transportRes.error) throw transportRes.error;
      if (toursRes.error) throw toursRes.error;

      const transport = transportRes.data ?? [];
      const tours = toursRes.data ?? [];

      const countBy = (rows: any[], key: string) =>
        rows.reduce<Record<string, number>>((acc, r) => {
          const v = String(r?.[key] ?? "unknown");
          acc[v] = (acc[v] || 0) + 1;
          return acc;
        }, {});

      const sumMoney = (rows: any[], key: string) =>
        rows.reduce((acc, r) => {
          const n = typeof r?.[key] === "number" ? r[key] : parseFloat(String(r?.[key] ?? "0"));
          return acc + (Number.isFinite(n) ? n : 0);
        }, 0);

      const transportRevenue = sumMoney(transport, "final_price") || sumMoney(transport, "estimated_price");
      const toursRevenue = sumMoney(tours, "total_price");

      res.json({
        range: { from: fromIso, to: toIso },
        transport: {
          total: transport.length,
          byStatus: countBy(transport, "status"),
          byPaymentStatus: countBy(transport, "payment_status"),
          revenue: Math.round(transportRevenue * 100) / 100,
        },
        tours: {
          total: tours.length,
          byStatus: countBy(tours, "status"),
          byPaymentStatus: countBy(tours, "payment_status"),
          revenue: Math.round(toursRevenue * 100) / 100,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to compute stats", error: error?.message || String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
