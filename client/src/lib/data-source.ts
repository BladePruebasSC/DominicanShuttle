import type { Booking, InsertBooking, InsertTourBooking, Tour, TourBooking, Vehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !String(url).includes("placeholder") && !String(key).includes("placeholder"));
}

// Supabase devuelve columnas en snake_case; la app usa camelCase (Drizzle schema)
function mapTourRow(row: any): Tour {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    duration: row.duration,
    price: row.price,
    includes: row.includes ?? [],
    highlights: row.highlights ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    category: row.category,
    popular: row.popular ?? false,
    rating: row.rating ?? null,
    reviews: row.reviews ?? null,
    maxParticipants: row.max_participants ?? row.maxParticipants ?? null,
    minParticipants: row.min_participants ?? row.minParticipants ?? 1,
    difficultyLevel: row.difficulty_level ?? row.difficultyLevel ?? null,
    isActive: row.is_active ?? row.isActive ?? true,
  } as Tour;
}

function mapVehicleRow(row: any): Vehicle {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    luggageCapacity: row.luggage_capacity ?? row.luggageCapacity ?? 0,
    capacityText: row.capacity_text ?? row.capacityText ?? null,
    luggageText: row.luggage_text ?? row.luggageText ?? null,
    basePrice: row.base_price ?? row.basePrice,
    features: row.features ?? [],
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    licensePlate: row.license_plate ?? row.licensePlate ?? null,
    year: row.year ?? null,
    color: row.color ?? null,
    available: row.available ?? true,
    driverId: row.driver_id ?? row.driverId ?? null,
  } as Vehicle;
}

function toSupabaseTourPayload(data: Partial<Tour>) {
  // solo enviar columnas existentes en DB
  return {
    name: data.name,
    description: data.description,
    duration: data.duration,
    price: data.price,
    includes: data.includes ?? [],
    highlights: data.highlights ?? null,
    image_url: data.imageUrl ?? null,
    category: data.category,
    popular: data.popular ?? false,
    rating: data.rating ?? null,
    reviews: data.reviews ?? null,
    max_participants: data.maxParticipants ?? null,
    min_participants: data.minParticipants ?? 1,
    difficulty_level: data.difficultyLevel ?? null,
    is_active: data.isActive ?? true,
  };
}

function toSupabaseVehiclePayload(data: Partial<Vehicle>) {
  return {
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    luggage_capacity: data.luggageCapacity,
    capacity_text: data.capacityText ?? null,
    luggage_text: data.luggageText ?? null,
    base_price: data.basePrice,
    features: data.features ?? [],
    image_url: data.imageUrl ?? null,
    license_plate: data.licensePlate ?? null,
    year: data.year ?? null,
    color: data.color ?? null,
    available: data.available ?? true,
    driver_id: data.driverId ?? null,
  };
}

