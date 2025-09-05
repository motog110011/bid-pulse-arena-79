
-- 1) Reactivar subastas vencidas (o con fecha pasada) y darles 6 horas desde ahora
update public.auctions
set
  status = 'active',
  end_time = now() + interval '6 hours',
  updated_at = now()
where
  (
    (status = 'active' and end_time <= now())
    or status = 'ended'
  )
  and status <> 'cancelled';

-- 2) Reemplazar rutas locales /src/assets por imágenes válidas públicas, por categoría
update public.auctions
set
  image_url = case
    when category = 'Vinos y Licores' then 'https://images.unsplash.com/photo-1514362545857-3bc16c4c76d3?q=80&w=800&auto=format&fit=crop'
    when category = 'Navajas' then 'https://images.unsplash.com/photo-1617979745825-2b3e9a219ddb?q=80&w=800&auto=format&fit=crop'
    when category = 'Electrónicos' then 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'
    else 'https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=800&auto=format&fit=crop'
  end,
  updated_at = now()
where
  image_url is null
  or image_url like '/src/assets%';
