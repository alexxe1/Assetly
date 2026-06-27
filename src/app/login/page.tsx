'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

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

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  async function handleLogin() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/')
  }

  return (
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
        Iniciá sesión
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 28px' }}>
        Bienvenido de vuelta a Assetly
      </p>

      {justRegistered && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '6px',
          color: 'var(--success)',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          Si el email es válido y no está registrado, recibirás un correo de confirmación.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
          onClick={handleLogin}
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
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          ¿No tenés cuenta?{' '}
          <a href="/register" style={{ color: 'var(--accent-light)' }}>
            Registrate
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}