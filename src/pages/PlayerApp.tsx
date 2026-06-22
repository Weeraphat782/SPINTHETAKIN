import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { GameConfig } from '../lib/supabase'
import { getConfig } from '../lib/api'
import { useDeviceId } from '../hooks/useDeviceId'
import { useAudio } from '../hooks/useAudio'
import { useGameState } from '../hooks/useGameState'
import LandingScreen from '../components/screens/LandingScreen'
import GameScreen from '../components/screens/GameScreen'
import WinnerScreen from '../components/screens/WinnerScreen'
import AlreadyPlayedScreen from '../components/screens/AlreadyPlayedScreen'
import MuteButton from '../components/ui/MuteButton'
import ViewportScale from '../components/ViewportScale'

export default function PlayerApp() {
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [configError, setConfigError] = useState('')
  const deviceId = useDeviceId()
  const { state, goToGame, goToAlreadyPlayed, goToWinner, reset } = useGameState()

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch(() => setConfigError('Unable to load game. Please refresh.'))
  }, [])

  const { muted, toggleMute, startMusic, playSpin, playWin } = useAudio(
    config?.musicUrl ?? null,
    config?.musicDefaultOn ?? false
  )

  if (configError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-red-400">{configError}</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p style={{ color: '#C9A84C' }}>Loading…</p>
      </div>
    )
  }

  return (
    <ViewportScale>
      <div className="relative w-full h-full overflow-hidden">
        <MuteButton muted={muted} onToggle={toggleMute} />

        <AnimatePresence mode="wait">
        {state.screen === 'landing' && (
          <div key="landing" className="absolute inset-0">
            <LandingScreen
              config={config}
              deviceId={deviceId}
              onStart={goToGame}
              onAlreadyPlayed={goToAlreadyPlayed}
              startMusic={startMusic}
            />
          </div>
        )}

        {state.screen === 'game' && state.sessionToken && (
          <div key="game" className="absolute inset-0">
            <GameScreen
              config={config}
              sessionToken={state.sessionToken}
              onSpinComplete={goToWinner}
              onAlreadyPlayed={goToAlreadyPlayed}
              playSpin={playSpin}
              playWin={playWin}
            />
          </div>
        )}

        {state.screen === 'winner' && state.spinResult && (
          <div key="winner" className="absolute inset-0">
            <WinnerScreen result={state.spinResult} onDone={reset} />
          </div>
        )}

        {state.screen === 'already-played' && (
          <div key="already-played" className="absolute inset-0">
            <AlreadyPlayedScreen />
          </div>
        )}
        </AnimatePresence>
      </div>
    </ViewportScale>
  )
}
