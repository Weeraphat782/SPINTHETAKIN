type Props = {
  muted: boolean
  onToggle: () => void
}

export default function MuteButton({ muted, onToggle }: Props) {
  function handleToggle(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    onToggle()
  }

  return (
    <button
      type="button"
      onPointerUp={handleToggle}
      className="absolute z-[101] pointer-events-auto flex items-center justify-center rounded-full text-xl"
      style={{
        top: 'max(12px, env(safe-area-inset-top, 0px))',
        right: 'max(12px, env(safe-area-inset-right, 0px))',
        width: 44,
        height: 44,
        background: 'rgba(255,248,231,0.92)',
        border: '1.5px solid rgba(212,148,10,0.5)',
        color: '#2C1810',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
      }}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
