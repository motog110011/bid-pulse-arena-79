-- ============================================================
-- CATÁLOGO EXTENDIDO DE LICORES — 50 subastas con imágenes
-- Whiskies, Tequilas, Vodkas, Rones, Cognacs/Otros
-- Ejecutar en Supabase SQL Editor
-- Fotos: Unsplash (libre para uso comercial)
-- ============================================================

INSERT INTO public.auctions
  (title, description, category, starting_bid, minimum_bid, current_bid, bid_increment, end_time, status, image_url, total_bids)
VALUES

-- ============================================================
-- WHISKIES ESCOCESES (10)
-- ============================================================
(
  'Glenfiddich 15 años Solera 700ml — Decomisado en aduana',
  'Single malt escocés con triple maduración en barricas de sherry, bourbon y nueva madera. Botella sellada, etiqueta en excelente estado. Pasajero excedió límite de litros permitidos.',
  'Licores', 65, 65, 65, 8,
  now() + INTERVAL '3 hours 20 minutes', 'active',
  'https://images.unsplash.com/photo-1527281400683-1aad1e20ed22?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Glenfiddich 18 años Small Batch 700ml — Olvidado en sala VIP',
  'Single malt 18 años con acabado en barrica de oloroso. Caja original intacta. Uno de los más premiados del mundo.',
  'Licores', 110, 110, 110, 10,
  now() + INTERVAL '14 hours', 'active',
  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Lagavulin 16 años 700ml — Confiscado en revisión de equipaje',
  'Referencia obligada de Islay. Turba intensa, humo y notas de algas. Botella sellada sin caja exterior. Estado impecable.',
  'Licores', 120, 120, 120, 10,
  now() + INTERVAL '22 hours', 'active',
  'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Laphroaig 10 años Cask Strength 700ml — Equipaje no reclamado',
  'El más reconocido de Islay. Versión cask strength sin diluir, aproximadamente 58% vol. Botella sellada.',
  'Licores', 95, 95, 95, 10,
  now() + INTERVAL '6 hours 45 minutes', 'active',
  'https://images.unsplash.com/photo-1509669803049-9b5bd63582f1?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Talisker 10 años 700ml — Confiscado vuelo Edimburgo–CDMX',
  'Single malt de la Isla de Skye. Sabor marítimo con pimienta y turba suave. Botella original sellada.',
  'Licores', 80, 80, 80, 8,
  now() + INTERVAL '31 hours', 'active',
  'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'The Glenlivet 18 años 700ml — Decomisado en aduana',
  'Single malt Speyside con 18 años de maduración. Notas de frutas tropicales, miel y madera tostada. Con caja.',
  'Licores', 105, 105, 105, 10,
  now() + INTERVAL '8 hours 10 minutes', 'active',
  'https://images.unsplash.com/photo-1527281400683-1aad1e20ed22?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Chivas Regal 18 años Gold Signature 700ml — Confiscado',
  'Blend premium con 18 años mínimos. Botella distintiva con etiqueta dorada. Sellada, sin daños.',
  'Licores', 75, 75, 75, 8,
  now() + INTERVAL '19 hours', 'active',
  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Balvenie DoubleWood 12 años 700ml — Olvidado en terminal T2',
  'Doble maduración en barrica de bourbon y sherry de Jerez. Miel, vainilla y especias. Sellada.',
  'Licores', 85, 85, 85, 8,
  now() + INTERVAL '41 hours', 'active',
  'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Highland Park 12 años Viking Honour 700ml — Equipaje no reclamado',
  'Single malt de Orkney con balance perfecto entre turba, fruta y madera. Botella sellada con caja.',
  'Licores', 72, 72, 72, 8,
  now() + INTERVAL '11 hours 30 minutes', 'active',
  'https://images.unsplash.com/photo-1509669803049-9b5bd63582f1?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Oban 14 años 700ml — Decomisado en revisión',
  'West Highland single malt. Producción limitada, destilería pequeña. Notas de sal marina, fruta y miel. Sellado.',
  'Licores', 98, 98, 98, 10,
  now() + INTERVAL '27 hours', 'active',
  'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&h=400&fit=crop&auto=format',
  0
),

