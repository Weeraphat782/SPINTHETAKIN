import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import type { SpinResult } from '../../lib/supabase'

type Props = {
  result: SpinResult
  onDone: () => void
}

export default function PrizePopup({ result, onDone }: Props) {
  const isWin = !result.isNoPrize

  useEffect(() => {
    if (!isWin) return
    confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#D4940A', '#F4C430', '#E53935', '#fff', '#2E7D32', '#F4A636'],
    })
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 130,
        origin: { y: 0.35 },
        colors: ['#D4940A', '#fff', '#F4A636', '#E53935'],
      })
    }, 600)
  }, [isWin])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(44,24,16,0.6)', backdropFilter: 'blur(3px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm mx-4 mb-8 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #FFF8E7 0%, #FFF3CD 100%)',
          border: isWin ? '2.5px solid #D4940A' : '2.5px solid #6b6375',
          boxShadow: isWin
            ? '0 8px 60px rgba(212,148,10,0.35), 0 0 0 1px rgba(212,148,10,0.15)'
            : '0 8px 40px rgba(44,24,16,0.2)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        <div
          className="py-4 text-center text-xl font-bold tracking-wide"
          style={{
            background: isWin
              ? 'linear-gradient(90deg, #B22222 0%, #D4940A 50%, #B22222 100%)'
              : 'linear-gradient(90deg, #5D3A1A 0%, #6b6375 50%, #5D3A1A 100%)',
            color: '#FFF8E7',
            letterSpacing: '0.12em',
          }}
        >
          {isWin ? '🎉 Congratulations! 🎉' : 'Better Luck Next Time!'}
        </div>

        <div className="px-6 py-5 flex flex-col items-center gap-4">
          {isWin && (
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#5D3A1A' }}>
              You Won
            </p>
          )}

          {result.imageUrl ? (
            <div
              className="w-40 h-40 rounded-2xl overflow-hidden"
              style={{
                border: isWin ? '2.5px solid #D4940A' : '2.5px solid #6b6375',
                boxShadow: isWin ? '0 4px 20px rgba(212,148,10,0.25)' : 'none',
              }}
            >
              <img src={result.imageUrl} alt={result.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-40 h-40 rounded-2xl flex items-center justify-center text-6xl"
              style={{
                background: isWin ? 'rgba(212,148,10,0.1)' : 'rgba(107,99,117,0.12)',
                border: isWin ? '2.5px solid #D4940A' : '2.5px solid #6b6375',
              }}
            >
              {isWin ? '🏆' : '🔄'}
            </div>
          )}

          <h2 className="text-2xl font-bold text-center" style={{ color: isWin ? '#B22222' : '#5D3A1A' }}>
            {result.name}
          </h2>

          {result.description && (
            <p className="text-sm text-center" style={{ color: '#5D3A1A' }}>{result.description}</p>
          )}

          {isWin && (
            <div
              className="w-full rounded-xl p-3 text-center text-sm font-semibold"
              style={{
                background: 'rgba(178,34,34,0.08)',
                border: '1.5px solid rgba(178,34,34,0.3)',
                color: '#B22222',
              }}
            >
              📱 Please show this screen to our staff.
            </div>
          )}

          <button
            onClick={onDone}
            className="btn-gold w-full mt-1"
            style={{ padding: '0.85rem 2rem' }}
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
