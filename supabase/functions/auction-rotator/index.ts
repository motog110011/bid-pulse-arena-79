
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dynamic Product Generator (copied from frontend)
interface ProductVariant {
  title: string;
  description: string;
  startingBid: number;
  category: string;
  imageUrl: string;
}

// Brand and item arrays (same as frontend)
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
  'Gerber StrongArm', 'Ka-Bar USMC', 'Morakniv Companion', 'CRKT M16-14SF'
];

const WATCHES = [
  'Rolex Submariner', 'Omega Speedmaster', 'TAG Heuer Carrera', 'Seiko Prospex',
  'Citizen Eco-Drive', 'Casio G-Shock', 'Apple Watch Ultra', 'Garmin Fenix 7'
];

const JEWELRY = [
  'Anillo de Oro 18k', 'Collar de Perlas Cultivadas', 'Pulsera de Diamantes',
  'Aretes de Esmeralda', 'Cadena de Oro Blanco', 'Pulsera Tiffany & Co'
];

const CONDITIONS = [
  'Decomisado en Seguridad Aeroportuaria',
  'Confiscado por Aduana',
  'Incautado en Operativo',
  'Abandono en Aeropuerto',
  'Decomiso Fiscal',
  'Confiscación Legal',
  'Abandono de Viajero',
  'Retención Aduanera'
];

const PERFUME_SIZES = ['30ml', '50ml', '100ml', '125ml'];
const LIQUOR_SIZES = ['375ml', '500ml', '700ml', '750ml'];
const STORAGE_SIZES = ['64GB', '128GB', '256GB', '512GB'];
const COLORS = ['Negro', 'Blanco', 'Plateado', 'Dorado', 'Azul Marino', 'Rojo'];

// Product generation functions
const generateProductVariant = (category: string): ProductVariant => {
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  
  switch (category.toLowerCase()) {
    case 'perfumes':
      return generatePerfumeVariant(condition);
    case 'vinos y licores':
      return generateLiquorVariant(condition);
    case 'electrónicos':
      return generateElectronicsVariant(condition);
    case 'navajas':
      return generateTacticalVariant(condition);
    case 'relojes':
      return generateWatchVariant(condition);
    case 'joyas':
      return generateJewelryVariant(condition);
    default:
      return generateGeneralVariant(condition);
  }
};

const generatePerfumeVariant = (condition: string): ProductVariant => {
  const brand = PERFUME_BRANDS[Math.floor(Math.random() * PERFUME_BRANDS.length)];
  const size = PERFUME_SIZES[Math.floor(Math.random() * PERFUME_SIZES.length)];
  const gender = Math.random() > 0.5 ? 'EDP' : 'EDT';
  
  return {
    title: `${brand} ${gender} ${size} - ${condition}`,
    description: `Perfume original ${brand} de ${size}. ${condition.toLowerCase()} en aduana. Verificado como producto auténtico.`,
    startingBid: Math.floor(Math.random() * 30) + 15,
    category: 'Perfumes',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'
  };
};

const generateLiquorVariant = (condition: string): ProductVariant => {
  const brand = LIQUOR_BRANDS[Math.floor(Math.random() * LIQUOR_BRANDS.length)];
  const size = LIQUOR_SIZES[Math.floor(Math.random() * LIQUOR_SIZES.length)];
  const alcohol = (Math.floor(Math.random() * 20) + 35) + '%';
  
  return {
    title: `${brand} ${size} ${alcohol} - ${condition}`,
    description: `Licor premium ${brand} botella de ${size} con ${alcohol} de alcohol. ${condition.toLowerCase()}. Producto sellado.`,
    startingBid: Math.floor(Math.random() * 80) + 25,
    category: 'Vinos y Licores',
    imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'
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
    description: `Dispositivo ${device} en color ${color.toLowerCase()}${hasStorage ? ` con ${storage}` : ''}. ${condition.toLowerCase()}.`,
    startingBid: Math.floor(Math.random() * 200) + 50,
    category: 'Electrónicos',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400'
  };
};

const generateTacticalVariant = (condition: string): ProductVariant => {
  const tool = TACTICAL_GEAR[Math.floor(Math.random() * TACTICAL_GEAR.length)];
  const material = Math.random() > 0.5 ? 'Acero Inoxidable' : 'Acero al Carbono';
  
  return {
    title: `${tool} ${material} - ${condition}`,
    description: `Herramienta táctica ${tool} fabricada en ${material.toLowerCase()}. ${condition.toLowerCase()}.`,
    startingBid: Math.floor(Math.random() * 60) + 20,
    category: 'Navajas',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
  };
};

