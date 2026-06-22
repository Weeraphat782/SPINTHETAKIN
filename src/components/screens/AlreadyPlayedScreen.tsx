import { motion } from 'framer-motion'

export default function AlreadyPlayedScreen() {
  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center px-8 text-center"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #FFF3CD 50%, #E8C97A 100%)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Branding pill */}
      <div
        className="flex items-center gap-2 mb-8 px-5 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1.5px solid rgba(212,148,10,0.5)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#B22222' }}>OMG</span>
        <span style={{ color: 'rgba(44,24,16,0.3)' }}>|</span>
        <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#2C1810' }}>Bhutan Airlines</span>
      </div>

      <div className="text-7xl mb-6 animate-breathe drop-shadow-md">🦬</div>

      <h2
        className="text-2xl font-bold mb-3"
        style={{ color: '#B22222' }}
      >
        You've already spun the Takin!
      </h2>

      <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#5D3A1A' }}>
        Each visitor gets one spin per event.<br />Please see our staff if you have any questions.
      </p>

      <div
        className="mt-10 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold"
        style={{
          border: '1.5px solid rgba(212,148,10,0.5)',
          color: '#5D3A1A',
          background: 'rgba(255,255,255,0.6)',
        }}
      >
        Thank you for playing!
      </div>
    </motion.div>
  )
}
