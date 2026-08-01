// TTL partagé des caches de stores (historique joueur, détail de match)
export const CACHE_TTL_MS = 30 * 60 * 1000

export const isCacheFresh = (fetchedAt: number | undefined, ttlMs: number = CACHE_TTL_MS): boolean =>
  fetchedAt != null && Date.now() - fetchedAt < ttlMs
