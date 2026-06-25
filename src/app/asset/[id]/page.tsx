import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DownloadButton from './DownloadButton'

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: asset } = await supabase
    .from('assets')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (!asset) redirect('/dashboard')

  const format = asset.file_url.split('.').pop() ?? 'archivo'

  return (
    <main>
      <a href="/dashboard">← Volver</a>

      <h1>{asset.name}</h1>
      <p>Categoría: {asset.category}</p>
      <p>Subido por: {asset.profiles?.username ?? 'Desconocido'}</p>
      <p>{asset.download_count} descargas</p>
      {asset.description && <p>{asset.description}</p>}

      {asset.preview_url && (
        <img src={asset.preview_url} alt={`Preview de ${asset.name}`} width={400} />
      )}

      <DownloadButton
        assetId={asset.id}
        fileUrl={asset.file_url}
        format={format}
      />
    </main>
  )
}