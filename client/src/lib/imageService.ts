import { supabase } from './supabase';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export interface TourImage {
  id: string;
  tour_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomepageImage {
  id: string;
  section: 'hero' | 'services' | 'testimonials' | 'about' | 'gallery';
  image_url: string;
  alt_text?: string;
  caption?: string;
  title?: string;
  subtitle?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImageSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

class ImageService {
  private bucketName = 'images';

  // =====================================================
  // MÉTODOS DE SUBIDA DE ARCHIVOS
  // =====================================================

  async uploadImage(file: File, folder: string): Promise<ImageUploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([imagePath]);

      if (error) {
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA IMÁGENES DE TOURS
  // =====================================================

  async getTourImages(tourId?: string): Promise<TourImage[]> {
    try {
      let query = supabase
        .from('tour_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (tourId) {
        query = query.eq('tour_id', tourId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener imágenes de tours: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tour images:', error);
      throw error;
    }
  }

  async createTourImage(imageData: Omit<TourImage, 'id' | 'created_at' | 'updated_at'>): Promise<TourImage> {
    try {
      const { data, error } = await supabase
        .from('tour_images')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear imagen de tour: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating tour image:', error);
      throw error;
    }
  }

  async updateTourImage(id: string, updates: Partial<TourImage>): Promise<TourImage> {
    try {
      const { data, error } = await supabase
        .from('tour_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar imagen de tour: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating tour image:', error);
      throw error;
    }
  }

  async deleteTourImage(id: string): Promise<void> {
    try {
      // Primero obtener la imagen para eliminar el archivo
      const { data: image } = await supabase
        .from('tour_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (image?.image_url) {
        // Extraer la ruta del archivo de la URL
        const url = new URL(image.image_url);
        const path = url.pathname.split('/').slice(-2).join('/');
        await this.deleteImage(path);
      }

      const { error } = await supabase
        .from('tour_images')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error al eliminar imagen de tour: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting tour image:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA IMÁGENES DE VEHÍCULOS
  // =====================================================

  async getVehicleImages(vehicleId?: string): Promise<VehicleImage[]> {
    try {
      let query = supabase
        .from('vehicle_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener imágenes de vehículos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching vehicle images:', error);
      throw error;
    }
  }

  async createVehicleImage(imageData: Omit<VehicleImage, 'id' | 'created_at' | 'updated_at'>): Promise<VehicleImage> {
    try {
      const { data, error } = await supabase
        .from('vehicle_images')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear imagen de vehículo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating vehicle image:', error);
      throw error;
    }
  }

  async updateVehicleImage(id: string, updates: Partial<VehicleImage>): Promise<VehicleImage> {
    try {
      const { data, error } = await supabase
        .from('vehicle_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar imagen de vehículo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating vehicle image:', error);
      throw error;
    }
  }

  async deleteVehicleImage(id: string): Promise<void> {
    try {
      // Primero obtener la imagen para eliminar el archivo
      const { data: image } = await supabase
        .from('vehicle_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (image?.image_url) {
        // Extraer la ruta del archivo de la URL
        const url = new URL(image.image_url);
        const path = url.pathname.split('/').slice(-2).join('/');
        await this.deleteImage(path);
      }

      const { error } = await supabase
        .from('vehicle_images')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error al eliminar imagen de vehículo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle image:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA IMÁGENES DE PÁGINA PRINCIPAL
  // =====================================================

  async getHomepageImages(section?: string): Promise<HomepageImage[]> {
    try {
      let query = supabase
        .from('homepage_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener imágenes de página principal: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching homepage images:', error);
      throw error;
    }
  }

  async createHomepageImage(imageData: Omit<HomepageImage, 'id' | 'created_at' | 'updated_at'>): Promise<HomepageImage> {
    try {
      const { data, error } = await supabase
        .from('homepage_images')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear imagen de página principal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating homepage image:', error);
      throw error;
    }
  }

  async updateHomepageImage(id: string, updates: Partial<HomepageImage>): Promise<HomepageImage> {
    try {
      const { data, error } = await supabase
        .from('homepage_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar imagen de página principal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating homepage image:', error);
      throw error;
    }
  }

  async deleteHomepageImage(id: string): Promise<void> {
    try {
      // Primero obtener la imagen para eliminar el archivo
      const { data: image } = await supabase
        .from('homepage_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (image?.image_url) {
        // Extraer la ruta del archivo de la URL
        const url = new URL(image.image_url);
        const path = url.pathname.split('/').slice(-2).join('/');
        await this.deleteImage(path);
      }

      const { error } = await supabase
        .from('homepage_images')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error al eliminar imagen de página principal: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting homepage image:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA CONFIGURACIONES
  // =====================================================

  async getImageSettings(): Promise<ImageSettings[]> {
    try {
      const { data, error } = await supabase
        .from('image_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        throw new Error(`Error al obtener configuraciones: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching image settings:', error);
      throw error;
    }
  }

  async updateImageSetting(key: string, value: any): Promise<ImageSettings> {
    try {
      const { data, error } = await supabase
        .from('image_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar configuración: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating image setting:', error);
      throw error;
    }
  }
}

export const imageService = new ImageService();
