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

  useEffect(() => { setPage(1) }, [category, search, sort])

  useEffect(() => {
    async function fetchAssets() {
      let query = supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .order(sort.column, { ascending: sort.ascending })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (category !== 'Todos') query = query.eq('category', category)
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)

      const { data, count } = await query
      setAssets(data ?? [])
      setTotal(count ?? 0)
    }
    fetchAssets()
  }, [category, search, sort, page])

  return (
    <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>

      {/* Buscador */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Categorías */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: category === cat ? 'var(--accent)' : 'var(--surface)',
              color: category === cat ? 'white' : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: category === cat ? 500 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resultados y ordenamiento */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {total} resultado{total !== 1 ? 's' : ''}
        </span>
        <select
          value={sort.label}
          onChange={e => setSort(SORT_OPTIONS.find(s => s.label === e.target.value) ?? SORT_OPTIONS[0])}
          style={{
            padding: '6px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.label} value={s.label}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Grid de assets */}
      {assets.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {assets.map(asset => (
            <a
              key={asset.id}
              href={`/asset/${asset.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: 'var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {asset.preview_url ? (
                    <img
                      src={asset.preview_url}
                      alt={asset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sin preview</span>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {asset.name}
                  </p>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>
                    {asset.category} · {asset.download_count} descargas
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '64px 0',
          color: 'var(--text-secondary)',
        }}>
          No se encontraron assets.
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            style={{
              padding: '6px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: page === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            ← Anterior
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            style={{
              padding: '6px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: page === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </main>
  )
}