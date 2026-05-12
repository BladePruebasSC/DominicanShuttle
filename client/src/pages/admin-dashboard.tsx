import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit, 
  Trash2, 
  Plus,
  Save,
  Loader2,
  Car,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { dataSource } from '@/lib/data-source';
import AuthGate from '@/components/auth-gate';
import type { Tour, Vehicle, Testimonial, Booking, TourBooking } from '@shared/schema';
import { COMPANY_INFO } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt: string | null;
};

// Componentes de formularios fuera del componente principal para evitar re-renders
const TourForm = React.memo(({ 
  tour, 
  onSave, 
  onCancel, 
  isSaving 
}: { 
  tour?: Tour; 
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const lastTourIdRef = useRef<string | undefined>(tour?.id);
  const [formData, setFormData] = useState(() => ({
    name: tour?.name || '',
    description: tour?.description || '',
    duration: tour?.duration || '',
    price: tour?.price || '',
    includes: Array.isArray(tour?.includes) ? tour.includes.join(', ') : '',
    imageUrl: tour?.imageUrl || '',
    category: tour?.category || 'beach',
    popular: tour?.popular || false,
  }));

  // Actualizar formData solo cuando cambie el ID del tour
  useEffect(() => {
    const currentTourId = tour?.id;
    
    if (lastTourIdRef.current !== currentTourId) {
      lastTourIdRef.current = currentTourId;
      
      if (tour) {
        setFormData({
          name: tour.name || '',
          description: tour.description || '',
          duration: tour.duration || '',
          price: tour.price || '',
          includes: Array.isArray(tour.includes) ? tour.includes.join(', ') : '',
          imageUrl: tour.imageUrl || '',
          category: tour.category || 'beach',
          popular: tour.popular || false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          duration: '',
          price: '',
          includes: '',
          imageUrl: '',
          category: 'beach',
          popular: false,
        });
      }
    }
  }, [tour?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      includes: formData.includes.split(',').map(i => i.trim()).filter(Boolean),
      price: formData.price.toString(),
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Nombre del Tour</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Duración</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="Ej: 8 horas"
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Precio (USD)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-black/10 bg-white text-void">
              <SelectItem value="beach" className="text-void focus:bg-coco-gold/10">Playa</SelectItem>
              <SelectItem value="adventure" className="text-void focus:bg-coco-gold/10">Aventura</SelectItem>
              <SelectItem value="cultural" className="text-void focus:bg-coco-gold/10">Cultural</SelectItem>
              <SelectItem value="nature" className="text-void focus:bg-coco-gold/10">Naturaleza</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Incluye (separado por comas)</Label>
        <Input
          value={formData.includes}
          onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
          placeholder="Transporte, Almuerzo, Guía..."
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
        />
      </div>
      
      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">URL de Imagen</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://..."
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
        />
      </div>
        
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.popular}
          onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
        />
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Tour Popular</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="bg-coco-gold text-black hover:bg-coco-gold/90">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {tour ? 'Actualizar' : 'Crear'} Tour
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#D0D0D0] text-void hover:bg-coco-gold/10 hover:text-void">
          Cancelar
        </Button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  return prevProps.tour?.id === nextProps.tour?.id && prevProps.isSaving === nextProps.isSaving;
});

const VehicleForm = React.memo(({ 
  vehicle, 
  onSave, 
  onCancel, 
  isSaving 
}: { 
  vehicle?: Vehicle; 
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const lastVehicleIdRef = useRef<string | undefined>(vehicle?.id);
  const [formData, setFormData] = useState(() => ({
    name: vehicle?.name || '',
    type: vehicle?.type || 'sedan',
    capacity: vehicle?.capacity || 3,
    luggageCapacity: vehicle?.luggageCapacity || 2,
    basePrice: vehicle?.basePrice || '',
    features: Array.isArray(vehicle?.features) ? vehicle.features.join(', ') : '',
    imageUrl: vehicle?.imageUrl || '',
    available: vehicle?.available ?? true,
  }));

  useEffect(() => {
    const currentVehicleId = vehicle?.id;
    
    if (lastVehicleIdRef.current !== currentVehicleId) {
      lastVehicleIdRef.current = currentVehicleId;
      
      if (vehicle) {
        setFormData({
          name: vehicle.name || '',
          type: vehicle.type || 'sedan',
          capacity: vehicle.capacity || 3,
          luggageCapacity: vehicle.luggageCapacity || 2,
          basePrice: vehicle.basePrice || '',
          features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '',
          imageUrl: vehicle.imageUrl || '',
          available: vehicle.available ?? true,
        });
      } else {
        setFormData({
          name: '',
          type: 'sedan',
          capacity: 3,
          luggageCapacity: 2,
          basePrice: '',
          features: '',
          imageUrl: '',
          available: true,
        });
      }
    }
  }, [vehicle?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      basePrice: formData.basePrice.toString(),
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Nombre del Vehículo</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-black/10 bg-white text-void">
              <SelectItem value="sedan" className="text-void focus:bg-coco-gold/10">Sedán</SelectItem>
              <SelectItem value="suv" className="text-void focus:bg-coco-gold/10">SUV</SelectItem>
              <SelectItem value="van" className="text-void focus:bg-coco-gold/10">Van</SelectItem>
              <SelectItem value="bus" className="text-void focus:bg-coco-gold/10">Autobús</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
        
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Capacidad (pasajeros)</Label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Capacidad de Equipaje</Label>
          <Input
            type="number"
            value={formData.luggageCapacity}
            onChange={(e) => setFormData({ ...formData, luggageCapacity: parseInt(e.target.value) })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
      </div>
        
      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Precio Base (USD)</Label>
        <Input
          type="number"
          value={formData.basePrice}
          onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
          required
        />
      </div>
        
      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Características (separado por comas)</Label>
        <Input
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Aire acondicionado, WiFi, Agua gratis..."
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
        />
      </div>
        
      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">URL de Imagen</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://..."
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
        />
      </div>
        
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.available}
          onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
        />
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Disponible</Label>
      </div>
        
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="bg-coco-gold text-black hover:bg-coco-gold/90">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {vehicle ? 'Actualizar' : 'Crear'} Vehículo
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#D0D0D0] text-void hover:bg-coco-gold/10 hover:text-void">
          Cancelar
        </Button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  return prevProps.vehicle?.id === nextProps.vehicle?.id && prevProps.isSaving === nextProps.isSaving;
});

const TestimonialForm = React.memo(({ 
  testimonial, 
  onSave, 
  onCancel, 
  isSaving 
}: { 
  testimonial?: Testimonial; 
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const lastTestimonialIdRef = useRef<string | undefined>(testimonial?.id);
  const [formData, setFormData] = useState(() => ({
    customerName: testimonial?.customerName || '',
    customerInitials: testimonial?.customerInitials || '',
    rating: testimonial?.rating || 5,
    review: testimonial?.review || '',
    date: testimonial?.date || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    verified: testimonial?.verified ?? true,
  }));

  useEffect(() => {
    const currentTestimonialId = testimonial?.id;
    
    if (lastTestimonialIdRef.current !== currentTestimonialId) {
      lastTestimonialIdRef.current = currentTestimonialId;
      
      if (testimonial) {
        setFormData({
          customerName: testimonial.customerName || '',
          customerInitials: testimonial.customerInitials || '',
          rating: testimonial.rating || 5,
          review: testimonial.review || '',
          date: testimonial.date || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          verified: testimonial.verified ?? true,
        });
      } else {
        setFormData({
          customerName: '',
          customerInitials: '',
          rating: 5,
          review: '',
          date: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          verified: true,
        });
      }
    }
  }, [testimonial?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Nombre del Cliente</Label>
          <Input
            value={formData.customerName}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                customerName: e.target.value,
                customerInitials: e.target.value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              });
            }}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Iniciales</Label>
          <Input
            value={formData.customerInitials}
            onChange={(e) => setFormData({ ...formData, customerInitials: e.target.value })}
            maxLength={2}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Reseña</Label>
        <Textarea
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          rows={4}
          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Calificación (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Fecha</Label>
          <Input
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="Ej: Agosto 2025"
            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.verified}
          onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
        />
        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Verificado</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} className="bg-coco-gold text-black hover:bg-coco-gold/90">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {testimonial ? 'Actualizar' : 'Crear'} Testimonio
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#D0D0D0] text-void hover:bg-coco-gold/10 hover:text-void">
          Cancelar
        </Button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  return prevProps.testimonial?.id === nextProps.testimonial?.id && prevProps.isSaving === nextProps.isSaving;
});

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');
  // `undefined` se usa como "nuevo" (crear) en esta UI.
  const [editingTour, setEditingTour] = useState<Tour | null | undefined>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null | undefined>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null | undefined>(null);
  const [contactInfo, setContactInfo] = useState(COMPANY_INFO);
  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    vehicleType: 'all',
    flightVerified: 'all',
    search: '',
  });
  const [bookingType, setBookingType] = useState<'transport' | 'tours'>('transport');
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [verifyingFlightBookingId, setVerifyingFlightBookingId] = useState<string | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null | undefined>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    contentHtml: '<h1></h1>\n<p></p>',
    coverImageUrl: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    status: 'draft' as 'draft' | 'scheduled' | 'published' | 'failed',
  });

  // Queries
  const { data: tours = [], isLoading: toursLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => dataSource.listTours(),
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => dataSource.listVehicles(),
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['/api/testimonials'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/testimonials');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['transportBookings'],
    queryFn: () => dataSource.listTransportBookings(),
  });

  const { data: tourBookings = [], isLoading: tourBookingsLoading } = useQuery({
    queryKey: ['tourBookings'],
    queryFn: () => dataSource.listTourBookings(),
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', bookingFilters.dateFrom, bookingFilters.dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (bookingFilters.dateFrom) params.set('from', bookingFilters.dateFrom);
      if (bookingFilters.dateTo) params.set('to', bookingFilters.dateTo);
      const qs = params.toString();
      const res = await apiRequest('GET', `/api/dashboard/stats${qs ? `?${qs}` : ''}`);
      return await res.json();
    },
    staleTime: 30_000,
  });

  const { data: blogPosts = [], isLoading: blogPostsLoading } = useQuery({
    queryKey: ['blogPostsAdmin'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blog/posts?status=all&limit=50');
      const payload = await res.json();
      return Array.isArray(payload?.items) ? payload.items : [];
    },
  });

  // Mutations
  const createTour = useMutation({
    mutationFn: (data: any) => dataSource.createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: 'Tour creado exitosamente' });
      setEditingTour(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear tour' });
    },
  });

  const updateTour = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await dataSource.updateTour(id, data);
    },
    onSuccess: async (updatedTour) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: 'Tour actualizado exitosamente' });
      setEditingTour(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar tour' });
    },
  });

  const deleteTour = useMutation({
    mutationFn: async (id: string) => {
      await dataSource.deleteTour(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: 'Tour eliminado exitosamente' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al eliminar tour' });
    },
  });

  const createVehicle = useMutation({
    mutationFn: (data: any) => dataSource.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Vehículo creado exitosamente' });
      setEditingVehicle(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear vehículo' });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await dataSource.updateVehicle(id, data);
    },
    onSuccess: async (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Vehículo actualizado exitosamente' });
      setEditingVehicle(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar vehículo' });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      await dataSource.deleteVehicle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Vehículo eliminado exitosamente' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al eliminar vehículo' });
    },
  });

  const createTestimonial = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/testimonials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: 'Testimonio creado exitosamente' });
      setEditingTestimonial(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear testimonio' });
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/testimonials/${id}`, data);
      return await res.json();
    },
    onSuccess: async (updatedTestimonial) => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: 'Testimonio actualizado exitosamente' });
      setEditingTestimonial(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar testimonio' });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: 'Testimonio eliminado exitosamente' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al eliminar testimonio' });
    },
  });

  const markBookingPaid = useMutation({
    mutationFn: async (booking: Booking) => {
      const amount = (booking as any).finalPrice ?? booking.estimatedPrice;
      const res = await apiRequest('PATCH', `/api/bookings/${booking.id}/payment`, {
        paymentStatus: 'paid',
        paymentMethod: (booking as any).paymentMethod ?? 'manual_dashboard',
        finalPrice: amount,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportBookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast({ title: 'Reserva marcada como pagada y webhook disparado' });
      setPayingBookingId(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'No se pudo marcar como pagada' });
      setPayingBookingId(null);
    },
  });

  const createBlogPost = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/blog/posts', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPostsAdmin'] });
      toast({ title: 'Post creado exitosamente' });
      setEditingBlogPost(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear post' });
    },
  });

  const updateBlogPost = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/blog/posts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPostsAdmin'] });
      toast({ title: 'Post actualizado exitosamente' });
      setEditingBlogPost(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar post' });
    },
  });

  const deleteBlogPost = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/blog/posts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPostsAdmin'] });
      toast({ title: 'Post eliminado exitosamente' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al eliminar post' });
    },
  });

  // Nota: El dashboard es para monitoreo/seguimiento (no para aceptar/denegar).

  // Callbacks estables para los formularios usando useRef para evitar re-renders
  const editingTourRef = useRef(editingTour);
  const editingVehicleRef = useRef(editingVehicle);
  const editingTestimonialRef = useRef(editingTestimonial);

  useEffect(() => {
    editingTourRef.current = editingTour;
  }, [editingTour]);

  useEffect(() => {
    editingVehicleRef.current = editingVehicle;
  }, [editingVehicle]);

  useEffect(() => {
    editingTestimonialRef.current = editingTestimonial;
  }, [editingTestimonial]);

  const handleTourSave = useCallback((data: any) => {
    const currentTour = editingTourRef.current;
    if (currentTour) {
      updateTour.mutate({ id: currentTour.id, data });
    } else {
      createTour.mutate(data);
    }
  }, [updateTour, createTour]);

  const handleTourCancel = useCallback(() => {
    setEditingTour(null);
  }, []);

  const handleVehicleSave = useCallback((data: any) => {
    const currentVehicle = editingVehicleRef.current;
    if (currentVehicle) {
      updateVehicle.mutate({ id: currentVehicle.id, data });
    } else {
      createVehicle.mutate(data);
    }
  }, [updateVehicle, createVehicle]);

  const handleVehicleCancel = useCallback(() => {
    setEditingVehicle(null);
  }, []);

  const handleTestimonialSave = useCallback((data: any) => {
    const currentTestimonial = editingTestimonialRef.current;
    if (currentTestimonial) {
      updateTestimonial.mutate({ id: currentTestimonial.id, data });
    } else {
      createTestimonial.mutate(data);
    }
  }, [updateTestimonial, createTestimonial]);

  const handleTestimonialCancel = useCallback(() => {
    setEditingTestimonial(null);
  }, []);

  useEffect(() => {
    if (editingBlogPost === undefined) {
      setBlogForm({
        title: '',
        slug: '',
        excerpt: '',
        contentHtml: '<h1></h1>\n<p></p>',
        coverImageUrl: '',
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        status: 'draft',
      });
      return;
    }
    if (editingBlogPost) {
      setBlogForm({
        title: editingBlogPost.title || '',
        slug: editingBlogPost.slug || '',
        excerpt: editingBlogPost.excerpt || '',
        contentHtml: editingBlogPost.contentHtml || '<h1></h1>\n<p></p>',
        coverImageUrl: editingBlogPost.coverImageUrl || '',
        metaTitle: editingBlogPost.metaTitle || '',
        metaDescription: editingBlogPost.metaDescription || '',
        focusKeyword: editingBlogPost.focusKeyword || '',
        status: editingBlogPost.status || 'draft',
      });
    }
  }, [editingBlogPost]);

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...blogForm,
      excerpt: blogForm.excerpt || null,
      coverImageUrl: blogForm.coverImageUrl || null,
      metaTitle: blogForm.metaTitle || null,
      metaDescription: blogForm.metaDescription || null,
      focusKeyword: blogForm.focusKeyword || null,
      slug: blogForm.slug || undefined,
    };
    if (editingBlogPost) {
      updateBlogPost.mutate({ id: editingBlogPost.id, data: payload });
    } else {
      createBlogPost.mutate(payload);
    }
  };

  // Usar los formularios que están definidos fuera del componente

  return (
    <AuthGate>
      <div className="min-h-screen bg-coco-panel pt-24 pb-12 px-3 text-void antialiased sm:px-5">
        <div className="mx-auto max-w-[1600px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <aside className="shrink-0 lg:sticky lg:top-28 lg:w-56 lg:self-start">
              <div className="rounded-xl border border-coco-gold/15 bg-coco-navy p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-2.5 border-b border-white/10 px-2 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coco-gold font-display text-base font-bold text-void">
                    C
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold leading-tight text-white">
                      Coco<span className="text-coco-gold">Luxe</span>
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Panel</div>
                  </div>
                </div>
                <TabsList className="flex h-auto w-full flex-row gap-1 overflow-x-auto bg-transparent p-0 lg:flex-col lg:overflow-visible">
              <TabsTrigger value="bookings" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <Calendar className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="tours" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <MapPin className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
              Tours
            </TabsTrigger>
              <TabsTrigger value="vehicles" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <Car className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
              Vehículos
            </TabsTrigger>
              <TabsTrigger value="testimonials" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <Star className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
                Testimonios
              </TabsTrigger>
              <TabsTrigger value="contact" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <Phone className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
                Contacto
              </TabsTrigger>
              <TabsTrigger value="tripadvisor" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <ExternalLink className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
                TripAdvisor
            </TabsTrigger>
              <TabsTrigger value="blog" className="nav-dash-trigger group flex shrink-0 items-center gap-2 rounded-lg border-0 px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white data-[state=active]:bg-coco-gold/15 data-[state=active]:text-coco-gold lg:w-full lg:justify-start data-[state=active]:lg:border-l-[3px] data-[state=active]:lg:border-coco-gold data-[state=active]:lg:bg-coco-gold/10 data-[state=active]:lg:pl-[9px]">
                <FileText className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
                Blog
            </TabsTrigger>
          </TabsList>
              </div>
            </aside>
            <main className="min-w-0 flex-1 space-y-5">
              <div className="rounded-xl border border-black/[0.06] bg-white px-5 py-4 shadow-sm">
                <h1 className="font-display text-2xl font-bold text-void">Panel operativo</h1>
                <p className="mt-1 text-xs text-coco-mgray">Reservas, transporte, tours, flota, contacto y blog</p>
              </div>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <CardTitle className="font-display text-xl text-void">Gestión de Reservas</CardTitle>
                      <CardDescription className="text-coco-mgray">Gestiona y comunícate con los clientes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="relative overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-[3px] before:bg-emerald-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-lg text-void">Transporte</CardTitle>
                        <CardDescription className="text-coco-mgray">Resumen del rango seleccionado</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {statsLoading ? (
                          <div className="text-sm text-coco-mgray">Cargando…</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-coco-mgray">Total</div>
                              <div className="text-void font-semibold text-lg">{dashboardStats?.transport?.total ?? 0}</div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Pagadas</div>
                              <div className="text-emerald-700 font-semibold text-lg">
                                {dashboardStats?.transport?.byPaymentStatus?.paid ?? 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Confirmadas</div>
                              <div className="text-void font-semibold text-lg">
                                {dashboardStats?.transport?.byStatus?.confirmed ?? 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Ingresos (USD)</div>
                              <div className="text-coco-gold font-semibold text-lg">
                                ${dashboardStats?.transport?.revenue ?? 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-[3px] before:bg-violet-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-lg text-void">Tours</CardTitle>
                        <CardDescription className="text-coco-mgray">Resumen del rango seleccionado</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {statsLoading ? (
                          <div className="text-sm text-coco-mgray">Cargando…</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-coco-mgray">Total</div>
                              <div className="text-void font-semibold text-lg">{dashboardStats?.tours?.total ?? 0}</div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Pagadas</div>
                              <div className="text-violet-700 font-semibold text-lg">
                                {dashboardStats?.tours?.byPaymentStatus?.paid ?? 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Confirmadas</div>
                              <div className="text-void font-semibold text-lg">
                                {dashboardStats?.tours?.byStatus?.confirmed ?? 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-coco-mgray">Ingresos (USD)</div>
                              <div className="text-coco-gold font-semibold text-lg">
                                ${dashboardStats?.tours?.revenue ?? 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                      type="button"
                      variant={bookingType === 'transport' ? 'default' : 'outline'}
                      onClick={() => setBookingType('transport')}
                      className={
                        bookingType === 'transport'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'border border-black/10 bg-white text-coco-mgray hover:border-coco-gold/40 hover:text-void'
                      }
                    >
                      Transporte
                    </Button>
                    <Button
                      type="button"
                      variant={bookingType === 'tours' ? 'default' : 'outline'}
                      onClick={() => setBookingType('tours')}
                      className={
                        bookingType === 'tours'
                          ? 'bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100'
                          : 'border border-black/10 bg-white text-coco-mgray hover:border-coco-gold/40 hover:text-void'
                      }
                    >
                      Tours
                    </Button>
                  </div>

                  {(() => {
                    const normalizePhone = (p?: string | null) => (p || '').replace(/[^0-9]/g, '');
                    const transportEmails = new Set((bookings as Booking[]).map(b => b.customerEmail?.toLowerCase()).filter(Boolean));
                    const transportPhones = new Set((bookings as Booking[]).map(b => normalizePhone(b.customerPhone)).filter(Boolean));
                    const tourEmails = new Set((tourBookings as TourBooking[]).map(b => b.customerEmail?.toLowerCase()).filter(Boolean));
                    const tourPhones = new Set((tourBookings as TourBooking[]).map(b => normalizePhone(b.customerPhone)).filter(Boolean));

                    const isSameCustomer = (email?: string | null, phone?: string | null) => {
                      const e = (email || '').toLowerCase();
                      const p = normalizePhone(phone);
                      return (e && (transportEmails.has(e) && tourEmails.has(e))) || (p && (transportPhones.has(p) && tourPhones.has(p)));
                    };

                    return bookingType === 'transport' ? (
                      <>
                  {/* Filtros */}
                  <div className="mb-6 space-y-4 rounded-xl border border-black/[0.08] bg-[#FAFAFA] p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="h-4 w-4 text-coco-gold" />
                      <h3 className="text-void font-semibold">Filtros</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Buscar</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-coco-mgray" />
                          <Input
                            placeholder="Nombre, email..."
                            value={bookingFilters.search}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, search: e.target.value })}
                            className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD] pl-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Estado</Label>
                        <Select
                          value={bookingFilters.status}
                          onValueChange={(value) => setBookingFilters({ ...bookingFilters, status: value })}
                        >
                          <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border border-black/10 bg-white text-void">
                            <SelectItem value="all" className="text-void focus:bg-coco-gold/10">Todos</SelectItem>
                            <SelectItem value="pending" className="text-void focus:bg-coco-gold/10">Pendiente</SelectItem>
                            <SelectItem value="confirmed" className="text-void focus:bg-coco-gold/10">Confirmado</SelectItem>
                            <SelectItem value="in_progress" className="text-void focus:bg-coco-gold/10">En Progreso</SelectItem>
                            <SelectItem value="completed" className="text-void focus:bg-coco-gold/10">Completado</SelectItem>
                            <SelectItem value="cancelled" className="text-void focus:bg-coco-gold/10">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Tipo de Vehículo</Label>
                        <Select
                          value={bookingFilters.vehicleType}
                          onValueChange={(value) => setBookingFilters({ ...bookingFilters, vehicleType: value })}
                        >
                          <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border border-black/10 bg-white text-void">
                            <SelectItem value="all" className="text-void focus:bg-coco-gold/10">Todos</SelectItem>
                            <SelectItem value="sedan" className="text-void focus:bg-coco-gold/10">Sedán</SelectItem>
                            <SelectItem value="suv" className="text-void focus:bg-coco-gold/10">SUV</SelectItem>
                            <SelectItem value="van" className="text-void focus:bg-coco-gold/10">Van</SelectItem>
                            <SelectItem value="bus" className="text-void focus:bg-coco-gold/10">Autobús</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Vuelo</Label>
                        <Select
                          value={bookingFilters.flightVerified}
                          onValueChange={(value) => setBookingFilters({ ...bookingFilters, flightVerified: value })}
                        >
                          <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border border-black/10 bg-white text-void">
                            <SelectItem value="all" className="text-void focus:bg-coco-gold/10">Todos</SelectItem>
                            <SelectItem value="verified" className="text-void focus:bg-coco-gold/10">Verificado</SelectItem>
                            <SelectItem value="not_verified" className="text-void focus:bg-coco-gold/10">No verificado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Desde</Label>
                        <Input
                          type="date"
                          value={bookingFilters.dateFrom}
                          onChange={(e) => setBookingFilters({ ...bookingFilters, dateFrom: e.target.value })}
                          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Hasta</Label>
                        <Input
                          type="date"
                          value={bookingFilters.dateTo}
                          onChange={(e) => setBookingFilters({ ...bookingFilters, dateTo: e.target.value })}
                          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Reservas */}
                  {bookingsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                    </div>
                  ) : (() => {
                    // Filtrar reservas
                    let filteredBookings = bookings as Booking[];
                    
                    if (bookingFilters.status !== 'all') {
                      filteredBookings = filteredBookings.filter(b => b.status === bookingFilters.status);
                    }
                    
                    if (bookingFilters.vehicleType !== 'all') {
                      filteredBookings = filteredBookings.filter(b => b.vehicleType === bookingFilters.vehicleType);
                    }
                    
                    if (bookingFilters.search) {
                      const searchLower = bookingFilters.search.toLowerCase();
                      filteredBookings = filteredBookings.filter(b => 
                        b.customerName.toLowerCase().includes(searchLower) ||
                        b.customerEmail.toLowerCase().includes(searchLower) ||
                        b.customerPhone.includes(searchLower) ||
                        b.origin.toLowerCase().includes(searchLower) ||
                        b.destination.toLowerCase().includes(searchLower)
                      );
                    }

                    if (bookingFilters.flightVerified === 'verified') {
                      filteredBookings = filteredBookings.filter((b: any) => Boolean(b.flightVerified));
                    }
                    if (bookingFilters.flightVerified === 'not_verified') {
                      filteredBookings = filteredBookings.filter((b: any) => !b.flightVerified);
                    }
                    
                    if (bookingFilters.dateFrom) {
                      filteredBookings = filteredBookings.filter(b => {
                        const pickupDate = new Date(b.pickupDate);
                        const filterDate = new Date(bookingFilters.dateFrom);
                        return pickupDate >= filterDate;
                      });
                    }
                    
                    if (bookingFilters.dateTo) {
                      filteredBookings = filteredBookings.filter(b => {
                        const pickupDate = new Date(b.pickupDate);
                        const filterDate = new Date(bookingFilters.dateTo);
                        filterDate.setHours(23, 59, 59);
                        return pickupDate <= filterDate;
                      });
                    }

                    // Ordenar por fecha de recogida (más recientes primero)
                    filteredBookings.sort((a, b) => 
                      new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime()
                    );

                    return filteredBookings.length === 0 ? (
                      <div className="text-center py-8 text-coco-mgray">
                        <p>No hay reservas que coincidan con los filtros.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                          const getStatusBadge = (status: string) => {
                            const statusMap: Record<string, { label: string; className: string }> = {
                              pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
                              confirmed: { label: 'Confirmado', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
                              in_progress: { label: 'En Progreso', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
                              completed: { label: 'Completado', className: 'bg-gray-100 text-void border-gray-200' },
                              cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
                            };
                            const statusInfo = statusMap[status] || statusMap.pending;
                            return (
                              <Badge className={statusInfo.className}>
                                {statusInfo.label}
                              </Badge>
                            );
                          };

                          const formatDate = (dateValue: string | Date) => {
                            const date = new Date(dateValue as any);
                            return date.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          };

                          const openWhatsApp = (phone: string, booking: Booking) => {
                            const message = encodeURIComponent(
                              `Hola ${booking.customerName}, te contactamos sobre tu reserva del ${formatDate(booking.pickupDate)}. ` +
                              `Origen: ${booking.origin} - Destino: ${booking.destination}. ` +
                              `¿Podemos confirmar los detalles?`
                            );
                            const whatsappNumber = phone.replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                          };

                          const openEmail = (email: string, booking: Booking) => {
                            const subject = encodeURIComponent(`Confirmación de Reserva - ${booking.customerName}`);
                            const body = encodeURIComponent(
                              `Hola ${booking.customerName},\n\n` +
                              `Te contactamos sobre tu reserva:\n\n` +
                              `Fecha de recogida: ${formatDate(booking.pickupDate)}\n` +
                              `Origen: ${booking.origin}\n` +
                              `Destino: ${booking.destination}\n` +
                              `Pasajeros: ${booking.passengers}\n` +
                              `Tipo de vehículo: ${booking.vehicleType}\n` +
                              `Precio estimado: $${booking.estimatedPrice} USD\n\n` +
                              `Por favor confirma si estos detalles son correctos.\n\n` +
                              `Saludos,\nCocoluxe`
                            );
                            window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
                          };

                          const reverifyFlight = async (booking: any) => {
                            const flightNumber = String(booking.flightNumber || '').trim();
                            if (!flightNumber) {
                              toast({ variant: 'destructive', title: 'Esta reserva no tiene número de vuelo' });
                              return;
                            }
                            try {
                              setVerifyingFlightBookingId(booking.id);
                              const params = new URLSearchParams({ flightNumber });
                              if (booking.flightDate) params.set('flightDate', String(booking.flightDate));
                              const res = await apiRequest('GET', `/api/flights/verify?${params.toString()}`);
                              const result = await res.json();
                              await apiRequest('PATCH', `/api/bookings/${booking.id}/assignment`, {
                                notes: [
                                  booking.notes || '',
                                  `[FlightRecheck] ${result.flightNumber || flightNumber} ${result.status || 'N/A'} ${result?.departure?.iata || '-'}->${result?.arrival?.iata || '-'}`
                                ].filter(Boolean).join('\n'),
                              });
                              queryClient.invalidateQueries({ queryKey: ['transportBookings'] });
                              toast({ title: result?.verified ? 'Vuelo re-verificado' : 'No verificado', description: result?.reason || result?.status || '' });
                            } catch (error: any) {
                              toast({ variant: 'destructive', title: 'Error re-verificando vuelo', description: error?.message || 'Intenta nuevamente.' });
                            } finally {
                              setVerifyingFlightBookingId(null);
                            }
                          };

                          return (
                            <Card key={booking.id} className="border border-black/[0.06] bg-white shadow-sm">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                      <h3 className="font-semibold text-void text-lg">{booking.customerName}</h3>
                                      {getStatusBadge(booking.status)}
                                      {Boolean((booking as any).flightVerified) && (
                                        <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                                          Vuelo verificado
                                        </Badge>
                                      )}
                                      {String((booking as any).paymentStatus ?? 'pending') === 'paid' ? (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                          Pagada
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                          Pago pendiente
                                        </Badge>
                                      )}
                                      {isSameCustomer(booking.customerEmail, booking.customerPhone) && (
                                        <Badge className="bg-coco-gold/10 text-coco-gold border border-coco-gold/30">
                                          Cliente con Tour + Transporte
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-coco-mgray">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{booking.customerEmail}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{booking.customerPhone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{booking.origin} → {booking.destination}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(booking.pickupDate)}</span>
                                      </div>
                                    </div>
                                    {booking.returnDate && (
                                      <div className="text-sm text-coco-mgray mt-2">
                                        <span className="font-semibold">Regreso:</span> {formatDate(booking.returnDate)}
                                      </div>
                                    )}
                                    {(booking as any).flightNumber && (
                                      <div className="text-sm text-coco-mgray mt-2">
                                        <span className="font-semibold text-void">Vuelo:</span> {(booking as any).flightNumber}
                                        {(booking as any).flightStatus ? ` • ${(booking as any).flightStatus}` : ""}
                                        {(booking as any).flightArrivalIata || (booking as any).flightDepartureIata
                                          ? ` • ${((booking as any).flightDepartureIata || "-")} -> ${((booking as any).flightArrivalIata || "-")}`
                                          : ""}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <div className="text-right">
                                      <div className="text-coco-gold font-bold text-lg">${booking.estimatedPrice} USD</div>
                                      <div className="text-xs text-coco-mgray">
                                        {booking.passengers} pax • {booking.vehicleType} • {booking.serviceType === 'one_way' ? 'Solo ida' : 'Ida y vuelta'}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {booking.specialRequests && (
                                  <div className="mb-4 rounded-lg border border-black/[0.08] bg-[#FAFAFA] p-3">
                                    <p className="text-sm text-coco-mgray">
                                      <span className="font-semibold text-void">Solicitudes especiales:</span> {booking.specialRequests}
                                    </p>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2 border-t border-black/[0.08] pt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openWhatsApp(booking.customerPhone, booking)}
                                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEmail(booking.customerEmail, booking)}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reverifyFlight(booking)}
                                    disabled={verifyingFlightBookingId === booking.id}
                                    className="border-sky-500 text-sky-400 hover:bg-sky-500/10"
                                  >
                                    {verifyingFlightBookingId === booking.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Calendar className="h-4 w-4 mr-2" />
                                    )}
                                    Re-verificar vuelo
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setPayingBookingId(booking.id);
                                      markBookingPaid.mutate(booking);
                                    }}
                                    disabled={
                                      payingBookingId === booking.id ||
                                      markBookingPaid.isPending ||
                                      String((booking as any).paymentStatus ?? 'pending') === 'paid'
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    {payingBookingId === booking.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {String((booking as any).paymentStatus ?? 'pending') === 'paid'
                                      ? 'Ya pagada'
                                      : 'Marcar pagada'}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}
                      </>
                    ) : (
                      <>
                        {/* Filtros (Tours) */}
                        <div className="mb-6 space-y-4 rounded-xl border border-black/[0.08] bg-[#FAFAFA] p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-4 w-4 text-coco-gold" />
                            <h3 className="text-void font-semibold">Filtros (Tours)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Buscar</Label>
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-coco-mgray" />
                                <Input
                                  placeholder="Nombre, email, tour..."
                                  value={bookingFilters.search}
                                  onChange={(e) => setBookingFilters({ ...bookingFilters, search: e.target.value })}
                                  className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD] pl-8"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Estado</Label>
                              <Select
                                value={bookingFilters.status}
                                onValueChange={(value) => setBookingFilters({ ...bookingFilters, status: value })}
                              >
                                <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border border-black/10 bg-white text-void">
                                  <SelectItem value="all" className="text-void focus:bg-coco-gold/10">Todos</SelectItem>
                                  <SelectItem value="pending" className="text-void focus:bg-coco-gold/10">Pendiente</SelectItem>
                                  <SelectItem value="confirmed" className="text-void focus:bg-coco-gold/10">Confirmado</SelectItem>
                                  <SelectItem value="completed" className="text-void focus:bg-coco-gold/10">Completado</SelectItem>
                                  <SelectItem value="cancelled" className="text-void focus:bg-coco-gold/10">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Desde</Label>
                              <Input
                                type="date"
                                value={bookingFilters.dateFrom}
                                onChange={(e) => setBookingFilters({ ...bookingFilters, dateFrom: e.target.value })}
                                className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Hasta</Label>
                              <Input
                                type="date"
                                value={bookingFilters.dateTo}
                                onChange={(e) => setBookingFilters({ ...bookingFilters, dateTo: e.target.value })}
                                className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lista de Reservas de Tours */}
                        {tourBookingsLoading ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                          </div>
                        ) : (() => {
                          let filtered = tourBookings as TourBooking[];

                          if (bookingFilters.status !== 'all') {
                            filtered = filtered.filter(b => b.status === bookingFilters.status);
                          }
                          if (bookingFilters.search) {
                            const s = bookingFilters.search.toLowerCase();
                            filtered = filtered.filter(b =>
                              b.customerName.toLowerCase().includes(s) ||
                              b.customerEmail.toLowerCase().includes(s) ||
                              (b.tourName || '').toLowerCase().includes(s) ||
                              (b.customerPhone || '').includes(s)
                            );
                          }
                          if (bookingFilters.dateFrom) {
                            const from = new Date(bookingFilters.dateFrom);
                            filtered = filtered.filter(b => new Date(b.tourDate) >= from);
                          }
                          if (bookingFilters.dateTo) {
                            const to = new Date(bookingFilters.dateTo);
                            to.setHours(23, 59, 59);
                            filtered = filtered.filter(b => new Date(b.tourDate) <= to);
                          }

                          filtered.sort((a, b) => new Date(b.tourDate).getTime() - new Date(a.tourDate).getTime());

                          const getStatusBadge = (status: string) => {
                            const statusMap: Record<string, { label: string; className: string }> = {
                              pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
                              confirmed: { label: 'Confirmado', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
                              completed: { label: 'Completado', className: 'bg-gray-100 text-void border-gray-200' },
                              cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
                            };
                            const statusInfo = statusMap[status] || statusMap.pending;
                            return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
                          };

                          const formatDate = (dateValue: string | Date) => {
                            const date = new Date(dateValue as any);
                            return date.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          };

                          return filtered.length === 0 ? (
                            <div className="text-center py-8 text-coco-mgray">
                              <p>No hay reservas de tours que coincidan con los filtros.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {filtered.map((tb) => (
                                <Card key={tb.id} className="border border-black/[0.06] bg-white shadow-sm">
                                  <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                          <h3 className="font-semibold text-void text-lg">{tb.customerName}</h3>
                                          {getStatusBadge(tb.status)}
                                          {isSameCustomer(tb.customerEmail, tb.customerPhone) && (
                                            <Badge className="bg-coco-gold/10 text-coco-gold border border-coco-gold/30">
                                              Cliente con Tour + Transporte
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-coco-mgray">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-coco-gold" />
                                            <span><strong>Tour:</strong> {tb.tourName}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-coco-gold" />
                                            <span><strong>Fecha:</strong> {formatDate(tb.tourDate)}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-coco-gold" />
                                            <span>{tb.customerEmail}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-coco-gold" />
                                            <span>{tb.customerPhone || '—'}</span>
                                          </div>
                                        </div>
                                        {tb.notes && (
                                          <div className="mt-3 text-sm text-coco-mgray">
                                            <strong className="text-void">Notas:</strong> {tb.notes}
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col gap-2 min-w-[200px]">
                                        <div className="text-right">
                                          <p className="text-xs text-coco-mgray">Estado</p>
                                          <p className="text-void font-semibold">{tb.status}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-display text-xl text-void">Gestión de Tours</CardTitle>
                      <CardDescription className="text-coco-mgray">Agrega, edita o elimina tours</CardDescription>
                    </div>
                    <Button onClick={() => setEditingTour(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Tour
                    </Button>
              </div>
                  </CardHeader>
                  <CardContent>
                  {editingTour !== null ? (
                    <TourForm 
                      key={editingTour?.id || "new"} 
                      tour={editingTour || undefined} 
                      onSave={handleTourSave}
                      onCancel={handleTourCancel}
                      isSaving={createTour.isPending || updateTour.isPending}
                    />
                  ) : (
                    <div className="space-y-4">
                      {toursLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                      </div>
                      ) : tours.length === 0 ? (
                        <div className="text-center py-8 text-coco-mgray">
                          <p>No hay tours aún. Crea tu primer tour.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tours.map((tour) => (
                            <Card key={tour.id} className="border border-black/[0.06] bg-white shadow-sm">
                              {tour.imageUrl && (
                                <img src={tour.imageUrl} alt={tour.name} className="w-full h-48 object-cover" />
                              )}
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-void">{tour.name}</h3>
                                  {tour.popular && <Badge className="bg-coco-gold text-black">Popular</Badge>}
                                </div>
                                <p className="text-sm text-coco-mgray mb-2 line-clamp-2">{tour.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                  <span className="text-coco-gold font-bold">${tour.price} USD</span>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingTour(tour)}
                                      className="text-void hover:bg-black/[0.06]"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este tour?')) {
                                          deleteTour.mutate(tour.id);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                    )}
                  </CardContent>
                </Card>
          </TabsContent>

            {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-display text-xl text-void">Gestión de Vehículos</CardTitle>
                      <CardDescription className="text-coco-mgray">Agrega, edita o elimina vehículos</CardDescription>
                    </div>
                    <Button onClick={() => setEditingVehicle(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Vehículo
                    </Button>
              </div>
                  </CardHeader>
                  <CardContent>
                  {editingVehicle !== null ? (
                    <VehicleForm 
                      key={editingVehicle?.id || "new"} 
                      vehicle={editingVehicle || undefined} 
                      onSave={handleVehicleSave}
                      onCancel={handleVehicleCancel}
                      isSaving={createVehicle.isPending || updateVehicle.isPending}
                    />
                  ) : (
                    <div className="space-y-4">
                      {vehiclesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                      </div>
                      ) : vehicles.length === 0 ? (
                        <div className="text-center py-8 text-coco-mgray">
                          <p>No hay vehículos aún. Crea tu primer vehículo.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vehicles.map((vehicle) => (
                            <Card key={vehicle.id} className="border border-black/[0.06] bg-white shadow-sm">
                              {vehicle.imageUrl && (
                                <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-48 object-cover" />
                              )}
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-void mb-2">{vehicle.name}</h3>
                                <div className="space-y-1 text-sm text-coco-mgray mb-2">
                                  <p>Tipo: {vehicle.type}</p>
                                  <p>Capacidad: {vehicle.capacity} pasajeros</p>
                                  <p>Equipaje: {vehicle.luggageCapacity} maletas</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                  <span className="text-coco-gold font-bold">${vehicle.basePrice} USD</span>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingVehicle(vehicle)}
                                      className="text-void hover:bg-black/[0.06]"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este vehículo?')) {
                                          deleteVehicle.mutate(vehicle.id);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-display text-xl text-void">Gestión de Testimonios</CardTitle>
                      <CardDescription className="text-coco-mgray">Agrega, edita o elimina testimonios de clientes</CardDescription>
                    </div>
                    <Button onClick={() => setEditingTestimonial(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Testimonio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingTestimonial !== null ? (
                    <TestimonialForm 
                      key={editingTestimonial?.id || "new"} 
                      testimonial={editingTestimonial || undefined} 
                      onSave={handleTestimonialSave}
                      onCancel={handleTestimonialCancel}
                      isSaving={createTestimonial.isPending || updateTestimonial.isPending}
                    />
                  ) : (
                    <div className="space-y-4">
                      {testimonialsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                        </div>
                      ) : testimonials.length === 0 ? (
                        <div className="text-center py-8 text-coco-mgray">
                          <p>No hay testimonios aún. Crea tu primer testimonio.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {testimonials.map((testimonial) => (
                            <Card key={testimonial.id} className="border border-black/[0.06] bg-white shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-void">{testimonial.customerName}</h3>
                                      <div className="flex text-coco-gold">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                          <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm text-coco-mgray">{testimonial.date}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingTestimonial(testimonial)}
                                      className="text-void hover:bg-black/[0.06]"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este testimonio?')) {
                                          deleteTestimonial.mutate(testimonial.id);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
              </div>
            </div>
                                <p className="text-coco-mgray italic">"{testimonial.review}"</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
          </TabsContent>

            {/* Contact Info Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                  <CardHeader>
                  <CardTitle className="font-display text-xl text-void">Información de Contacto</CardTitle>
                  <CardDescription className="text-coco-mgray">Actualiza la información de contacto de la empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Nombre de la Empresa</Label>
                      <Input
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Teléfono</Label>
                        <Input
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">WhatsApp</Label>
                        <Input
                          value={contactInfo.whatsapp}
                          onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                          className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Email</Label>
                      <Input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Zonas de Cobertura (separado por comas)</Label>
                      <Input
                        value={contactInfo.coverage.join(', ')}
                        onChange={(e) => setContactInfo({ 
                          ...contactInfo, 
                          coverage: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                        })}
                        className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"
                      />
                    </div>
                    <Button 
                      className="bg-coco-gold text-black hover:bg-coco-gold/90"
                      onClick={async () => {
                        try {
                          await apiRequest('PUT', '/api/contact-info', contactInfo);
                          toast({ title: 'Información de contacto actualizada exitosamente' });
                        } catch (error) {
                          toast({ variant: 'destructive', title: 'Error al actualizar información de contacto' });
                        }
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                  </CardContent>
                </Card>
          </TabsContent>

            {/* TripAdvisor Tab */}
            <TabsContent value="tripadvisor" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-void">Integración con TripAdvisor</CardTitle>
                  <CardDescription className="text-coco-mgray">Conecta con TripAdvisor para sincronizar reseñas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="border border-coco-gold/25 bg-coco-gold/5 text-void">
                    <ExternalLink className="h-4 w-4 text-coco-gold" />
                    <AlertDescription className="text-sm text-void/80">
                      <strong className="font-semibold text-void">Próximamente:</strong> La integración con TripAdvisor permitirá sincronizar reseñas automáticamente.
                      Para configurar, necesitarás:
                      <ul className="list-disc list-inside mt-2 space-y-1 text-coco-mgray">
                        <li>API Key de TripAdvisor</li>
                        <li>ID de tu negocio en TripAdvisor</li>
                        <li>Configuración de webhook para actualizaciones en tiempo real</li>
                      </ul>
                      <Button className="mt-4 bg-coco-gold text-black hover:bg-coco-gold/90" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Configurar Integración
                      </Button>
            </AlertDescription>
          </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blog" className="space-y-6">
              <Card className="rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-display text-xl text-void">Gestión del Blog</CardTitle>
                      <CardDescription className="text-coco-mgray">Crea y publica posts manualmente desde el dashboard</CardDescription>
                    </div>
                    <Button onClick={() => setEditingBlogPost(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Post
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingBlogPost !== null ? (
                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Título</Label>
                          <Input value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" required />
                        </div>
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Slug (opcional)</Label>
                          <Input value={blogForm.slug} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Extracto</Label>
                        <Textarea value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} rows={3} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Contenido HTML</Label>
                        <Textarea value={blogForm.contentHtml} onChange={(e) => setBlogForm({ ...blogForm, contentHtml: e.target.value })} rows={14} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD] font-mono text-xs" required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Meta title</Label>
                          <Input value={blogForm.metaTitle} onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                        </div>
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Meta description</Label>
                          <Input value={blogForm.metaDescription} onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Palabra clave</Label>
                          <Input value={blogForm.focusKeyword} onChange={(e) => setBlogForm({ ...blogForm, focusKeyword: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                        </div>
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Imagen portada URL</Label>
                          <Input value={blogForm.coverImageUrl} onChange={(e) => setBlogForm({ ...blogForm, coverImageUrl: e.target.value })} className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]" />
                        </div>
                        <div>
                          <Label className="text-[11px] font-bold uppercase tracking-wide text-coco-mgray">Estado</Label>
                          <Select value={blogForm.status} onValueChange={(value: any) => setBlogForm({ ...blogForm, status: value })}>
                            <SelectTrigger className="border border-[#E0E0E0] bg-white text-void placeholder:text-[#BDBDBD]"><SelectValue /></SelectTrigger>
                            <SelectContent className="border border-black/10 bg-white text-void">
                              <SelectItem value="draft" className="text-void focus:bg-coco-gold/10">Borrador</SelectItem>
                              <SelectItem value="published" className="text-void focus:bg-coco-gold/10">Publicado</SelectItem>
                              <SelectItem value="scheduled" className="text-void focus:bg-coco-gold/10">Programado</SelectItem>
                              <SelectItem value="failed" className="text-void focus:bg-coco-gold/10">Fallido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createBlogPost.isPending || updateBlogPost.isPending} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                          {(createBlogPost.isPending || updateBlogPost.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          {editingBlogPost ? 'Actualizar' : 'Crear'} Post
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingBlogPost(null)} className="border-[#D0D0D0] text-void hover:bg-coco-gold/10 hover:text-void">
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {blogPostsLoading ? (
                        <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" /></div>
                      ) : blogPosts.length === 0 ? (
                        <div className="text-center py-8 text-coco-mgray"><p>No hay posts todavía.</p></div>
                      ) : (
                        <div className="space-y-3">
                          {(blogPosts as BlogPost[]).map((post) => (
                            <Card key={post.id} className="border border-black/[0.06] bg-white shadow-sm">
                              <CardContent className="p-4 flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-void">{post.title}</h3>
                                    <Badge className="bg-coco-gold/20 text-coco-gold border-coco-gold/40">{post.status}</Badge>
                                  </div>
                                  <p className="text-xs text-coco-mgray mb-1">/{post.slug}</p>
                                  <p className="text-sm text-coco-mgray">{post.excerpt || 'Sin extracto'}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingBlogPost(post)} className="text-void hover:bg-black/[0.06]">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => { if (confirm('¿Eliminar este post?')) deleteBlogPost.mutate(post.id); }} className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </main>
          </Tabs>
        </div>
      </div>
    </AuthGate>
  );
}
