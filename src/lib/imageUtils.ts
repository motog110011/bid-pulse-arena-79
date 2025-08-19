// Smart image URL generation system for auction items
// Generates specific Unsplash URLs based on product titles and brands
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

interface BrandMapping {
  [key: string]: {
    searchTerms: string[];
    category: string;
  };
}

interface CategoryKeywords {
  [key: string]: string[];
}

// Popular brand mappings with their search terms
const BRAND_MAPPINGS: BrandMapping = {
  // Electronics brands
  'samsung': { searchTerms: ['samsung phone', 'samsung galaxy', 'samsung smartphone'], category: 'electronics' },
  'iphone': { searchTerms: ['iphone apple', 'apple iphone', 'iphone smartphone'], category: 'electronics' },
  'apple': { searchTerms: ['apple iphone', 'apple macbook', 'apple device'], category: 'electronics' },
  'xiaomi': { searchTerms: ['xiaomi phone', 'xiaomi smartphone', 'xiaomi device'], category: 'electronics' },
  'huawei': { searchTerms: ['huawei phone', 'huawei smartphone', 'huawei device'], category: 'electronics' },
  'sony': { searchTerms: ['sony headphones', 'sony camera', 'sony electronics'], category: 'electronics' },
  'hp': { searchTerms: ['hp laptop', 'hp computer', 'hp printer'], category: 'electronics' },
  'dell': { searchTerms: ['dell laptop', 'dell computer', 'dell monitor'], category: 'electronics' },
  'lenovo': { searchTerms: ['lenovo laptop', 'lenovo thinkpad', 'lenovo computer'], category: 'electronics' },
  'anker': { searchTerms: ['anker power bank', 'anker charger', 'anker battery'], category: 'electronics' },
  
  // Knife brands
  'benchmade': { searchTerms: ['benchmade knife', 'benchmade folding knife', 'benchmade tactical'], category: 'knives' },
  'spyderco': { searchTerms: ['spyderco knife', 'spyderco folding knife', 'spyderco tactical'], category: 'knives' },
  'cold steel': { searchTerms: ['cold steel knife', 'cold steel tactical', 'cold steel blade'], category: 'knives' },
  'kershaw': { searchTerms: ['kershaw knife', 'kershaw folding knife', 'kershaw blade'], category: 'knives' },
  'opinel': { searchTerms: ['opinel knife', 'opinel folding knife', 'opinel french'], category: 'knives' },
  'victorinox': { searchTerms: ['victorinox swiss army', 'victorinox knife', 'swiss army knife'], category: 'knives' },
  
  // Liquor brands
  'johnnie walker': { searchTerms: ['johnnie walker whiskey', 'johnnie walker scotch', 'whiskey bottle'], category: 'liquor' },
  'macallan': { searchTerms: ['macallan whiskey', 'macallan scotch', 'premium whiskey'], category: 'liquor' },
  'glenfiddich': { searchTerms: ['glenfiddich whiskey', 'glenfiddich scotch', 'single malt'], category: 'liquor' },
  'hennessy': { searchTerms: ['hennessy cognac', 'hennessy bottle', 'cognac bottle'], category: 'liquor' },
  'don julio': { searchTerms: ['don julio tequila', 'tequila bottle', 'premium tequila'], category: 'liquor' },
  'patron': { searchTerms: ['patron tequila', 'patron bottle', 'silver tequila'], category: 'liquor' },
};

// Category-specific keywords for products
const CATEGORY_KEYWORDS: CategoryKeywords = {
  'Electrónicos': [
    'smartphone', 'laptop', 'tablet', 'headphones', 'camera', 'watch', 'phone',
    'computer', 'monitor', 'keyboard', 'mouse', 'charger', 'power bank', 'speaker'
  ],
  'Navajas': [
    'knife', 'blade', 'tactical knife', 'folding knife', 'pocket knife', 
    'hunting knife', 'survival knife', 'swiss army knife', 'utility knife'
  ],
  'Vinos y Licores': [
    'wine bottle', 'whiskey', 'vodka', 'rum', 'tequila', 'cognac', 'scotch',
    'bourbon', 'wine', 'champagne', 'beer', 'liquor bottle'
  ],
  'Cosméticos': [
    'perfume', 'makeup', 'cosmetics', 'skincare', 'beauty', 'fragrance',
    'lipstick', 'foundation', 'mascara', 'skincare routine'
  ],
  'Joyería': [
    'jewelry', 'watch', 'ring', 'necklace', 'bracelet', 'earrings',
    'gold jewelry', 'diamond', 'luxury watch', 'pendant'
  ]
};

