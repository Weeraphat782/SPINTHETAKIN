import { useEffect, useState } from 'react'

const TAKIN_FRONT = '/assets/Takin.png'
const TAKIN_BACK = '/assets/takin%20back.png'

type Props = {
  spinning: boolean
  hasSpun: boolean
  onClick?: () => void
}

export default function SpinningTakin({ spinning, hasSpun, onClick }: Props) {
  const [showBack, setShowBack] = useState(false)
  const interactive = !spinning && !hasSpun

  useEffect(() => {
    if (!spinning) {
      setShowBack(false)
      return
    }
    const id = setInterval(() => setShowBack((v) => !v), 350)
    return () => clearInterval(id)
  }, [spinning])

  return (
    <div
      onClick={interactive ? onClick : undefined}
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '48%',
        maxWidth: 188,
        zIndex: 5,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        filter: hasSpun && !spinning
          ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.5)) brightness(0.7) grayscale(0.3)'
          : 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
      }}
    >
      <div className={spinning ? 'takin-mascot--running' : 'animate-breathe'}>
        <img
          src={spinning && showBack ? TAKIN_BACK : TAKIN_FRONT}
          alt="Takin"
          draggable={false}
          style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', pointerEvents: 'none' }}
        />
      </div>
    </div>
  )
}
