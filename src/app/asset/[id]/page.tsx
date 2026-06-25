import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: asset } = await supabase
    .from('assets')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (!asset) redirect('/dashboard')

  return (
    <main>
      <a href="/dashboard">← Volver</a>

      <h1>{asset.name}</h1>
      <p>Categoría: {asset.category}</p>
      <p>Subido por: {asset.profiles?.username ?? 'Desconocido'}</p>
      {asset.description && <p>{asset.description}</p>}

      {asset.preview_url && (
        <img src={asset.preview_url} alt={`Preview de ${asset.name}`} width={400} />
      )}

      <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
        Descargar asset
      </a>
    </main>
  )
}