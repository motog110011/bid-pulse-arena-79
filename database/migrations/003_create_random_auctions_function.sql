-- =====================================================
-- FUNCIÓN PARA OBTENER SUBASTAS EN ORDEN ALEATORIO
-- Permite mostrar las subastas en diferente orden en cada carga
-- =====================================================

-- Crear función para obtener subastas en orden aleatorio
CREATE OR REPLACE FUNCTION public.get_random_auctions()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    current_bid DECIMAL,
    minimum_bid DECIMAL,
    bid_increment DECIMAL,
    image_url TEXT,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    current_bidder TEXT,
    total_bids INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Retornar todas las subastas activas en orden aleatorio
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.category,
        a.current_bid,
        a.minimum_bid,
        a.bid_increment,
        a.image_url,
        a.end_time,
        a.status,
        a.current_bidder,
        a.total_bids,
        a.created_at,
        a.updated_at
    FROM public.auctions a
    WHERE a.status = 'active'
    ORDER BY random(); -- Orden aleatorio usando la función random() de PostgreSQL
END;
$$;

-- Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.get_random_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_auctions() TO anon;

-- También crear una versión con filtros opcionales para mayor flexibilidad
CREATE OR REPLACE FUNCTION public.get_random_auctions_with_filters(
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT NULL,
    status_filter TEXT DEFAULT 'active'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    current_bid DECIMAL,
    minimum_bid DECIMAL,
    bid_increment DECIMAL,
    image_url TEXT,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    current_bidder TEXT,
    total_bids INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Retornar subastas con filtros opcionales en orden aleatorio
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.category,
        a.current_bid,
        a.minimum_bid,
        a.bid_increment,
        a.image_url,
        a.end_time,
        a.status,
        a.current_bidder,
        a.total_bids,
        a.created_at,
        a.updated_at
    FROM public.auctions a
    WHERE 
        a.status = status_filter
        AND (category_filter IS NULL OR a.category = category_filter)
    ORDER BY random()
    LIMIT COALESCE(limit_count, 100); -- Límite por defecto de 100 si no se especifica
END;
$$;

-- Otorgar permisos para la función con filtros
GRANT EXECUTE ON FUNCTION public.get_random_auctions_with_filters(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_auctions_with_filters(TEXT, INTEGER, TEXT) TO anon;

-- Mensaje de confirmación
SELECT 'Función get_random_auctions creada exitosamente. Las subastas se mostrarán en orden aleatorio en cada carga.' as mensaje;
