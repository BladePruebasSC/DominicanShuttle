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
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useTourImages, 
  useCreateTourImage, 
  useDeleteTourImage,
  useVehicleImages,
  useCreateVehicleImage,
  useDeleteVehicleImage,
  useHomepageImages,
  useCreateHomepageImage,
  useDeleteHomepageImage,
  useImageUpload
} from '@/hooks/use-images';
import AuthGate from '@/components/auth-gate';

interface ImageData {
  id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
  title?: string;
  subtitle?: string;
}

interface TourImage extends ImageData {
  tour_id: string;
}

interface VehicleImage extends ImageData {
  vehicle_id: string;
}

interface HomepageImage extends ImageData {
  section: 'hero' | 'services' | 'testimonials' | 'about' | 'gallery';
  is_active: boolean;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tours');
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Hooks para datos
  const { data: tourImages = [], isLoading: tourImagesLoading } = useTourImages();
  const { data: vehicleImages = [], isLoading: vehicleImagesLoading } = useVehicleImages();
  const { data: homepageImages = [], isLoading: homepageImagesLoading } = useHomepageImages();

  // Hooks para mutaciones
  const createTourImage = useCreateTourImage();
  const deleteTourImage = useDeleteTourImage();
  const createVehicleImage = useCreateVehicleImage();
  const deleteVehicleImage = useDeleteVehicleImage();
  const createHomepageImage = useCreateHomepageImage();
  const deleteHomepageImage = useDeleteHomepageImage();
  const { uploadImage, isUploading } = useImageUpload();

  // Estados para formularios
  const [newImage, setNewImage] = useState({
    image_url: '',
    alt_text: '',
    caption: '',
    title: '',
    subtitle: '',
    display_order: 0,
    is_primary: false,
    section: 'hero' as 'hero' | 'services' | 'testimonials' | 'about' | 'gallery'
  });

  const handleImageUpload = async (file: File, type: 'tours' | 'vehicles' | 'homepage') => {
    try {
      const folder = type === 'tours' ? 'tours' : type === 'vehicles' ? 'vehicles' : 'homepage';
      const result = await uploadImage(file, folder);
      return result.url;
    } catch (error) {
      return null;
    }
  };

  const handleSaveImage = async (type: 'tours' | 'vehicles' | 'homepage', imageData: any) => {
    try {
      if (type === 'tours') {
        await createTourImage.mutateAsync({
          tour_id: 'default-tour-id', // En una implementación real, esto vendría de un selector
          image_url: imageData.image_url,
          alt_text: imageData.alt_text,
          caption: imageData.caption,
          is_primary: imageData.is_primary,
          display_order: imageData.display_order
        });
      } else if (type === 'vehicles') {
        await createVehicleImage.mutateAsync({
          vehicle_id: 'default-vehicle-id', // En una implementación real, esto vendría de un selector
          image_url: imageData.image_url,
          alt_text: imageData.alt_text,
          caption: imageData.caption,
          is_primary: imageData.is_primary,
          display_order: imageData.display_order
        });
      } else if (type === 'homepage') {
        await createHomepageImage.mutateAsync({
          section: imageData.section,
          image_url: imageData.image_url,
          alt_text: imageData.alt_text,
          caption: imageData.caption,
          title: imageData.title,
          subtitle: imageData.subtitle,
          is_primary: imageData.is_primary,
          display_order: imageData.display_order,
          is_active: true
        });
      }
      
      setEditingImage(null);
      setNewImage({
        image_url: '',
        alt_text: '',
        caption: '',
        title: '',
        subtitle: '',
        display_order: 0,
        is_primary: false,
        section: 'hero'
      });
    } catch (error) {
      // El error ya se maneja en los hooks
    }
  };

  const handleDeleteImage = async (id: string, type: 'tours' | 'vehicles' | 'homepage') => {
    try {
      if (type === 'tours') {
        await deleteTourImage.mutateAsync(id);
      } else if (type === 'vehicles') {
        await deleteVehicleImage.mutateAsync(id);
      } else if (type === 'homepage') {
        await deleteHomepageImage.mutateAsync(id);
      }
    } catch (error) {
      // El error ya se maneja en los hooks
    }
  };