// Product type keywords for more specific matching
const PRODUCT_TYPE_KEYWORDS: { [key: string]: string[] } = {
  'galaxy': ['samsung galaxy', 'galaxy phone', 'samsung smartphone'],
  'iphone': ['apple iphone', 'iphone smartphone', 'apple phone'],
  'macbook': ['apple macbook', 'macbook laptop', 'apple laptop'],
  'thinkpad': ['lenovo thinkpad', 'thinkpad laptop', 'business laptop'],
  'griptilian': ['benchmade griptilian', 'griptilian knife', 'folding knife'],
  'spyderco': ['spyderco knife', 'spyderco folding', 'tactical knife'],
  'whiskey': ['whiskey bottle', 'scotch whiskey', 'bourbon bottle'],
  'tequila': ['tequila bottle', 'silver tequila', 'premium tequila'],
  'perfume': ['perfume bottle', 'fragrance bottle', 'luxury perfume']
};

/**
 * Extracts brand from product title
 */
function extractBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  
  // Check for multi-word brands first
  if (titleLower.includes('cold steel')) return 'cold steel';
  if (titleLower.includes('don julio')) return 'don julio';
  if (titleLower.includes('johnnie walker')) return 'johnnie walker';
  
  // Check for single-word brands
  for (const brand of Object.keys(BRAND_MAPPINGS)) {
    if (titleLower.includes(brand)) {
      return brand;
    }
  }
  
  return null;
}

/**
 * Extracts product type keywords from title
 */
function extractProductKeywords(title: string): string[] {
  const titleLower = title.toLowerCase();
  const keywords: string[] = [];
  
  for (const [keyword, searchTerms] of Object.entries(PRODUCT_TYPE_KEYWORDS)) {
    if (titleLower.includes(keyword)) {
      keywords.push(...searchTerms);
    }
  }
  
  return keywords;
}

/**
 * Generates specific search term for Unsplash based on title analysis
 */
function generateSearchTerm(title: string, category: string): string {
  const brand = extractBrand(title);
  const productKeywords = extractProductKeywords(title);
  
  // Priority 1: Brand-specific search
  if (brand && BRAND_MAPPINGS[brand]) {
    const brandMapping = BRAND_MAPPINGS[brand];
    const randomTerm = brandMapping.searchTerms[Math.floor(Math.random() * brandMapping.searchTerms.length)];
    return randomTerm;
  }
  
  // Priority 2: Product-specific search
  if (productKeywords.length > 0) {
    const randomKeyword = productKeywords[Math.floor(Math.random() * productKeywords.length)];
    return randomKeyword;
  }
  
  // Priority 3: Category-specific search
  const categoryKeywords = CATEGORY_KEYWORDS[category];
  if (categoryKeywords) {
    const randomKeyword = categoryKeywords[Math.floor(Math.random() * categoryKeywords.length)];
    return randomKeyword;
  }
  
  // Fallback: use category name
  return category.toLowerCase();
}

/**
 * Generates multiple fallback image URLs for rotation
 */
function generateFallbackUrls(category: string, count: number = 3): string[] {
  const categoryKeywords = CATEGORY_KEYWORDS[category] || [category.toLowerCase()];
  const urls: string[] = [];
  const dims = '800x600';
  for (let i = 0; i < count && i < categoryKeywords.length; i++) {
    const keyword = categoryKeywords[i].replace(/\s+/g, ',');
    urls.push(`https://source.unsplash.com/${dims}/?${encodeURIComponent(keyword)}&sig=${i}`);
  }
  return urls;
}

/**
 * Generates a random image ID for Unsplash (simulates real photo IDs)
 */
function generateImageId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Main function to generate specific image URL based on auction title and category
 */
export function generateSpecificImageUrl(title: string, category: string, fallbackIndex: number = 0): string {
  const rawTerm = generateSearchTerm(title, category);
  const searchTerm = rawTerm.replace(/\s+/g, ',');
  const dims = '800x600';
  const sig = Math.floor(Math.random() * 1000) + fallbackIndex;
  return `https://source.unsplash.com/${dims}/?${encodeURIComponent(searchTerm)}&sig=${sig}`;
}

/**
 * Get image URL with intelligent fallbacks
 */
export function getImageWithFallbacks(title: string, category: string, customImageUrl?: string): string {
  // If custom image URL exists, use it
  if (customImageUrl && customImageUrl.trim() !== '') {
    return customImageUrl;
  }
  
  // Generate specific image based on title and category
  return generateSpecificImageUrl(title, category);
}

/**
 * Legacy fallback function for backward compatibility
 */
export function getImageFallback(category: string): string {
  return generateSpecificImageUrl('', category);
}