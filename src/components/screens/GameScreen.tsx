import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import type { GameConfig, SpinResult } from '../../lib/supabase'
import WheelScene from '../three/WheelScene'
import WheelCanvas2D from './WheelCanvas2D'

type Props = {
  config: GameConfig
  sessionToken: string
  onSpinComplete: (result: SpinResult) => void
  onAlreadyPlayed: () => void
  playSpin: () => void
  playWin: () => void
}

export default function GameScreen({
  config,
  sessionToken,
  onSpinComplete,
  onAlreadyPlayed,
  playSpin,
  playWin,
}: Props) {
  const [use2D, setUse2D] = useState(false)

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundImage: 'url(/assets/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundColor: '#87CEEB',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo + Banner — proportional rows (64:300 design ratio) */}
      <div
        className="flex-shrink-0 grid w-full min-h-0"
        style={{
          gridTemplateRows: config.logoUrl ? '64fr 300fr' : '1fr',
          maxHeight: config.logoUrl ? 'clamp(96px, 32svh, 364px)' : 'clamp(72px, 22svh, 300px)',
          paddingTop: 'clamp(6px, 1svh, 12px)',
          gap: 'clamp(2px, 0.5svh, 6px)',
        }}
      >
        {config.logoUrl && (
          <div className="min-h-0 flex items-center justify-center">
            <img
              src={config.logoUrl}
              alt="Logo"
              className="max-h-full max-w-full object-contain"
              style={{
                mixBlendMode: 'multiply',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
              }}
            />
          </div>
        )}
        <div className="min-h-0 flex items-center justify-center">
          <img
            src="/assets/Banner.png"
            alt="Spin the Takin"
            className="max-h-full max-w-full object-contain"
            style={{
              maxWidth: 'min(92vw, 380px)',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.3))',
            }}
          />
        </div>
      </div>

      {/* 3D Scene — fills remaining space */}
      <div className="flex-1 relative min-h-0">
        {use2D ? (
          <WheelCanvas2D
            prizes={config.prizes}
            sessionToken={sessionToken}
            spinDurationMs={config.spinDurationMs}
            onSpinComplete={onSpinComplete}
            onAlreadyPlayed={onAlreadyPlayed}
            playSpin={playSpin}
            playWin={playWin}
          />
        ) : (
          <Suspense fallback={<Loading />}>
            <ErrorBoundary onError={() => setUse2D(true)}>
              <WheelScene
                prizes={config.prizes}
                sessionToken={sessionToken}
                spinDurationMs={config.spinDurationMs}
                onSpinComplete={onSpinComplete}
                onAlreadyPlayed={onAlreadyPlayed}
                playSpin={playSpin}
                playWin={playWin}
              />
            </ErrorBoundary>
          </Suspense>
        )}
      </div>
    </motion.div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <p style={{ color: '#B22222' }} className="font-bold tracking-widest">Loading…</p>
    </div>
  )
}

import React from 'react'
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() { this.props.onError() }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
