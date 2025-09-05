
-- Helper to maintain updated_at automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) Banco de imágenes curadas
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,            -- e.g., product-images/phones/iphone13.jpg
  label text,                         -- nombre amigable
  category text not null,             -- debe coincidir con auctions.category (p.ej. "Electrónicos", "Navajas", "Vinos y Licores")
  brand text,                         -- p.ej. "Apple", "Samsung"
  product_type text,                  -- p.ej. "Phone", "Laptop", "Tequila"
  tags text[],                        -- palabras clave libres
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger product_images_set_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

alter table public.product_images enable row level security;

-- Lectura pública (solo metadatos)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_images' and policyname = 'Public can read product images'
  ) then
    create policy "Public can read product images"
      on public.product_images
      for select
      using (true);
  end if;
end $$;

-- Gestión solo admins
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_images' and policyname = 'Admins manage product images'
  ) then
    create policy "Admins manage product images"
      on public.product_images
      for all
      using (has_role(auth.uid(), 'admin'::app_role))
      with check (has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;

-- 2) Reglas de mapeo determinísticas
create table if not exists public.product_image_mappings (
  id uuid primary key default gen_random_uuid(),
  category text not null,             -- misma convención que auctions.category
  brand text,                         -- opcional
  product_type text,                  -- opcional
  contains_keywords text[],           -- opcional: palabras que deben aparecer en el título
  image_id uuid not null references public.product_images(id) on delete cascade,
  priority int not null default 100,  -- menor número = mayor prioridad
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_image_mappings_category
  on public.product_image_mappings (lower(category));
create index if not exists idx_product_image_mappings_priority
  on public.product_image_mappings (priority);
create index if not exists idx_product_image_mappings_active
  on public.product_image_mappings (active);

create trigger product_image_mappings_set_updated_at
before update on public.product_image_mappings
for each row execute function public.set_updated_at();

alter table public.product_image_mappings enable row level security;

-- Lectura pública
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_image_mappings' and policyname = 'Public can read image mappings'
  ) then
    create policy "Public can read image mappings"
      on public.product_image_mappings
      for select
      using (true);
  end if;
end $$;

-- Gestión solo admins
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_image_mappings' and policyname = 'Admins manage image mappings'
  ) then
    create policy "Admins manage image mappings"
      on public.product_image_mappings
      for all
      using (has_role(auth.uid(), 'admin'::app_role))
      with check (has_role(auth.uid(), 'admin'::app_role));
  end if;
end $$;
