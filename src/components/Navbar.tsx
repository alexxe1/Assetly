'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const supabase = createClient()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        async function loadUser(userId: string) {
            setIsLoggedIn(true)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', userId)
                .single()
            setIsAdmin(profile?.is_admin ?? false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUser(session.user.id)
            } else {
                setIsLoggedIn(false)
                setIsAdmin(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav>
            <a href="/dashboard">Assetly</a>
            <div>
                {isLoggedIn && <a href="/upload">Subir asset</a>}
                {isAdmin && <a href="/admin">Admin</a>}
                {isLoggedIn ? (
                    <button onClick={handleLogout}>Cerrar sesión</button>
                ) : (
                    <a href="/login">Iniciar sesión</a>
                )}
            </div>
        </nav>
    )
}