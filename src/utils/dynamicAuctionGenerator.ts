/**
 * Dynamic Auction Generator
 * Generates realistic auction items with varied titles, descriptions, and prices
 */

export interface ProductVariant {
  title: string;
  description: string;
  startingBid: number;
  category: string;
  imageUrl: string;
}

// Brand variations for different categories
const PERFUME_BRANDS = [
  'Chanel No. 5', 'Dior Sauvage', 'Giorgio Armani Si', 'Versace Eros', 
  'Paco Rabanne Invictus', 'Hugo Boss Bottled', 'Calvin Klein Obsession',
  'Jean Paul Gaultier Le Male', 'Tom Ford Black Orchid', 'Yves Saint Laurent Black Opium',
  'Dolce & Gabbana Light Blue', 'Gucci Bloom', 'Burberry Her', 'Marc Jacobs Daisy'
];

const LIQUOR_BRANDS = [
  'Johnnie Walker Black Label', 'Macallan 12 años', 'Hennessy VSOP', 'Rémy Martin XO',
  'Jack Daniel\'s Single Barrel', 'Glenfiddich 18', 'Absolut Elyx', 'Don Julio 1942',
  'Patrón Silver', 'Grey Goose', 'Bombay Sapphire', 'Chivas Regal 18',
  'Crown Royal Reserve', 'Jameson Black Barrel', 'Bacardi Reserva Ocho'
];

const ELECTRONICS = [
  'iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'AirPods Pro', 'Apple Watch Series 9',
  'iPad Air', 'MacBook Pro M3', 'Nintendo Switch OLED', 'PlayStation 5',
  'Xbox Series X', 'Sony WH-1000XM5', 'Bose QuietComfort', 'Canon EOS R6',
  'GoPro Hero 12', 'DJI Mini 4 Pro', 'Surface Pro 9'
];

const TACTICAL_GEAR = [
  'Navaja Suiza Victorinox SwissChamp', 'Leatherman Wave Plus', 'Benchmade Bugout',
  'Spyderco Para Military 2', 'Cold Steel Recon 1', 'SOG SEAL Pup Elite',
  'Gerber StrongArm', 'Ka-Bar USMC', 'Morakniv Companion', 'CRKT M16-14SF',
  'Kershaw Leek', 'Ontario RAT-1', 'Esee 4P', 'Buck 119 Special'
];

const WATCHES = [
  'Rolex Submariner', 'Omega Speedmaster', 'TAG Heuer Carrera', 'Seiko Prospex',
  'Citizen Eco-Drive', 'Casio G-Shock', 'Apple Watch Ultra', 'Garmin Fenix 7',
  'Tudor Black Bay', 'Breitling Navitimer', 'IWC Pilot', 'Panerai Luminor'
];

const JEWELRY = [
  'Anillo de Oro 18k', 'Collar de Perlas Cultivadas', 'Pulsera de Diamantes',
  'Aretes de Esmeralda', 'Reloj de Plata Sterling', 'Cadena de Oro Blanco',
  'Anillo de Compromiso', 'Pulsera Tiffany & Co', 'Collar Cartier', 'Anillo Bulgari'
];

// Condition variations
const CONDITIONS = [
  'Decomisado en Seguridad Aeroportuaria',
  'Confiscado por Aduana',
  'Incautado en Operativo',
  'Abandono en Aeropuerto',
  'Decomiso Fiscal',
  'Confiscación Legal',
  'Abandono de Viajero',
  'Retención Aduanera',
  'Decomiso Administrativo',
  'Confiscación Preventiva'
];

// Size/volume variations
const PERFUME_SIZES = ['30ml', '50ml', '100ml', '125ml', '150ml'];
const LIQUOR_SIZES = ['375ml', '500ml', '700ml', '750ml', '1L'];
const STORAGE_SIZES = ['64GB', '128GB', '256GB', '512GB', '1TB'];

// Color variations
const COLORS = [
  'Negro', 'Blanco', 'Plateado', 'Dorado', 'Azul Marino', 'Rojo',
  'Verde Militar', 'Gris Espacial', 'Rosa', 'Púrpura'
];

