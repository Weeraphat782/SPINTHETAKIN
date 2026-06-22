import type { CSSProperties } from 'react'

/**
 * Reference proportions (from production screenshot) — NOT a fixed phone size.
 * The whole block scales uniformly to fit any viewport (100dvh × 100vw).
 */
export const LAYOUT_W = 390

export const LANDING_LOGO_H = 150
export const LANDING_BANNER_H = 300
export const LANDING_TAKIN_H = 220
export const LANDING_GAP_SM = 12
export const LANDING_GAP_MD = 16
export const LANDING_PAD_TOP = 8
export const LANDING_PAD_BOTTOM = 24
export const LANDING_FORM_H = 200

/** Total landing content height at scale 1 */
export const LANDING_LAYOUT_H =
  LANDING_PAD_TOP +
  LANDING_LOGO_H +
  LANDING_GAP_SM +
  LANDING_BANNER_H +
  LANDING_GAP_SM +
  LANDING_TAKIN_H +
  LANDING_GAP_MD +
  LANDING_FORM_H +
  LANDING_PAD_BOTTOM

export const GAME_LOGO_H = 64
export const GAME_BANNER_H = 300
export const GAME_HEADER_GAP = 4
export const GAME_PAD_TOP = 8
export const SPIN_TAKIN_W = 188

/** Usable viewport height (Safari safe areas) */
export const VIEWPORT_H =
  'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'

/** One unitless factor — same on every phone, every model */
export const FIT_SCALE = `min(calc(${VIEWPORT_H} / ${LANDING_LAYOUT_H}), calc(100vw / ${LAYOUT_W}))`

export function playerRootStyle(extra?: CSSProperties): CSSProperties {
  return { ...extra, '--s': FIT_SCALE } as CSSProperties
}

export function scaled(designPx: number): string {
  return `calc(${designPx}px * var(--s))`
}

/** Landing: fixed design canvas, uniformly scaled to fit the device */
export function landingCanvasStyle(extra?: CSSProperties): CSSProperties {
  return {
    width: LAYOUT_W,
    height: LANDING_LAYOUT_H,
    transform: `scale(${FIT_SCALE})`,
    transformOrigin: 'top center',
    flexShrink: 0,
    paddingBottom: LANDING_PAD_BOTTOM,
    ...extra,
  } as CSSProperties
}