-- ============================================================
-- WHISKIES AMERICANOS / IRLANDESES (5)
-- ============================================================
(
  'Woodford Reserve Bourbon 750ml — Confiscado en aduana AICM',
  'Bourbon premium de Kentucky. Triple destilación en pot stills de cobre. Notas de naranja, vainilla y centeno. Sellado.',
  'Licores', 45, 45, 45, 5,
  now() + INTERVAL '2 hours 50 minutes', 'active',
  'https://images.unsplash.com/photo-1527281400683-1aad1e20ed22?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Buffalo Trace Bourbon 750ml — Equipaje no reclamado',
  'Bourbon clásico de la destilería más antigua de EUA en operación continua. Botella sellada, etiqueta impecable.',
  'Licores', 38, 38, 38, 5,
  now() + INTERVAL '16 hours', 'active',
  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Maker''s Mark Bourbon 750ml — Olvidado en sala de abordaje',
  'Bourbon de trigo suave con lacre rojo característico. Botella original sellada. Ligero roce en etiqueta inferior.',
  'Licores', 40, 40, 40, 5,
  now() + INTERVAL '5 hours 15 minutes', 'active',
  'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Jameson Black Barrel 700ml — Confiscado vuelo Dublin–CDMX',
  'Blend irlandés con doble maduración en barricas de bourbon. Más dulce y complejo que el Jameson clásico. Sellado.',
  'Licores', 42, 42, 42, 5,
  now() + INTERVAL '33 hours', 'active',
  'https://images.unsplash.com/photo-1509669803049-9b5bd63582f1?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Bulleit Bourbon Frontier Whiskey 750ml — Decomisado en aduana',
  'High-rye bourbon con notas especiadas. Botella de forma icónica. Sellada, sin caja pero etiqueta perfecta.',
  'Licores', 35, 35, 35, 5,
  now() + INTERVAL '9 hours 40 minutes', 'active',
  'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&h=400&fit=crop&auto=format',
  0
),

