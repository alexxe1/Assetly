'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['2D', '3D', 'Audio', 'UI', 'Fuentes', 'Shaders', 'Otro']

export default function UploadPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    if (!user) {
      router.push('/login')
      return
    }

    // Subir archivo principal
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { data: { publicUrl: fileUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)

    // Subir preview si hay
    let previewUrl = null
    if (preview) {
      const previewExt = preview.name.split('.').pop()
      const previewPath = `${user.id}/preview_${Date.now()}.${previewExt}`
      await supabase.storage.from('assets').upload(previewPath, preview)
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(previewPath)
      previewUrl = publicUrl
    }

    // Guardar en la tabla assets
    const { error: dbError } = await supabase.from('assets').insert({
      name,
      description,
      category,
      file_url: fileUrl,
      preview_url: previewUrl,
      uploader_id: user.id,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main>
      <h1>Subir asset</h1>

      <input
        type="text"
        placeholder="Nombre del asset"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <select value={category} onChange={e => setCategory(e.target.value)}>
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <label>
        Archivo del asset
        <input
          type="file"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label>
        Imagen de preview (opcional)
        <input
          type="file"
          accept="image/*"
          onChange={e => setPreview(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <p>{error}</p>}

      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir asset'}
      </button>

      <a href="/dashboard">Cancelar</a>
    </main>
  )
}