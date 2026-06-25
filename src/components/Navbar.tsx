'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser(userId: string) {
      setIsLoggedIn(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, username')
        .eq('id', userId)
        .single()
      setIsAdmin(profile?.is_admin ?? false)
      setUsername(profile?.username ?? '')
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user.id)
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setUsername('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <nav>
      <a href="/dashboard">Assetly</a>
      <div>
        {isLoggedIn ? (
          <>
            <a href="/upload">Subir</a>
            <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button onClick={() => setMenuOpen(o => !o)}>
                {username} ▾
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, background: 'white', border: '1px solid #ccc', padding: '8px', zIndex: 100 }}>
                  {isAdmin && (
                    <a href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block' }}>
                      Panel de Admin
                    </a>
                  )}
                  <button onClick={handleLogout} style={{ display: 'block' }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/login">Iniciar sesión</a>
            <a href="/register">Registrarse</a>
          </>
        )}
      </div>
    </nav>
  )
}