const generateWatchVariant = (condition: string): ProductVariant => {
  const watch = WATCHES[Math.floor(Math.random() * WATCHES.length)];
  const material = Math.random() > 0.7 ? 'Acero Inoxidable' : 'Titanio';
  const movement = Math.random() > 0.6 ? 'Automático' : 'Cuarzo';
  
  return {
    title: `${watch} ${material} ${movement} - ${condition}`,
    description: `Reloj ${watch} con caja de ${material.toLowerCase()} y movimiento ${movement.toLowerCase()}. ${condition.toLowerCase()}.`,
    startingBid: Math.floor(Math.random() * 300) + 100,
    category: 'Relojes',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'
  };
};

const generateJewelryVariant = (condition: string): ProductVariant => {
  const piece = JEWELRY[Math.floor(Math.random() * JEWELRY.length)];
  const material = Math.random() > 0.6 ? 'Oro 18k' : 'Plata 925';
  
  return {
    title: `${piece} ${material} - ${condition}`,
    description: `Joya ${piece.toLowerCase()} elaborada en ${material.toLowerCase()}. ${condition.toLowerCase()}. Pieza única.`,
    startingBid: Math.floor(Math.random() * 250) + 75,
    category: 'Joyas',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
  };
};

const generateGeneralVariant = (condition: string): ProductVariant => {
  const items = ['Maleta de Cuero Premium', 'Gafas de Sol Ray-Ban', 'Cartera Louis Vuitton', 'Zapatos de Cuero Italiano'];
  const item = items[Math.floor(Math.random() * items.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  return {
    title: `${item} ${color} - ${condition}`,
    description: `${item} en color ${color.toLowerCase()}. ${condition.toLowerCase()}. Artículo de calidad premium.`,
    startingBid: Math.floor(Math.random() * 100) + 25,
    category: 'General',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  };
};

const getRandomAuctionDuration = (): Date => {
  const hours = Math.floor(Math.random() * 6) + 3; // 3-8 hours
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + hours);
  return endTime;
};

const calculateBidIncrement = (startingBid: number): number => {
  if (startingBid < 50) return 5;
  if (startingBid < 100) return 10;
  if (startingBid < 200) return 15;
  if (startingBid < 500) return 25;
  return 50;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting auction rotation...');

    // Find auctions that have ended
    const { data: endedAuctions, error: fetchError } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .lte('end_time', new Date().toISOString());

    if (fetchError) {
      console.error('❌ Error fetching ended auctions:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!endedAuctions || endedAuctions.length === 0) {
      console.log('✅ No auctions need renewal');
      return new Response(JSON.stringify({ message: 'No auctions to renew' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let renewedCount = 0;

    // Generate new dynamic products for ended auctions
    const categories = ['Perfumes', 'Vinos y Licores', 'Electrónicos', 'Navajas', 'Relojes', 'Joyas'];
    
    for (const auction of endedAuctions) {
      // Generate a completely new product variant
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const newProduct = generateProductVariant(randomCategory);
      const newEndTime = getRandomAuctionDuration();
      const bidIncrement = calculateBidIncrement(newProduct.startingBid);

      console.log(`🔄 Transforming "${auction.title}" into "${newProduct.title}"`);

      // Update with completely new product information
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          title: newProduct.title,
          description: newProduct.description,
          category: newProduct.category,
          image_url: newProduct.imageUrl,
          starting_bid: newProduct.startingBid,
          minimum_bid: newProduct.startingBid,
          bid_increment: bidIncrement,
          current_bid: newProduct.startingBid,
          end_time: newEndTime.toISOString(),
          current_bidder: null,
          total_bids: 0,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id);

      if (updateError) {
        console.error(`❌ Error renewing auction ${auction.id}:`, updateError);
      } else {
        renewedCount++;
        console.log(`✅ Created new auction: "${newProduct.title}" - $${newProduct.startingBid} starting bid`);
        console.log(`   📅 Ends at: ${newEndTime.toLocaleString()}`);
      }
    }

    console.log(`🎉 Auction rotation complete. Renewed ${renewedCount} auctions.`);

    return new Response(JSON.stringify({
      success: true,
      renewedCount,
      totalProcessed: endedAuctions.length,
      message: `Renewed ${renewedCount} auctions for 6 more hours`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
