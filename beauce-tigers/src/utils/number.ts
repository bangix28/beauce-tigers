// L'API renvoie encore certains nombres en string ("93") ; demain tout sera int.
// On normalise dans les stores une bonne fois : les composants ne consomment
// que des number | null.
export const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}
