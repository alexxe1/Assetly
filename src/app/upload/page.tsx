'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export default function UploadPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpload() {
    if (!file || !name) {
      setError('El nombre y el archivo son obligatorios')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file)

    if (uploadError) { setError(uploadError.message); setLoading(false); return }

    const { data: { publicUrl: fileUrl } } = supabase.storage.from('assets').getPublicUrl(filePath)

    let uploadedPreviewUrl = null
    if (preview) {
      const previewExt = preview.name.split('.').pop()
      const previewPath = `${user.id}/preview_${Date.now()}.${previewExt}`
      await supabase.storage.from('assets').upload(previewPath, preview)
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(previewPath)
      uploadedPreviewUrl = publicUrl
    }

    const { error: dbError } = await supabase.from('assets').insert({
      name, description, category, file_url: fileUrl, preview_url: uploadedPreviewUrl, uploader_id: user.id,
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }

    router.push('/')
  }

  return (
    <main style={{ maxWidth: '520px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '32px',
        letterSpacing: '-0.4px',
      }}>
        Subir un asset
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Nombre del asset *</label>
          <input
            type="text"
            placeholder="Nombre del asset..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea
            placeholder="Descripción del asset..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
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
          <label style={labelStyle}>Archivo del asset *</label>
          <div style={{
            border: '1px dashed var(--border)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--surface)',
          }}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={e => {
                setFile(e.target.files?.[0] ?? null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              <p style={{ color: file ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                {file ? `✓ ${file.name}` : 'Hacé clic para seleccionar un archivo'}
              </p>
              {file && (
                <p style={{ color: 'var(--accent-light)', fontSize: '12px', margin: '4px 0 0' }}>
                  Hacé clic para cambiar
                </p>
              )}
            </label>
          </div>
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
                    alt="Preview"
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
          onClick={handleUpload}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? 'var(--surface-2)' : 'var(--success)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Subiendo...' : 'Subir'}
        </button>

        <a href="/" style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px',
        }}>
          Cancelar
        </a>
      </div>
    </main>
  )
}