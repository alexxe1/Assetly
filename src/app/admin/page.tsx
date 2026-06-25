import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from './DeleteButton'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: assets } = await supabase
    .from('assets')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  return (
    <main>
      <h1>Panel de administración</h1>
      <a href="/dashboard">← Volver</a>

      <section>
        {assets && assets.length > 0 ? (
          assets.map(asset => (
            <div key={asset.id}>
              <h2>{asset.name}</h2>
              <p>Categoría: {asset.category}</p>
              <p>Subido por: {asset.profiles?.username ?? 'Desconocido'}</p>
              <a href={`/asset/${asset.id}`}>Ver detalle</a>
              <DeleteButton assetId={asset.id} />
            </div>
          ))
        ) : (
          <p>No hay assets.</p>
        )}
      </section>
    </main>
  )
}