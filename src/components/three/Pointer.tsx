// Compass-needle pointer fixed at wheel center, tip pointing toward 12 o'clock
export default function Pointer() {
  return (
    <group position={[0, 0, 0.25]}>
      {/* Needle tip — mid-wheel */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.10, 0.50, 6]} />
        <meshStandardMaterial
          color="#E07B39"
          metalness={0.3}
          roughness={0.4}
          emissive="#E07B39"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Tapered shaft from center to tip base */}
      <mesh position={[0, 0.525, 0]}>
        <cylinderGeometry args={[0.04, 0.09, 1.05, 8]} />
        <meshStandardMaterial color="#D4940A" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Counterbalance tail pointing downward */}
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.07, 0.44, 6]} />
        <meshStandardMaterial color="#B8860B" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Hub glow ring at pivot */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.04, 8, 24]} />
        <meshStandardMaterial
          color="#D4940A"
          metalness={0.8}
          roughness={0.2}
          emissive="#F4C430"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  )
}
