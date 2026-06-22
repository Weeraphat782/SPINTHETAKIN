import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function PrayerFlag({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.1
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[0.22, 0.16]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.95} />
    </mesh>
  )
}

function FlagString({ x }: { x: number }) {
  const flags = ['#E53935','#F4C430','#fff','#1565C0','#2E7D32','#E53935','#F4C430','#fff','#1565C0','#2E7D32']
  return (
    <group>
      <mesh position={[x, 3.2, -4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 5, 4]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {flags.map((color, i) => (
        <PrayerFlag key={i} position={[x - 2.2 + i * 0.5, 2.9 - i * 0.12, -4]} color={color} />
      ))}
    </group>
  )
}

function Cloud({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.position.x += 0.003
    if (ref.current && ref.current.position.x > 12) ref.current.position.x = -12
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[0.5, 0.1, 0]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={1} />
      </mesh>
      <mesh position={[-0.5, 0.05, 0]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#f0f0f0" roughness={1} />
      </mesh>
    </group>
  )
}

export default function BhutanBackground() {
  return (
    <group>
      {/* Bright daytime sky */}
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial color="#5BA4E0" />
      </mesh>

      {/* Horizon glow */}
      <mesh position={[0, -2, -7.5]}>
        <planeGeometry args={[40, 6]} />
        <meshBasicMaterial color="#FFF3CD" transparent opacity={0.5} />
      </mesh>

      {/* Snow-capped mountain peaks */}
      <mesh position={[0, -0.5, -6]}>
        <coneGeometry args={[6, 5.5, 4]} />
        <meshStandardMaterial color="#8BA888" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, -6]}>
        <coneGeometry args={[2, 1.8, 4]} />
        <meshStandardMaterial color="#F0EEE8" roughness={0.5} />
      </mesh>
      <mesh position={[-5.5, -1.2, -5]}>
        <coneGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#7A9E74" roughness={0.9} />
      </mesh>
      <mesh position={[-5.5, 0.6, -5]}>
        <coneGeometry args={[1.5, 1.4, 4]} />
        <meshStandardMaterial color="#EDEAE0" roughness={0.5} />
      </mesh>
      <mesh position={[5.5, -0.8, -5.5]}>
        <coneGeometry args={[4.5, 4.5, 4]} />
        <meshStandardMaterial color="#6B8F68" roughness={0.9} />
      </mesh>
      <mesh position={[5.5, 1.4, -5.5]}>
        <coneGeometry args={[1.8, 1.6, 4]} />
        <meshStandardMaterial color="#F0EEE8" roughness={0.5} />
      </mesh>

      {/* Green foothills */}
      <mesh position={[-4, -2.5, -3]}>
        <sphereGeometry args={[3.2, 8, 5]} />
        <meshStandardMaterial color="#4A7C59" roughness={0.9} />
      </mesh>
      <mesh position={[4, -2.8, -3]}>
        <sphereGeometry args={[3.5, 8, 5]} />
        <meshStandardMaterial color="#3D6B4A" roughness={0.9} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#5B8C3A" roughness={0.9} />
      </mesh>

      {/* White clouds */}
      <Cloud position={[-6, 4, -5]} />
      <Cloud position={[4, 5, -6]} />
      <Cloud position={[-1, 5.5, -7]} />

      {/* Prayer flag strings */}
      <FlagString x={-1.5} />
      <FlagString x={1.5} />
    </group>
  )
}
