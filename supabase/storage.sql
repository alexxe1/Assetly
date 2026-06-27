-- Policies para el bucket "assets" en Supabase Storage
-- (crear el bucket manualmente en Supabase -> Storage -> New bucket -> "assets" -> Public)

create policy "Usuarios autenticados pueden subir archivos"
on storage.objects for insert
with check (
  bucket_id = 'assets' and auth.uid() is not null
);

create policy "Todos pueden ver archivos"
on storage.objects for select
using (bucket_id = 'assets');

create policy "Admins pueden eliminar archivos"
on storage.objects for delete
using (
  bucket_id = 'assets' and
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);
