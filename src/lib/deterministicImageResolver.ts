
import { findMappedImage } from '@/hooks/useProductImages';
import type { ProductImageMapping } from '@/hooks/useProductImages';

// Assets locales como fallback final
import productElectronics from "@/assets/product-electronics.jpg";
import productLaptop from "@/assets/product-laptop.jpg";
import productPhone from "@/assets/product-phone.jpg";
import productSwissKnife from "@/assets/product-swiss-knife.jpg";
import productTacticalGear from "@/assets/product-tactical-gear.jpg";
import productPremiumSpirits from "@/assets/product-premium-spirits.jpg";
import productLiquor from "@/assets/product-liquor.jpg";
import productCosmetics from "@/assets/product-cosmetics.jpg";
import productLuxuryPerfumes from "@/assets/product-luxury-perfumes.jpg";
import productLuxuryJewelry from "@/assets/product-luxury-jewelry.jpg";
import productWatch from "@/assets/product-watch.jpg";

/**
 * Resuelve la imagen de forma determinística siguiendo esta jerarquía:
 * 1. image_url existente (manual del admin)
 * 2. Imagen mapeada según reglas de la DB
 * 3. Asset local por categoría
 * 4. Placeholder genérico
 */
export function resolveDeterministicImage(
  title: string,
  category: string,
  customImageUrl?: string,
  mappings?: any[]
): string {
  // 1. Prioridad: URL manual existente
  if (customImageUrl && customImageUrl.trim() !== '' && customImageUrl !== '/placeholder.svg') {
    return customImageUrl;
  }

  // 2. Buscar imagen mapeada
  if (mappings && mappings.length > 0) {
    const mappedImage = findMappedImage(title, category, mappings);
    if (mappedImage) {
      return mappedImage;
    }
  }

  // 3. Asset local por categoría (determinístico usando hash del título)
  const categoryAsset = getCategoryAssetDeterministic(category, title);
  if (categoryAsset) {
    return categoryAsset;
  }

  // 4. Fallback final
  return '/placeholder.svg';
}

/**
 * Obtiene un asset local de forma determinística basado en el título
 */
function getCategoryAssetDeterministic(category: string, title: string): string {
  // Crear un hash simple del título para selección determinística
  const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  switch (category.toLowerCase()) {
    case 'electrónicos':
    case 'electronics':
      const electronicsAssets = [productElectronics, productLaptop, productPhone];
      return electronicsAssets[hash % electronicsAssets.length];
    
    case 'navajas':
    case 'knives':
      const knivesAssets = [productSwissKnife, productTacticalGear];
      return knivesAssets[hash % knivesAssets.length];
    
    case 'vinos y licores':
    case 'liquor':
      const liquorAssets = [productPremiumSpirits, productLiquor];
      return liquorAssets[hash % liquorAssets.length];
    
    case 'cosméticos':
    case 'cosmetics':
      const cosmeticsAssets = [productCosmetics, productLuxuryPerfumes];
      return cosmeticsAssets[hash % cosmeticsAssets.length];
    
    case 'joyería':
    case 'jewelry':
      const jewelryAssets = [productLuxuryJewelry, productWatch];
      return jewelryAssets[hash % jewelryAssets.length];
    
    default:
      return productElectronics;
  }
}

/**
 * Genera candidatos de fallback solo cuando la imagen principal falla
 */
export function getFallbackCandidates(category: string, title: string): string[] {
  return [
    getCategoryAssetDeterministic(category, title),
    '/placeholder.svg'
  ];
}
