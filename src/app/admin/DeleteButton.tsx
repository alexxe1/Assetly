'use client'

import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ assetId, onDelete }: { assetId: string, onDelete: () => void }) {
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('¿Seguro que querés eliminar este asset?')) return
    await supabase.from('assets').delete().eq('id', assetId)
    onDelete()
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