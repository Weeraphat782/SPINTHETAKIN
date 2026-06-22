import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { GameConfig } from '../../lib/supabase'
import { createSession } from '../../lib/api'

/** Original design heights — rows share space in this ratio on every screen size */
const LOGO_FR = 15
const BANNER_FR = 30
const TAKIN_FR = 22

type Props = {
  config: GameConfig
  deviceId: string
  onStart: (sessionToken: string, nickname: string, company: string) => void
  onAlreadyPlayed: () => void
  startMusic: () => void
}

export default function LandingScreen({ config, deviceId, onStart, onAlreadyPlayed, startMusic }: Props) {
  const [nickname, setNickname] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const musicStartedRef = useRef(false)

  function tryStartMusic() {
    if (musicStartedRef.current) return
    musicStartedRef.current = true
    startMusic()
  }

  function handleNicknameFocus() {
    tryStartMusic()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim() || !company.trim()) { setError('Please fill in both fields.'); return }
    setError('')
    setLoading(true)
    tryStartMusic()
    try {
      const result = await createSession(nickname.trim(), company.trim(), deviceId)
      if ('alreadyPlayed' in result) onAlreadyPlayed()
      else onStart(result.sessionToken, nickname.trim(), company.trim())
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundColor: '#87CEEB',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)', zIndex: 0 }}
      />

      <motion.div
        className="relative flex-1 min-h-0 w-full max-w-sm mx-auto px-5 grid"
        style={{
          zIndex: 1,
          gridTemplateRows: `${LOGO_FR}fr ${BANNER_FR}fr ${TAKIN_FR}fr auto`,
          paddingTop: 'clamp(4px, 1svh, 12px)',
          paddingBottom: 'clamp(8px, 2svh, 24px)',
          gap: 'clamp(2px, 0.6svh, 8px)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo — 15 parts of hero height */}
        <div className="min-h-0 w-full flex items-center justify-center">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt="Logo"
              className="max-h-full max-w-full object-contain drop-shadow-md"
              style={{ mixBlendMode: 'multiply' }}
            />
          ) : (
            <div
              className="flex items-center gap-2 px-5 py-2 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(212,148,10,0.6)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            >
              <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#B22222' }}>OMG</span>
              <span style={{ color: 'rgba(44,24,16,0.3)' }}>|</span>
              <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#2C1810' }}>Bhutan Airlines</span>
            </div>
          )}
        </div>

        {/* Banner — 30 parts of hero height */}
        <div className="min-h-0 w-full flex items-center justify-center">
          <img
            src="/assets/Banner.png"
            alt="Spin the Takin"
            className="max-h-full max-w-full object-contain"
            style={{ filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.4))' }}
          />
        </div>

        {/* Takin — 22 parts of hero height (same scale system as logo & banner) */}
        <div className="min-h-0 w-full flex items-center justify-center">
          <img
            src="/assets/Takin.png"
            alt="Takin"
            draggable={false}
            className="max-h-full max-w-full object-contain animate-breathe"
            style={{
              filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.45))',
              userSelect: 'none',
            }}
          />
        </div>

        {/* Form — natural height, not part of image ratio */}
        <div
          className="w-full rounded-2xl px-5"
          style={{
            paddingTop: 'clamp(10px, 1.5svh, 20px)',
            paddingBottom: 'clamp(10px, 1.5svh, 20px)',
            background: 'rgba(255,255,255,0.88)',
            border: '1.5px solid rgba(212,148,10,0.35)',
            boxShadow: '0 8px 32px rgba(44,24,16,0.18)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 'clamp(8px, 1.5svh, 12px)' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#5D3A1A' }}>
                Nickname *
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 40))}
                onFocus={handleNicknameFocus}
                onClick={handleNicknameFocus}
                placeholder="Your name"
                maxLength={40}
                required
                className="field-light"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#5D3A1A' }}>
                Company *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, 40))}
                onFocus={handleNicknameFocus}
                placeholder="Your company"
                maxLength={40}
                required
                className="field-light"
              />
            </div>

            {error && <p className="text-sm text-center" style={{ color: '#B22222' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold mt-1 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting…' : 'Start Game'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
