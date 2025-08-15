-- Clear existing auctions and add many new cheap ones
DELETE FROM public.auctions;

-- Insert new auctions with very cheap prices and specific descriptions
INSERT INTO public.auctions (title, description, category, minimum_bid, current_bid, bid_increment, end_time, image_url, status) VALUES

-- Liquor items (decomisado en arco de seguridad)
('Botella de Whisky Premium', 'Whisky escocés de 12 años - decomisado en arco de seguridad', 'alcohol', 5.00, 5.00, 1.00, NOW() + INTERVAL '2 hours', '/src/assets/product-liquor.jpg', 'active'),
('Ron Añejo Caribeño', 'Ron premium añejado - decomisado en arco de seguridad', 'alcohol', 3.00, 3.00, 0.50, NOW() + INTERVAL '1 hour', '/src/assets/product-premium-spirits.jpg', 'active'),
('Vodka Importado', 'Vodka premium de grano - decomisado en arco de seguridad', 'alcohol', 4.00, 4.00, 0.50, NOW() + INTERVAL '3 hours', '/src/assets/product-liquor.jpg', 'active'),
('Tequila Artesanal', 'Tequila 100% agave - decomisado en arco de seguridad', 'alcohol', 6.00, 6.00, 1.00, NOW() + INTERVAL '4 hours', '/src/assets/product-premium-spirits.jpg', 'active'),
('Cognac Francés', 'Cognac VSOP importado - decomisado en arco de seguridad', 'alcohol', 8.00, 8.00, 1.00, NOW() + INTERVAL '5 hours', '/src/assets/product-liquor.jpg', 'active'),

-- Knives and tools (decomisado en arco de seguridad)
('Navaja Suiza Multiusos', 'Navaja con múltiples herramientas - decomisado en arco de seguridad', 'tools', 2.00, 2.00, 0.50, NOW() + INTERVAL '1.5 hours', '/src/assets/product-swiss-knife.jpg', 'active'),
('Kit de Herramientas Tácticas', 'Set completo de herramientas tácticas - decomisado en arco de seguridad', 'tools', 7.00, 7.00, 1.00, NOW() + INTERVAL '6 hours', '/src/assets/product-tactical-gear.jpg', 'active'),
('Cuchillo de Supervivencia', 'Cuchillo militar de supervivencia - decomisado en arco de seguridad', 'tools', 4.00, 4.00, 0.50, NOW() + INTERVAL '2.5 hours', '/src/assets/product-tools.jpg', 'active'),
('Multiherramienta Profesional', 'Herramienta multifunción profesional - decomisado en arco de seguridad', 'tools', 3.00, 3.00, 0.50, NOW() + INTERVAL '3.5 hours', '/src/assets/product-swiss-knife.jpg', 'active'),
('Set de Navajas Colección', 'Colección de navajas plegables - decomisado en arco de seguridad', 'tools', 5.00, 5.00, 1.00, NOW() + INTERVAL '4.5 hours', '/src/assets/product-tactical-gear.jpg', 'active'),

