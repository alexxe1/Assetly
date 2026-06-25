'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav>
      <a href="/dashboard">Assetly</a>
      <div>
        <a href="/upload">Subir asset</a>
        <a href="/admin">Admin</a>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </nav>
  )
}