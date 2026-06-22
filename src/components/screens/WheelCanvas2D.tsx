import { useRef, useEffect, useState, useCallback } from 'react'
import type { PublicPrize, SpinResult } from '../../lib/supabase'
import { spin as apiSpin } from '../../lib/api'
import {
  draw2DWheel,
  easeOutCubic,
  calcTargetAngle,
  resolveSegmentIndex,
  WHEEL_2D_ANGLE_OFFSET,
} from '../../lib/spin'

type Props = {
  prizes: PublicPrize[]
  sessionToken: string
  spinDurationMs: number
  onSpinComplete: (result: SpinResult) => void
  onAlreadyPlayed: () => void
  playSpin: () => void
  playWin: (isNoPrize?: boolean) => void
}

export default function WheelCanvas2D({
  prizes,
  sessionToken,
  spinDurationMs,
  onSpinComplete,
  onAlreadyPlayed,
  playSpin,
  playWin,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const rafRef = useRef<number>(0)
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    draw2DWheel(canvas, prizes, rotationRef.current)
  }, [prizes])

  const handleTap = useCallback(async () => {
    if (spinning || hasSpun) return
    setSpinning(true)
    setHasSpun(true)
    playSpin()

    try {
      const result = await apiSpin(sessionToken)
      if ('alreadyPlayed' in result) { onAlreadyPlayed(); return }

      const canvas = canvasRef.current
      if (!canvas) { onSpinComplete(result); return }

      const segmentIndex = resolveSegmentIndex(prizes, result.prizeId, result.segmentIndex)
      const target = calcTargetAngle(
        segmentIndex,
        prizes.length,
        rotationRef.current,
        WHEEL_2D_ANGLE_OFFSET
      )

      const start = performance.now()
      const startAngle = rotationRef.current

      function animate(now: number) {
        const elapsed = now - start
        const t = Math.min(elapsed / spinDurationMs, 1)
        rotationRef.current = startAngle + (target - startAngle) * easeOutCubic(t)
        draw2DWheel(canvas!, prizes, rotationRef.current)

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setSpinning(false)
          playWin(result.isNoPrize)
          onSpinComplete(result)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    } catch (err) {
      console.error(err)
      setSpinning(false)
      setHasSpun(false)
    }
  }, [spinning, hasSpun, prizes, sessionToken, spinDurationMs, playSpin, playWin, onSpinComplete, onAlreadyPlayed])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: -Math.min(window.innerWidth, window.innerHeight) * 0.37 }}>
        <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '28px solid #E07B39' }} />
      </div>

      <canvas
        ref={canvasRef}
        className="w-80 h-80 cursor-pointer"
        onClick={handleTap}
      />

      <div className="mt-6 text-center">
        {!hasSpun && (
          <button onClick={handleTap} className="btn-gold">Tap to Spin!</button>
        )}
        {spinning && <p style={{ color: '#C9A84C' }}>Spinning...</p>}
      </div>
    </div>
  )
}
