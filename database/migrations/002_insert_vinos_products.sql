-- =====================================================
-- SCRIPT PARA INSERTAR 26 PRODUCTOS DE VINOS
-- Valores reales: 600-1000 pesos
-- Valores de subasta: 60-100 pesos
-- =====================================================

-- Insertar 26 botellas de vino
INSERT INTO public.auctions (
    id,
    title,
    description,
    category,
    current_bid,
    minimum_bid,
    bid_increment,
    image_url,
    end_time,
    status,
    total_bids,
    created_at,
    updated_at
) VALUES 
-- Vino 1
(
    gen_random_uuid(),
    'Château Margaux 2015 - Bordeaux',
    'Excepcional vino tinto francés de Bordeaux, considerado uno de los mejores del mundo. Añada 2015 con gran potencial de guarda. Decomisado en aduana por documentación incompleta.',
    'Vinos',
    75.00,
    60.00,
    5.00,
    '/images/products/vinos/margaux-2015.jpg',
    NOW() + INTERVAL '2 hours' + (random() * INTERVAL '22 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 2
(
    gen_random_uuid(),
    'Dom Pérignon Vintage 2012 - Champagne',
    'Prestigioso champagne francés de la región de Champagne. Botella de 750ml con crianza en rima de 8 años. Confiscado por exceder límites de importación personal.',
    'Vinos',
    82.00,
    65.00,
    5.00,
    '/images/products/vinos/dom-perignon-2012.jpg',
    NOW() + INTERVAL '1 hour' + (random() * INTERVAL '23 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 3
(
    gen_random_uuid(),
    'Barolo Brunate 2017 - Piamonte',
    'Vino tinto italiano DOCG de la región del Piamonte. Elaborado con uvas Nebbiolo 100%. Abandonado en depósito aduanero tras vencimiento de trámites.',
    'Vinos',
    68.00,
    60.00,
    4.00,
    '/images/products/vinos/barolo-brunate-2017.jpg',
    NOW() + INTERVAL '3 hours' + (random() * INTERVAL '21 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 4
(
    gen_random_uuid(),
    'Opus One 2018 - Napa Valley',
    'Vino de culto californiano, colaboración entre Robert Mondavi y Baron Philippe de Rothschild. Mezcla de Cabernet Sauvignon y Merlot. Decomisado por autoridades.',
    'Vinos',
    95.00,
    80.00,
    5.00,
    '/images/products/vinos/opus-one-2018.jpg',
    NOW() + INTERVAL '4 hours' + (random() * INTERVAL '20 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 5
(
    gen_random_uuid(),
    'Chablis Premier Cru 2019 - Borgonia',
    'Vino blanco francés de la región de Borgonia. Elaborado con uvas Chardonnay de viñedos Premier Cru. Olvidado en almacén tras disputa legal.',
    'Vinos',
    71.00,
    65.00,
    3.00,
    '/images/products/vinos/chablis-premier-2019.jpg',
    NOW() + INTERVAL '5 hours' + (random() * INTERVAL '19 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 6
(
    gen_random_uuid(),
    'Rioja Gran Reserva 2015 - Tempranillo',
    'Vino tinto español de la D.O.Ca. Rioja con 5 años de crianza. Elaborado con Tempranillo 85% y Graciano 15%. Confiscado por incumplimiento de documentación.',
    'Vinos',
    63.00,
    60.00,
    3.00,
    '/images/products/vinos/rioja-gran-reserva-2015.jpg',
    NOW() + INTERVAL '6 hours' + (random() * INTERVAL '18 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 7
(
    gen_random_uuid(),
    'Caymus Cabernet Sauvignon 2020',
    'Vino tinto premium de Napa Valley, California. 100% Cabernet Sauvignon con notas de frutas oscuras y especias. Recuperado por seguros tras siniestro.',
    'Vinos',
    78.00,
    70.00,
    4.00,
    '/images/products/vinos/caymus-cabernet-2020.jpg',
    NOW() + INTERVAL '7 hours' + (random() * INTERVAL '17 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 8
(
    gen_random_uuid(),
    'Moët & Chandon Imperial - Champagne',
    'Champagne clásico francés, símbolo de celebración mundial. Mezcla de Pinot Noir, Chardonnay y Pinot Meunier. Abandonado en depósito fiscal.',
    'Vinos',
    69.00,
    65.00,
    4.00,
    '/images/products/vinos/moet-chandon-imperial.jpg',
    NOW() + INTERVAL '8 hours' + (random() * INTERVAL '16 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 9
(
    gen_random_uuid(),
    'Sassicaia 2018 - Toscana IGT',
    'Super Tuscan italiano, mezcla de Cabernet Sauvignon y Cabernet Franc. Reconocido mundialmente por su calidad excepcional. Decomisado por autoridades.',
    'Vinos',
    89.00,
    80.00,
    5.00,
    '/images/products/vinos/sassicaia-2018.jpg',
    NOW() + INTERVAL '9 hours' + (random() * INTERVAL '15 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 10
(
    gen_random_uuid(),
    'Cloudy Bay Sauvignon Blanc 2021',
    'Vino blanco neozelandés de Marlborough. Sauvignon Blanc con notas herbales y cítricas distintivas. Olvidado en almacén aduanero.',
    'Vinos',
    64.00,
    60.00,
    3.00,
    '/images/products/vinos/cloudy-bay-sauvignon-2021.jpg',
    NOW() + INTERVAL '10 hours' + (random() * INTERVAL '14 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 11
(
    gen_random_uuid(),
    'Château d\'Yquem 2016 - Sauternes',
    'Legendario vino dulce francés de Sauternes. Elaborado con uvas afectadas por Botrytis cinerea. Confiscado por exceder cuotas de importación.',
    'Vinos',
    98.00,
    90.00,
    5.00,
    '/images/products/vinos/chateau-yquem-2016.jpg',
    NOW() + INTERVAL '11 hours' + (random() * INTERVAL '13 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 12
(
    gen_random_uuid(),
    'Penfolds Grange 2017 - Australia',
    'Vino tinto australiano icónico, principalmente Shiraz con algo de Cabernet Sauvignon. Considerado el mejor vino de Australia. Recuperado por seguros.',
    'Vinos',
    87.00,
    80.00,
    4.00,
    '/images/products/vinos/penfolds-grange-2017.jpg',
    NOW() + INTERVAL '12 hours' + (random() * INTERVAL '12 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 13
(
    gen_random_uuid(),
    'Pol Roger Winston Churchill - Champagne',
    'Champagne de prestigio dedicado a Winston Churchill. Mezcla de Pinot Noir y Chardonnay de viñedos Grand Cru. Abandonado tras disputa comercial.',
    'Vinos',
    79.00,
    75.00,
    4.00,
    '/images/products/vinos/pol-roger-churchill.jpg',
    NOW() + INTERVAL '13 hours' + (random() * INTERVAL '11 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 14
(
    gen_random_uuid(),
    'Vega Sicilia Único 2010 - Ribera del Duero',
    'Vino tinto español legendario de la D.O. Ribera del Duero. Mezcla de Tempranillo y Cabernet Sauvignon con 10 años de crianza. Decomisado por autoridades.',
    'Vinos',
    94.00,
    85.00,
    5.00,
    '/images/products/vinos/vega-sicilia-unico-2010.jpg',
    NOW() + INTERVAL '14 hours' + (random() * INTERVAL '10 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 15
(
    gen_random_uuid(),
    'Screaming Eagle Cabernet 2019 - Napa',
    'Vino de culto californiano de Napa Valley. Cabernet Sauvignon de producción limitada. Uno de los vinos más caros de California. Confiscado en aduana.',
    'Vinos',
    100.00,
    95.00,
    5.00,
    '/images/products/vinos/screaming-eagle-2019.jpg',
    NOW() + INTERVAL '15 hours' + (random() * INTERVAL '9 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 16
(
    gen_random_uuid(),
    'Château Pichon Baron 2016 - Pauillac',
    'Vino tinto francés de Bordeaux, clasificado como 2ème Cru Classé. Mezcla de Cabernet Sauvignon, Merlot y Petit Verdot. Olvidado en depósito.',
    'Vinos',
    76.00,
    70.00,
    4.00,
    '/images/products/vinos/pichon-baron-2016.jpg',
    NOW() + INTERVAL '16 hours' + (random() * INTERVAL '8 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 17
(
    gen_random_uuid(),
    'Krug Grande Cuvée - Champagne',
    'Champagne de lujo francés sin añada, mezcla de más de 120 vinos de diferentes cosechas. Símbolo de excelencia en champagne. Recuperado por seguros.',
    'Vinos',
    91.00,
    85.00,
    5.00,
    '/images/products/vinos/krug-grande-cuvee.jpg',
    NOW() + INTERVAL '17 hours' + (random() * INTERVAL '7 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 18
(
    gen_random_uuid(),
    'Domaine de la Romanée-Conti 2018',
    'Vino tinto borgoñón de la parcela más famosa del mundo. Pinot Noir de Romanée-Conti, producción extremadamente limitada. Abandonado tras embargo.',
    'Vinos',
    99.00,
    95.00,
    5.00,
    '/images/products/vinos/romanee-conti-2018.jpg',
    NOW() + INTERVAL '18 hours' + (random() * INTERVAL '6 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 19
(
    gen_random_uuid(),
    'Silver Oak Alexander Valley 2018',
    'Cabernet Sauvignon californiano de Alexander Valley. Envejecido exclusivamente en barricas de roble americano. Confiscado por documentación irregular.',
    'Vinos',
    67.00,
    60.00,
    4.00,
    '/images/products/vinos/silver-oak-2018.jpg',
    NOW() + INTERVAL '19 hours' + (random() * INTERVAL '5 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 20
(
    gen_random_uuid(),
    'Amarone della Valpolicella 2017',
    'Vino tinto italiano DOCG de Veneto. Elaborado con uvas pasificadas Corvina, Rondinella y Molinara. Proceso de appassimento tradicional. Decomisado por autoridades.',
    'Vinos',
    73.00,
    65.00,
    4.00,
    '/images/products/vinos/amarone-valpolicella-2017.jpg',
    NOW() + INTERVAL '20 hours' + (random() * INTERVAL '4 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 21
(
    gen_random_uuid(),
    'Château Lynch-Bages 2015 - Pauillac',
    'Vino tinto francés de Bordeaux, 5ème Cru Classé. Mezcla tradicional de Cabernet Sauvignon, Merlot, Cabernet Franc y Petit Verdot. Olvidado en almacén.',
    'Vinos',
    81.00,
    75.00,
    4.00,
    '/images/products/vinos/lynch-bages-2015.jpg',
    NOW() + INTERVAL '21 hours' + (random() * INTERVAL '3 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 22
(
    gen_random_uuid(),
    'Taittinger Comtes de Champagne 2012',
    'Champagne prestigioso francés elaborado exclusivamente con Chardonnay. Cuvée de prestige de la casa Taittinger. Recuperado tras liquidación judicial.',
    'Vinos',
    84.00,
    80.00,
    4.00,
    '/images/products/vinos/taittinger-comtes-2012.jpg',
    NOW() + INTERVAL '22 hours' + (random() * INTERVAL '2 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 23
(
    gen_random_uuid(),
    'Brunello di Montalcino 2016 - Toscana',
    'Vino tinto italiano DOCG 100% Sangiovese Grosso. Mínimo 5 años de crianza según regulación. Zona de Montalcino, Toscana. Confiscado en aduana.',
    'Vinos',
    72.00,
    65.00,
    4.00,
    '/images/products/vinos/brunello-montalcino-2016.jpg',
    NOW() + INTERVAL '23 hours' + (random() * INTERVAL '1 hour'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 24
(
    gen_random_uuid(),
    'Château Cos d\'Estournel 2017',
    'Vino tinto francés de Saint-Estèphe, Bordeaux. 2ème Cru Classé con arquitectura oriental distintiva. Mezcla de Cabernet Sauvignon y Merlot. Abandonado en depósito.',
    'Vinos',
    86.00,
    80.00,
    5.00,
    '/images/products/vinos/cos-estournel-2017.jpg',
    NOW() + INTERVAL '1 day' + (random() * INTERVAL '23 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 25
(
    gen_random_uuid(),
    'Cristal Louis Roederer 2013 - Champagne',
    'Champagne de lujo francés en botella transparente característica. Mezcla de Pinot Noir y Chardonnay de viñedos Grand Cru. Decomisado por autoridades.',
    'Vinos',
    93.00,
    85.00,
    5.00,
    '/images/products/vinos/cristal-roederer-2013.jpg',
    NOW() + INTERVAL '1 day 1 hour' + (random() * INTERVAL '22 hours'),
    'active',
    0,
    NOW(),
    NOW()
),
-- Vino 26
(
    gen_random_uuid(),
    'Ornellaia 2018 - Bolgheri Superiore',
    'Super Tuscan italiano de la región de Bolgheri. Mezcla de Cabernet Sauvignon, Merlot, Petit Verdot y Cabernet Franc. Considerado uno de los mejores de Italia. Recuperado por seguros.',
    'Vinos',
    77.00,
    70.00,
    4.00,
    '/images/products/vinos/ornellaia-2018.jpg',
    NOW() + INTERVAL '1 day 2 hours' + (random() * INTERVAL '21 hours'),
    'active',
    0,
    NOW(),
    NOW()
);

-- Mensaje de confirmación
SELECT 'Se insertaron 26 productos de vinos exitosamente' as mensaje;
