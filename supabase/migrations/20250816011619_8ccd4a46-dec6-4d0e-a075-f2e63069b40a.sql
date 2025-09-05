-- Clear existing auctions and add new realistic products with MXN pricing
DELETE FROM public.auctions;

-- Insert new auctions organized by the updated categories
-- Vinos y Licores ($100-300 MXN) - decomisado en arco de seguridad
INSERT INTO public.auctions (title, description, category, minimum_bid, current_bid, bid_increment, end_time, image_url, status) VALUES

-- Vinos y Licores
('Whisky Jack Daniels No. 7', 'Whisky americano Tennessee 750ml - decomisado en arco de seguridad', 'Vinos y Licores', 150.00, 150.00, 25.00, NOW() + INTERVAL '4 hours', '/src/assets/product-liquor.jpg', 'active'),
('Tequila José Cuervo Tradicional', 'Tequila reposado 100% agave 700ml - decomisado en arco de seguridad', 'Vinos y Licores', 180.00, 180.00, 30.00, NOW() + INTERVAL '3 hours', '/src/assets/product-premium-spirits.jpg', 'active'),
('Ron Bacardí Añejo', 'Ron caribeño añejado 750ml - decomisado en arco de seguridad', 'Vinos y Licores', 120.00, 120.00, 20.00, NOW() + INTERVAL '5 hours', '/src/assets/product-liquor.jpg', 'active'),
('Vodka Absolut Original', 'Vodka sueco premium 750ml - decomisado en arco de seguridad', 'Vinos y Licores', 140.00, 140.00, 25.00, NOW() + INTERVAL '2 hours', '/src/assets/product-premium-spirits.jpg', 'active'),
('Vino Tinto Cabernet', 'Vino tinto mexicano cosecha 2020 - decomisado en arco de seguridad', 'Vinos y Licores', 100.00, 100.00, 15.00, NOW() + INTERVAL '6 hours', '/src/assets/product-liquor.jpg', 'active'),
('Gin Tanqueray London Dry', 'Gin inglés destilado 750ml - decomisado en arco de seguridad', 'Vinos y Licores', 160.00, 160.00, 25.00, NOW() + INTERVAL '3.5 hours', '/src/assets/product-premium-spirits.jpg', 'active'),
('Cerveza Artesanal IPA', 'Pack 6 cervezas artesanales IPA - decomisado en arco de seguridad', 'Vinos y Licores', 200.00, 200.00, 30.00, NOW() + INTERVAL '4.5 hours', '/src/assets/product-liquor.jpg', 'active'),
('Whisky Johnnie Walker Red', 'Whisky escocés blend 750ml - decomisado en arco de seguridad', 'Vinos y Licores', 170.00, 170.00, 25.00, NOW() + INTERVAL '2.5 hours', '/src/assets/product-premium-spirits.jpg', 'active'),
('Vino Blanco Sauvignon', 'Vino blanco chileno cosecha 2021 - decomisado en arco de seguridad', 'Vinos y Licores', 110.00, 110.00, 20.00, NOW() + INTERVAL '5.5 hours', '/src/assets/product-liquor.jpg', 'active'),
('Brandy Torres 10 Años', 'Brandy español reserva 700ml - decomisado en arco de seguridad', 'Vinos y Licores', 250.00, 250.00, 40.00, NOW() + INTERVAL '1.5 hours', '/src/assets/product-premium-spirits.jpg', 'active'),

-- Navajas ($100-300 MXN) - decomisado en arco de seguridad  
('Navaja Victorinox Classic', 'Navaja suiza multiusos 7 funciones - decomisado en arco de seguridad', 'Navajas', 150.00, 150.00, 25.00, NOW() + INTERVAL '3 hours', '/src/assets/product-swiss-knife.jpg', 'active'),
('Navaja Gerber Paraframe', 'Navaja táctica plegable acero inox - decomisado en arco de seguridad', 'Navajas', 200.00, 200.00, 30.00, NOW() + INTERVAL '4 hours', '/src/assets/product-tactical-gear.jpg', 'active'),
('Navaja de Bolsillo Kershaw', 'Navaja compacta hoja acero 440C - decomisado en arco de seguridad', 'Navajas', 180.00, 180.00, 25.00, NOW() + INTERVAL '2 hours', '/src/assets/product-tools.jpg', 'active'),
('Multiherramienta Leatherman', 'Multiherramienta 14 funciones acero - decomisado en arco de seguridad', 'Navajas', 280.00, 280.00, 40.00, NOW() + INTERVAL '5 hours', '/src/assets/product-swiss-knife.jpg', 'active'),
('Navaja SOG Flash II', 'Navaja táctica asistida clip - decomisado en arco de seguridad', 'Navajas', 220.00, 220.00, 35.00, NOW() + INTERVAL '3.5 hours', '/src/assets/product-tactical-gear.jpg', 'active'),
('Navaja Buck 110 Folding', 'Navaja clásica americana hoja fija - decomisado en arco de seguridad', 'Navajas', 190.00, 190.00, 30.00, NOW() + INTERVAL '4.5 hours', '/src/assets/product-tools.jpg', 'active'),
('Navaja CRKT M16-14M', 'Navaja militar diseño Carson - decomisado en arco de seguridad', 'Navajas', 160.00, 160.00, 25.00, NOW() + INTERVAL '2.5 hours', '/src/assets/product-tactical-gear.jpg', 'active'),
('Navaja Spyderco Tenacious', 'Navaja deportiva hoja lisa 8Cr13MoV - decomisado en arco de seguridad', 'Navajas', 240.00, 240.00, 35.00, NOW() + INTERVAL '1.5 hours', '/src/assets/product-swiss-knife.jpg', 'active'),
('Navaja Benchmade Griptilian', 'Navaja premium acero S30V - decomisado en arco de seguridad', 'Navajas', 300.00, 300.00, 45.00, NOW() + INTERVAL '6 hours', '/src/assets/product-tools.jpg', 'active'),
('Navaja Cold Steel Recon 1', 'Navaja táctica pesada CTS-XHP - decomisado en arco de seguridad', 'Navajas', 260.00, 260.00, 40.00, NOW() + INTERVAL '5.5 hours', '/src/assets/product-tactical-gear.jpg', 'active'),

