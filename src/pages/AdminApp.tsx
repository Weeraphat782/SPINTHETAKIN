import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/admin/AdminLayout'
import PrizesTab from '../components/admin/PrizesTab'
import PlayersTab from '../components/admin/PlayersTab'
import BrandingTab from '../components/admin/BrandingTab'
import SettingsTab from '../components/admin/SettingsTab'

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center w-full h-full" style={{ background: '#0d1520' }}>
        <p style={{ color: '#C9A84C' }}>Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin />
  }

  return (
    <div className="w-full" style={{ minHeight: '100vh' }}>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/prizes" replace />} />
          <Route path="/prizes" element={<PrizesTab />} />
          <Route path="/players" element={<PlayersTab />} />
          <Route path="/branding" element={<BrandingTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </AdminLayout>
    </div>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #87CEEB 0%, #FFF3CD 50%, #E8C97A 100%)' }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 8px 40px rgba(44,24,16,0.15)' }}
      >
        {/* Header strip */}
        <div
          className="py-6 text-center"
          style={{ background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)' }}
        >
          <span className="text-5xl">🦬</span>
          <h1 className="text-xl font-bold mt-2 text-white tracking-wide">Admin Login</h1>
          <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,248,231,0.6)' }}>
            Spin the Takin
          </p>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4" style={{ background: '#FFF8E7' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field-light"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="field-light"
          />
          {error && <p className="text-sm" style={{ color: '#B22222' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold mt-1">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
