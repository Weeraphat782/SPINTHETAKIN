import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

// Background music uses native HTML5 Audio — no AudioContext, no autoUnlock conflicts
// SFX use Howl but are lazy-created only after a user gesture has already occurred

export function useAudio(musicUrl: string | null, defaultOn: boolean) {
  const [muted, setMuted] = useState(!defaultOn)
  const mutedRef = useRef(!defaultOn)
  const bgRef = useRef<HTMLAudioElement | null>(null)
  const sfxSpinRef = useRef<Howl | null>(null)
  const sfxWinRef = useRef<Howl | null>(null)
  const sfxLoseRef = useRef<Howl | null>(null)

  function applyMuteState(isMuted: boolean) {
    mutedRef.current = isMuted
    const audio = getOrCreateBg()
    if (audio) {
      audio.muted = isMuted
      if (!isMuted) {
        audio.volume = 0.4
        if (audio.paused) {
          audio.play().catch(() => {/* browser blocked */})
        }
      }
    }
    sfxSpinRef.current?.mute(isMuted)
    sfxWinRef.current?.mute(isMuted)
    sfxLoseRef.current?.mute(isMuted)
  }

  // Sync mute state when config loads (PlayerApp mounts before config is available)
  useEffect(() => {
    const isMuted = !defaultOn
    setMuted(isMuted)
    applyMuteState(isMuted)
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
      audio.preload = 'auto'
      audio.setAttribute('playsinline', '')
      audio.setAttribute('webkit-playsinline', '')
      audio.muted = mutedRef.current
      audio.volume = 0.4
      bgRef.current = audio
    }
    return bgRef.current
  }

  /** User gesture (e.g. nickname focus) — unmute and play audibly */
  function startMusic() {
    setMuted(false)
    applyMuteState(false)
  }

  function playSpin() {
    if (mutedRef.current) return
    if (!sfxSpinRef.current) {
      sfxSpinRef.current = new Howl({ src: ['/assets/sfx-spin.mp3'], volume: 0.6 })
      sfxSpinRef.current.mute(mutedRef.current)
    }
    sfxSpinRef.current.play()
  }

  function playWin(isNoPrize = false) {
    if (mutedRef.current) return
    if (isNoPrize) {
      if (!sfxLoseRef.current) {
        sfxLoseRef.current = new Howl({ src: ['/assets/sfx-lose.mp3'], volume: 0.8 })
        sfxLoseRef.current.mute(mutedRef.current)
      }
      sfxLoseRef.current.play()
    } else {
      if (!sfxWinRef.current) {
        sfxWinRef.current = new Howl({ src: ['/assets/sfx-win.mp3'], volume: 0.8 })
        sfxWinRef.current.mute(mutedRef.current)
      }
      sfxWinRef.current.play()
    }
  }

  /** Must be called directly from a user gesture (tap/click) for iOS */
  function toggleMute() {
    const next = !mutedRef.current
    setMuted(next)
    applyMuteState(next)
  }

  return { muted, toggleMute, startMusic, playSpin, playWin }
}
