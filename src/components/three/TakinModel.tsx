import { useRef, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

useGLTF.preload('/assets/takin.glb')

// Takin color palette — applied when the GLB has no textures
const TAKIN_MATERIALS: THREE.MeshStandardMaterial[] = [
  new THREE.MeshStandardMaterial({ color: '#8B6520', roughness: 0.85, metalness: 0.05 }), // body — golden brown
  new THREE.MeshStandardMaterial({ color: '#6B4C14', roughness: 0.9,  metalness: 0.0  }), // legs / darker parts
  new THREE.MeshStandardMaterial({ color: '#A07828', roughness: 0.8,  metalness: 0.05 }), // face / lighter fur
  new THREE.MeshStandardMaterial({ color: '#D4B87A', roughness: 0.6,  metalness: 0.1  }), // horns
  new THREE.MeshStandardMaterial({ color: '#1A0A00', roughness: 0.95, metalness: 0.0  }), // eyes / nose
]

function applyTakinColors(scene: THREE.Group) {
  let meshIndex = 0
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mat = Array.isArray(child.material) ? child.material[0] : child.material
    const hasTexture = mat && (mat as THREE.MeshStandardMaterial).map
    if (!hasTexture) {
      // Assign a color based on mesh order — cycles through the palette
      child.material = TAKIN_MATERIALS[meshIndex % TAKIN_MATERIALS.length]
    }
    child.castShadow = true
    meshIndex++
  })
}

type Props = {
  onTap: () => void
  disabled: boolean
}

function TakinGLB({ onTap, disabled }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const t = useRef(0)
  const { scene } = useGLTF('/assets/takin.glb')

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    applyTakinColors(c)
    return c
  }, [scene])

  useFrame((_, delta) => {
    t.current += delta
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t.current * 1.4) * 0.06
    }
  })

  function handleClick(e: { stopPropagation: () => void }) {
    e.stopPropagation()
    if (!disabled) onTap()
  }

  return (
    <group
      ref={groupRef}
      position={[0, -0.2, 0.5]}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      {/* Large invisible tap sphere */}
      <mesh visible={false}>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Use cloned scene with colors applied */}
      <primitive
        object={cloned}
        scale={[0.5, 0.5, 0.5]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Gold glow ring when tappable */}
      {!disabled && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <torusGeometry args={[0.55, 0.03, 8, 32]} />
          <meshStandardMaterial
            color="#F4A636"
            emissive="#F4A636"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  )
}

function TakinPrimitive({ onTap, disabled }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (groupRef.current) groupRef.current.position.y = Math.sin(t.current * 1.4) * 0.06
  })

  function handleClick(e: { stopPropagation: () => void }) {
    e.stopPropagation()
    if (!disabled) onTap()
  }

  return (
    <group ref={groupRef} position={[0, -0.2, 0.5]} onClick={handleClick} onPointerDown={handleClick}>
      <mesh visible={false}><sphereGeometry args={[1.0, 8, 8]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      <mesh position={[0, 0.18, 0]} castShadow><boxGeometry args={[0.55, 0.35, 0.75]} /><meshStandardMaterial color="#8B6914" roughness={0.8} /></mesh>
      <mesh position={[0, 0.46, 0.3]} castShadow><boxGeometry args={[0.35, 0.3, 0.35]} /><meshStandardMaterial color="#7a5c10" roughness={0.8} /></mesh>
      {!disabled && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <torusGeometry args={[0.55, 0.03, 8, 32]} />
          <meshStandardMaterial color="#F4A636" emissive="#F4A636" emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  )
}

export default function TakinModel({ onTap, disabled }: Props) {
  return (
    <Suspense fallback={<TakinPrimitive onTap={onTap} disabled={disabled} />}>
      <TakinGLB onTap={onTap} disabled={disabled} />
    </Suspense>
  )
}
