import type { Tour, Vehicle } from "@shared/schema";
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
        .eq("available", true)
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
};

