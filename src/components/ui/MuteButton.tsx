type Props = {
  muted: boolean
  onToggle: () => void
}

export default function MuteButton({ muted, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-xl"
      style={{
        background: 'rgba(255,248,231,0.85)',
        border: '1.5px solid rgba(212,148,10,0.5)',
        color: '#2C1810',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
