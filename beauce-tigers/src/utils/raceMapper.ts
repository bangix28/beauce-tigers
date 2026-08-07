import {
  ProgressionEntry,
  RaceQueue,
  RaceStandings,
  RankSnapshot,
  RankedRaceEvent,
  WinrateEntry,
  WinrateStandings
} from '../../types/rankedRace'
import { toNumber } from '@/utils/number'

// Anti-corruption layer des endpoints Ranked Race, dans l'esprit de playerMapper.
// L'API sérialise logoId en string et les deltas en float PHP : les composants
// ne consomment que des number | null normalisés ici.

/** Master/GM/Challenger n'ont pas de division : l'API renvoie 'UNRANKED' */
export const isApex = (snapshot: RankSnapshot): boolean =>
  snapshot.division === 'UNRANKED' || !snapshot.division

const LADDER_TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND']
const APEX_TIERS = ['MASTER', 'GRANDMASTER', 'CHALLENGER']
const DIVISION_INDEX: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 }
const LP_PER_DIVISION = 100
const DIVISIONS_PER_TIER = 4
const LP_PER_TIER = DIVISIONS_PER_TIER * LP_PER_DIVISION
/** Master 0 LP prolonge Diamond I 100 LP sans discontinuité */
const APEX_FLOOR = LADDER_TIERS.length * LP_PER_TIER

/**
 * Position sur une échelle **linéaire en LP** : 100 LP par division, 4 divisions
 * par tier. À ne pas confondre avec le raceScore de l'API (tier × 1000), qui
 * compte 1000 points par tier là où un tier n'en vaut que 400 : chaque
 * franchissement y ajoute 600 points fantômes. C'est cette échelle-ci qui
 * permet d'annoncer un vrai nombre de LP gagnés.
 */
export const ladderPosition = (snapshot: RankSnapshot): number | null => {
  if (APEX_TIERS.includes(snapshot.tier)) {
    return APEX_FLOOR + snapshot.leaguePoints
  }

  const tierIndex = LADDER_TIERS.indexOf(snapshot.tier)
  if (tierIndex < 0) return null

  return (
    tierIndex * LP_PER_TIER +
    (DIVISION_INDEX[snapshot.division] ?? 0) * LP_PER_DIVISION +
    snapshot.leaguePoints
  )
}

/** LP réellement encaissés sur la période, null si un rang est illisible */
export const netLpGained = (start: RankSnapshot, end: RankSnapshot): number | null => {
  const from = ladderPosition(start)
  const to = ladderPosition(end)
  return from == null || to == null ? null : to - from
}

/**
 * Classement aux LP nets. Mêmes départages que la progression côté api-bot
 * (RaceStandingsCalculator) : à égalité, celui qui a joué le moins de parties
 * passe devant, puis le meilleur winrate — sinon les deux tableaux se
 * contrediraient sur les ex æquo.
 */
export const rankByNetLp = (entries: ProgressionEntry[]): ProgressionEntry[] =>
  entries
    .filter((entry) => entry.netLp != null)
    .slice()
    .sort((a, b) => {
      if (b.netLp !== a.netLp) return (b.netLp ?? 0) - (a.netLp ?? 0)
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed
      return (b.winrate ?? -1) - (a.winrate ?? -1)
    })

/**
 * 'GOLD I · 80 LP', ou 'MASTER · 245 LP' pour l'apex.
 * Seul point d'affichage d'un rang de course : afficher `${tier} ${division}`
 * ailleurs produirait un « MASTER UNRANKED ».
 */
export const formatRankLabel = (snapshot: RankSnapshot): string =>
  isApex(snapshot)
    ? `${snapshot.tier} · ${snapshot.leaguePoints} LP`
    : `${snapshot.tier} ${snapshot.division} · ${snapshot.leaguePoints} LP`

/** Vrai quand le joueur a changé de tier sur la période (promotion ou chute) */
export const hasTierChanged = (start: RankSnapshot, end: RankSnapshot): boolean =>
  start.tier !== end.tier

/**
 * La borne `end` de la fenêtre est incluse : la course s'achève le lendemain
 * à minuit. Base de tous les comptes à rebours.
 */
export const raceWindowEnd = (end: string): Date => {
  const date = new Date(`${end}T00:00:00`)
  date.setDate(date.getDate() + 1)
  return date
}

const mapRankSnapshot = (raw: any): RankSnapshot => ({
  tier: raw?.tier ?? 'UNRANKED',
  division: raw?.division ?? 'UNRANKED',
  leaguePoints: toNumber(raw?.leaguePoints) ?? 0,
  raceScore: toNumber(raw?.raceScore) ?? 0
})

export const mapProgressionEntry = (item: any): ProgressionEntry => {
  const start = mapRankSnapshot(item.start)
  const end = mapRankSnapshot(item.end)

  return {
    riotId: item.riotId,
    summonerName: item.summonerName,
    logoId: String(item.logoId ?? ''),
    start,
    end,
    // Dérivé ici et pas côté API : le back n'expose que le raceScore
    netLp: netLpGained(start, end),
    rawDelta: toNumber(item.rawDelta) ?? 0,
    weightedDelta: toNumber(item.weightedDelta) ?? 0,
    rankRaw: toNumber(item.rankRaw) ?? 0,
    rankWeighted: toNumber(item.rankWeighted) ?? 0,
    gamesPlayed: toNumber(item.gamesPlayed) ?? 0,
    // null assumé (0 partie) : les composants affichent un tiret, pas un 0 %
    winrate: toNumber(item.winrate)
  }
}

export const mapWinrateEntry = (item: any): WinrateEntry => ({
  riotId: item.riotId,
  summonerName: item.summonerName,
  logoId: String(item.logoId ?? ''),
  wins: toNumber(item.wins) ?? 0,
  losses: toNumber(item.losses) ?? 0,
  gamesPlayed: toNumber(item.gamesPlayed) ?? 0,
  winrate: toNumber(item.winrate)
})

const mapWinrateStandings = (raw: any): WinrateStandings => ({
  gamesRequired: toNumber(raw?.gamesRequired) ?? 0,
  qualified: (raw?.qualified ?? []).map(mapWinrateEntry),
  notQualified: (raw?.notQualified ?? []).map(mapWinrateEntry)
})

export const mapRankedRaceEvent = (item: any): RankedRaceEvent => ({
  id: toNumber(item.id) ?? 0,
  name: item.name,
  queue: item.queue as RaceQueue,
  window: { start: item.window?.start, end: item.window?.end },
  status: item.status,
  minGamesToQualify: toNumber(item.minGamesToQualify) ?? 0
})

/**
 * Ramène /ranked-race et /ranked-race-events/{id} à une seule forme :
 * les champs d'événement ne sont présents que dans le second cas.
 */
export const mapRaceStandings = (data: any): RaceStandings => ({
  window: { start: data.window?.start, end: data.window?.end },
  progressionSuspended: data.progressionSuspended === true,
  progression: (data.progression ?? []).map(mapProgressionEntry),
  winrate: mapWinrateStandings(data.winrate),
  queue: data.queue as RaceQueue,
  period: data.period ?? undefined,
  eventId: data.id != null ? (toNumber(data.id) ?? undefined) : undefined,
  eventName: data.name ?? undefined,
  status: data.status ?? undefined
})
