-- =====================================================
-- SCRIPT DE DESPLIEGUE - SISTEMA DE SUBASTAS PROGRAMADAS
-- Versión: 1.0
-- Fecha: 2025-01-06
-- Descripción: Script completo para implementar el sistema de subastas programadas
-- =====================================================

-- 1. CREAR TABLA scheduled_auctions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scheduled_auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    starting_bid DECIMAL(10,2) NOT NULL CHECK (starting_bid > 0),
    image_url TEXT DEFAULT '',
    duration_hours INTEGER NOT NULL DEFAULT 6 CHECK (duration_hours > 0),
    scheduled_publish_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
    published_auction_id UUID REFERENCES public.auctions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Opcional, sin foreign key para evitar problemas
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_scheduled_auctions_status ON public.scheduled_auctions(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_auctions_publish_time ON public.scheduled_auctions(scheduled_publish_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_auctions_category ON public.scheduled_auctions(category);

-- 2. HABILITAR RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.scheduled_auctions ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICAS RLS PERMISIVAS PARA PRUEBAS
-- =====================================================
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "scheduled_auctions_select_policy" ON public.scheduled_auctions;
DROP POLICY IF EXISTS "scheduled_auctions_insert_policy" ON public.scheduled_auctions;
DROP POLICY IF EXISTS "scheduled_auctions_update_policy" ON public.scheduled_auctions;
DROP POLICY IF EXISTS "scheduled_auctions_delete_policy" ON public.scheduled_auctions;

-- Crear nuevas políticas permisivas
CREATE POLICY "scheduled_auctions_select_policy" ON public.scheduled_auctions
    FOR SELECT USING (true);

CREATE POLICY "scheduled_auctions_insert_policy" ON public.scheduled_auctions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "scheduled_auctions_update_policy" ON public.scheduled_auctions
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "scheduled_auctions_delete_policy" ON public.scheduled_auctions
    FOR DELETE USING (true);

-- 4. FUNCIÓN PARA GENERAR PRODUCTOS DINÁMICOS
-- =====================================================
CREATE OR REPLACE FUNCTION generate_realistic_auction_product(category_param TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    categories TEXT[] := ARRAY['electronics', 'jewelry', 'watches', 'perfumes', 'art', 'vehicles', 'furniture', 'collectibles'];
    selected_category TEXT;
    product_data JSON;
    base_price DECIMAL(10,2);
    conditions TEXT[] := ARRAY['Decomisado por autoridades', 'Abandonado en depósito', 'Confiscado por incumplimiento', 'Recuperado por seguros', 'Olvidado en almacén'];
    condition_text TEXT;
BEGIN
    -- Seleccionar categoría
    IF category_param IS NULL THEN
        selected_category := categories[floor(random() * array_length(categories, 1)) + 1];
    ELSE
        selected_category := category_param;
    END IF;

    -- Seleccionar condición aleatoria
    condition_text := conditions[floor(random() * array_length(conditions, 1)) + 1];

    -- Generar productos según categoría
    CASE selected_category
        WHEN 'electronics' THEN
            WITH electronics AS (
                SELECT * FROM (VALUES
                    ('iPhone 15 Pro Max 256GB', 'Smartphone Apple última generación, pantalla Super Retina XDR', 850.00),
                    ('MacBook Air M3 13"', 'Laptop Apple con chip M3, 16GB RAM, 512GB SSD', 1200.00),
                    ('Samsung Galaxy S24 Ultra', 'Smartphone Samsung premium con S Pen incluido', 780.00),
                    ('iPad Pro 12.9" M2', 'Tablet profesional Apple con chip M2 y pantalla Liquid Retina', 950.00),
                    ('Dell XPS 15', 'Laptop premium para profesionales, Intel Core i7', 1100.00),
                    ('Sony WH-1000XM5', 'Audífonos inalámbricos con cancelación de ruido', 280.00),
                    ('Nintendo Switch OLED', 'Consola de videojuegos híbrida con pantalla OLED', 320.00),
                    ('Canon EOS R6 Mark II', 'Cámara mirrorless profesional de 24.2MP', 1800.00),
                    ('Dyson V15 Detect', 'Aspiradora inalámbrica con tecnología láser', 450.00),
                    ('Apple Watch Ultra 2', 'Smartwatch resistente para deportes extremos', 650.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', e.name,
                'description', e.description || '. ' || condition_text || '. Producto en excelente condición, verificado por expertos.',
                'category', selected_category,
                'base_price', e.price
            ) INTO product_data
            FROM electronics e;

        WHEN 'jewelry' THEN
            WITH jewelry AS (
                SELECT * FROM (VALUES
                    ('Collar de Perlas Akoya', 'Elegante collar de perlas genuinas de cultivo japonés, 18"', 450.00),
                    ('Anillo de Compromiso Solitario', 'Anillo de oro blanco 14k con diamante de 1 quilate', 2800.00),
                    ('Reloj Cartier Tank', 'Reloj clásico de lujo en oro amarillo de 18k', 3500.00),
                    ('Aretes de Esmeralda', 'Aretes en oro blanco con esmeraldas colombianas genuinas', 1200.00),
                    ('Pulsera Tiffany & Co.', 'Pulsera de plata esterlina con charm de corazón', 380.00),
                    ('Broche Vintage Art Déco', 'Broche antiguo de platino con diamantes y zafiros', 1800.00),
                    ('Cadena de Oro 18k', 'Cadena masculina de oro sólido, eslabones cubanos, 24"', 850.00),
                    ('Anillo de Rubí Birmano', 'Anillo vintage con rubí de Myanmar y diamantes', 2200.00),
                    ('Set de Joyas de Perlas', 'Conjunto completo: collar, aretes y pulsera de perlas', 680.00),
                    ('Gemelos de Platino', 'Gemelos elegantes con incrustaciones de diamantes', 750.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', j.name,
                'description', j.description || '. ' || condition_text || '. Pieza auténtica con certificado de autenticidad.',
                'category', selected_category,
                'base_price', j.price
            ) INTO product_data
            FROM jewelry j;

        WHEN 'watches' THEN
            WITH watches AS (
                SELECT * FROM (VALUES
                    ('Rolex Submariner Date', 'Reloj de buceo icónico en acero inoxidable, resistente al agua', 6500.00),
                    ('Omega Speedmaster Professional', 'El reloj que fue a la luna, cronógrafo manual', 3200.00),
                    ('TAG Heuer Carrera', 'Cronógrafo suizo inspirado en las carreras de autos', 1800.00),
                    ('Patek Philippe Calatrava', 'Reloj de vestir ultra fino, oro amarillo 18k', 15000.00),
                    ('Breitling Navitimer', 'Reloj de aviador con regla de cálculo circular', 2800.00),
                    ('IWC Portugieser', 'Reloj clásico con indicador de reserva de marcha', 4200.00),
                    ('Seiko Prospex Diver', 'Reloj de buceo japonés automático, 200m resistencia', 350.00),
                    ('Audemars Piguet Royal Oak', 'Icónico reloj deportivo de lujo en acero', 18000.00),
                    ('Tudor Black Bay', 'Reloj de buceo vintage-inspired, hermano de Rolex', 2200.00),
                    ('Citizen Eco-Drive', 'Reloj solar que nunca necesita cambio de batería', 280.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', w.name,
                'description', w.description || '. ' || condition_text || '. Mecanismo verificado y en perfecto funcionamiento.',
                'category', selected_category,
                'base_price', w.price
            ) INTO product_data
            FROM watches w;

        WHEN 'perfumes' THEN
            WITH perfumes AS (
                SELECT * FROM (VALUES
                    ('Chanel No. 5 EDP 100ml', 'Legendario perfume femenino, fragancia floral aldehídica', 120.00),
                    ('Tom Ford Black Orchid', 'Fragancia unisex lujosa y misteriosa, 50ml', 95.00),
                    ('Creed Aventus 120ml', 'Perfume masculino premium con notas frutales y ahumadas', 280.00),
                    ('Dior Sauvage EDT 100ml', 'Fragancia masculina fresca y especiada', 85.00),
                    ('Yves Saint Laurent Black Opium', 'Perfume femenino adictivo con café y vainilla, 90ml', 78.00),
                    ('Maison Margiela Replica', 'By the Fireplace - Fragancia unisex acogedora, 100ml', 110.00),
                    ('Hermès Terre d''Hermès', 'Eau de toilette masculina terrosa y elegante, 100ml', 95.00),
                    ('Jo Malone Peony & Blush Suede', 'Colonia británica delicada y sofisticada, 100ml', 88.00),
                    ('Byredo Gypsy Water EDP', 'Fragancia nicho unisex bohemia, 50ml', 145.00),
                    ('Viktor&Rolf Spicebomb', 'Perfume masculino explosivo y especiado, 90ml', 65.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', p.name,
                'description', p.description || '. ' || condition_text || '. Producto sellado y con garantía de autenticidad.',
                'category', selected_category,
                'base_price', p.price
            ) INTO product_data
            FROM perfumes p;

        WHEN 'art' THEN
            WITH art AS (
                SELECT * FROM (VALUES
                    ('Pintura al Óleo Original', 'Paisaje impresionista firmado por artista reconocido, 60x80cm', 1200.00),
                    ('Escultura de Bronce', 'Figura abstracta moderna, edición limitada numerada', 2800.00),
                    ('Acuarela Contemporánea', 'Obra abstracta enmarcada profesionalmente, 50x70cm', 650.00),
                    ('Grabado Vintage', 'Litografía original de principios del siglo XX, 40x60cm', 480.00),
                    ('Fotografía Fine Art', 'Impresión giclée firmada por fotógrafo reconocido', 420.00),
                    ('Cerámica Artesanal', 'Jarrón único hecho a mano por ceramista premiado', 320.00),
                    ('Dibujo a Carbón', 'Retrato realista enmarcado en madera noble', 380.00),
                    ('Collage Mixto', 'Técnica mixta sobre lienzo, estilo pop art contemporáneo', 750.00),
                    ('Serigrafía Original', 'Impresión artística numerada y firmada, 30x40cm', 290.00),
                    ('Tapiz Tejido', 'Obra textil contemporánea con fibras naturales, 100x120cm', 890.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', a.name,
                'description', a.description || '. ' || condition_text || '. Obra con certificado de autenticidad y procedencia.',
                'category', selected_category,
                'base_price', a.price
            ) INTO product_data
            FROM art a;

        WHEN 'vehicles' THEN
            WITH vehicles AS (
                SELECT * FROM (VALUES
                    ('BMW Serie 3 2020', 'Sedán ejecutivo con motor turbo, automático, full equipo', 28000.00),
                    ('Mercedes-Benz Clase C', 'Vehículo de lujo 2019, impecable mantenimiento', 32000.00),
                    ('Toyota Camry Hybrid', 'Sedán híbrido 2021, excelente eficiencia combustible', 24000.00),
                    ('Audi A4 Quattro', 'Tracción integral, tecnología avanzada, 2020', 29500.00),
                    ('Harley-Davidson Street 750', 'Motocicleta cruiser, perfecta para ciudad', 6500.00),
                    ('Jeep Wrangler Unlimited', 'SUV todoterreno 4x4, ideal para aventuras', 35000.00),
                    ('Tesla Model 3', 'Vehículo eléctrico autónomo, carga rápida', 31000.00),
                    ('Honda Civic Type R', 'Deportivo compacto de alto rendimiento', 27000.00),
                    ('Ford Mustang GT', 'Muscle car americano clásico, V8 5.0L', 38000.00),
                    ('Yamaha YZF-R6', 'Motocicleta deportiva de 600cc, pista y calle', 8500.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', v.name,
                'description', v.description || '. ' || condition_text || '. Documentos al día, verificación mecánica completa.',
                'category', selected_category,
                'base_price', v.price
            ) INTO product_data
            FROM vehicles v;

        WHEN 'furniture' THEN
            WITH furniture AS (
                SELECT * FROM (VALUES
                    ('Sofá Chester de Cuero', 'Sofá clásico de cuero genuino, 3 plazas, color cognac', 1200.00),
                    ('Mesa de Comedor Roble', 'Mesa extensible para 8 personas, madera maciza', 850.00),
                    ('Sillón Eames Lounge', 'Icónico sillón de diseño con otomana incluida', 2800.00),
                    ('Cama King Size', 'Estructura de nogal con cabecera tapizada, colchón premium', 950.00),
                    ('Librero Escandinavo', 'Estantería moderna de 5 niveles, madera clara', 420.00),
                    ('Mesa de Centro Mármol', 'Mesa circular con base de acero inoxidable', 680.00),
                    ('Armario Vintage', 'Guardarropa de madera restaurado, estilo mid-century', 750.00),
                    ('Escritorio Ejecutivo', 'Desk de oficina en caoba con cajones', 580.00),
                    ('Juego de Sillas Comedor', 'Set de 6 sillas tapizadas en terciopelo gris', 720.00),
                    ('Consola TV Industrial', 'Mueble de entretenimiento estilo industrial', 480.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', f.name,
                'description', f.description || '. ' || condition_text || '. Mueble en excelente estado, listo para usar.',
                'category', selected_category,
                'base_price', f.price
            ) INTO product_data
            FROM furniture f;

        ELSE -- collectibles
            WITH collectibles AS (
                SELECT * FROM (VALUES
                    ('Cartas Pokémon Vintage', 'Colección de cartas raras incluyendo Charizard holográfico', 1500.00),
                    ('Monedas de Plata Antiguas', 'Set de monedas mexicanas de los años 1900-1950', 680.00),
                    ('Cómic Superman #1', 'Reedición de colección en perfecto estado', 250.00),
                    ('Figura Star Wars Vintage', 'Luke Skywalker original de 1977, empaque sellado', 450.00),
                    ('Reloj de Bolsillo Ferrocarrilero', 'Hamilton 21 joyas, funcionando perfectamente', 380.00),
                    ('Vinilo Beatles White Album', 'Disco original prensado en 1968, excelente condición', 220.00),
                    ('Máquina de Escribir Olivetti', 'Modelo Studio 44 de 1960, completamente funcional', 320.00),
                    ('Juego de Mesa Monopoly 1935', 'Edición original restaurada con piezas originales', 280.00),
                    ('Cámara Leica Vintage', 'Modelo IIIc de 1950, lente Carl Zeiss', 1200.00),
                    ('Timbres Postales Raros', 'Colección de estampillas mexicanas 1920-1960', 150.00)
                ) AS t(name, description, price)
                ORDER BY random()
                LIMIT 1
            )
            SELECT json_build_object(
                'title', c.name,
                'description', c.description || '. ' || condition_text || '. Pieza de colección auténtica y verificada.',
                'category', 'collectibles',
                'base_price', c.price
            ) INTO product_data
            FROM collectibles c;
    END CASE;

    RETURN product_data;
END;
$$;

-- 5. FUNCIÓN SIMPLIFICADA PARA GENERAR SUBASTAS PROGRAMADAS
-- =====================================================
CREATE OR REPLACE FUNCTION generate_scheduled_auctions_simple(
    days_ahead INTEGER DEFAULT 7,
    auctions_per_day INTEGER DEFAULT 3
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    current_date_iter DATE;
    end_date DATE;
    auction_count INTEGER := 0;
    result_auctions JSON[] := '{}';
    product_data JSON;
    scheduled_time TIMESTAMP WITH TIME ZONE;
    hours_offset INTEGER;
    auction_record JSON;
BEGIN
    -- Validar parámetros
    IF days_ahead <= 0 OR auctions_per_day <= 0 THEN
        RAISE EXCEPTION 'Los parámetros days_ahead y auctions_per_day deben ser positivos';
    END IF;

    current_date_iter := CURRENT_DATE + INTERVAL '1 day';
    end_date := current_date_iter + (days_ahead || ' days')::INTERVAL;

    -- Generar subastas para cada día
    WHILE current_date_iter <= end_date LOOP
        -- Crear múltiples subastas por día
        FOR i IN 1..auctions_per_day LOOP
            -- Generar producto aleatorio
            product_data := generate_realistic_auction_product();
            
            -- Calcular hora de publicación (entre 8 AM y 10 PM)
            hours_offset := 8 + floor(random() * 14)::INTEGER;
            scheduled_time := current_date_iter + (hours_offset || ' hours')::INTERVAL + 
                            (floor(random() * 60)::INTEGER || ' minutes')::INTERVAL;

            -- Insertar subasta programada
            INSERT INTO public.scheduled_auctions (
                title,
                description,
                category,
                starting_bid,
                image_url,
                duration_hours,
                scheduled_publish_time,
                status
            ) VALUES (
                product_data->>'title',
                product_data->>'description',
                product_data->>'category',
                (product_data->>'base_price')::DECIMAL(10,2) * (0.3 + random() * 0.4), -- 30-70% del precio base
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
                6 + floor(random() * 19)::INTEGER, -- Entre 6 y 24 horas
                scheduled_time,
                'scheduled'
            )
            RETURNING json_build_object(
                'id', id,
                'title', title,
                'scheduled_time', scheduled_publish_time
            ) INTO auction_record;

            result_auctions := result_auctions || auction_record;
            auction_count := auction_count + 1;
        END LOOP;

        current_date_iter := current_date_iter + INTERVAL '1 day';
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'generated_count', auction_count,
        'auctions', result_auctions,
        'message', 'Se generaron ' || auction_count || ' subastas programadas exitosamente'
    );
END;
$$;

-- 6. FUNCIÓN PARA OBTENER PRÓXIMAS SUBASTAS SIMPLIFICADA
-- =====================================================
CREATE OR REPLACE FUNCTION get_upcoming_scheduled_auctions_simple(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    starting_bid DECIMAL(10,2),
    image_url TEXT,
    duration_hours INTEGER,
    scheduled_publish_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    time_until_publish TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.title,
        sa.description,
        sa.category,
        sa.starting_bid,
        sa.image_url,
        sa.duration_hours,
        sa.scheduled_publish_time,
        sa.status,
        sa.created_at,
        sa.updated_at,
        CASE 
            WHEN sa.scheduled_publish_time <= NOW() THEN 'Listo para publicar'
            WHEN sa.scheduled_publish_time <= NOW() + INTERVAL '1 hour' THEN 'En menos de 1 hora'
            WHEN sa.scheduled_publish_time <= NOW() + INTERVAL '24 hours' THEN 
                EXTRACT(HOUR FROM (sa.scheduled_publish_time - NOW())) || ' horas'
            ELSE 
                EXTRACT(DAY FROM (sa.scheduled_publish_time - NOW())) || ' días'
        END as time_until_publish
    FROM public.scheduled_auctions sa
    WHERE sa.status = 'scheduled'
      AND sa.scheduled_publish_time >= NOW() - INTERVAL '1 hour' -- Incluir las que están listas
    ORDER BY sa.scheduled_publish_time ASC
    LIMIT limit_count;
END;
$$;

-- 7. FUNCIÓN PARA PUBLICAR SUBASTAS PROGRAMADAS
-- =====================================================
CREATE OR REPLACE FUNCTION publish_scheduled_auctions()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    published_count INTEGER := 0;
    auction_record RECORD;
    new_auction_id UUID;
    result_auctions JSON[] := '{}';
BEGIN
    -- Buscar subastas programadas listas para publicar
    FOR auction_record IN 
        SELECT * FROM public.scheduled_auctions 
        WHERE status = 'scheduled' 
          AND scheduled_publish_time <= NOW()
        ORDER BY scheduled_publish_time ASC
        LIMIT 10 -- Procesar máximo 10 por vez
    LOOP
        -- Insertar nueva subasta en la tabla auctions
        INSERT INTO public.auctions (
            title,
            description,
            category,
            current_bid,
            image_url,
            ends_at
        ) VALUES (
            auction_record.title,
            auction_record.description,
            auction_record.category,
            auction_record.starting_bid,
            auction_record.image_url,
            NOW() + (auction_record.duration_hours || ' hours')::INTERVAL
        )
        RETURNING id INTO new_auction_id;

        -- Actualizar subasta programada como publicada
        UPDATE public.scheduled_auctions 
        SET 
            status = 'published',
            published_auction_id = new_auction_id,
            updated_at = NOW()
        WHERE id = auction_record.id;

        -- Agregar al resultado
        result_auctions := result_auctions || json_build_object(
            'scheduled_id', auction_record.id,
            'auction_id', new_auction_id,
            'title', auction_record.title
        );

        published_count := published_count + 1;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'published_count', published_count,
        'published_auctions', result_auctions,
        'message', CASE 
            WHEN published_count = 0 THEN 'No hay subastas programadas listas para publicar'
            ELSE 'Se publicaron ' || published_count || ' subastas exitosamente'
        END
    );
END;
$$;

-- 8. TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_scheduled_auctions_updated_at ON public.scheduled_auctions;
CREATE TRIGGER update_scheduled_auctions_updated_at
    BEFORE UPDATE ON public.scheduled_auctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. OTORGAR PERMISOS NECESARIOS
-- =====================================================
-- Permisos para usuarios autenticados
GRANT ALL ON public.scheduled_auctions TO authenticated;
GRANT ALL ON public.scheduled_auctions TO anon;

-- Permisos para ejecutar funciones
GRANT EXECUTE ON FUNCTION generate_realistic_auction_product(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_realistic_auction_product(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION generate_scheduled_auctions_simple(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_scheduled_auctions_simple(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_scheduled_auctions_simple(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_scheduled_auctions_simple(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION publish_scheduled_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION publish_scheduled_auctions() TO anon;

-- 10. INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- =====================================================
-- Descomentar las siguientes líneas si quieres datos de prueba iniciales

/*
-- Generar 5 subastas de prueba para los próximos 2 días
SELECT generate_scheduled_auctions_simple(2, 5);

-- Insertar una subasta manual de prueba
INSERT INTO public.scheduled_auctions (
    title,
    description, 
    category,
    starting_bid,
    image_url,
    duration_hours,
    scheduled_publish_time,
    status
) VALUES (
    'Subasta de Prueba',
    'Esta es una subasta de prueba del sistema programado',
    'electronics',
    100.00,
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    6,
    NOW() + INTERVAL '2 hours',
    'scheduled'
);
*/

-- =====================================================
-- FIN DEL SCRIPT DE DESPLIEGUE
-- =====================================================

-- Para verificar que todo se instaló correctamente, ejecuta:
-- SELECT * FROM public.scheduled_auctions LIMIT 5;
-- SELECT generate_scheduled_auctions_simple(1, 2);
-- SELECT * FROM get_upcoming_scheduled_auctions_simple(10);

COMMIT;
