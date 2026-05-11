import { 
  type User, 
  type InsertUser, 
  type Vehicle,
  type Tour,
  type Testimonial,
  type Booking,
  type InsertBooking,
  type ContactMessage,
  type InsertContactMessage,
  type InsertTour,
  type InsertVehicle,
  type InsertTestimonial
} from "@shared/schema";
import { randomUUID } from "crypto";

// Enhanced storage interface with all CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vehicle methods
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: any): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Tour methods
  getAllTours(): Promise<Tour[]>;
  getTourById(id: string): Promise<Tour | undefined>;
  createTour(tour: any): Promise<Tour>;
  updateTour(id: string, tour: Partial<Tour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<boolean>;

  // Testimonial methods
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: any): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;

  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;

  // Contact message methods
  getAllContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private tours: Map<string, Tour>;
  private testimonials: Map<string, Testimonial>;
  private bookings: Map<string, Booking>;
  private contactMessages: Map<string, ContactMessage>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.tours = new Map();
    this.testimonials = new Map();
    this.bookings = new Map();
    this.contactMessages = new Map();
    
    // Initialize with real data
    this.initializeData();
  }

  private initializeData() {
    // Initialize vehicles with real Dominican Republic transport fleet
    const vehicles: Vehicle[] = [
      {
        id: randomUUID(),
        name: "Sedán Económico",
        type: "sedan",
        capacity: 3,
        luggageCapacity: 2,
        capacityText: null,
        luggageText: null,
        basePrice: "35",
        features: ["Aire acondicionado", "Conductor profesional", "Agua gratis"],
        imageUrl: "https://us.as.com/autos/wp-content/uploads/2024/06/Civic-2025-1024x576.jpg",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
      {
        id: randomUUID(),
        name: "SUV Premium",  
        type: "suv",
        capacity: 6,
        luggageCapacity: 4,
        capacityText: null,
        luggageText: null,
        basePrice: "60",
        features: ["Vehículo de lujo", "Asientos de cuero", "WiFi gratis", "Sistema de sonido"],
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
      {
        id: randomUUID(),
        name: "Van Grupal",
        type: "van",
        capacity: 12,
        luggageCapacity: 8,
        capacityText: null,
        luggageText: null,
        basePrice: "120",
        features: ["Amplio espacio", "Sistema de sonido", "Refrigerios incluidos", "Asientos cómodos"],
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
      {
        id: randomUUID(),
        name: "Autobús Ejecutivo",
        type: "bus",
        capacity: 25,
        luggageCapacity: 15,
        capacityText: null,
        luggageText: null,
        basePrice: "200",
        features: ["Asientos reclinables", "Aire acondicionado dual", "Entretenimiento", "Baño a bordo"],
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
      {
        id: randomUUID(),
        name: "Mercedes-Benz Clase E",
        type: "suv",
        capacity: 4,
        luggageCapacity: 3,
        capacityText: null,
        luggageText: null,
        basePrice: "150",
        features: ["Vehículo de lujo premium", "Conductor con traje", "Agua premium", "Cargadores USB"],
        imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
      {
        id: randomUUID(),
        name: "Autobús de Lujo",
        type: "bus",
        capacity: 45,
        luggageCapacity: 30,
        capacityText: null,
        luggageText: null,
        basePrice: "350",
        features: ["Asientos de cuero", "WiFi premium", "Sistema de entretenimiento", "Refrigerador", "Baño VIP"],
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        licensePlate: null,
        year: null,
        color: null,
        available: true,
        driverId: null,
      },
    ];

    vehicles.forEach(vehicle => this.vehicles.set(vehicle.id, vehicle));

    // Initialize tours with real Dominican Republic destinations
    const tours: Tour[] = [
      {
        id: randomUUID(),
        name: "Isla Saona Paradise",
        description: "Descubre el paraíso tropical de Isla Saona con sus playas de arena blanca y aguas cristalinas. Una experiencia única en el Caribe dominicano.",
        duration: "8 horas",
        price: "85",
        includes: ["Transporte ida y vuelta", "Almuerzo bufet en la playa", "Bebidas incluidas", "Equipo de snorkeling", "Guía turístico bilingüe"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "beach",
        popular: true,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "27 Charcos de Damajagua",
        description: "Aventura extrema en las cascadas más famosas de República Dominicana. Saltos, toboganes naturales y piscinas de agua dulce.",
        duration: "10 horas",
        price: "95",
        includes: ["Transporte especializado", "Equipo de seguridad completo", "Guía certificado", "Almuerzo típico dominicano", "Fotos profesionales"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "adventure",
        popular: false,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Zona Colonial Santo Domingo",
        description: "Explora la primera ciudad del Nuevo Mundo. Historia, cultura y arquitectura colonial en el corazón de América.",
        duration: "6 horas",
        price: "70",
        includes: ["Transporte cómodo", "Guía historiador", "Entradas a monumentos", "Almuerzo en restaurante típico", "Mapa turístico"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "cultural",
        popular: false,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Cayo Levantado (Bacardí Island)",
        description: "Isla paradisíaca en la Bahía de Samaná. Relájate en playas vírgenes y disfruta de la naturaleza caribeña.",
        duration: "7 horas",
        price: "75",
        includes: ["Transporte marítimo", "Almuerzo caribeño", "Bebidas tropicales", "Tiempo libre en la playa", "Equipo de playa"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "beach",
        popular: true,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Parque Nacional del Este",
        description: "Aventura ecológica en uno de los parques más diversos del Caribe. Cuevas, playas vírgenes y vida silvestre.",
        duration: "9 horas",
        price: "90",
        includes: ["Transporte 4x4", "Guía naturalista", "Almuerzo eco-friendly", "Equipo de exploración", "Entrada al parque"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "nature",
        popular: false,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "Hoyo Azul + Zipline Scape Park",
        description: "Combinación perfecta de aventura y naturaleza. Cenote natural y emocionantes tirolinas en la jungla.",
        duration: "5 horas",
        price: "65",
        includes: ["Transporte al parque", "Equipo de tirolina", "Acceso al Hoyo Azul", "Instructor certificado", "Refreshment incluido"],
        highlights: null,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "adventure",
        popular: true,
        rating: null,
        reviews: null,
        maxParticipants: null,
        minParticipants: 1,
        difficultyLevel: null,
        isActive: true,
      },
    ];

    tours.forEach(tour => this.tours.set(tour.id, tour));

    // Initialize testimonials with real reviews
    const testimonials: Testimonial[] = [
      {
        id: randomUUID(),
        customerName: "Alicia H.",
        customerInitials: "AH",
        rating: 5,
        review: "Excelente servicio! El transfer fue puntual, muy cómodo, y el conductor súper amable. Hizo que nuestro viaje en Punta Cana fuera libre de estrés. Lo recomiendo 100%.",
        date: "Agosto 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
      {
        id: randomUUID(),
        customerName: "Nathan Mapp",
        customerInitials: "NM",
        rating: 5,
        review: "Estaba escéptico al principio, pero el servicio superó mis expectativas. Pago por adelantado, comunicación excelente por WhatsApp, y conductores profesionales. $35 por una van fue un precio justo.",
        date: "Septiembre 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
      {
        id: randomUUID(),
        customerName: "Shanda Young",
        customerInitials: "SY",
        rating: 5,
        review: "Viajé con un grupo grande y el servicio fue excepcional. La comunicación fue excelente, el servicio profesional y la hospitalidad excepcional. Definitivamente los usaré otra vez.",
        date: "Agosto 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
      {
        id: randomUUID(),
        customerName: "Wilbur Smith",
        customerInitials: "WS",
        rating: 5,
        review: "Excellent service! The transfer was on time, very comfortable, and the driver was professional and friendly. Made our trip in Punta Cana stress-free. Highly recommend",
        date: "Agosto 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
      {
        id: randomUUID(),
        customerName: "Mariela Mazziotti",
        customerInitials: "MM",
        rating: 5,
        review: "Great service! Punctual, safe, and friendly transfer from-to Punta Cana airport, and tours. Thanks!",
        date: "Agosto 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
      {
        id: randomUUID(),
        customerName: "Nathalie Velasco",
        customerInitials: "NV",
        rating: 5,
        review: "I am extremely satisfied with this transportation service. The airport pick up and drop off went by really quick and smooth. The drivers were very professional, friendly and helpful. Will recommend and use them again!",
        date: "Agosto 2025",
        verified: true,
        source: null,
        bookingId: null,
        isFeatured: false,
      },
    ];

    testimonials.forEach(testimonial => this.testimonials.set(testimonial.id, testimonial));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vehicle methods
  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      id,
      name: insertVehicle.name,
      type: insertVehicle.type,
      capacity: insertVehicle.capacity,
      luggageCapacity: (insertVehicle as any).luggageCapacity,
      basePrice: (insertVehicle as any).basePrice,
      features: Array.isArray((insertVehicle as any).features)
        ? (insertVehicle as any).features.map((x: any) => String(x))
        : [],
      available: (insertVehicle as any).available ?? true,
      capacityText: (insertVehicle as any).capacityText ?? null,
      luggageText: (insertVehicle as any).luggageText ?? null,
      imageUrl: (insertVehicle as any).imageUrl ?? null,
      licensePlate: (insertVehicle as any).licensePlate ?? null,
      year: (insertVehicle as any).year ?? null,
      color: (insertVehicle as any).color ?? null,
      driverId: (insertVehicle as any).driverId ?? null,
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Tour methods
  async getAllTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getTourById(id: string): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = randomUUID();
    const tour: Tour = {
      id,
      name: insertTour.name,
      description: insertTour.description,
      duration: insertTour.duration,
      price: (insertTour as any).price,
      includes: Array.isArray((insertTour as any).includes)
        ? (insertTour as any).includes.map((x: any) => String(x))
        : [],
      category: (insertTour as any).category,
      popular: (insertTour as any).popular ?? false,
      highlights: (insertTour as any).highlights ?? null,
      imageUrl: (insertTour as any).imageUrl ?? null,
      rating: (insertTour as any).rating ?? null,
      reviews: (insertTour as any).reviews ?? null,
      maxParticipants: (insertTour as any).maxParticipants ?? null,
      minParticipants: (insertTour as any).minParticipants ?? 1,
      difficultyLevel: (insertTour as any).difficultyLevel ?? null,
      isActive: (insertTour as any).isActive ?? true,
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: string, updates: Partial<Tour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;
    
    const updatedTour = { ...tour, ...updates };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }

  async deleteTour(id: string): Promise<boolean> {
    return this.tours.delete(id);
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      verified: insertTestimonial.verified ?? true,
      source: (insertTestimonial as any).source ?? null,
      bookingId: (insertTestimonial as any).bookingId ?? null,
      isFeatured: (insertTestimonial as any).isFeatured ?? false,
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, ...updates };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    return this.testimonials.delete(id);
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const now = new Date();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      originPlaceId: (insertBooking as any).originPlaceId ?? null,
      destinationPlaceId: (insertBooking as any).destinationPlaceId ?? null,
      originCoords: (insertBooking as any).originCoords ?? null,
      destinationCoords: (insertBooking as any).destinationCoords ?? null,
      returnDate: (insertBooking as any).returnDate ?? null,
      finalPrice: (insertBooking as any).finalPrice ?? null,
      specialRequests: (insertBooking as any).specialRequests ?? null,
      paymentStatus: (insertBooking as any).paymentStatus ?? "pending",
      paymentMethod: (insertBooking as any).paymentMethod ?? null,
      flightNumber: (insertBooking as any).flightNumber ?? null,
      flightDate: (insertBooking as any).flightDate ?? null,
      flightVerified: (insertBooking as any).flightVerified ?? false,
      flightStatus: (insertBooking as any).flightStatus ?? null,
      flightAirline: (insertBooking as any).flightAirline ?? null,
      flightDepartureIata: (insertBooking as any).flightDepartureIata ?? null,
      flightArrivalIata: (insertBooking as any).flightArrivalIata ?? null,
      vehicleId: (insertBooking as any).vehicleId ?? null,
      driverId: (insertBooking as any).driverId ?? null,
      notes: (insertBooking as any).notes ?? null,
      leadSource: (insertBooking as any).leadSource ?? null,
      zapierLeadId: (insertBooking as any).zapierLeadId ?? null,
      hubspotDealId: (insertBooking as any).hubspotDealId ?? null,
      hubspotContactId: (insertBooking as any).hubspotContactId ?? null,
      confirmedAt: (insertBooking as any).confirmedAt ?? null,
      paidAt: (insertBooking as any).paidAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = {
      ...booking,
      status,
      updatedAt: new Date(),
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Contact message methods
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      status: "new",
      phone: (insertMessage as any).phone ?? null,
      priority: (insertMessage as any).priority ?? "normal",
      assignedTo: (insertMessage as any).assignedTo ?? null,
      response: (insertMessage as any).response ?? null,
      leadSource: (insertMessage as any).leadSource ?? null,
      zapierLeadId: (insertMessage as any).zapierLeadId ?? null,
      hubspotDealId: (insertMessage as any).hubspotDealId ?? null,
      hubspotContactId: (insertMessage as any).hubspotContactId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = {
      ...message,
      status,
    };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
