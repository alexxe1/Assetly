import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: assets } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main>
      <h1>Assets</h1>
      <a href="/upload">Subir asset</a>
      <section>
        {assets && assets.length > 0 ? (
          assets.map(asset => (
            <div key={asset.id}>
              <h2>{asset.name}</h2>
              <p>{asset.description}</p>
              <p>{asset.category}</p>
              <a href={asset.file_url}>Descargar</a>
            </div>
          ))
        ) : (
          <p>No hay assets todavía.</p>
        )}
      </section>
    </main>
  )
}