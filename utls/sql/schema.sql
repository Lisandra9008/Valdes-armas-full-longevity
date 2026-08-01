-- ============================================================
-- VALDES ARMAS MARKETPLACE — Esquema Supabase
-- Pegar completo en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) PERFILES (se crea automáticamente al registrarse)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text,
  rol text not null default 'comprador' check (rol in ('comprador','vendedor','admin')),
  created_at timestamptz default now()
);

-- Trigger: crear fila en profiles cuando alguien se registra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2) PRODUCTOS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references profiles(id) on delete cascade,
  nombre text not null,
  descripcion text,
  categoria text not null check (categoria in ('aceite','plantas','artesanal','experiencias','publicaciones')),
  precio numeric(10,2),
  disponible boolean not null default true,
  imagenes text[] default '{}',
  created_at timestamptz default now()
);

-- 3) FAVORITOS
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- 4) CONVERSACIONES Y MENSAJES (chat comprador-vendedor)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  comprador_id uuid not null references profiles(id) on delete cascade,
  vendedor_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (product_id, comprador_id, vendedor_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  contenido text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- PERMISOS BASE (necesarios además de RLS)
-- Sin esto, Supabase rechaza el acceso aunque las políticas estén bien.
-- ============================================================
grant usage on schema public to anon, authenticated;

-- anon (visitantes sin cuenta): solo lectura de productos
grant select on products to anon;

-- authenticated (con cuenta creada): lectura/escritura, filtrada por RLS
grant select, insert, update, delete on profiles to authenticated;
grant select, insert, update, delete on products to authenticated;
grant select, insert, update, delete on favorites to authenticated;
grant select, insert, update, delete on conversations to authenticated;
grant select, insert, update, delete on messages to authenticated;

-- ============================================================
-- SEGURIDAD (Row Level Security)
-- ============================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Función auxiliar para chequear si el usuario es admin SIN causar
-- recursión infinita en las políticas de "profiles" (patrón recomendado
-- por Supabase: security definer evita que la función dispare RLS de nuevo).
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function is_seller_or_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and rol in ('vendedor','admin')
  );
$$;

-- PROFILES: cada quien ve/edita lo suyo; admin ve todo
drop policy if exists "ver propio perfil" on profiles;
create policy "ver propio perfil" on profiles for select using (auth.uid() = id);
drop policy if exists "admin ve todos los perfiles" on profiles;
create policy "admin ve todos los perfiles" on profiles for select using (is_admin());
drop policy if exists "editar propio perfil" on profiles;
create policy "editar propio perfil" on profiles for update using (auth.uid() = id);

-- PRODUCTS: cualquiera ve los disponibles; vendedor gestiona los suyos; admin todo
drop policy if exists "ver productos disponibles" on products;
create policy "ver productos disponibles" on products for select using (disponible = true);
drop policy if exists "vendedor ve los suyos" on products;
create policy "vendedor ve los suyos" on products for select using (auth.uid() = vendedor_id);
drop policy if exists "vendedor crea productos" on products;
create policy "vendedor crea productos" on products for insert with check (
  auth.uid() = vendedor_id
  and is_seller_or_admin()
);
drop policy if exists "vendedor edita los suyos" on products;
create policy "vendedor edita los suyos" on products for update using (auth.uid() = vendedor_id);
drop policy if exists "vendedor borra los suyos" on products;
create policy "vendedor borra los suyos" on products for delete using (auth.uid() = vendedor_id);
drop policy if exists "admin gestiona todo producto" on products;
create policy "admin gestiona todo producto" on products for all using (
  is_admin()
);

-- FAVORITES: solo el dueño
drop policy if exists "gestionar mis favoritos" on favorites;
create policy "gestionar mis favoritos" on favorites for all using (auth.uid() = user_id);

-- CONVERSATIONS: solo comprador o vendedor involucrado
drop policy if exists "ver mis conversaciones" on conversations;
create policy "ver mis conversaciones" on conversations for select using (
  auth.uid() = comprador_id or auth.uid() = vendedor_id
);
drop policy if exists "crear conversacion" on conversations;
create policy "crear conversacion" on conversations for insert with check (
  auth.uid() = comprador_id or auth.uid() = vendedor_id
);

-- MESSAGES: solo participantes de esa conversación
drop policy if exists "ver mensajes de mis conversaciones" on messages;
create policy "ver mensajes de mis conversaciones" on messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id
          and (c.comprador_id = auth.uid() or c.vendedor_id = auth.uid()))
);
drop policy if exists "enviar mensajes en mis conversaciones" on messages;
create policy "enviar mensajes en mis conversaciones" on messages for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from conversations c where c.id = conversation_id
          and (c.comprador_id = auth.uid() or c.vendedor_id = auth.uid()))
);

-- ============================================================
-- STORAGE: bucket para imágenes de producto
-- ============================================================
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists "cualquiera ve imagenes de productos" on storage.objects;
create policy "cualquiera ve imagenes de productos" on storage.objects for select using (
  bucket_id = 'productos'
);
drop policy if exists "vendedores suben imagenes" on storage.objects;
create policy "vendedores suben imagenes" on storage.objects for insert with check (
  bucket_id = 'productos'
  and is_seller_or_admin()
);
drop policy if exists "vendedores borran sus imagenes" on storage.objects;
create policy "vendedores borran sus imagenes" on storage.objects for delete using (
  bucket_id = 'productos' and owner = auth.uid()
);

-- ============================================================
-- PASO MANUAL: promover a Reinaldo, Bertha y Lisandra a 'vendedor'
-- (correr DESPUÉS de que cada uno se registre una vez en el sitio)
-- ============================================================
-- update profiles set rol = 'vendedor' where email = 'correo-de-reinaldo@ejemplo.com';
-- update profiles set rol = 'vendedor' where email = 'correo-de-bertha@ejemplo.com';
-- update profiles set rol = 'admin'    where email = 'tu-correo@ejemplo.com';
