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
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <a href="/" style={{
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '18px',
        letterSpacing: '-0.3px',
      }}>
        Assetly
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isLoggedIn ? (
          <>
            <a href="/upload" style={{
              background: 'var(--accent)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Subir
            </a>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {username}
                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>▾</span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '4px',
                  minWidth: '160px',
                  zIndex: 100,
                }}>
                  {isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    >
                      Panel de Admin
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/login" style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Iniciar sesión
            </a>
            <a href="/register" style={{
              background: 'var(--accent)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Registrarse
            </a>
          </>
        )}
      </div>
    </nav>
  )
}