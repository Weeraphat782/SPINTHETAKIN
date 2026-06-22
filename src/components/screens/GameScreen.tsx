import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import type { GameConfig, SpinResult } from '../../lib/supabase'
import WheelScene from '../three/WheelScene'
import WheelCanvas2D from './WheelCanvas2D'
import {
  playerRootStyle,
  scaled,
  GAME_LOGO_H,
  GAME_BANNER_H,
  GAME_HEADER_GAP,
  GAME_PAD_TOP,
} from '../../lib/playerLayout'

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
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundColor: '#87CEEB',
        ...playerRootStyle(),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="flex-shrink-0 flex flex-col items-center w-full"
        style={{ paddingTop: scaled(GAME_PAD_TOP), gap: scaled(GAME_HEADER_GAP) }}
      >
        {config.logoUrl && (
          <img
            src={config.logoUrl}
            alt="Logo"
            className="object-contain"
            style={{
              height: scaled(GAME_LOGO_H),
              width: 'auto',
              maxWidth: '100%',
              mixBlendMode: 'multiply',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
            }}
          />
        )}
        <img
          src="/assets/Banner.png"
          alt="Spin the Takin"
          className="object-contain w-full"
          style={{
            height: scaled(GAME_BANNER_H),
            maxWidth: scaled(380),
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.3))',
          }}
        />
      </div>

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
