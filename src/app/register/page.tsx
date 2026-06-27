'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%',
  padding: '10px 16px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister() {
    setError('')
    if (!username.trim()) { setError('El nombre de usuario es obligatorio'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (error) {
      if (error.message.includes('invalid format') || error.message.includes('email')) {
        setError('El formato del email no es válido')
      } else if (error.message.includes('already registered')) {
        setError('Ya existe una cuenta con ese email')
      } else if (error.message.includes('Password')) {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else {
        setError('Ocurrió un error al crear la cuenta. Intentá de nuevo')
      }
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <main style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
      }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.4px',
        }}>
          Crear cuenta
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 28px' }}>
          Unite a Assetly y empezá a compartir assets
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nombre de usuario</label>
            <input
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{
              color: 'var(--danger)',
              fontSize: '13px',
              margin: 0,
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? 'var(--surface-2)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            ¿Ya tenés cuenta?{' '}
            <a href="/login" style={{ color: 'var(--accent-light)' }}>
              Iniciá sesión
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}