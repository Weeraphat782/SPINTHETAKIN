import { motion } from 'framer-motion'
import type { SpinResult } from '../../lib/supabase'
import PrizePopup from '../ui/PrizePopup'

type Props = {
  result: SpinResult
  onDone: () => void
  logoUrl?: string
}

export default function WinnerScreen({ result, onDone, logoUrl }: Props) {
  const isWin = !result.isNoPrize

  return (
    <motion.div
      className="relative w-full h-full"
      style={{
        background: isWin
          ? 'linear-gradient(180deg, #FFF3CD 0%, #E8C97A 100%)'
          : 'linear-gradient(180deg, #E8E4DF 0%, #C9C4BC 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-yellow-300"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `pulse-gold ${Math.random() * 2 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {logoUrl && (
        <div style={{ position: 'absolute', top: 'clamp(8px, 2svh, 20px)', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <img
            src={logoUrl}
            alt="Logo"
            style={{ height: 'clamp(36px, 7svh, 60px)', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
          />
        </div>
      )}

      <PrizePopup result={result} onDone={onDone} />
    </motion.div>
  )
}