export const dataSource = {
  async listTours(): Promise<Tour[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapTourRow);
    }

    const res = await apiRequest("GET", "/api/tours");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createTour(payload: Partial<Tour>): Promise<Tour> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("tours")
        .insert(toSupabaseTourPayload(payload))
        .select("*")
        .single();
      if (error) throw error;
      return mapTourRow(data);
    }

    const res = await apiRequest("POST", "/api/tours", payload);
    return await res.json();
  },

  async updateTour(id: string, payload: Partial<Tour>): Promise<Tour> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("tours")
        .update(toSupabaseTourPayload(payload))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return mapTourRow(data);
    }

    const res = await apiRequest("PUT", `/api/tours/${id}`, payload);
    return await res.json();
  },

  async deleteTour(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("tours").delete().eq("id", id);
      if (error) throw error;
      return;
    }

    await apiRequest("DELETE", `/api/tours/${id}`);
  },

  async listVehicles(): Promise<Vehicle[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        // Si `available` es NULL en algunos registros, `eq(true)` no devuelve nada.
        // Mostramos todo excepto `available = false`.
        .or("available.is.null,available.eq.true")
        .order("base_price", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapVehicleRow);
    }

    const res = await apiRequest("GET", "/api/vehicles");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createVehicle(payload: Partial<Vehicle>): Promise<Vehicle> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("vehicles")
        .insert(toSupabaseVehiclePayload(payload))
        .select("*")
        .single();
      if (error) throw error;
      return mapVehicleRow(data);
    }

    const res = await apiRequest("POST", "/api/vehicles", payload);
    return await res.json();
  },

  async updateVehicle(id: string, payload: Partial<Vehicle>): Promise<Vehicle> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("vehicles")
        .update(toSupabaseVehiclePayload(payload))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return mapVehicleRow(data);
    }

    const res = await apiRequest("PUT", `/api/vehicles/${id}`, payload);
    return await res.json();
  },

  async deleteVehicle(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
      return;
    }

    await apiRequest("DELETE", `/api/vehicles/${id}`);
  },

  // ============================
  // Reservas de transporte
  // ============================
  async listTransportBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("pickup_date", { ascending: false });
      if (error) throw error;
      // Mapeo mínimo (snake_case -> camelCase) para UI
      return (data ?? []).map((b: any) => ({
        id: b.id,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        customerPhone: b.customer_phone,
        origin: b.origin,
        destination: b.destination,
        originPlaceId: b.origin_place_id ?? null,
        destinationPlaceId: b.destination_place_id ?? null,
        originCoords: b.origin_coords ?? null,
        destinationCoords: b.destination_coords ?? null,
        pickupDate: b.pickup_date,
        returnDate: b.return_date ?? null,
        passengers: b.passengers,
        vehicleType: b.vehicle_type,
        serviceType: b.service_type,
        estimatedPrice: b.estimated_price,
        finalPrice: b.final_price ?? null,
        specialRequests: b.special_requests ?? null,
        status: b.status,
        paymentStatus: b.payment_status ?? "pending",
        paymentMethod: b.payment_method ?? null,
        vehicleId: b.vehicle_id ?? null,
        driverId: b.driver_id ?? null,
        notes: b.notes ?? null,
        createdAt: b.created_at ?? null,
        updatedAt: b.updated_at ?? null,
      })) as Booking[];
    }

    const res = await apiRequest("GET", "/api/bookings");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createTransportBooking(payload: InsertBooking): Promise<Booking> {
    if (isSupabaseConfigured()) {
      const toInsert = {
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        origin: payload.origin,
        destination: payload.destination,
        origin_place_id: payload.originPlaceId ?? null,
        destination_place_id: payload.destinationPlaceId ?? null,
        origin_coords: payload.originCoords ?? null,
        destination_coords: payload.destinationCoords ?? null,
        pickup_date: payload.pickupDate,
        return_date: payload.returnDate ?? null,
        passengers: payload.passengers,
        vehicle_type: payload.vehicleType,
        service_type: payload.serviceType,
        estimated_price: payload.estimatedPrice,
        final_price: payload.finalPrice ?? null,
        special_requests: payload.specialRequests ?? null,
        payment_method: (payload as any).paymentMethod ?? null,
        payment_status: (payload as any).paymentStatus ?? "pending",
        status: "pending",
      };

      const { data, error } = await supabase.from("bookings").insert(toInsert).select("*").single();
      if (error) throw error;
      // reutilizar list mapper
      return (await this.listTransportBookings()).find((x) => x.id === data.id) as Booking;
    }

    const res = await apiRequest("POST", "/api/bookings", payload);
    return await res.json();
  },

  async updateTransportBookingStatus(id: string, status: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      return;
    }
    await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
  },

  // ============================
  // Reservas de tours
  // ============================
  async listTourBookings(): Promise<TourBooking[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("tour_bookings")
        .select("*")
        .order("tour_date", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.id,
        tourId: r.tour_id,
        tourName: r.tour_name,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone ?? null,
        tourDate: r.tour_date,
        participants: r.participants ?? 1,
        totalPrice: r.total_price ?? null,
        currency: r.currency ?? "USD",
        paymentMethod: r.payment_method ?? null,
        paymentStatus: r.payment_status ?? "pending",
        status: r.status ?? "pending",
        notes: r.notes ?? null,
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      })) as TourBooking[];
    }

    // Sin backend dedicado aún; si no hay Supabase configurado, devolver vacío.
    return [];
  },

  async createTourBooking(payload: InsertTourBooking): Promise<TourBooking> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado para crear reservas de tours.");
    }

    const toInsert = {
      tour_id: payload.tourId,
      tour_name: payload.tourName,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone ?? null,
      tour_date: payload.tourDate,
      participants: payload.participants ?? 1,
      total_price: (payload as any).totalPrice ?? null,
      currency: (payload as any).currency ?? "USD",
      payment_method: (payload as any).paymentMethod ?? null,
      payment_status: (payload as any).paymentStatus ?? "pending",
      notes: payload.notes ?? null,
      status: "pending",
    };

    const { data, error } = await supabase.from("tour_bookings").insert(toInsert).select("*").single();
    if (error) throw error;

    // map to UI shape
    return {
      id: data.id,
      tourId: data.tour_id,
      tourName: data.tour_name,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone ?? null,
      tourDate: data.tour_date,
      participants: data.participants ?? 1,
      totalPrice: data.total_price ?? null,
      currency: data.currency ?? "USD",
      paymentMethod: data.payment_method ?? null,
      paymentStatus: data.payment_status ?? "pending",
      status: data.status ?? "pending",
      notes: data.notes ?? null,
      createdAt: data.created_at ?? null,
      updatedAt: data.updated_at ?? null,
    } as TourBooking;
  },

  async updateTourBookingStatus(id: string, status: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado para actualizar reservas de tours.");
    }
    const { error } = await supabase.from("tour_bookings").update({ status }).eq("id", id);
    if (error) throw error;
  },
};

