'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteAssetButton({ assetId }: { assetId: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Seguro que querés eliminar este asset?')) return
    await supabase.from('assets').delete().eq('id', assetId)
    router.push('/')
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        width: '100%',
        padding: '11px',
        background: 'rgba(239,68,68,0.1)',
        color: 'var(--danger)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer',
        marginTop: '-6px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
    >
      Eliminar asset
    </button>
  )
}