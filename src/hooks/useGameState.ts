import { useState } from 'react'
import type { SpinResult } from '../lib/supabase'

export type GameScreen = 'landing' | 'game' | 'winner' | 'already-played'

export type GameState = {
  screen: GameScreen
  sessionToken: string | null
  spinResult: SpinResult | null
  nickname: string
  company: string
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    screen: 'landing',
    sessionToken: null,
    spinResult: null,
    nickname: '',
    company: '',
  })

  function goToGame(sessionToken: string, nickname: string, company: string) {
    setState((s) => ({ ...s, screen: 'game', sessionToken, nickname, company }))
  }

  function goToAlreadyPlayed() {
    setState((s) => ({ ...s, screen: 'already-played' }))
  }

  function goToWinner(result: SpinResult) {
    setState((s) => ({ ...s, screen: 'winner', spinResult: result }))
  }

  function reset() {
    setState({
      screen: 'landing',
      sessionToken: null,
      spinResult: null,
      nickname: '',
      company: '',
    })
  }

  return { state, goToGame, goToAlreadyPlayed, goToWinner, reset }
}
