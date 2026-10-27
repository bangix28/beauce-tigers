import { animateCount } from './useCountUp'

/** Durée par défaut : un changement de score doit se lire, pas se faire attendre */
export const NUMBER_ANIMATION_MS = 450

const prefersReducedMotion = (): boolean =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fait défiler un nombre de `from` à `to` (animateCount ne sait partir que de
 * zéro : on anime l'écart). Renvoie une fonction d'annulation, à appeler quand
 * une nouvelle valeur arrive avant la fin, sinon deux animations se chevauchent.
 * Sans matchMedia (tests) ou en mouvement réduit, la valeur finale est posée tout de suite.
 */
export function animateBetween(
  from: number,
  to: number,
  onFrame: (value: number) => void,
  durationMs = NUMBER_ANIMATION_MS
): () => void {
  let cancelled = false
  if (from === to || !Number.isFinite(from) || prefersReducedMotion()) {
    onFrame(to)
    return () => {}
  }

  animateCount(
    to - from,
    (delta) => {
      if (!cancelled) onFrame(from + delta)
    },
    durationMs
  )
  return () => {
    cancelled = true
  }
}
