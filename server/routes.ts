import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertContactMessageSchema, insertTourSchema, insertVehicleSchema, insertTestimonialSchema } from "@shared/schema";
import { notificationService } from "./notifications";
import { z } from "zod";

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
      const booking = await storage.createBooking(validatedData);
      
      // Enviar notificación WhatsApp
      try {
        await notificationService.sendBookingNotification(booking);
      } catch (notificationError) {
        console.error('Error enviando notificación de reserva:', notificationError);
        // No fallar la reserva si la notificación falla
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
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

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      
      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Create contact message
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // Enviar notificación WhatsApp
      try {
        await notificationService.sendContactNotification(message);
      } catch (notificationError) {
        console.error('Error enviando notificación de contacto:', notificationError);
        // No fallar el mensaje si la notificación falla
      }
      
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

  const httpServer = createServer(app);
  return httpServer;
}
