// Couleurs de texte par tier — source unique partagée par le classement
// (RowDashboard) et la page compte (AccountHeader)
export const TIER_COLOR_CLASSES: Record<string, string> = {
  IRON: 'text-zinc-400',
  BRONZE: 'text-amber-600',
  SILVER: 'text-slate-300',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-teal-300',
  EMERALD: 'text-emerald-400',
  DIAMOND: 'text-blue-300',
  MASTER: 'text-purple-400',
  GRANDMASTER: 'text-red-400',
  CHALLENGER: 'text-cyan-300'
}

export const getTierColorClass = (tier?: string | null): string =>
  (tier && TIER_COLOR_CLASSES[tier]) || 'text-gray-300'

export interface EloScoreParts {
  tier: string
  division: string | null
  lp: number
  label: string
}

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND']
const DIVISIONS = ['IV', 'III', 'II', 'I']

// Décompose le score journalier calculé par le bot (RankedTier/RankedRank côté api-bot) :
// score = tier * 1000 (IRON = 1000 … CHALLENGER = 10000) + division * 100 (IV = 100 … I = 400) + LP.
// MASTER+ : Riot renvoie toujours le rang "I" (+400) et les LP ne sont plus plafonnés à 100,
// donc la décomposition se fait par plages — best-effort assumé : un MASTER à très gros LP
// devient indistinguable d'un GRANDMASTER, acceptable pour un tooltip de graphique.
export function decomposeEloScore(score: number): EloScoreParts {
  if (!Number.isFinite(score) || score < 1000) {
    return { tier: 'UNRANKED', division: null, lp: 0, label: 'Unranked' }
  }

  if (score >= 8400) {
    const tier = score >= 10400 ? 'CHALLENGER' : score >= 9400 ? 'GRANDMASTER' : 'MASTER'
    const base = score >= 10400 ? 10400 : score >= 9400 ? 9400 : 8400
    const lp = score - base
    return { tier, division: null, lp, label: `${tier} · ${lp} LP` }
  }

  // Clamps défensifs : un score irrégulier (ex. 4050, entre deux divisions)
  // s'affiche sur la borne la plus proche plutôt que de sortir du tableau
  const tierIndex = Math.min(Math.max(Math.floor(score / 1000) - 1, 0), TIERS.length - 1)
  const divisionIndex = Math.min(Math.max(Math.floor((score % 1000) / 100) - 1, 0), DIVISIONS.length - 1)
  const lp = score % 100

  const tier = TIERS[tierIndex]
  const division = DIVISIONS[divisionIndex]
  return { tier, division, lp, label: `${tier} ${division} · ${lp} LP` }
}
