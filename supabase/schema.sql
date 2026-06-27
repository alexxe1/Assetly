-- Tabla de perfiles (extiende el auth de Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Tabla de assets
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null,
  file_url text not null,
  preview_url text,
  uploader_id uuid references public.profiles(id) on delete set null,
  download_count integer default 0,
  created_at timestamptz default now()
);

-- RLS: activar en ambas tablas
alter table public.profiles enable row level security;
alter table public.assets enable row level security;

-- Policies para profiles
create policy "Todos pueden ver perfiles"
  on public.profiles for select
  using (true);

create policy "Usuarios editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies para assets
create policy "Todos pueden ver assets"
  on public.assets for select
  using (true);

create policy "Usuarios autenticados pueden subir assets"
  on public.assets for insert
  with check (auth.uid() = uploader_id);

create policy "Dueños y admins pueden eliminar assets"
  on public.assets for delete
  using (
    auth.uid() = uploader_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );;

create policy "Dueños pueden editar sus assets"
  on public.assets for update
  using (auth.uid() = uploader_id)
  with check (auth.uid() = uploader_id);