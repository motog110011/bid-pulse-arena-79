const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration - Use environment variables from .env
require('dotenv').config();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables are not set');
  console.log('SUPABASE_URL:', SUPABASE_URL);
  console.log('SUPABASE_KEY:', SUPABASE_KEY?.substring(0, 20) + '...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function insertWines() {
  try {
    console.log('🚀 Starting wine products insertion...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '../database/migrations/002_insert_vinos_products.sql');
    let sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Extract the INSERT statements (skip the comments and SELECT message)
    const lines = sqlContent.split('\n');
    const insertStart = lines.findIndex(line => line.includes('INSERT INTO public.auctions'));
    const insertEnd = lines.findIndex(line => line.includes('SELECT \'Se insertaron'));
    
    if (insertStart === -1) {
      throw new Error('Could not find INSERT statement in SQL file');
    }

    const insertLines = lines.slice(insertStart, insertEnd === -1 ? undefined : insertEnd);
    const insertSQL = insertLines.join('\n');

    // Parse the VALUES manually since we need to insert individual records
    const wineProducts = [
      {
        title: 'Château Margaux 2015 - Bordeaux',
        description: 'Excepcional vino tinto francés de Bordeaux, considerado uno de los mejores del mundo. Añada 2015 con gran potencial de guarda. Decomisado en aduana por documentación incompleta.',
        category: 'Vinos',
        current_bid: 75.00,
        minimum_bid: 60.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/margaux-2015.jpg',
        end_time: new Date(Date.now() + (2 + Math.random() * 22) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Dom Pérignon Vintage 2012 - Champagne',
        description: 'Prestigioso champagne francés de la región de Champagne. Botella de 750ml con crianza en rima de 8 años. Confiscado por exceder límites de importación personal.',
        category: 'Vinos',
        current_bid: 82.00,
        minimum_bid: 65.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/dom-perignon-2012.jpg',
        end_time: new Date(Date.now() + (1 + Math.random() * 23) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Barolo Brunate 2017 - Piamonte',
        description: 'Vino tinto italiano DOCG de la región del Piamonte. Elaborado con uvas Nebbiolo 100%. Abandonado en depósito aduanero tras vencimiento de trámites.',
        category: 'Vinos',
        current_bid: 68.00,
        minimum_bid: 60.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/barolo-brunate-2017.jpg',
        end_time: new Date(Date.now() + (3 + Math.random() * 21) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Opus One 2018 - Napa Valley',
        description: 'Vino de culto californiano, colaboración entre Robert Mondavi y Baron Philippe de Rothschild. Mezcla de Cabernet Sauvignon y Merlot. Decomisado por autoridades.',
        category: 'Vinos',
        current_bid: 95.00,
        minimum_bid: 80.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/opus-one-2018.jpg',
        end_time: new Date(Date.now() + (4 + Math.random() * 20) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Chablis Premier Cru 2019 - Borgonia',
        description: 'Vino blanco francés de la región de Borgonia. Elaborado con uvas Chardonnay de viñedos Premier Cru. Olvidado en almacén tras disputa legal.',
        category: 'Vinos',
        current_bid: 71.00,
        minimum_bid: 65.00,
        bid_increment: 3.00,
        image_url: '/images/products/vinos/chablis-premier-2019.jpg',
        end_time: new Date(Date.now() + (5 + Math.random() * 19) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Rioja Gran Reserva 2015 - Tempranillo',
        description: 'Vino tinto español de la D.O.Ca. Rioja con 5 años de crianza. Elaborado con Tempranillo 85% y Graciano 15%. Confiscado por incumplimiento de documentación.',
        category: 'Vinos',
        current_bid: 63.00,
        minimum_bid: 60.00,
        bid_increment: 3.00,
        image_url: '/images/products/vinos/rioja-gran-reserva-2015.jpg',
        end_time: new Date(Date.now() + (6 + Math.random() * 18) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Caymus Cabernet Sauvignon 2020',
        description: 'Vino tinto premium de Napa Valley, California. 100% Cabernet Sauvignon con notas de frutas oscuras y especias. Recuperado por seguros tras siniestro.',
        category: 'Vinos',
        current_bid: 78.00,
        minimum_bid: 70.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/caymus-cabernet-2020.jpg',
        end_time: new Date(Date.now() + (7 + Math.random() * 17) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Moët & Chandon Imperial - Champagne',
        description: 'Champagne clásico francés, símbolo de celebración mundial. Mezcla de Pinot Noir, Chardonnay y Pinot Meunier. Abandonado en depósito fiscal.',
        category: 'Vinos',
        current_bid: 69.00,
        minimum_bid: 65.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/moet-chandon-imperial.jpg',
        end_time: new Date(Date.now() + (8 + Math.random() * 16) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Sassicaia 2018 - Toscana IGT',
        description: 'Super Tuscan italiano, mezcla de Cabernet Sauvignon y Cabernet Franc. Reconocido mundialmente por su calidad excepcional. Decomisado por autoridades.',
        category: 'Vinos',
        current_bid: 89.00,
        minimum_bid: 80.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/sassicaia-2018.jpg',
        end_time: new Date(Date.now() + (9 + Math.random() * 15) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Cloudy Bay Sauvignon Blanc 2021',
        description: 'Vino blanco neozelandés de Marlborough. Sauvignon Blanc con notas herbales y cítricas distintivas. Olvidado en almacén aduanero.',
        category: 'Vinos',
        current_bid: 64.00,
        minimum_bid: 60.00,
        bid_increment: 3.00,
        image_url: '/images/products/vinos/cloudy-bay-sauvignon-2021.jpg',
        end_time: new Date(Date.now() + (10 + Math.random() * 14) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Château d\'Yquem 2016 - Sauternes',
        description: 'Legendario vino dulce francés de Sauternes. Elaborado con uvas afectadas por Botrytis cinerea. Confiscado por exceder cuotas de importación.',
        category: 'Vinos',
        current_bid: 98.00,
        minimum_bid: 90.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/chateau-yquem-2016.jpg',
        end_time: new Date(Date.now() + (11 + Math.random() * 13) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Penfolds Grange 2017 - Australia',
        description: 'Vino tinto australiano icónico, principalmente Shiraz con algo de Cabernet Sauvignon. Considerado el mejor vino de Australia. Recuperado por seguros.',
        category: 'Vinos',
        current_bid: 87.00,
        minimum_bid: 80.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/penfolds-grange-2017.jpg',
        end_time: new Date(Date.now() + (12 + Math.random() * 12) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Pol Roger Winston Churchill - Champagne',
        description: 'Champagne de prestigio dedicado a Winston Churchill. Mezcla de Pinot Noir y Chardonnay de viñedos Grand Cru. Abandonado tras disputa comercial.',
        category: 'Vinos',
        current_bid: 79.00,
        minimum_bid: 75.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/pol-roger-churchill.jpg',
        end_time: new Date(Date.now() + (13 + Math.random() * 11) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Vega Sicilia Único 2010 - Ribera del Duero',
        description: 'Vino tinto español legendario de la D.O. Ribera del Duero. Mezcla de Tempranillo y Cabernet Sauvignon con 10 años de crianza. Decomisado por autoridades.',
        category: 'Vinos',
        current_bid: 94.00,
        minimum_bid: 85.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/vega-sicilia-unico-2010.jpg',
        end_time: new Date(Date.now() + (14 + Math.random() * 10) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Screaming Eagle Cabernet 2019 - Napa',
        description: 'Vino de culto californiano de Napa Valley. Cabernet Sauvignon de producción limitada. Uno de los vinos más caros de California. Confiscado en aduana.',
        category: 'Vinos',
        current_bid: 100.00,
        minimum_bid: 95.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/screaming-eagle-2019.jpg',
        end_time: new Date(Date.now() + (15 + Math.random() * 9) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Château Pichon Baron 2016 - Pauillac',
        description: 'Vino tinto francés de Bordeaux, clasificado como 2ème Cru Classé. Mezcla de Cabernet Sauvignon, Merlot y Petit Verdot. Olvidado en depósito.',
        category: 'Vinos',
        current_bid: 76.00,
        minimum_bid: 70.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/pichon-baron-2016.jpg',
        end_time: new Date(Date.now() + (16 + Math.random() * 8) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Krug Grande Cuvée - Champagne',
        description: 'Champagne de lujo francés sin añada, mezcla de más de 120 vinos de diferentes cosechas. Símbolo de excelencia en champagne. Recuperado por seguros.',
        category: 'Vinos',
        current_bid: 91.00,
        minimum_bid: 85.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/krug-grande-cuvee.jpg',
        end_time: new Date(Date.now() + (17 + Math.random() * 7) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Domaine de la Romanée-Conti 2018',
        description: 'Vino tinto borgoñón de la parcela más famosa del mundo. Pinot Noir de Romanée-Conti, producción extremadamente limitada. Abandonado tras embargo.',
        category: 'Vinos',
        current_bid: 99.00,
        minimum_bid: 95.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/romanee-conti-2018.jpg',
        end_time: new Date(Date.now() + (18 + Math.random() * 6) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Silver Oak Alexander Valley 2018',
        description: 'Cabernet Sauvignon californiano de Alexander Valley. Envejecido exclusivamente en barricas de roble americano. Confiscado por documentación irregular.',
        category: 'Vinos',
        current_bid: 67.00,
        minimum_bid: 60.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/silver-oak-2018.jpg',
        end_time: new Date(Date.now() + (19 + Math.random() * 5) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Amarone della Valpolicella 2017',
        description: 'Vino tinto italiano DOCG de Veneto. Elaborado con uvas pasificadas Corvina, Rondinella y Molinara. Proceso de appassimento tradicional. Decomisado por autoridades.',
        category: 'Vinos',
        current_bid: 73.00,
        minimum_bid: 65.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/amarone-valpolicella-2017.jpg',
        end_time: new Date(Date.now() + (20 + Math.random() * 4) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Château Lynch-Bages 2015 - Pauillac',
        description: 'Vino tinto francés de Bordeaux, 5ème Cru Classé. Mezcla tradicional de Cabernet Sauvignon, Merlot, Cabernet Franc y Petit Verdot. Olvidado en almacén.',
        category: 'Vinos',
        current_bid: 81.00,
        minimum_bid: 75.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/lynch-bages-2015.jpg',
        end_time: new Date(Date.now() + (21 + Math.random() * 3) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Taittinger Comtes de Champagne 2012',
        description: 'Champagne prestigioso francés elaborado exclusivamente con Chardonnay. Cuvée de prestige de la casa Taittinger. Recuperado tras liquidación judicial.',
        category: 'Vinos',
        current_bid: 84.00,
        minimum_bid: 80.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/taittinger-comtes-2012.jpg',
        end_time: new Date(Date.now() + (22 + Math.random() * 2) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Brunello di Montalcino 2016 - Toscana',
        description: 'Vino tinto italiano DOCG 100% Sangiovese Grosso. Mínimo 5 años de crianza según regulación. Zona de Montalcino, Toscana. Confiscado en aduana.',
        category: 'Vinos',
        current_bid: 72.00,
        minimum_bid: 65.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/brunello-montalcino-2016.jpg',
        end_time: new Date(Date.now() + (23 + Math.random() * 1) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Château Cos d\'Estournel 2017',
        description: 'Vino tinto francés de Saint-Estèphe, Bordeaux. 2ème Cru Classé con arquitectura oriental distintiva. Mezcla de Cabernet Sauvignon y Merlot. Abandonado en depósito.',
        category: 'Vinos',
        current_bid: 86.00,
        minimum_bid: 80.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/cos-estournel-2017.jpg',
        end_time: new Date(Date.now() + (24 + Math.random() * 23) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Cristal Louis Roederer 2013 - Champagne',
        description: 'Champagne de lujo francés en botella transparente característica. Mezcla de Pinot Noir y Chardonnay de viñedos Grand Cru. Decomisado por autoridades.',
        category: 'Vinos',
        current_bid: 93.00,
        minimum_bid: 85.00,
        bid_increment: 5.00,
        image_url: '/images/products/vinos/cristal-roederer-2013.jpg',
        end_time: new Date(Date.now() + (25 + Math.random() * 22) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      },
      {
        title: 'Ornellaia 2018 - Bolgheri Superiore',
        description: 'Super Tuscan italiano de la región de Bolgheri. Mezcla de Cabernet Sauvignon, Merlot, Petit Verdot y Cabernet Franc. Considerado uno de los mejores de Italia. Recuperado por seguros.',
        category: 'Vinos',
        current_bid: 77.00,
        minimum_bid: 70.00,
        bid_increment: 4.00,
        image_url: '/images/products/vinos/ornellaia-2018.jpg',
        end_time: new Date(Date.now() + (26 + Math.random() * 21) * 60 * 60 * 1000).toISOString(),
        status: 'active',
        total_bids: 0
      }
    ];

    // Insert all wine products
    for (const wine of wineProducts) {
      const { data, error } = await supabase
        .from('auctions')
        .insert([wine]);

      if (error) {
        console.error(`❌ Error inserting ${wine.title}:`, error);
      } else {
        console.log(`✅ Successfully inserted: ${wine.title}`);
      }
    }

    console.log(`🎉 Finished inserting ${wineProducts.length} wine products`);

  } catch (error) {
    console.error('❌ Error in wine insertion process:', error);
    process.exit(1);
  }
}

insertWines();
