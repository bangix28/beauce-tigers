// Retard d'apparition d'une ligne de liste, pour les cascades des tables de
// course. Plafonné : sans borne, une table de 40 lignes mettrait deux secondes
// à finir de s'afficher, ce qui se lit comme une lenteur et non comme un effet.
const STAGGER_STEP_MS = 40
const STAGGER_MAX_ROWS = 12

export const staggerDelay = (index: number): string =>
  `${Math.min(index, STAGGER_MAX_ROWS) * STAGGER_STEP_MS}ms`
