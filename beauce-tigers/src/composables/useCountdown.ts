const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** Millisecondes restantes avant `target` (négatif une fois passé, NaN si date illisible) */
export const msUntil = (target: string | Date, now: number = Date.now()): number =>
  new Date(target).getTime() - now

/**
 * Durée lisible d'un coup d'œil : « 3 j 4 h », « 2 h 14 », « 14 min »,
 * « moins d'une minute ». Arrondie à la minute supérieure : on n'annonce
 * jamais une ouverture plus tôt qu'elle n'aura lieu.
 */
export const formatCountdown = (ms: number): string => {
  if (!Number.isFinite(ms) || ms <= 0) return ''
  if (ms < MINUTE_MS) return 'moins d\'une minute'

  const totalMinutes = Math.ceil(ms / MINUTE_MS)
  const days = Math.floor(totalMinutes / (DAY_MS / MINUTE_MS))
  const hours = Math.floor((totalMinutes % (DAY_MS / MINUTE_MS)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return hours > 0 ? `${days} j ${hours} h` : `${days} j`
  if (hours > 0) return minutes > 0 ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`
  return `${minutes} min`
}