-- Electronics (olvidado en vuelo comercial)
('iPhone 14 Pro', 'Smartphone Apple iPhone 14 Pro 128GB - olvidado en vuelo comercial', 'electronics', 25.00, 25.00, 5.00, NOW() + INTERVAL '8 hours', '/src/assets/product-phone.jpg', 'active'),
('MacBook Pro 13"', 'Laptop Apple MacBook Pro 13 pulgadas - olvidado en vuelo comercial', 'electronics', 35.00, 35.00, 5.00, NOW() + INTERVAL '12 hours', '/src/assets/product-laptop.jpg', 'active'),
('Samsung Galaxy S23', 'Smartphone Samsung Galaxy S23 256GB - olvidado en vuelo comercial', 'electronics', 20.00, 20.00, 3.00, NOW() + INTERVAL '7 hours', '/src/assets/product-electronics.jpg', 'active'),
('iPad Air 5ta Gen', 'Tablet Apple iPad Air 64GB - olvidado en vuelo comercial', 'electronics', 18.00, 18.00, 3.00, NOW() + INTERVAL '9 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('AirPods Pro 2', 'Audífonos inalámbricos Apple AirPods Pro - olvidado en vuelo comercial', 'electronics', 8.00, 8.00, 2.00, NOW() + INTERVAL '5 hours', '/src/assets/product-electronics.jpg', 'active'),
('Dell XPS 15', 'Laptop Dell XPS 15 16GB RAM - olvidado en vuelo comercial', 'electronics', 30.00, 30.00, 5.00, NOW() + INTERVAL '10 hours', '/src/assets/product-laptop.jpg', 'active'),
('Nintendo Switch OLED', 'Consola Nintendo Switch modelo OLED - olvidado en vuelo comercial', 'electronics', 15.00, 15.00, 2.00, NOW() + INTERVAL '6 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Sony WH-1000XM5', 'Audífonos Sony con cancelación de ruido - olvidado en vuelo comercial', 'electronics', 12.00, 12.00, 2.00, NOW() + INTERVAL '4 hours', '/src/assets/product-electronics.jpg', 'active'),

-- Luxury items
('Reloj Rolex Submariner', 'Reloj de lujo suizo automático', 'luxury', 50.00, 50.00, 10.00, NOW() + INTERVAL '24 hours', '/src/assets/product-luxury-watches.jpg', 'active'),
('Perfume Chanel No. 5', 'Perfume de lujo francés 100ml', 'cosmetics', 10.00, 10.00, 2.00, NOW() + INTERVAL '8 hours', '/src/assets/product-luxury-perfumes.jpg', 'active'),
('Set de Maquillaje MAC', 'Kit completo de maquillaje profesional', 'cosmetics', 12.00, 12.00, 2.00, NOW() + INTERVAL '6 hours', '/src/assets/product-luxury-makeup.jpg', 'active'),
('Collar de Diamantes', 'Joyería fina con diamantes certificados', 'luxury', 75.00, 75.00, 15.00, NOW() + INTERVAL '48 hours', '/src/assets/product-luxury-jewelry.jpg', 'active'),
('Perfume Tom Ford', 'Fragancia premium masculina 50ml', 'cosmetics', 8.00, 8.00, 1.00, NOW() + INTERVAL '5 hours', '/src/assets/product-perfume.jpg', 'active'),
('Reloj TAG Heuer', 'Reloj deportivo suizo cronógrafo', 'luxury', 40.00, 40.00, 8.00, NOW() + INTERVAL '18 hours', '/src/assets/product-watch.jpg', 'active'),

-- More cheap electronics
('Google Pixel 7', 'Smartphone Google Pixel 7 128GB - olvidado en vuelo comercial', 'electronics', 16.00, 16.00, 3.00, NOW() + INTERVAL '7.5 hours', '/src/assets/product-phone.jpg', 'active'),
('Lenovo ThinkPad X1', 'Laptop empresarial Lenovo ThinkPad - olvidado en vuelo comercial', 'electronics', 28.00, 28.00, 4.00, NOW() + INTERVAL '11 hours', '/src/assets/product-laptop.jpg', 'active'),
('Samsung Galaxy Tab S8', 'Tablet Samsung Galaxy Tab S8 - olvidado en vuelo comercial', 'electronics', 14.00, 14.00, 2.00, NOW() + INTERVAL '8.5 hours', '/src/assets/product-premium-electronics.jpg', 'active'),

-- More liquor
('Whisky Jack Daniels', 'Whisky americano Tennessee - decomisado en arco de seguridad', 'alcohol', 4.50, 4.50, 0.50, NOW() + INTERVAL '2.2 hours', '/src/assets/product-liquor.jpg', 'active'),
('Gin Bombay Sapphire', 'Gin premium inglés - decomisado en arco de seguridad', 'alcohol', 3.50, 3.50, 0.50, NOW() + INTERVAL '3.8 hours', '/src/assets/product-premium-spirits.jpg', 'active'),

-- More tools
('Linterna Táctica LED', 'Linterna militar alta potencia - decomisado en arco de seguridad', 'tools', 2.50, 2.50, 0.50, NOW() + INTERVAL '2.8 hours', '/src/assets/product-tactical-gear.jpg', 'active'),
('Destornillador Multibit', 'Set de destornilladores profesional - decomisado en arco de seguridad', 'tools', 1.50, 1.50, 0.25, NOW() + INTERVAL '1.8 hours', '/src/assets/product-tools.jpg', 'active');