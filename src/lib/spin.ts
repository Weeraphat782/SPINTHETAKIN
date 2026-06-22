import * as THREE from 'three'
import gsap from 'gsap'

/**
 * 3D wheel uses the same top-pointer math as 2D (CircleGeometry, rotation.z).
 * Offset is applied via WHEEL_TEXTURE_ROTATION on the mesh material if needed.
 */
export const WHEEL_3D_ANGLE_OFFSET = 0
export const WHEEL_2D_ANGLE_OFFSET = 0

export function resolveSegmentIndex(
  prizes: { id: string }[],
  prizeId: string,
  fallbackIndex: number
): number {
  const index = prizes.findIndex((p) => p.id === prizeId)
  if (index < 0) {
    if (import.meta.env.DEV) {
      console.warn('Segment mismatch: prizeId not found in prizes array', { prizeId, fallbackIndex })
    }
    return fallbackIndex
  }
  return index
}

export function calcTargetAngle(
  segmentIndex: number,
  totalSegments: number,
  currentAngle: number,
  angleOffset = 0
): number {
  const segmentAngle = (Math.PI * 2) / totalSegments
  const fullSpins = (Math.floor(Math.random() * 3) + 4) * Math.PI * 2
  const jitter = (Math.random() - 0.5) * segmentAngle * 0.4
  // Pointer is at 12-o'clock. Segment 0 starts at top. Align segmentIndex under pointer.
  const targetOffset =
    segmentIndex * segmentAngle + segmentAngle / 2 + jitter + angleOffset
  const target = currentAngle + fullSpins + (Math.PI * 2 - (currentAngle % (Math.PI * 2))) - targetOffset
  return target
}

export function animateSpin(
  meshRef: THREE.Object3D,
  targetAngle: number,
  durationMs: number,
  onComplete: () => void
): void {
  gsap.to(meshRef.rotation, {
    y: targetAngle,
    duration: durationMs / 1000,
    ease: 'power3.out',
    onComplete,
  })
}

// 2D canvas fallback: draw the wheel
export function draw2DWheel(
  canvas: HTMLCanvasElement,
  prizes: { name: string; color: string }[],
  rotation: number
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(cx, cy) - 10
  const n = prizes.length
  const arc = (Math.PI * 2) / n

  ctx.clearRect(0, 0, width, height)

  prizes.forEach((p, i) => {
    const start = rotation - Math.PI / 2 + i * arc
    const end = start + arc

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, start, end)
    ctx.closePath()
    ctx.fillStyle = p.color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(start + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.max(10, r / 8)}px Georgia`
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 3
    ctx.fillText(p.name, r - 12, 5)
    ctx.restore()
  })

  // Hub
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2)
  ctx.fillStyle = '#C9A84C'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  ctx.stroke()
}

// Easing for 2D fallback
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
