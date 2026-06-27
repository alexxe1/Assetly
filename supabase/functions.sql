-- Función RPC para incrementar el contador de descargas de forma atómica
create or replace function increment_download(asset_id uuid)
returns void as $$
  update public.assets
  set download_count = download_count + 1
  where id = asset_id;
$$ language sql security definer;
