import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutoMappingRule {
  category: string;
  brand?: string;
  product_type?: string;
  keywords: string[];
  confidence: number;
}

export interface AutoMappingSuggestion {
  image_id: string;
  category: string;
  brand?: string;
  product_type?: string;
  contains_keywords?: string[];
  priority: number;
  confidence: number;
  reason: string;
}

// Patrones predefinidos para automatización
const BRAND_PATTERNS = {
  'apple': ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch'],
  'samsung': ['galaxy', 'samsung', 'note', 'tab'],
  'xiaomi': ['redmi', 'mi', 'poco'],
  'huawei': ['mate', 'p30', 'p40', 'honor'],
  'sony': ['xperia', 'playstation', 'bravia'],
  'hp': ['pavilion', 'elitebook', 'omen'],
  'dell': ['inspiron', 'xps', 'alienware'],
  'lenovo': ['thinkpad', 'ideapad', 'yoga'],
  'benchmade': ['griptilian', 'bugout', 'mini'],
  'spyderco': ['paramilitary', 'endura', 'delica'],
  'kershaw': ['leek', 'blur'],
  'victorinox': ['swiss army', 'classic'],
  'johnnie walker': ['black label', 'blue label', 'red label'],
  'macallan': ['single malt', '12 años', '18 años'],
  'hennessy': ['cognac', 'vsop', 'xo'],
  'patron': ['silver', 'reposado', 'añejo']
};

const CATEGORY_KEYWORDS = {
  'Electrónicos': ['smartphone', 'laptop', 'tablet', 'phone', 'computer', 'electronics', 'tech', 'digital'],
  'Navajas': ['knife', 'blade', 'tactical', 'folding', 'fixed', 'survival', 'edc'],
  'Vinos y Licores': ['whiskey', 'wine', 'cognac', 'tequila', 'rum', 'vodka', 'spirits', 'alcohol'],
  'Cosméticos': ['makeup', 'cosmetics', 'beauty', 'perfume', 'skincare', 'fragrance'],
  'Joyería': ['jewelry', 'watch', 'ring', 'necklace', 'bracelet', 'earrings', 'gold', 'silver']
};

