
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  file_path: string;
  label: string | null;
  category: string;
  brand: string | null;
  product_type: string | null;
  tags: string[] | null;
  active: boolean;
}

export interface ProductImageMapping {
  id: string;
  category: string;
  brand: string | null;
  product_type: string | null;
  contains_keywords: string[] | null;
  priority: number;
  active: boolean;
  product_images: ProductImage;
}

export const useProductImages = () => {
  return useQuery({
    queryKey: ['product-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('active', true)
        .order('category');

      if (error) throw error;
      return data as ProductImage[];
    },
  });
};

export const useProductImageMappings = () => {
  return useQuery({
    queryKey: ['product-image-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_image_mappings')
        .select(`
          *,
          product_images (*)
        `)
        .eq('active', true)
        .order('priority');

      if (error) throw error;
      return data as ProductImageMapping[];
    },
  });
};

/**
 * Busca la imagen más apropiada según las reglas de mapeo
 */
export const findMappedImage = (
  title: string,
  category: string,
  mappings: ProductImageMapping[]
): string | null => {
  if (!mappings || mappings.length === 0) return null;

  const titleLower = title.toLowerCase();
  const categoryLower = category.toLowerCase();

  // Buscar coincidencias ordenadas por prioridad
  for (const mapping of mappings) {
    // 1. Verificar categoría (obligatorio)
    if (mapping.category.toLowerCase() !== categoryLower) continue;

    // 2. Verificar marca (si está especificada)
    if (mapping.brand) {
      const brandLower = mapping.brand.toLowerCase();
      if (!titleLower.includes(brandLower)) continue;
    }

    // 3. Verificar tipo de producto (si está especificado)
    if (mapping.product_type) {
      const typeLower = mapping.product_type.toLowerCase();
      if (!titleLower.includes(typeLower)) continue;
    }

    // 4. Verificar keywords (si están especificadas)
    if (mapping.contains_keywords && mapping.contains_keywords.length > 0) {
      const hasAllKeywords = mapping.contains_keywords.every(keyword => 
        titleLower.includes(keyword.toLowerCase())
      );
      if (!hasAllKeywords) continue;
    }

    // Si llegamos aquí, esta regla coincide
    const supabaseUrl = "https://qxodekhmjymqyzudfbtv.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/product-images/${mapping.product_images.file_path}`;
  }

  return null;
};
