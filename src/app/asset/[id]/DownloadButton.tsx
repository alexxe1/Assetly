'use client'

import { createClient } from '@/lib/supabase/client'

export default function DownloadButton({ assetId, fileUrl, format }: {
  assetId: string
  fileUrl: string
  format: string
}) {
  const supabase = createClient()

  async function handleDownload() {
    await supabase.rpc('increment_download', { asset_id: assetId })
    window.open(fileUrl, '_blank')
  }

  return (
    <button
      onClick={handleDownload}
      style={{
        width: '100%',
        padding: '12px',
        background: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer',
        marginTop: '8px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
    >
      Descargar (.{format})
    </button>
  )
}