export const useAutoMappingRules = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const detectBrandFromTitle = useCallback((title: string): string | null => {
    const titleLower = title.toLowerCase();
    
    for (const [brand, keywords] of Object.entries(BRAND_PATTERNS)) {
      if (keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
        return brand;
      }
    }
    
    return null;
  }, []);

  const detectCategoryFromTitle = useCallback((title: string): string | null => {
    const titleLower = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return null;
  }, []);

  const extractKeywordsFromTitle = useCallback((title: string): string[] => {
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Filtrar palabras comunes
    const stopWords = ['the', 'and', 'for', 'with', 'por', 'con', 'para', 'del', 'las', 'los'];
    return words.filter(word => !stopWords.includes(word));
  }, []);

  const generateSuggestionsForImage = useCallback(async (imageId: string, imageMetadata: any): Promise<AutoMappingSuggestion[]> => {
    const suggestions: AutoMappingSuggestion[] = [];
    
    // Sugerencia basada en metadatos de la imagen
    if (imageMetadata.brand || imageMetadata.category || imageMetadata.product_type) {
      suggestions.push({
        image_id: imageId,
        category: imageMetadata.category,
        brand: imageMetadata.brand,
        product_type: imageMetadata.product_type,
        contains_keywords: imageMetadata.tags,
        priority: 90,
        confidence: 0.95,
        reason: 'Basado en metadatos de la imagen'
      });
    }

    // Sugerencias basadas en patrones de etiqueta
    if (imageMetadata.label) {
      const detectedBrand = detectBrandFromTitle(imageMetadata.label);
      const detectedCategory = detectCategoryFromTitle(imageMetadata.label);
      const keywords = extractKeywordsFromTitle(imageMetadata.label);

      if (detectedCategory) {
        suggestions.push({
          image_id: imageId,
          category: detectedCategory,
          brand: detectedBrand || undefined,
          contains_keywords: keywords.slice(0, 3),
          priority: detectedBrand ? 80 : 70,
          confidence: detectedBrand ? 0.85 : 0.75,
          reason: `Detectado automáticamente de la etiqueta "${imageMetadata.label}"`
        });
      }
    }

    return suggestions;
  }, [detectBrandFromTitle, detectCategoryFromTitle, extractKeywordsFromTitle]);

  const generateAutoRules = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Obtener todas las imágenes activas
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('active', true);

      if (imagesError) throw imagesError;

      const allSuggestions: AutoMappingSuggestion[] = [];

      // Generar sugerencias para cada imagen
      for (const image of images || []) {
        const suggestions = await generateSuggestionsForImage(image.id, image);
        allSuggestions.push(...suggestions);
      }

      // Filtrar sugerencias con alta confianza que no existan ya
      const { data: existingMappings } = await supabase
        .from('product_image_mappings')
        .select('image_id, category, brand, product_type, contains_keywords');

      const newRules = allSuggestions.filter(suggestion => {
        // Verificar si ya existe una regla similar
        const exists = existingMappings?.some(mapping => 
          mapping.image_id === suggestion.image_id &&
          mapping.category === suggestion.category &&
          mapping.brand === suggestion.brand &&
          mapping.product_type === suggestion.product_type
        );
        
        return !exists && suggestion.confidence > 0.7;
      });

      if (newRules.length === 0) {
        toast({
          title: "Sin nuevas reglas",
          description: "No se encontraron patrones nuevos para automatizar"
        });
        return;
      }

      // Insertar las nuevas reglas
      const { error: insertError } = await supabase
        .from('product_image_mappings')
        .insert(
          newRules.map(rule => ({
            image_id: rule.image_id,
            category: rule.category,
            brand: rule.brand || null,
            product_type: rule.product_type || null,
            contains_keywords: rule.contains_keywords || null,
            priority: rule.priority
          }))
        );

      if (insertError) throw insertError;

      toast({
        title: "Reglas generadas",
        description: `Se crearon ${newRules.length} reglas automáticamente`
      });

      return newRules;

    } catch (error) {
      console.error('Error generating auto rules:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar las reglas automáticas",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [generateSuggestionsForImage, toast]);

  const createSmartRule = useCallback(async (productTitle: string, category: string) => {
    const detectedBrand = detectBrandFromTitle(productTitle);
    const keywords = extractKeywordsFromTitle(productTitle);
    
    // Buscar la imagen más apropiada
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('active', true)
      .eq('category', category);

    let bestImage = null;
    let bestScore = 0;

    for (const image of images || []) {
      let score = 0;
      
      // Puntuación por marca coincidente
      if (detectedBrand && image.brand?.toLowerCase() === detectedBrand.toLowerCase()) {
        score += 50;
      }
      
      // Puntuación por tags coincidentes
      if (image.tags) {
        const matchingTags = keywords.filter(keyword => 
          image.tags!.some(tag => tag.toLowerCase().includes(keyword))
        );
        score += matchingTags.length * 10;
      }
      
      // Puntuación por tipo de producto
      if (image.product_type) {
        const productTypeKeywords = extractKeywordsFromTitle(image.product_type);
        const matches = productTypeKeywords.filter(keyword => 
          keywords.includes(keyword)
        );
        score += matches.length * 15;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestImage = image;
      }
    }

    if (bestImage && bestScore > 10) {
      return {
        image_id: bestImage.id,
        category,
        brand: detectedBrand,
        contains_keywords: keywords.slice(0, 3),
        priority: Math.min(100 - bestScore, 90),
        confidence: Math.min(bestScore / 100, 0.95)
      };
    }

    return null;
  }, [detectBrandFromTitle, extractKeywordsFromTitle]);

  return {
    generateAutoRules,
    createSmartRule,
    generateSuggestionsForImage,
    isGenerating,
    detectBrandFromTitle,
    detectCategoryFromTitle,
    extractKeywordsFromTitle
  };
};