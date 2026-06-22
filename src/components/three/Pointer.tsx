// Pointer arrow fixed at 12 o'clock of the vertical wheel
export default function Pointer() {
  return (
    <group position={[0, 2.62, 0.18]}>
      {/* Arrow tip pointing downward toward wheel */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.14, 0.44, 6]} />
        <meshStandardMaterial
          color="#E07B39"
          metalness={0.3}
          roughness={0.4}
          emissive="#E07B39"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.3, 8]} />
        <meshStandardMaterial color="#D4940A" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, -0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.026, 6, 20]} />
        <meshStandardMaterial color="#E07B39" emissive="#E07B39" emissiveIntensity={1.6} />
      </mesh>
    </group>
  )
}
