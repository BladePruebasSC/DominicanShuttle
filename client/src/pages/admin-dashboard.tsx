import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AuthGate from '@/components/auth-gate';
import type { Tour, Vehicle, Testimonial } from '@shared/schema';
import { COMPANY_INFO } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tours');
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [contactInfo, setContactInfo] = useState(COMPANY_INFO);

  // Queries
  const { data: tours = [], isLoading: toursLoading } = useQuery({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/tours');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/vehicles');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['/api/testimonials'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/testimonials');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Mutations
  const createTour = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/tours', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      toast({ title: 'Tour creado exitosamente' });
      setEditingTour(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear tour' });
    },
  });

  const updateTour = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/tours/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      toast({ title: 'Tour actualizado exitosamente' });
      setEditingTour(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar tour' });
    },
  });

  const deleteTour = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      toast({ title: 'Tour eliminado exitosamente' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al eliminar tour' });
    },
  });

  const createVehicle = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: 'Vehículo creado exitosamente' });
      setEditingVehicle(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al crear vehículo' });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: 'Vehículo actualizado exitosamente' });
      setEditingVehicle(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error al actualizar vehículo' });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
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
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/testimonials/${id}`, data),
    onSuccess: () => {
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

  const TourForm = ({ tour }: { tour?: Tour }) => {
    const [formData, setFormData] = useState({
      name: tour?.name || '',
      description: tour?.description || '',
      duration: tour?.duration || '',
      price: tour?.price || '',
      includes: Array.isArray(tour?.includes) ? tour.includes.join(', ') : '',
      imageUrl: tour?.imageUrl || '',
      category: tour?.category || 'beach',
      popular: tour?.popular || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = {
        ...formData,
        includes: formData.includes.split(',').map(i => i.trim()).filter(Boolean),
        price: formData.price.toString(),
      };

      if (tour) {
        updateTour.mutate({ id: tour.id, data });
      } else {
        createTour.mutate(data);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Nombre del Tour</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Duración</Label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ej: 8 horas"
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Descripción</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="bg-void/50 border-white/10 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Precio (USD)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-void/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-void border-white/10">
                <SelectItem value="beach" className="text-white">Playa</SelectItem>
                <SelectItem value="adventure" className="text-white">Aventura</SelectItem>
                <SelectItem value="cultural" className="text-white">Cultural</SelectItem>
                <SelectItem value="nature" className="text-white">Naturaleza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Incluye (separado por comas)</Label>
          <Input
            value={formData.includes}
            onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
            placeholder="Transporte, Almuerzo, Guía..."
            className="bg-void/50 border-white/10 text-white"
          />
        </div>
        
        <div>
          <Label className="text-gray-300">URL de Imagen</Label>
          <Input
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            className="bg-void/50 border-white/10 text-white"
              />
            </div>
            
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.popular}
            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
          />
          <Label className="text-gray-300">Tour Popular</Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createTour.isPending || updateTour.isPending} className="bg-coco-gold text-black hover:bg-coco-gold/90">
            {createTour.isPending || updateTour.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {tour ? 'Actualizar' : 'Crear'} Tour
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditingTour(null)} className="border-white/20 text-white hover:bg-white/10">
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  const VehicleForm = ({ vehicle }: { vehicle?: Vehicle }) => {
    const [formData, setFormData] = useState({
      name: vehicle?.name || '',
      type: vehicle?.type || 'sedan',
      capacity: vehicle?.capacity || 3,
      luggageCapacity: vehicle?.luggageCapacity || 2,
      basePrice: vehicle?.basePrice || '',
      features: Array.isArray(vehicle?.features) ? vehicle.features.join(', ') : '',
      imageUrl: vehicle?.imageUrl || '',
      available: vehicle?.available ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        basePrice: formData.basePrice.toString(),
      };

      if (vehicle) {
        updateVehicle.mutate({ id: vehicle.id, data });
      } else {
        createVehicle.mutate(data);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Nombre del Vehículo</Label>
                <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-void/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-void border-white/10">
                <SelectItem value="sedan" className="text-white">Sedán</SelectItem>
                <SelectItem value="suv" className="text-white">SUV</SelectItem>
                <SelectItem value="van" className="text-white">Van</SelectItem>
                <SelectItem value="bus" className="text-white">Autobús</SelectItem>
              </SelectContent>
            </Select>
          </div>
              </div>
              
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Capacidad (pasajeros)</Label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Capacidad de Equipaje</Label>
                <Input
                  type="number"
              value={formData.luggageCapacity}
              onChange={(e) => setFormData({ ...formData, luggageCapacity: parseInt(e.target.value) })}
              className="bg-void/50 border-white/10 text-white"
              required
                />
              </div>
            </div>
            
        <div>
          <Label className="text-gray-300">Precio Base (USD)</Label>
          <Input
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            className="bg-void/50 border-white/10 text-white"
            required
              />
            </div>
            
        <div>
          <Label className="text-gray-300">Características (separado por comas)</Label>
                    <Input
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="Aire acondicionado, WiFi, Agua gratis..."
            className="bg-void/50 border-white/10 text-white"
                    />
                  </div>
                  
        <div>
          <Label className="text-gray-300">URL de Imagen</Label>
                    <Input
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            className="bg-void/50 border-white/10 text-white"
                    />
                  </div>
            
            <div className="flex items-center space-x-2">
          <Switch
            checked={formData.available}
            onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
          />
          <Label className="text-gray-300">Disponible</Label>
            </div>
            
            <div className="flex gap-2">
          <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending} className="bg-coco-gold text-black hover:bg-coco-gold/90">
            {createVehicle.isPending || updateVehicle.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {vehicle ? 'Actualizar' : 'Crear'} Vehículo
              </Button>
          <Button type="button" variant="outline" onClick={() => setEditingVehicle(null)} className="border-white/20 text-white hover:bg-white/10">
                Cancelar
              </Button>
            </div>
      </form>
    );
  };

  const TestimonialForm = ({ testimonial }: { testimonial?: Testimonial }) => {
    const [formData, setFormData] = useState({
      customerName: testimonial?.customerName || '',
      customerInitials: testimonial?.customerInitials || '',
      rating: testimonial?.rating || 5,
      review: testimonial?.review || '',
      date: testimonial?.date || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      verified: testimonial?.verified ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (testimonial) {
        updateTestimonial.mutate({ id: testimonial.id, data: formData });
      } else {
        createTestimonial.mutate(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Nombre del Cliente</Label>
            <Input
              value={formData.customerName}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  customerName: e.target.value,
                  customerInitials: e.target.value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                });
              }}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Iniciales</Label>
            <Input
              value={formData.customerInitials}
              onChange={(e) => setFormData({ ...formData, customerInitials: e.target.value })}
              maxLength={2}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Reseña</Label>
          <Textarea
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            rows={4}
            className="bg-void/50 border-white/10 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Calificación (1-5)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Fecha</Label>
            <Input
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="Ej: Agosto 2025"
              className="bg-void/50 border-white/10 text-white"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.verified}
            onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
          />
          <Label className="text-gray-300">Verificado</Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createTestimonial.isPending || updateTestimonial.isPending} className="bg-coco-gold text-black hover:bg-coco-gold/90">
            {createTestimonial.isPending || updateTestimonial.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {testimonial ? 'Actualizar' : 'Crear'} Testimonio
                  </Button>
          <Button type="button" variant="outline" onClick={() => setEditingTestimonial(null)} className="border-white/20 text-white hover:bg-white/10">
            Cancelar
                  </Button>
                </div>
      </form>
    );
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-void pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Gestiona tours, vehículos, testimonios e información de contacto</p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-glass-dark border-white/10">
              <TabsTrigger value="tours" className="flex items-center gap-2 data-[state=active]:bg-coco-gold data-[state=active]:text-black">
                <MapPin className="h-4 w-4" />
              Tours
            </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex items-center gap-2 data-[state=active]:bg-coco-gold data-[state=active]:text-black">
                <Car className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2 data-[state=active]:bg-coco-gold data-[state=active]:text-black">
                <Star className="h-4 w-4" />
                Testimonios
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-coco-gold data-[state=active]:text-black">
                <Phone className="h-4 w-4" />
                Contacto
              </TabsTrigger>
              <TabsTrigger value="tripadvisor" className="flex items-center gap-2 data-[state=active]:bg-coco-gold data-[state=active]:text-black">
                <ExternalLink className="h-4 w-4" />
                TripAdvisor
            </TabsTrigger>
          </TabsList>

            {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Gestión de Tours</CardTitle>
                      <CardDescription className="text-gray-400">Agrega, edita o elimina tours</CardDescription>
                    </div>
                    <Button onClick={() => setEditingTour(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Tour
                    </Button>
              </div>
                  </CardHeader>
                  <CardContent>
                  {editingTour !== null ? (
                    <TourForm tour={editingTour} />
                  ) : (
                    <div className="space-y-4">
                      {toursLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                      </div>
                      ) : tours.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No hay tours aún. Crea tu primer tour.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tours.map((tour) => (
                            <Card key={tour.id} className="border-white/10 bg-glass-dark">
                              {tour.imageUrl && (
                                <img src={tour.imageUrl} alt={tour.name} className="w-full h-48 object-cover" />
                              )}
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-white">{tour.name}</h3>
                                  {tour.popular && <Badge className="bg-coco-gold text-black">Popular</Badge>}
                                </div>
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{tour.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                  <span className="text-coco-gold font-bold">${tour.price} USD</span>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingTour(tour)}
                                      className="text-white hover:bg-white/10"
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
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Gestión de Vehículos</CardTitle>
                      <CardDescription className="text-gray-400">Agrega, edita o elimina vehículos</CardDescription>
                    </div>
                    <Button onClick={() => setEditingVehicle(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Vehículo
                    </Button>
              </div>
                  </CardHeader>
                  <CardContent>
                  {editingVehicle !== null ? (
                    <VehicleForm vehicle={editingVehicle} />
                  ) : (
                    <div className="space-y-4">
                      {vehiclesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                      </div>
                      ) : vehicles.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No hay vehículos aún. Crea tu primer vehículo.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vehicles.map((vehicle) => (
                            <Card key={vehicle.id} className="border-white/10 bg-glass-dark">
                              {vehicle.imageUrl && (
                                <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-48 object-cover" />
                              )}
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-white mb-2">{vehicle.name}</h3>
                                <div className="space-y-1 text-sm text-gray-400 mb-2">
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
                                      className="text-white hover:bg-white/10"
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
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Gestión de Testimonios</CardTitle>
                      <CardDescription className="text-gray-400">Agrega, edita o elimina testimonios de clientes</CardDescription>
                    </div>
                    <Button onClick={() => setEditingTestimonial(undefined)} className="bg-coco-gold text-black hover:bg-coco-gold/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Testimonio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingTestimonial !== null ? (
                    <TestimonialForm testimonial={editingTestimonial} />
                  ) : (
                    <div className="space-y-4">
                      {testimonialsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-coco-gold" />
                        </div>
                      ) : testimonials.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No hay testimonios aún. Crea tu primer testimonio.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {testimonials.map((testimonial) => (
                            <Card key={testimonial.id} className="border-white/10 bg-glass-dark">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-white">{testimonial.customerName}</h3>
                                      <div className="flex text-coco-gold">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                          <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-400">{testimonial.date}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingTestimonial(testimonial)}
                                      className="text-white hover:bg-white/10"
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
                                <p className="text-gray-300 italic">"{testimonial.review}"</p>
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
              <Card className="glass-panel border-white/10">
                  <CardHeader>
                  <CardTitle className="text-white">Información de Contacto</CardTitle>
                  <CardDescription className="text-gray-400">Actualiza la información de contacto de la empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Nombre de la Empresa</Label>
                      <Input
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        className="bg-void/50 border-white/10 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Teléfono</Label>
                        <Input
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="bg-void/50 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">WhatsApp</Label>
                        <Input
                          value={contactInfo.whatsapp}
                          onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                          className="bg-void/50 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        className="bg-void/50 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Zonas de Cobertura (separado por comas)</Label>
                      <Input
                        value={contactInfo.coverage.join(', ')}
                        onChange={(e) => setContactInfo({ 
                          ...contactInfo, 
                          coverage: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                        })}
                        className="bg-void/50 border-white/10 text-white"
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
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Integración con TripAdvisor</CardTitle>
                  <CardDescription className="text-gray-400">Conecta con TripAdvisor para sincronizar reseñas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-void/50 border-white/10">
                    <ExternalLink className="h-4 w-4 text-coco-gold" />
                    <AlertDescription className="text-gray-300">
                      <strong className="text-white">Próximamente:</strong> La integración con TripAdvisor permitirá sincronizar reseñas automáticamente.
                      Para configurar, necesitarás:
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
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
          </Tabs>
        </div>
      </div>
    </AuthGate>
  );
}
