'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'

const CATEGORIES = ['Todos', '2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']

const SORT_OPTIONS = [
  { label: 'Más recientes', column: 'created_at', ascending: false },
  { label: 'Más antiguos', column: 'created_at', ascending: true },
  { label: 'Más descargas', column: 'download_count', ascending: false },
  { label: 'Menos descargas', column: 'download_count', ascending: true },
  { label: 'A → Z', column: 'name', ascending: true },
  { label: 'Z → A', column: 'name', ascending: false },
]

type Asset = {
  id: string
  name: string
  description: string | null
  category: string
  preview_url: string | null
  download_count: number
  profiles: { username: string } | null
}

export default function AdminPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS[0])
  const [total, setTotal] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/'); return }

      setIsAdmin(true)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    async function fetchAssets() {
      let query = supabase
        .from('assets')
        .select('*, profiles(username)', { count: 'exact' })
        .order(sort.column, { ascending: sort.ascending })

      if (category !== 'Todos') query = query.eq('category', category)
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)

      const { data, count } = await query
      setAssets(data ?? [])
      setTotal(count ?? 0)
    }

    fetchAssets()
  }, [isAdmin, category, search, sort])

  if (loading) return (
    <main style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
    </main>
  )

  return (
    <main style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '-0.4px',
        }}>
          Panel de administración
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0' }}>
          {total} asset{total !== 1 ? 's' : ''} en total
        </p>
      </div>

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
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
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

      {/* Ordenamiento */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <select
          value={sort.label}
          onChange={e => setSort(SORT_OPTIONS.find(s => s.label === e.target.value) ?? SORT_OPTIONS[0])}
          style={{
            padding: '6px 32px 6px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.label} value={s.label}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de assets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assets.length > 0 ? (
          assets.map(asset => (
            <div
              key={asset.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                background: 'var(--surface-2)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {asset.preview_url ? (
                  <img
                    src={asset.preview_url}
                    alt={asset.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Sin preview</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {asset.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {asset.category} · {asset.profiles?.username ?? 'Desconocido'} · {asset.download_count} descargas
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <a
                  href={`/asset/${asset.id}`}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                  }}
                >
                  Ver
                </a>
                <DeleteButton
                  assetId={asset.id}
                  onDelete={() => {
                    setAssets(prev => prev.filter(a => a.id !== asset.id))
                    setTotal(prev => prev - 1)
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 0',
            color: 'var(--text-secondary)',
          }}>
            No se encontraron assets.
          </div>
        )}
      </div>
    </main>
  )
}