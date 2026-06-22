import { scaled, SPIN_TAKIN_W } from '../../lib/playerLayout'

const TAKIN_FRONT = '/assets/Takin.png'
const TAKIN_BACK = '/assets/takin back.png'

type Props = {
  spinning: boolean
  hasSpun: boolean
  onClick?: () => void
}

export default function SpinningTakin({ spinning, hasSpun, onClick }: Props) {
  const interactive = !spinning && !hasSpun

  return (
    <div
      onClick={interactive ? onClick : undefined}
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: scaled(SPIN_TAKIN_W),
        maxWidth: scaled(SPIN_TAKIN_W),
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
        <div className="takin-mascot__frame">
          <img
            src={TAKIN_FRONT}
            alt="Takin"
            draggable={false}
            className={spinning ? 'takin-mascot__sprite takin-mascot__sprite--front' : 'takin-mascot__sprite'}
          />
          {spinning && (
            <img
              src={TAKIN_BACK}
              alt=""
              aria-hidden
              draggable={false}
              className="takin-mascot__sprite takin-mascot__sprite--back"
            />
          )}
        </div>
      </div>
    </div>
  )
}
