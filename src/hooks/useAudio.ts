import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

// Background music uses native HTML5 Audio — no AudioContext, no autoUnlock conflicts
// SFX use Howl but are lazy-created only after a user gesture has already occurred

export function useAudio(musicUrl: string | null, defaultOn: boolean) {
  const [muted, setMuted] = useState(!defaultOn)
  const bgRef = useRef<HTMLAudioElement | null>(null)
  const sfxSpinRef = useRef<Howl | null>(null)
  const sfxWinRef = useRef<Howl | null>(null)

  // Sync mute state when config loads (PlayerApp mounts before config is available)
  useEffect(() => {
    setMuted(!defaultOn)
  }, [defaultOn])

  // Tear down old audio element when musicUrl changes
  useEffect(() => {
    return () => {
      bgRef.current?.pause()
      bgRef.current = null
    }
  }, [musicUrl])

  function getOrCreateBg(): HTMLAudioElement | null {
    if (!musicUrl) return null
    if (!bgRef.current) {
      const audio = new Audio(musicUrl)
      audio.loop = true
      bgRef.current = audio
    }
    return bgRef.current
  }

  /** User gesture (e.g. nickname focus) — unmute and play audibly */
  function startMusic() {
    const audio = getOrCreateBg()
    if (!audio) return
    setMuted(false)
    audio.volume = 0.4
    audio.play().catch(() => {/* browser blocked */})
  }

  function playSpin() {
    if (muted) return
    if (!sfxSpinRef.current) {
      sfxSpinRef.current = new Howl({ src: ['/assets/sfx-spin.mp3'], volume: 0.6 })
    }
    sfxSpinRef.current.play()
  }

  function playWin() {
    if (muted) return
    if (!sfxWinRef.current) {
      sfxWinRef.current = new Howl({ src: ['/assets/sfx-win.mp3'], volume: 0.8 })
    }
    sfxWinRef.current.play()
  }

  function toggleMute() {
    setMuted(prev => {
      const next = !prev
      const audio = getOrCreateBg()
      if (audio) {
        audio.volume = next ? 0 : 0.4
        // If unmuting and audio is paused, start it (user is performing a gesture right now)
        if (!next && audio.paused) {
          audio.play().catch(() => {})
        }
      }
      return next
    })
  }

  return { muted, toggleMute, startMusic, playSpin, playWin }
}
