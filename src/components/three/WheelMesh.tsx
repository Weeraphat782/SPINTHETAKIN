import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { PublicPrize } from '../../lib/supabase'

type Props = {
  prizes: PublicPrize[]
  spinning: boolean
}

export type WheelMeshHandle = {
  mesh: THREE.Group | null
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function buildWheelTexture(prizes: PublicPrize[], size = 1024): Promise<THREE.CanvasTexture> {
  const images = await Promise.all(
    prizes.map(p => (p.image_url ? loadImage(p.image_url) : Promise.resolve(null)))
  )
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2, cy = size / 2
  const r = size / 2 - 4
  const n = prizes.length
  const arc = (Math.PI * 2) / n

  prizes.forEach((p, i) => {
    const start = -Math.PI / 2 + i * arc
    const end = start + arc
    const mid = start + arc / 2

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, start, end)
    ctx.closePath()
    ctx.fillStyle = p.color || '#C9A84C'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 4
    ctx.stroke()

    const img = images[i]
    const imgR = r * 0.46
    const imgHalf = size * 0.085
    if (img) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(mid)
      ctx.beginPath()
      ctx.arc(imgR, 0, imgHalf, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, imgR - imgHalf, -imgHalf, imgHalf * 2, imgHalf * 2)
      ctx.restore()
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(mid)
      ctx.beginPath()
      ctx.arc(imgR, 0, imgHalf + 2, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()
    }

    const fontSize = Math.max(16, Math.floor(220 / n))
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = 6

    const textR = img ? r * 0.80 : r * 0.68
    const maxArcLen = textR * arc * 0.80
    let label = p.name
    while (label.length > 1 && ctx.measureText(label).width > maxArcLen) {
      label = label.slice(0, -1)
    }
    if (label.length < p.name.length) label = label.slice(0, -1) + '…'

    const chars = [...label]
    const charWidths = chars.map(c => ctx.measureText(c).width)
    const totalWidth = charWidths.reduce((a, b) => a + b, 0)
    const totalAngleSpan = totalWidth / textR
    let charAngle = mid - totalAngleSpan / 2

    chars.forEach((char, ci) => {
      const a = charAngle + charWidths[ci] / (2 * textR)
      ctx.save()
      ctx.translate(
        cx + textR * Math.cos(a),
        cy + textR * Math.sin(a),
      )
      ctx.rotate(a + Math.PI / 2)
      ctx.fillText(char, 0, 0)
      ctx.restore()
      charAngle += charWidths[ci] / textR
    })
  })

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = '#D4940A'
  ctx.lineWidth = 14
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, r - 18, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(212,148,10,0.3)'
  ctx.lineWidth = 4
  ctx.stroke()

  const hubR = r * 0.1
  ctx.beginPath()
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2)
  const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR)
  hg.addColorStop(0, '#fffde7')
  hg.addColorStop(0.7, '#F4A636')
  hg.addColorStop(1, '#B22222')
  ctx.fillStyle = hg
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.center.set(0.5, 0.5)
  return tex
}

const WheelMesh = forwardRef<WheelMeshHandle, Props>(({ prizes, spinning }, ref) => {
  const spinGroupRef = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useImperativeHandle(ref, () => ({ mesh: spinGroupRef.current }))

  useEffect(() => {
    if (prizes.length === 0) return
    let cancelled = false
    buildWheelTexture(prizes).then(tex => {
      if (!cancelled) setTexture(prev => { prev?.dispose(); return tex })
    })
    return () => { cancelled = true }
  }, [prizes])

  useFrame(({ clock }) => {
    if (!spinGroupRef.current || spinning) return
    spinGroupRef.current.rotation.z -= Math.sin(clock.getElapsedTime() * 0.3) * 0.0003
  })

  if (!texture) return null

  return (
    <group ref={spinGroupRef}>
      {/* Flat disc facing the camera — segment 0 at 12 o'clock when rotation.z = 0 */}
      <mesh receiveShadow castShadow>
        <circleGeometry args={[2.4, 80]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.0} side={THREE.DoubleSide} />
      </mesh>

      <mesh>
        <ringGeometry args={[2.31, 2.49, 80]} />
        <meshStandardMaterial color="#D4940A" metalness={0.88} roughness={0.12} side={THREE.DoubleSide} />
      </mesh>

      <mesh>
        <ringGeometry args={[2.29, 2.35, 60]} />
        <meshStandardMaterial color="#F4C430" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      <mesh>
        <ringGeometry args={[0.165, 0.275, 32]} />
        <meshStandardMaterial color="#D4940A" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
})

WheelMesh.displayName = 'WheelMesh'
export default WheelMesh
