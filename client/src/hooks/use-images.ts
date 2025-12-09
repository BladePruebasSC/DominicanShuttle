import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imageService, TourImage, VehicleImage, HomepageImage, ImageSettings } from '@/lib/imageService';
import { useToast } from './use-toast';

// =====================================================
// HOOKS PARA IMÁGENES DE TOURS
// =====================================================

export function useTourImages(tourId?: string) {
  return useQuery({
    queryKey: ['tour-images', tourId],
    queryFn: () => imageService.getTourImages(tourId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateTourImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.createTourImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-images'] });
      toast({
        title: "Imagen creada",
        description: "La imagen del tour se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTourImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TourImage> }) =>
      imageService.updateTourImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-images'] });
      toast({
        title: "Imagen actualizada",
        description: "La imagen del tour se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTourImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.deleteTourImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-images'] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen del tour se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =====================================================
// HOOKS PARA IMÁGENES DE VEHÍCULOS
// =====================================================

export function useVehicleImages(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle-images', vehicleId],
    queryFn: () => imageService.getVehicleImages(vehicleId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateVehicleImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.createVehicleImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images'] });
      toast({
        title: "Imagen creada",
        description: "La imagen del vehículo se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVehicleImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VehicleImage> }) =>
      imageService.updateVehicleImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images'] });
      toast({
        title: "Imagen actualizada",
        description: "La imagen del vehículo se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteVehicleImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.deleteVehicleImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images'] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen del vehículo se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =====================================================
// HOOKS PARA IMÁGENES DE PÁGINA PRINCIPAL
// =====================================================

export function useHomepageImages(section?: string) {
  return useQuery({
    queryKey: ['homepage-images', section],
    queryFn: () => imageService.getHomepageImages(section),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateHomepageImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.createHomepageImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-images'] });
      toast({
        title: "Imagen creada",
        description: "La imagen de página principal se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateHomepageImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<HomepageImage> }) =>
      imageService.updateHomepageImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-images'] });
      toast({
        title: "Imagen actualizada",
        description: "La imagen de página principal se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteHomepageImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: imageService.deleteHomepageImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-images'] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen de página principal se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =====================================================
// HOOKS PARA CONFIGURACIONES
// =====================================================

export function useImageSettings() {
  return useQuery({
    queryKey: ['image-settings'],
    queryFn: imageService.getImageSettings,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useUpdateImageSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      imageService.updateImageSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-settings'] });
      toast({
        title: "Configuración actualizada",
        description: "La configuración se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar configuración",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =====================================================
// HOOK PARA SUBIDA DE ARCHIVOS
// =====================================================

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, folder: string) => {
    setIsUploading(true);
    try {
      const result = await imageService.uploadImage(file, folder);
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido exitosamente.",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}
