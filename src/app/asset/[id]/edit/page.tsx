'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { use } from 'react'

const CATEGORIES = ['2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']

const inputStyle = {
  width: '100%',
  padding: '10px 16px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
}

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [preview, setPreview] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const previewInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadAsset() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: asset } = await supabase
        .from('assets')
        .select('*, profiles(is_admin)')
        .eq('id', id)
        .single()

      if (!asset) { router.push('/'); return }

      const isAdmin = asset.profiles?.is_admin
      const isOwner = asset.uploader_id === user.id

      if (!isAdmin && !isOwner) { router.push('/'); return }

      setName(asset.name)
      setDescription(asset.description ?? '')
      setCategory(asset.category)
      setCurrentPreviewUrl(asset.preview_url)
      setInitialLoading(false)
    }

    loadAsset()
  }, [id])

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let newPreviewUrl = currentPreviewUrl

    if (preview) {
      const previewExt = preview.name.split('.').pop()
      const previewPath = `${user.id}/preview_${Date.now()}.${previewExt}`
      await supabase.storage.from('assets').upload(previewPath, preview)
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(previewPath)
      newPreviewUrl = publicUrl
    }

    const { error: dbError } = await supabase
      .from('assets')
      .update({ name, description, category, preview_url: newPreviewUrl })
      .eq('id', id)

    if (dbError) { setError(dbError.message); setLoading(false); return }

    router.push(`/asset/${id}`)
  }

  if (initialLoading) return (
    <main style={{ maxWidth: '520px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
    </main>
  )

  return (
    <main style={{ maxWidth: '520px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
      <a href={`/asset/${id}`} style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        display: 'inline-block',
        marginBottom: '24px',
      }}>
        ← Volver
      </a>

      <h1 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '32px',
        letterSpacing: '-0.4px',
      }}>
        Editar asset
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Nombre del asset *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Categoría *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              ...inputStyle,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '32px',
            }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Imagen de preview</label>
          <div style={{
            border: '1px dashed var(--border)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--surface)',
          }}>
            <input
              ref={previewInputRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0] ?? null
                setPreview(f)
                if (f) setPreviewUrl(URL.createObjectURL(f))
                else setPreviewUrl(null)
                if (previewInputRef.current) previewInputRef.current.value = ''
              }}
              id="preview-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="preview-input" style={{ cursor: 'pointer' }}>
              {previewUrl ? (
                <div>
                  <img
                    src={previewUrl}
                    alt="Preview nueva"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', marginBottom: '8px' }}
                  />
                  <p style={{ color: 'var(--accent-light)', fontSize: '12px', margin: 0 }}>
                    Hacé clic para cambiar
                  </p>
                </div>
              ) : currentPreviewUrl ? (
                <div>
                  <img
                    src={currentPreviewUrl}
                    alt="Preview actual"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', marginBottom: '8px' }}
                  />
                  <p style={{ color: 'var(--accent-light)', fontSize: '12px', margin: 0 }}>
                    Hacé clic para cambiar
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                  Hacé clic para seleccionar una imagen
                </p>
              )}
            </label>
          </div>
        </div>

        {error && (
          <p style={{
            color: 'var(--danger)',
            fontSize: '13px',
            margin: 0,
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? 'var(--surface-2)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </main>
  )
}