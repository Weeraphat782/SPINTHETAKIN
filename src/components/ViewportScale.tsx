import { useEffect, useState, type ReactNode } from 'react'

/** Reference canvas — layout is authored at this size and scaled to cover the device. */
export const DESIGN_WIDTH = 390
export const DESIGN_HEIGHT = 844

type Props = { children: ReactNode }

export default function ViewportScale({ children }: Props) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function update() {
      const w = window.visualViewport?.width ?? window.innerWidth
      const h = window.visualViewport?.height ?? window.innerHeight
      // Cover: scale up until the canvas fills the screen (no letterbox bars).
      setScale(Math.max(w / DESIGN_WIDTH, h / DESIGN_HEIGHT))
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