-- ============================================================
-- TEQUILAS PREMIUM (15)
-- ============================================================
(
  'Clase Azul Reposado 750ml — Confiscado vuelo Guadalajara–LAX',
  'Tequila 100% agave azul en la icónica botella de cerámica artesanal pintada a mano. Reposado 8 meses. Sellado.',
  'Licores', 280, 280, 280, 20,
  now() + INTERVAL '48 hours', 'active',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Don Julio 1942 Añejo 750ml — Equipaje no reclamado',
  'Tequila añejo de añejamiento mínimo 30 meses. Notas de caramelo, vainilla y roble. Botella sellada, edición estándar.',
  'Licores', 220, 220, 220, 20,
  now() + INTERVAL '36 hours', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Patrón Silver 1L — Decomisado en aduana AICM',
  'Tequila blanco 100% agave Weber azul de Jalisco. El más reconocido internacionalmente en su categoría. Botella sellada.',
  'Licores', 55, 55, 55, 5,
  now() + INTERVAL '7 hours 20 minutes', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Patrón Añejo 750ml — Confiscado en revisión de equipaje',
  'Añejo madurado en barricas de roble americano. Color dorado. Notas de vainilla, miel y agave. Sellado con caja.',
  'Licores', 90, 90, 90, 10,
  now() + INTERVAL '20 hours', 'active',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Casamigos Añejo 750ml — Olvidado en terminal internacional',
  'La marca de George Clooney. Añejo 14 meses. Suave, con notas de caramelo y chocolate. Botella sellada.',
  'Licores', 85, 85, 85, 10,
  now() + INTERVAL '13 hours', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Herradura Ultra Añejo 750ml — Decomisado por exceso de litros',
  'Añejo con acabado en barrica de cognac. Cuerpo rico, notas de fruta seca y roble. Botella y caja originales.',
  'Licores', 130, 130, 130, 10,
  now() + INTERVAL '29 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'El Tesoro Añejo 750ml — Equipaje no reclamado vuelo LA–GDL',
  'Producción tradicional tahona. Añejamiento en barricas de bourbon americano. Complejo y robusto. Sellado.',
  'Licores', 95, 95, 95, 10,
  now() + INTERVAL '4 hours 50 minutes', 'active',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Fortaleza Blanco 750ml — Confiscado en aduana',
  'Destilado en alambiques de cobre con tahona de piedra. Producción artesanal pequeña. Alta demanda internacional. Sellado.',
  'Licores', 110, 110, 110, 10,
  now() + INTERVAL '17 hours 30 minutes', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  '1800 Cristalino 750ml — Olvidado en sala VIP aeropuerto GDL',
  'Añejo filtrado en carbón para cristalización. Color transparente, sabor complejo. Presentación elegante. Sellado.',
  'Licores', 75, 75, 75, 8,
  now() + INTERVAL '38 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Casa Noble Añejo 750ml — Confiscado vuelo Chicago–GDL',
  'Tequila orgánico certificado. Añejo 2 años en barricas de roble francés. Notas de chocolate, agave y vainilla.',
  'Licores', 100, 100, 100, 10,
  now() + INTERVAL '23 hours', 'active',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Avión Reserva 44 Extra Añejo 750ml — Decomisado aduana',
  'Extra añejo madurado más de 44 meses. Presentación elegante, edición limitada. Sellado con caja de madera.',
  'Licores', 195, 195, 195, 15,
  now() + INTERVAL '55 hours', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Volcán de mi Tierra Blanco 750ml — Equipaje no reclamado',
  'Tequila de Moët Hennessy con agave de dos terruños distintos. Fresco y floral. Botella negra icónica. Sellado.',
  'Licores', 60, 60, 60, 5,
  now() + INTERVAL '10 hours 20 minutes', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Don Ramón Extra Añejo Plata 750ml — Confiscado en revisión',
  'Extra añejo en botella plateada decorada. 3 años mínimos de maduración. Edición de colección. Sellado.',
  'Licores', 160, 160, 160, 15,
  now() + INTERVAL '44 hours', 'active',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Espolón Reposado 750ml — Olvidado en vuelo CDMX–Houston',
  'Reposado premiado internacionalmente. Madurado 6 meses en barricas de roble americano. Fresco y versátil. Sellado.',
  'Licores', 30, 30, 30, 5,
  now() + INTERVAL '1 hour 55 minutes', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Olmeca Altos Plata 750ml — Decomisado aduana AICM',
  'Blanco artesanal hecho con tahona. Refrescante y con notas herbales. Excelente relación calidad-precio. Sellado.',
  'Licores', 22, 22, 22, 3,
  now() + INTERVAL '6 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),

-- ============================================================
-- VODKAS (10)
-- ============================================================
(
  'Grey Goose 1L — Confiscado en revisión de equipaje',
  'Vodka premium francés elaborado con trigo de la Beauce y agua de manantial filtrada. Botella sellada, sin caja.',
  'Licores', 55, 55, 55, 5,
  now() + INTERVAL '4 hours 10 minutes', 'active',
  'https://images.unsplash.com/photo-1550985543-f47f38ebb697?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Belvedere Pure 1L — Equipaje no reclamado vuelo Varsovia–CDMX',
  'Vodka polaco 100% centeno. Cuádruple destilación. Notas de vainilla y almendra. Botella sellada con caja.',
  'Licores', 65, 65, 65, 8,
  now() + INTERVAL '26 hours', 'active',
  'https://images.unsplash.com/photo-1527660070895-9e5ba2a3d0e9?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Ketel One 1L — Decomisado en aduana AICM',
  'Vodka holandés destilado en pot stills de cobre. Suave y limpio. Uno de los más vendidos en bares premium. Sellado.',
  'Licores', 42, 42, 42, 5,
  now() + INTERVAL '8 hours 40 minutes', 'active',
  'https://images.unsplash.com/photo-1550985543-f47f38ebb697?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Cîroc Ultra Premium 750ml — Confiscado vuelo París–CDMX',
  'El único vodka elaborado 100% con uvas en lugar de granos. Cinco destilaciones. Botella sellada.',
  'Licores', 60, 60, 60, 5,
  now() + INTERVAL '35 hours', 'active',
  'https://images.unsplash.com/photo-1527660070895-9e5ba2a3d0e9?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Absolut Elyx 1L — Olvidado en sala VIP terminal 2',
  'Single estate wheat vodka. Destilado en alambique de cobre vintage de 1921. Textura sedosa. Sellado.',
  'Licores', 58, 58, 58, 5,
  now() + INTERVAL '15 hours 20 minutes', 'active',
  'https://images.unsplash.com/photo-1550985543-f47f38ebb697?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Chopin Potato Vodka 750ml — Decomisado por exceso de litros',
  'El vodka de papa más premiado del mundo. Producción artesanal en Polonia. Cremoso y con cuerpo. Sellado.',
  'Licores', 48, 48, 48, 5,
  now() + INTERVAL '21 hours', 'active',
  'https://images.unsplash.com/photo-1527660070895-9e5ba2a3d0e9?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Tito''s Handmade Vodka 1.75L — Equipaje no reclamado',
  'El vodka americano más vendido. Elaborado en Austin, Texas, en pot stills de cobre. Botella grande sellada.',
  'Licores', 50, 50, 50, 5,
  now() + INTERVAL '3 hours 45 minutes', 'active',
  'https://images.unsplash.com/photo-1550985543-f47f38ebb697?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Stolichnaya Elit 750ml — Confiscado en revisión aduana',
  'La expresión más premium de Stoli. Ultra-filtración en frío. Suave y cristalino. Botella sellada con caja.',
  'Licores', 70, 70, 70, 8,
  now() + INTERVAL '40 hours', 'active',
  'https://images.unsplash.com/photo-1527660070895-9e5ba2a3d0e9?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Crystal Head Vodka 750ml — Olvidado en vuelo Toronto–CDMX',
  'Vodka canadiense en la icónica botella de calavera de cristal. Cuatro destilaciones, filtrado en cristales Herkimer. Sellado.',
  'Licores', 68, 68, 68, 8,
  now() + INTERVAL '12 hours 30 minutes', 'active',
  'https://images.unsplash.com/photo-1550985543-f47f38ebb697?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Russian Standard Platinum 1L — Decomisado aduana',
  'Vodka ruso filtrado en plata. Suave y neutro. Excelente para cocktails premium. Botella sellada.',
  'Licores', 35, 35, 35, 5,
  now() + INTERVAL '18 hours 45 minutes', 'active',
  'https://images.unsplash.com/photo-1527660070895-9e5ba2a3d0e9?w=600&h=400&fit=crop&auto=format',
  0
),

-- ============================================================
-- RONES (5)
-- ============================================================
(
  'Zacapa Centenario XO 750ml — Confiscado vuelo Guatemala–CDMX',
  'Ron guatemalteco madurado mediante sistema solera hasta 25 años. Notas de chocolate, café y tabaco. Sellado con caja.',
  'Licores', 145, 145, 145, 10,
  now() + INTERVAL '46 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Diplomatico Reserva Exclusiva 750ml — Equipaje no reclamado',
  'Ron venezolano de melaza de caña. 12 años mínimos. Dulce, especiado y con chocolate. Sellado.',
  'Licores', 75, 75, 75, 8,
  now() + INTERVAL '24 hours 30 minutes', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Appleton Estate 21 años 750ml — Confiscado aduana AICM',
  'Ron jamaicano de añejamiento excepcional. Edición limitada. Notas de fruta, roble y especias. Sellado con caja.',
  'Licores', 160, 160, 160, 15,
  now() + INTERVAL '58 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Brugal 1888 Double Aged 750ml — Olvidado en terminal internacional',
  'Ron dominicano madurado en barricas de bourbon y jerez. Equilibrado y complejo. Botella sellada.',
  'Licores', 55, 55, 55, 5,
  now() + INTERVAL '7 hours 50 minutes', 'active',
  'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Bacardi Gran Reserva Maestro de Ron 750ml — Decomisado',
  'La expresión máxima de Bacardi. Madurado 10 años en barricas seleccionadas. Suave y elegante. Sellado.',
  'Licores', 48, 48, 48, 5,
  now() + INTERVAL '32 hours', 'active',
  'https://images.unsplash.com/photo-1574023278561-83b47dd54e97?w=600&h=400&fit=crop&auto=format',
  0
),

-- ============================================================
-- COGNACS Y OTROS (5)
-- ============================================================
(
  'Hennessy XO 700ml — Confiscado vuelo París–CDMX',
  'El cognac XO que definió la categoría. Blend de más de 100 eaux-de-vie. Botella sellada con caja de lujo.',
  'Licores', 220, 220, 220, 20,
  now() + INTERVAL '52 hours', 'active',
  'https://images.unsplash.com/photo-1605454651558-f24c3b1a0ba2?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Rémy Martin VSOP 700ml — Equipaje no reclamado',
  'Cognac fino de la región de Champaña. Madurado entre 4 y 15 años. Frutal y especiado. Sellado.',
  'Licores', 60, 60, 60, 8,
  now() + INTERVAL '16 hours 40 minutes', 'active',
  'https://images.unsplash.com/photo-1605454651558-f24c3b1a0ba2?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Courvoisier XO 700ml — Confiscado en revisión de aduana',
  'Cognac de Napoleon. Blend de eaux-de-vie con hasta 35 años. Floral, especiado y elegante. Sellado con caja.',
  'Licores', 185, 185, 185, 15,
  now() + INTERVAL '43 hours', 'active',
  'https://images.unsplash.com/photo-1605454651558-f24c3b1a0ba2?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Amaretto Disaronno Originale 700ml — Olvidado en sala de abordaje',
  'Licor italiano de almendras amargas. El más vendido del mundo en su categoría. Botella icónica. Sellado.',
  'Licores', 28, 28, 28, 3,
  now() + INTERVAL '9 hours 10 minutes', 'active',
  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=400&fit=crop&auto=format',
  0
),
(
  'Kahlúa Original 1L — Decomisado en aduana AICM',
  'Licor de café mexicano. El más reconocido mundialmente. Base de ron, café arábica y vainilla. Sellado.',
  'Licores', 25, 25, 25, 3,
  now() + INTERVAL '2 hours 20 minutes', 'active',
  'https://images.unsplash.com/photo-1527281400683-1aad1e20ed22?w=600&h=400&fit=crop&auto=format',
  0
);


-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT
  category,
  COUNT(*)                                          AS total,
  MIN(current_bid)                                  AS precio_min,
  MAX(current_bid)                                  AS precio_max,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL)     AS con_imagen
FROM public.auctions
WHERE category = 'Licores' AND status = 'active'
GROUP BY category;
