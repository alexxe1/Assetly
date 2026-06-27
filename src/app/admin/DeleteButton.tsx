'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ assetId }: { assetId: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Seguro que querés eliminar este asset?')) return
    await supabase.from('assets').delete().eq('id', assetId)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: '6px 14px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '6px',
        color: 'var(--danger)',
        fontSize: '13px',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
    >
      Eliminar
    </button>
  )
}