/**
 * Generate a random product variant for each category
 */
export const generateProductVariant = (category: string): ProductVariant => {
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  
  switch (category.toLowerCase()) {
    case 'perfumes':
    case 'fragancia':
      return generatePerframeVariant(condition);
    
    case 'vinos y licores':
    case 'licores':
      return generateLiquorVariant(condition);
    
    case 'electrónicos':
    case 'tecnología':
      return generateElectronicsVariant(condition);
    
    case 'navajas':
    case 'herramientas':
      return generateTacticalVariant(condition);
    
    case 'relojes':
      return generateWatchVariant(condition);
    
    case 'joyas':
    case 'joyería':
      return generateJewelryVariant(condition);
    
    default:
      return generateGeneralVariant(condition);
  }
};

const generatePerframeVariant = (condition: string): ProductVariant => {
  const brand = PERFUME_BRANDS[Math.floor(Math.random() * PERFUME_BRANDS.length)];
  const size = PERFUME_SIZES[Math.floor(Math.random() * PERFUME_SIZES.length)];
  const gender = Math.random() > 0.5 ? 'EDP' : 'EDT';
  
  return {
    title: `${brand} ${gender} ${size} - ${condition}`,
    description: `Perfume original ${brand} de ${size}. ${condition.toLowerCase()} en aduana. Verificado como producto auténtico. Ideal para coleccionistas o uso personal.`,
    startingBid: Math.floor(Math.random() * 30) + 15, // $15-45
    category: 'Perfumes',
    imageUrl: '/src/assets/product-luxury-perfumes.jpg'
  };
};

const generateLiquorVariant = (condition: string): ProductVariant => {
  const brand = LIQUOR_BRANDS[Math.floor(Math.random() * LIQUOR_BRANDS.length)];
  const size = LIQUOR_SIZES[Math.floor(Math.random() * LIQUOR_SIZES.length)];
  const alcohol = (Math.floor(Math.random() * 20) + 35) + '%'; // 35-55%
  
  return {
    title: `${brand} ${size} ${alcohol} - ${condition}`,
    description: `Licor premium ${brand} botella de ${size} con ${alcohol} de alcohol. ${condition.toLowerCase()}. Producto sellado y en excelente estado.`,
    startingBid: Math.floor(Math.random() * 80) + 25, // $25-105
    category: 'Vinos y Licores', 
    imageUrl: '/src/assets/product-premium-spirits.jpg'
  };
};

