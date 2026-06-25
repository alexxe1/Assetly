'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Todos', '2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']

type Asset = {
  id: string
  name: string
  description: string | null
  category: string
  file_url: string
  preview_url: string | null
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [category, setCategory] = useState('Todos')
  const supabase = createClient()

  useEffect(() => {
    async function fetchAssets() {
      let query = supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (category !== 'Todos') {
        query = query.eq('category', category)
      }

      const { data } = await query
      setAssets(data ?? [])
    }

    fetchAssets()
  }, [category])

  return (
    <main>
      <h1>Assets</h1>

      <div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{ fontWeight: category === cat ? 'bold' : 'normal' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section>
        {assets.length > 0 ? (
          assets.map(asset => (
            <div key={asset.id}>
              {asset.preview_url && (
                <img src={asset.preview_url} alt={asset.name} width={200} />
              )}
              <h2>{asset.name}</h2>
              <p>{asset.description}</p>
              <p>{asset.category}</p>
              <a href={`/asset/${asset.id}`}>Ver detalle</a>
            </div>
          ))
        ) : (
          <p>No hay assets en esta categoría.</p>
        )}
      </section>
    </main>
  )
}