-- Electrónicos (máximo $1000 MXN) - olvidado en vuelo comercial
('Samsung Galaxy A54 5G', 'Smartphone Samsung 128GB cámara 50MP - olvidado en vuelo comercial', 'Electrónicos', 800.00, 800.00, 100.00, NOW() + INTERVAL '6 hours', '/src/assets/product-phone.jpg', 'active'),
('Laptop HP Pavilion 15', 'Laptop HP Core i5 8GB RAM 256GB SSD - olvidado en vuelo comercial', 'Electrónicos', 1000.00, 1000.00, 150.00, NOW() + INTERVAL '5 hours', '/src/assets/product-laptop.jpg', 'active'),
('Tablet Samsung Galaxy Tab A8', 'Tablet Android 10.5\" 64GB WiFi - olvidado en vuelo comercial', 'Electrónicos', 600.00, 600.00, 80.00, NOW() + INTERVAL '4 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Audífonos Sony WH-CH720N', 'Audífonos inalámbricos cancelación ruido - olvidado en vuelo comercial', 'Electrónicos', 400.00, 400.00, 60.00, NOW() + INTERVAL '3 hours', '/src/assets/product-electronics.jpg', 'active'),
('Bocina JBL Flip 6', 'Bocina Bluetooth portátil resistente agua - olvidado en vuelo comercial', 'Electrónicos', 300.00, 300.00, 50.00, NOW() + INTERVAL '2 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Lenovo ThinkPad E14', 'Laptop empresarial Core i5 16GB RAM - olvidado en vuelo comercial', 'Electrónicos', 950.00, 950.00, 120.00, NOW() + INTERVAL '5.5 hours', '/src/assets/product-laptop.jpg', 'active'),
('Xiaomi Redmi Note 12', 'Smartphone Android 256GB cámara 48MP - olvidado en vuelo comercial', 'Electrónicos', 500.00, 500.00, 70.00, NOW() + INTERVAL '3.5 hours', '/src/assets/product-phone.jpg', 'active'),
('Dell Inspiron 15 3000', 'Laptop Dell Core i3 8GB RAM 1TB - olvidado en vuelo comercial', 'Electrónicos', 700.00, 700.00, 90.00, NOW() + INTERVAL '4.5 hours', '/src/assets/product-electronics.jpg', 'active'),
('Audífonos Bose QuietComfort', 'Audífonos premium cancelación activa - olvidado en vuelo comercial', 'Electrónicos', 800.00, 800.00, 100.00, NOW() + INTERVAL '2.5 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Mouse Gaming Logitech G502', 'Mouse gaming 11 botones RGB - olvidado en vuelo comercial', 'Electrónicos', 150.00, 150.00, 25.00, NOW() + INTERVAL '1.5 hours', '/src/assets/product-electronics.jpg', 'active'),
('Teclado Mecánico Corsair K70', 'Teclado gaming mecánico switches Cherry - olvidado en vuelo comercial', 'Electrónicos', 350.00, 350.00, 50.00, NOW() + INTERVAL '6 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Webcam Logitech C920', 'Cámara web HD 1080p micrófono dual - olvidado en vuelo comercial', 'Electrónicos', 200.00, 200.00, 30.00, NOW() + INTERVAL '4 hours', '/src/assets/product-electronics.jpg', 'active'),
('Power Bank Anker 20000mAh', 'Batería portátil carga rápida USB-C - olvidado en vuelo comercial', 'Electrónicos', 180.00, 180.00, 25.00, NOW() + INTERVAL '3 hours', '/src/assets/product-premium-electronics.jpg', 'active'),
('Monitor LG 24\" Full HD', 'Monitor LED IPS 24 pulgadas HDMI - olvidado en vuelo comercial', 'Electrónicos', 600.00, 600.00, 80.00, NOW() + INTERVAL '5 hours', '/src/assets/product-electronics.jpg', 'active');