  const ImageUploader = ({ type }: { type: 'tours' | 'vehicles' | 'homepage' }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Nueva Imagen
        </CardTitle>
        <CardDescription>
          Sube una nueva imagen para {type === 'tours' ? 'tours' : type === 'vehicles' ? 'vehículos' : 'la página principal'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Seleccionar archivo</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file, type).then(url => {
                  if (url) {
                    setNewImage(prev => ({ ...prev, image_url: url }));
                  }
                });
              }
            }}
            disabled={isUploading}
          />
        </div>
        
        {newImage.image_url && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={newImage.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alt-text">Texto alternativo</Label>
                <Input
                  id="alt-text"
                  value={newImage.alt_text}
                  onChange={(e) => setNewImage(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Descripción de la imagen"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display-order">Orden de visualización</Label>
                <Input
                  id="display-order"
                  type="number"
                  value={newImage.display_order}
                  onChange={(e) => setNewImage(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caption">Leyenda</Label>
              <Textarea
                id="caption"
                value={newImage.caption}
                onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Leyenda de la imagen"
              />
            </div>
            
            {type === 'homepage' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="section">Sección</Label>
                  <select
                    id="section"
                    value={newImage.section}
                    onChange={(e) => setNewImage(prev => ({ ...prev, section: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hero">Hero</option>
                    <option value="services">Servicios</option>
                    <option value="testimonials">Testimonios</option>
                    <option value="about">Acerca de</option>
                    <option value="gallery">Galería</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newImage.title || ''}
                      onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la imagen"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Input
                      id="subtitle"
                      value={newImage.subtitle || ''}
                      onChange={(e) => setNewImage(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Subtítulo de la imagen"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-primary"
                checked={newImage.is_primary}
                onChange={(e) => setNewImage(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is-primary">Imagen principal</Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSaveImage(type, newImage)}
                disabled={!newImage.image_url || isUploading || createTourImage.isPending || createVehicleImage.isPending || createHomepageImage.isPending}
                className="flex items-center gap-2"
              >
                {(createTourImage.isPending || createVehicleImage.isPending || createHomepageImage.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Imagen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNewImage({
                  image_url: '',
                  alt_text: '',
                  caption: '',
                  title: '',
                  subtitle: '',
                  display_order: 0,
                  is_primary: false,
                  section: 'hero'
                })}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ImageGallery = ({ images, type }: { images: any[], type: 'tours' | 'vehicles' | 'homepage' }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative">
            <img
              src={image.image_url}
              alt={image.alt_text || 'Imagen'}
              className="w-full h-48 object-cover"
            />
            {image.is_primary && (
              <Badge className="absolute top-2 right-2 bg-green-500">
                Principal
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              {image.title && (
                <h4 className="font-semibold text-sm">{image.title}</h4>
              )}
              {image.caption && (
                <p className="text-xs text-gray-600 line-clamp-2">{image.caption}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Orden: {image.display_order}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteImage(image.id, type)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
            <p className="text-gray-600 mt-2">Gestiona las imágenes de tours, vehículos y página principal</p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Página Principal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ImageUploader type="tours" />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes de Tours</CardTitle>
                    <CardDescription>
                      Gestiona las imágenes de tus tours y excursiones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tourImagesLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                        <p>Cargando imágenes...</p>
                      </div>
                    ) : tourImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay imágenes de tours aún</p>
                        <p className="text-sm">Sube tu primera imagen usando el formulario</p>
                      </div>
                    ) : (
                      <ImageGallery images={tourImages} type="tours" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ImageUploader type="vehicles" />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes de Vehículos</CardTitle>
                    <CardDescription>
                      Gestiona las imágenes de tu flota de vehículos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vehicleImagesLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                        <p>Cargando imágenes...</p>
                      </div>
                    ) : vehicleImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay imágenes de vehículos aún</p>
                        <p className="text-sm">Sube tu primera imagen usando el formulario</p>
                      </div>
                    ) : (
                      <ImageGallery images={vehicleImages} type="vehicles" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="homepage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ImageUploader type="homepage" />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes de Página Principal</CardTitle>
                    <CardDescription>
                      Gestiona las imágenes de las diferentes secciones de tu página principal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {homepageImagesLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                        <p>Cargando imágenes...</p>
                      </div>
                    ) : homepageImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay imágenes de página principal aún</p>
                        <p className="text-sm">Sube tu primera imagen usando el formulario</p>
                      </div>
                    ) : (
                      <ImageGallery images={homepageImages} type="homepage" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

          <Alert className="mt-8">
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> Este dashboard está en desarrollo. Las funcionalidades de subida y gestión de imágenes se integrarán con Supabase Storage una vez configurado.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </AuthGate>
  );
}
