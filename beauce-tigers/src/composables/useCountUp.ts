// Compte de 0 vers `to` en appelant onFrame à chaque frame (~durationMs au total).
// Respecte prefers-reduced-motion : la valeur finale est posée immédiatement.
export function animateCount(
  to: number,
  onFrame: (value: number) => void,
  durationMs = 800
): void {
  if (
    !Number.isFinite(to) ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    onFrame(to)
    return
  }

  const start = performance.now()
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const tick = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1)
    onFrame(to * easeOutCubic(progress))
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}
