'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getCategoryStyle } from '@/lib/categoryColors'

const CATEGORIES = ['Todos', '2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']

type Asset = {
    id: string
    name: string
    category: string
    preview_url: string | null
    download_count: number
    created_at: string
}

export default function MisSubidasPage() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [filtered, setFiltered] = useState<Asset[]>([])
    const [category, setCategory] = useState('Todos')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchAssets() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data } = await supabase
                .from('assets')
                .select('*')
                .eq('uploader_id', user.id)
                .order('created_at', { ascending: false })

            setAssets(data ?? [])
            setFiltered(data ?? [])
            setLoading(false)
        }
        fetchAssets()
    }, [])

    useEffect(() => {
        let result = assets

        if (category !== 'Todos') {
            result = result.filter(a => a.category === category)
        }

        if (search.trim()) {
            result = result.filter(a =>
                a.name.toLowerCase().includes(search.trim().toLowerCase())
            )
        }

        setFiltered(result)
    }, [category, search, assets])

    if (loading) return (
        <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </main>
    )

    return (
        <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.4px',
                }}>
                    Mis subidas
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0' }}>
                    {filtered.length} de {assets.length} asset{assets.length !== 1 ? 's' : ''}
                </p>
            </div>

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

            {filtered.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '16px',
                }}>
                    {filtered.map((asset, index) => (
                        <a
                            key={asset.id}
                            href={`/asset/${asset.id}`}
                            className="asset-card"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                animationDelay: `${index * 30}ms`,
                                opacity: 0,
                            }}
                        >
                            <div
                                style={{
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
                                <div style={{ padding: '8px 10px' }}>
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
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 7px',
                                            borderRadius: '20px',
                                            background: getCategoryStyle(asset.category).bg,
                                            color: getCategoryStyle(asset.category).color,
                                            fontWeight: 500,
                                            marginLeft: '-4px',
                                        }}>
                                            {asset.category}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {asset.download_count} ↓
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 0',
                    color: 'var(--text-secondary)',
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📭</p>
                    <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                        {assets.length === 0 ? 'Todavía no subiste ningún asset' : 'No se encontraron assets'}
                    </p>
                    {assets.length === 0 && (
                        <a
                            href="/upload"
                            style={{
                                display: 'inline-block',
                                padding: '10px 24px',
                                background: 'var(--accent)',
                                color: 'white',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                            }}
                        >
                            Subir el primero
                        </a>
                    )}
                </div>
            )}
        </main>
    )
}