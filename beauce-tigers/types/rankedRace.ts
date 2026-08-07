// Contrat des endpoints Ranked Race exposés par l'api-bot :
// /ranked-race, /ranked-race-events, /ranked-race-events/{id}.
// Les trois renvoient les mêmes shapes de classement, seule la fenêtre change.

export type RaceQueue = 'solo' | 'flex'
export type RacePeriod = 'week' | 'month'
export type RaceEventStatus = 'upcoming' | 'active' | 'finished'

/** Bornes de la course, incluses des deux côtés, au format 'YYYY-MM-DD' */
export interface RaceWindow {
  start: string
  end: string
}

export interface RankSnapshot {
  tier: string
  /** 'I'..'IV', ou 'UNRANKED' pour l'apex (Master+) : ne jamais l'afficher brut */
  division: string
  leaguePoints: number
  raceScore: number
}

export interface ProgressionEntry {
  riotId: string
  summonerName: string
  logoId: string
  start: RankSnapshot
  end: RankSnapshot
  /**
   * LP réellement gagnés, dérivés côté front d'une échelle linéaire —
   * l'API n'expose que rawDelta, qui compte 1000 points par tier au lieu de 400
   */
  netLp: number | null
  rawDelta: number
  weightedDelta: number
  /** Rangs 1-based ; le tableau est trié sur rankWeighted */
  rankRaw: number
  rankWeighted: number
  gamesPlayed: number
  winrate: number | null
}

export interface WinrateEntry {
  riotId: string
  summonerName: string
  logoId: string
  wins: number
  losses: number
  gamesPlayed: number
  winrate: number | null
}

export interface WinrateStandings {
  gamesRequired: number
  qualified: WinrateEntry[]
  notQualified: WinrateEntry[]
}

/**
 * Classements normalisés, communs à la course calendaire et aux événements.
 * Les champs propres aux événements (id, name, status…) restent optionnels
 * pour que la vue consomme une seule forme.
 */
export interface RaceStandings {
  window: RaceWindow
  /** Vrai pendant les placements : progression vidée, winrate toujours calculé */
  progressionSuspended: boolean
  progression: ProgressionEntry[]
  winrate: WinrateStandings
  queue: RaceQueue
  period?: RacePeriod
  eventId?: number
  eventName?: string
  status?: RaceEventStatus
}

export interface RankedRaceEvent {
  id: number
  name: string
  queue: RaceQueue
  window: RaceWindow
  status: RaceEventStatus
  minGamesToQualify: number
}

/** Ce que l'écran /courses affiche : une période calendaire ou un événement */
export type RaceSelection =
  | { kind: 'calendar'; queue: RaceQueue; period: RacePeriod }
  | { kind: 'event'; id: number }
