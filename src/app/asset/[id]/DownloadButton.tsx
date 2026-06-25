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
    <button onClick={handleDownload}>
      Descargar (.{format})
    </button>
  )
}