import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos para TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          email: string | null;
          full_name: string | null;
          role: 'admin' | 'user' | 'driver';
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          email?: string | null;
          full_name?: string | null;
          role?: 'admin' | 'user' | 'driver';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          email?: string | null;
          full_name?: string | null;
          role?: 'admin' | 'user' | 'driver';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          name: string;
          type: 'sedan' | 'suv' | 'van' | 'bus';
          capacity: number;
          luggage_capacity: number;
          base_price: number;
          features: string[];
          image_url: string | null;
          license_plate: string | null;
          year: number | null;
          color: string | null;
          available: boolean;
          driver_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'sedan' | 'suv' | 'van' | 'bus';
          capacity: number;
          luggage_capacity: number;
          base_price: number;
          features?: string[];
          image_url?: string | null;
          license_plate?: string | null;
          year?: number | null;
          color?: string | null;
          available?: boolean;
          driver_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'sedan' | 'suv' | 'van' | 'bus';
          capacity?: number;
          luggage_capacity?: number;
          base_price?: number;
          features?: string[];
          image_url?: string | null;
          license_plate?: string | null;
          year?: number | null;
          color?: string | null;
          available?: boolean;
          driver_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          origin: string;
          destination: string;
          pickup_date: string;
          return_date: string | null;
          passengers: number;
          vehicle_type: 'sedan' | 'suv' | 'van' | 'bus';
          service_type: 'one_way' | 'round_trip';
          estimated_price: number;
          final_price: number | null;
          special_requests: string | null;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method: string | null;
          vehicle_id: string | null;
          driver_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          origin: string;
          destination: string;
          pickup_date: string;
          return_date?: string | null;
          passengers: number;
          vehicle_type: 'sedan' | 'suv' | 'van' | 'bus';
          service_type: 'one_way' | 'round_trip';
          estimated_price: number;
          final_price?: number | null;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method?: string | null;
          vehicle_id?: string | null;
          driver_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          origin?: string;
          destination?: string;
          pickup_date?: string;
          return_date?: string | null;
          passengers?: number;
          vehicle_type?: 'sedan' | 'suv' | 'van' | 'bus';
          service_type?: 'one_way' | 'round_trip';
          estimated_price?: number;
          final_price?: number | null;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method?: string | null;
          vehicle_id?: string | null;
          driver_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tours: {
        Row: {
          id: string;
          name: string;
          description: string;
          duration: string;
          price: number;
          includes: string[];
          image_url: string | null;
          category: 'adventure' | 'cultural' | 'beach' | 'nature' | 'city';
          popular: boolean;
          max_participants: number | null;
          min_participants: number;
          difficulty_level: 'easy' | 'medium' | 'hard' | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          duration: string;
          price: number;
          includes?: string[];
          image_url?: string | null;
          category: 'adventure' | 'cultural' | 'beach' | 'nature' | 'city';
          popular?: boolean;
          max_participants?: number | null;
          min_participants?: number;
          difficulty_level?: 'easy' | 'medium' | 'hard' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          duration?: string;
          price?: number;
          includes?: string[];
          image_url?: string | null;
          category?: 'adventure' | 'cultural' | 'beach' | 'nature' | 'city';
          popular?: boolean;
          max_participants?: number | null;
          min_participants?: number;
          difficulty_level?: 'easy' | 'medium' | 'hard' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          customer_name: string;
          customer_initials: string;
          rating: number;
          review: string;
          date: string;
          verified: boolean;
          booking_id: string | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_initials: string;
          rating: number;
          review: string;
          date: string;
          verified?: boolean;
          booking_id?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_initials?: string;
          rating?: number;
          review?: string;
          date?: string;
          verified?: boolean;
          booking_id?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          service_interest: string;
          message: string;
          status: 'new' | 'contacted' | 'resolved' | 'closed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          assigned_to: string | null;
          response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          service_interest: string;
          message: string;
          status?: 'new' | 'contacted' | 'resolved' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          assigned_to?: string | null;
          response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          service_interest?: string;
          message?: string;
          status?: 'new' | 'contacted' | 'resolved' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          assigned_to?: string | null;
          response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Funciones de utilidad para trabajar con Supabase
export const supabaseUtils = {
  // Obtener todos los vehículos
  async getVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('available', true)
      .order('base_price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener todos los tours
  async getTours() {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener tours populares
  async getPopularTours() {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('popular', true)
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener todos los testimonios
  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Crear una nueva reserva
  async createBooking(booking: Database['public']['Tables']['bookings']['Insert']) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear un mensaje de contacto
  async createContactMessage(message: Database['public']['Tables']['contact_messages']['Insert']) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener precio de ruta
  async getRoutePrice(origin: string, destination: string, vehicleType: string) {
    const { data, error } = await supabase
      .rpc('get_route_price', {
        p_origin: origin,
        p_destination: destination,
        p_vehicle_type: vehicleType
      });
    
    if (error) throw error;
    return data;
  },

  // Verificar disponibilidad de vehículo
  async checkVehicleAvailability(vehicleId: string, pickupDate: string, returnDate?: string) {
    const { data, error } = await supabase
      .rpc('check_vehicle_availability', {
        p_vehicle_id: vehicleId,
        p_pickup_date: pickupDate,
        p_return_date: returnDate
      });
    
    if (error) throw error;
    return data;
  }
};

export default supabase;
