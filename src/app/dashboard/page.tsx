'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Todos', '2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']
const PAGE_SIZE = 20

type Asset = {
  id: string
  name: string
  description: string | null
  category: string
  file_url: string
  preview_url: string | null
  download_count: number
  created_at: string
}

type SortOption = {
  label: string
  column: string
  ascending: boolean
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Más recientes', column: 'created_at', ascending: false },
  { label: 'Más antiguos', column: 'created_at', ascending: true },
  { label: 'Más descargas', column: 'download_count', ascending: false },
  { label: 'Menos descargas', column: 'download_count', ascending: true },
  { label: 'A → Z', column: 'name', ascending: true },
  { label: 'Z → A', column: 'name', ascending: false },
]

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS[0])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const supabase = createClient()
  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [category, search, sort])

  useEffect(() => {
    async function fetchAssets() {
      let query = supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .order(sort.column, { ascending: sort.ascending })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (category !== 'Todos') {
        query = query.eq('category', category)
      }

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }

      const { data, count } = await query
      setAssets(data ?? [])
      setTotal(count ?? 0)
    }

    fetchAssets()
  }, [category, search, sort, page])

  return (
    <main>
      <div>
        <input
          type="text"
          placeholder="Buscar assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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

      <div>
        <span>Resultados: {total}</span>
        <select
          value={sort.label}
          onChange={e => setSort(SORT_OPTIONS.find(s => s.label === e.target.value) ?? SORT_OPTIONS[0])}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.label} value={s.label}>{s.label}</option>
          ))}
        </select>
      </div>

      <section>
        {assets.length > 0 ? (
          assets.map(asset => (
            <div key={asset.id}>
              {asset.preview_url && (
                <img src={asset.preview_url} alt={asset.name} width={200} />
              )}
              <h2>{asset.name}</h2>
              <p>{asset.category}</p>
              <p>{asset.download_count} descargas</p>
              <a href={`/asset/${asset.id}`}>Ver detalle</a>
            </div>
          ))
        ) : (
          <p>No hay assets en esta categoría.</p>
        )}
      </section>

      {totalPages > 1 && (
        <div>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            ← Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
            Siguiente →
          </button>
        </div>
      )}
    </main>
  )
}