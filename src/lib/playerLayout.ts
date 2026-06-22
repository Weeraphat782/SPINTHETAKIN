import type { CSSProperties } from 'react'

/**
 * Desktop-first reference canvas (browser responsive @ 430×844 = scale 1).
 * Tune logo / banner / takin sizes here — all viewports scale proportionally.
 */
export const DESIGN_WIDTH = 430
export const DESIGN_HEIGHT = 844

export const LANDING_LOGO_H = 160
export const LANDING_BANNER_H = 300
export const LANDING_TAKIN_H = 220
export const LANDING_HERO_GAP = 24

/** Hero stack height at scale 1 (logo + banner + takin + gaps) */
export const LANDING_HERO_H =
  LANDING_LOGO_H + LANDING_BANNER_H + LANDING_TAKIN_H + LANDING_HERO_GAP

/** Form card stays ~fixed px (inputs don't scale) — reserve separately */
export const LANDING_FORM_FIXED = 180

export const GAME_LOGO_H = 64
export const GAME_BANNER_H = 300
export const SPIN_TAKIN_W = 188

/**
 * Fills viewport — no cap at 1; large screens scale up, small screens scale down.
 * min(heightFactor, widthFactor) keeps proportions.
 */
export const PLAYER_SCALE = `min((100dvh - ${LANDING_FORM_FIXED}px) / ${LANDING_HERO_H}, 100vw / ${DESIGN_WIDTH})`

export function playerRootStyle(extra?: CSSProperties): CSSProperties {
  return {
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    paddingLeft: 'env(safe-area-inset-left, 0px)',
    paddingRight: 'env(safe-area-inset-right, 0px)',
    ...extra,
    '--scale': PLAYER_SCALE,
  } as CSSProperties
}

/** Multiply a design-pixel value (at desktop scale 1) by --scale */
export function scaled(designPx: number): string {
  return `calc(${designPx}px * var(--scale))`
}

export function designMaxWidth(): string {
  return `${DESIGN_WIDTH}px`
}
