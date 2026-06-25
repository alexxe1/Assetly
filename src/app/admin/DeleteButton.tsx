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
    <button onClick={handleDelete}>
      Eliminar
    </button>
  )
}