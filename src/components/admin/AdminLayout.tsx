import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TABS = [
  { to: '/admin/prizes',   label: '🏆 Prizes' },
  { to: '/admin/players',  label: '📋 Players' },
  { to: '/admin/branding', label: '🎨 Branding' },
  { to: '/admin/settings', label: '⚙️ Settings' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8E7', color: '#2C1810' }}>
      {/* Top bar — deep red Bhutanese temple style */}
      <header
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)',
          boxShadow: '0 2px 12px rgba(139,26,26,0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦬</span>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Spin the Takin</h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,248,231,0.6)' }}>Admin Panel</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-4 py-2 rounded-full font-semibold transition-all hover:bg-white/20"
          style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#FFF8E7' }}
        >
          Sign Out
        </button>
      </header>

      {/* Nav tabs */}
      <nav
        className="flex border-b overflow-x-auto"
        style={{ background: '#FFF3CD', borderColor: 'rgba(212,148,10,0.3)' }}
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors"
            style={({ isActive }) => ({
              color:        isActive ? '#B22222' : '#5D3A1A',
              borderBottom: isActive ? '3px solid #B22222' : '3px solid transparent',
              background:   isActive ? 'rgba(178,34,34,0.06)' : 'transparent',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
