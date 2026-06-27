import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DownloadButton from './DownloadButton'
import DeleteAssetButton from './DeleteAssetButton'

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: asset } = await supabase
    .from('assets')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (!asset) redirect('/')

  const { data: { user } } = await supabase.auth.getUser()

  let canDelete = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    canDelete = profile?.is_admin || user.id === asset.uploader_id
  }

  const format = asset.file_url.split('.').pop() ?? 'archivo'
  const date = new Date(asset.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <main style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
      <a href="/" style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '24px',
      }}>
        ← Volver
      </a>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Columna izquierda: imagen + info + botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: '1',
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
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sin preview</span>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            <span>Subido por <strong style={{ color: 'var(--text-primary)' }}>{asset.profiles?.username ?? 'Desconocido'}</strong></span>
            <span>Fecha de subida: {date}</span>
            <span>{asset.download_count} descarga{asset.download_count !== 1 ? 's' : ''}</span>
          </div>

          <DownloadButton
            assetId={asset.id}
            fileUrl={asset.file_url}
            format={format}
          />

          {canDelete && (
            <a
              href={`/asset/${asset.id}/edit`}
              style={{
                display: 'block',
                width: '100%',
                padding: '11px',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '15px',
                marginTop: '-6px',
                fontWeight: 500,
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              Editar asset
            </a>
          )}

          {canDelete && <DeleteAssetButton assetId={asset.id} />}
        </div>

        {/* Columna derecha: título y descripción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div>
            <span style={{
              display: 'inline-block',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--accent-light)',
              fontSize: '12px',
              padding: '2px 10px',
              borderRadius: '20px',
              marginBottom: '8px',
            }}>
              {asset.category}
            </span>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              wordBreak: 'break-word',
            }}>
              {asset.name}
            </h1>
          </div>

          {asset.description && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                wordBreak: 'break-word',
              }}>
                {asset.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}