const generateElectronicsVariant = (condition: string): ProductVariant => {
  const device = ELECTRONICS[Math.floor(Math.random() * ELECTRONICS.length)];
  const storage = STORAGE_SIZES[Math.floor(Math.random() * STORAGE_SIZES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  const hasStorage = device.includes('iPhone') || device.includes('iPad') || device.includes('MacBook');
  const fullTitle = hasStorage ? `${device} ${storage} ${color}` : `${device} ${color}`;
  
  return {
    title: `${fullTitle} - ${condition}`,
    description: `Dispositivo ${device} en color ${color.toLowerCase()}${hasStorage ? ` con ${storage} de almacenamiento` : ''}. ${condition.toLowerCase()} en proceso de importación. Funcional y en buen estado.`,
    startingBid: Math.floor(Math.random() * 200) + 50, // $50-250
    category: 'Electrónicos',
    imageUrl: '/src/assets/product-electronics.jpg'
  };
};

const generateTacticalVariant = (condition: string): ProductVariant => {
  const tool = TACTICAL_GEAR[Math.floor(Math.random() * TACTICAL_GEAR.length)];
  const material = Math.random() > 0.5 ? 'Acero Inoxidable' : 'Acero al Carbono';
  const handle = Math.random() > 0.5 ? 'Mango de G10' : 'Mango de Micarta';
  
  return {
    title: `${tool} ${material} - ${condition}`,
    description: `Herramienta táctica ${tool} fabricada en ${material.toLowerCase()} con ${handle.toLowerCase()}. ${condition.toLowerCase()} por regulaciones de transporte. Excelente para colección o uso profesional.`,
    startingBid: Math.floor(Math.random() * 60) + 20, // $20-80
    category: 'Navajas',
    imageUrl: '/src/assets/product-tactical-gear.jpg'
  };
};

const generateWatchVariant = (condition: string): ProductVariant => {
  const watch = WATCHES[Math.floor(Math.random() * WATCHES.length)];
  const material = Math.random() > 0.7 ? 'Acero Inoxidable' : Math.random() > 0.5 ? 'Titanio' : 'Oro Rosa';
  const movement = Math.random() > 0.6 ? 'Automático' : 'Cuarzo';
  
  return {
    title: `${watch} ${material} ${movement} - ${condition}`,
    description: `Reloj ${watch} con caja de ${material.toLowerCase()} y movimiento ${movement.toLowerCase()}. ${condition.toLowerCase()}. Funcional y con documentos de autenticidad.`,
    startingBid: Math.floor(Math.random() * 300) + 100, // $100-400
    category: 'Relojes',
    imageUrl: '/src/assets/product-watch.jpg'
  };
};

const generateJewelryVariant = (condition: string): ProductVariant => {
  const piece = JEWELRY[Math.floor(Math.random() * JEWELRY.length)];
  const material = Math.random() > 0.6 ? 'Oro 18k' : Math.random() > 0.5 ? 'Plata 925' : 'Oro Blanco';
  const stones = Math.random() > 0.7 ? 'con Diamantes' : Math.random() > 0.5 ? 'con Zirconia' : '';
  
  return {
    title: `${piece} ${material} ${stones} - ${condition}`.trim(),
    description: `Joya ${piece.toLowerCase()} elaborada en ${material.toLowerCase()}${stones ? ' ' + stones.toLowerCase() : ''}. ${condition.toLowerCase()}. Pieza única con certificado de autenticidad.`,
    startingBid: Math.floor(Math.random() * 250) + 75, // $75-325
    category: 'Joyas',
    imageUrl: '/src/assets/product-luxury-jewelry.jpg'
  };
};

const generateGeneralVariant = (condition: string): ProductVariant => {
  const items = [
    'Maleta de Cuero Premium', 'Gafas de Sol Ray-Ban', 'Cartera Louis Vuitton',
    'Zapatos de Cuero Italiano', 'Corbata de Seda', 'Cinturón de Piel',
    'Billetera de Cuero', 'Lentes de Sol Oakley', 'Mochila Táctica'
  ];
  
  const item = items[Math.floor(Math.random() * items.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  return {
    title: `${item} ${color} - ${condition}`,
    description: `${item} en color ${color.toLowerCase()}. ${condition.toLowerCase()}. Artículo de calidad premium en excelente estado.`,
    startingBid: Math.floor(Math.random() * 100) + 25, // $25-125
    category: 'General',
    imageUrl: '/src/assets/product-cosmetics.jpg'
  };
};

/**
 * Generate multiple unique variants for batch creation
 */
export const generateBatchVariants = (count: number = 10): ProductVariant[] => {
  const categories = ['Perfumes', 'Vinos y Licores', 'Electrónicos', 'Navajas', 'Relojes', 'Joyas'];
  const variants: ProductVariant[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    variants.push(generateProductVariant(category));
  }
  
  return variants;
};

/**
 * Get a realistic auction duration (3-8 hours)
 */
export const getRandomAuctionDuration = (): Date => {
  const hours = Math.floor(Math.random() * 6) + 3; // 3-8 hours
  const minutes = Math.floor(Math.random() * 60); // 0-59 minutes
  
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + hours);
  endTime.setMinutes(endTime.getMinutes() + minutes);
  
  return endTime;
};

/**
 * Calculate bid increment based on starting price
 */
export const calculateBidIncrement = (startingBid: number): number => {
  if (startingBid < 50) return 5;
  if (startingBid < 100) return 10;
  if (startingBid < 200) return 15;
  if (startingBid < 500) return 25;
  return 50;
};
