-- Insert more auctions with "forgotten" electronics, alcohol and pocket knives
INSERT INTO public.auctions (title, description, category, minimum_bid, current_bid, bid_increment, end_time, image_url, total_bids, current_bidder, status) VALUES
-- Forgotten Electronics
('iPhone 12 Olvidado', 'iPhone 12 de 128GB encontrado en aeropuerto, sin reclamar por 6 meses', 'Electrónicos', 5000.00, 6200.00, 200.00, NOW() + INTERVAL '3 hours', '/src/assets/product-phone.jpg', 12, 'TechCollector2024', 'active'),
('Laptop Gaming Abandonada', 'Laptop gaming Asus ROG abandonada en hotel, especificaciones altas', 'Electrónicos', 8000.00, 9500.00, 300.00, NOW() + INTERVAL '5 hours', '/src/assets/product-laptop.jpg', 8, 'GamerPro', 'active'),
('Audífonos Premium Perdidos', 'Sony WH-1000XM4 perdidos en transporte público', 'Electrónicos', 2500.00, 3100.00, 100.00, NOW() + INTERVAL '2 hours', '/src/assets/product-premium-electronics.jpg', 15, 'AudioLover', 'active'),
('Tablet Olvidada', 'iPad Pro olvidado en café, pantalla de 12.9 pulgadas', 'Electrónicos', 4000.00, 4800.00, 200.00, NOW() + INTERVAL '4 hours', '/src/assets/product-electronics.jpg', 6, 'DigitalNomad', 'active'),

-- Alcohol
('Tequila Artesanal Perdido', 'Botella de tequila artesanal de Jalisco, 100% agave azul', 'Licores', 1200.00, 1450.00, 50.00, NOW() + INTERVAL '6 hours', '/src/assets/product-premium-spirits.jpg', 18, 'TequilaExpert', 'active'),
('Whisky Japonés Extraviado', 'Whisky japonés Yamazaki de colección, botella única', 'Licores', 3500.00, 4200.00, 150.00, NOW() + INTERVAL '8 hours', '/src/assets/product-liquor.jpg', 22, 'WhiskyCollector', 'active'),
('Ron Dominicano Vintage', 'Ron añejo dominicano de 25 años, encontrado en bodega', 'Licores', 2800.00, 3300.00, 100.00, NOW() + INTERVAL '7 hours', '/src/assets/product-premium-spirits.jpg', 14, 'RumMaster', 'active'),
('Mezcal Oaxaqueño Olvidado', 'Mezcal artesanal de Oaxaca, producción limitada', 'Licores', 800.00, 950.00, 25.00, NOW() + INTERVAL '3 hours', '/src/assets/product-liquor.jpg', 11, 'MezcalFan', 'active'),

-- Pocket Knives
('Navaja Suiza Vintage', 'Navaja suiza Victorinox vintage, modelo coleccionable de los años 80', 'Herramientas', 1500.00, 1750.00, 50.00, NOW() + INTERVAL '4 hours', '/src/assets/product-swiss-knife.jpg', 9, 'KnifeCollector', 'active'),
('Cuchillo Táctico Perdido', 'Cuchillo táctico militar de alta calidad, mango ergonómico', 'Herramientas', 2200.00, 2650.00, 100.00, NOW() + INTERVAL '5 hours', '/src/assets/product-tactical-gear.jpg', 16, 'TacticalGear', 'active'),
('Navaja de Bolsillo Artesanal', 'Navaja artesanal española con mango de madera de olivo', 'Herramientas', 800.00, 920.00, 30.00, NOW() + INTERVAL '2 hours', '/src/assets/product-tools.jpg', 7, 'CraftsmanTool', 'active'),
('Set de Navajas de Colección', 'Conjunto de 3 navajas de diferentes épocas, todas funcionales', 'Herramientas', 3000.00, 3400.00, 150.00, NOW() + INTERVAL '6 hours', '/src/assets/product-tactical-gear.jpg', 13, 'VintageTools', 'active');