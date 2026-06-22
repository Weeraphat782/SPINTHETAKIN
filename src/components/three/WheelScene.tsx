import { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import WheelMesh, { type WheelMeshHandle } from './WheelMesh'
import Pointer from './Pointer'
import type { PublicPrize, SpinResult } from '../../lib/supabase'
import { spin as apiSpin } from '../../lib/api'
import { calcTargetAngle, resolveSegmentIndex, WHEEL_3D_ANGLE_OFFSET } from '../../lib/spin'
import SpinningTakin from '../ui/SpinningTakin'

type Props = {
  prizes: PublicPrize[]
  sessionToken: string
  spinDurationMs: number
  onSpinComplete: (result: SpinResult) => void
  onAlreadyPlayed: () => void
  playSpin: () => void
  playWin: () => void
}

function ResponsiveCamera() {
  const { camera, viewport } = useThree()
  useEffect(() => {
    const aspect = viewport.width / viewport.height
    const fov = aspect < 0.65 ? 62 : aspect < 0.85 ? 58 : 52
    ;(camera as THREE.PerspectiveCamera).fov = fov
    camera.updateProjectionMatrix()
  }, [camera, viewport.width, viewport.height])
  return null
}

export default function WheelScene({
  prizes,
  sessionToken,
  spinDurationMs,
  onSpinComplete,
  onAlreadyPlayed,
  playSpin,
  playWin,
}: Props) {
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const wheelRef = useRef<WheelMeshHandle>(null)
  const currentAngleRef = useRef(0)

  const handleTap = useCallback(async () => {
    if (spinning || hasSpun) return
    setSpinning(true)
    setHasSpun(true)
    playSpin()

    try {
      const result = await apiSpin(sessionToken)

      if ('alreadyPlayed' in result) {
        onAlreadyPlayed()
        return
      }

      const mesh = wheelRef.current?.mesh
      if (!mesh) {
        onSpinComplete(result)
        return
      }

      const segmentIndex = resolveSegmentIndex(prizes, result.prizeId, result.segmentIndex)

      const target = calcTargetAngle(
        segmentIndex,
        prizes.length,
        currentAngleRef.current,
        WHEEL_3D_ANGLE_OFFSET
      )

      // rotation.z is CCW; calcTargetAngle matches 2D CW — negate to align with pointer at 12 o'clock
      gsap.to(mesh.rotation, {
        z: -target,
        duration: spinDurationMs / 1000,
        ease: 'power3.out',
        onUpdate: () => {
          currentAngleRef.current = -mesh.rotation.z
        },
        onComplete: () => {
          setSpinning(false)
          playWin()
          onSpinComplete(result)
        },
      })
    } catch (err) {
      console.error('Spin error:', err)
      setSpinning(false)
      setHasSpun(false)
    }
  }, [spinning, hasSpun, sessionToken, prizes.length, spinDurationMs, playSpin, playWin, onSpinComplete, onAlreadyPlayed])

  return (
    <div className="w-full h-full relative overflow-hidden">


      {/* Transparent 3D canvas — only the wheel + pointer */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 58 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', position: 'absolute', inset: 0 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(devicePixelRatio, 2))
          gl.setClearColor(0x000000, 0)
        }}
      >
        <ResponsiveCamera />
        <ambientLight intensity={1.4} />
        <directionalLight position={[0, 0, 10]} intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} />
        <pointLight position={[-3, 4, 2]} intensity={0.3} color="#FFF8E7" />

        <Suspense fallback={null}>
          <group position={[0, 2.0, 0]}>
            <WheelMesh ref={wheelRef} prizes={prizes} spinning={spinning} />
            <Pointer />
          </group>
        </Suspense>
      </Canvas>

      <SpinningTakin
        spinning={spinning}
        hasSpun={hasSpun}
        onClick={handleTap}
      />

      {/* Instruction text */}
      {!hasSpun && !spinning && (
        <div
          style={{
            position: 'absolute',
            bottom: '2%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 999,
              background: 'rgba(255,248,231,0.92)',
              border: '2px solid #D4940A',
              color: '#B22222',
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 4px 16px rgba(212,148,10,0.3)',
              animation: 'pulse-gold 2s ease-in-out infinite',
            }}
          >
            Tap the Takin to Spin!
          </div>
        </div>
      )}

      {spinning && (
        <div
          style={{
            position: 'absolute',
            bottom: '2%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 999,
              background: 'rgba(255,248,231,0.92)',
              border: '2px solid #D4940A',
              color: '#B22222',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Spinning...
          </div>
        </div>
      )}
    </div>
  )
}

