import type { CSSProperties } from 'react'

/**
 * Desktop-first reference canvas (browser responsive @ 430×844 = scale 1).
 * Tune logo / banner / takin sizes here — mobile scales down proportionally.
 */
export const DESIGN_WIDTH = 430
export const DESIGN_HEIGHT = 844

/** Hero stack at scale 1 (desktop reference) */
export const LANDING_HERO_H = 550 // 150 + 300 + 220 + gaps 24
export const LANDING_FORM_FIXED = 180

export const LANDING_LOGO_H = 160
export const LANDING_BANNER_H = 300
export const LANDING_TAKIN_H = 220

export const GAME_LOGO_H = 64
export const GAME_BANNER_H = 300
export const SPIN_TAKIN_W = 188

/**
 * scale = 1 on desktop reference (430×844+).
 * Smaller viewports (phone) shrink width & height together.
 * Extra term prevents hero overflow on very short screens.
 */
export const PLAYER_SCALE = [
  'min(',
  '1,',
  `100dvh / ${DESIGN_HEIGHT},`,
  `100vw / ${DESIGN_WIDTH},`,
  `(100dvh - ${LANDING_FORM_FIXED}px) / ${LANDING_HERO_H}`,
  ')',
].join(' ')

export function playerRootStyle(extra?: CSSProperties): CSSProperties {
  return { ...extra, '--scale': PLAYER_SCALE } as CSSProperties
}

/** Multiply a design-pixel value (at desktop scale 1) by --scale */
export function scaled(designPx: number): string {
  return `calc(${designPx}px * var(--scale))`
}

export function designMaxWidth(): string {
  return `${DESIGN_WIDTH}px`
}
