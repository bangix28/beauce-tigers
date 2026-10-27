import type {
  ChallengeCard,
  FeedEntry,
  StandingEntry,
  Verdict
} from '../../types/lanChallenge'

// Récap des manches de la soirée, tiré du fil d'exploits (le plus récent en
// premier côté API). Pure mise en forme : verdicts, points et bonus viennent
// tels quels de l'API, et les totaux d'un joueur du classement — jamais d'une
// somme sur le fil, qui peut être tronqué.

/** Le fil n'en renvoie pas plus (GetFeedHandler::MAX_LIMIT côté api-bot) */
export const FEED_RECAP_LIMIT = 50

export interface RecapRound {
  key: string
  riotId: string
  gameId: string
  card: ChallengeCard
  verdict: Verdict
  points: number
  roundBonus: boolean
  curseApplied: boolean
  occurredAt: string
}

export interface RecapGame {
  gameId: string
  /** Règlement le plus récent du match */
  settledAt: string
  /** Bonus de manche obtenu sur ce match (drapeau de l'API sur les manches) */
  roundBonus: boolean
  rounds: RecapRound[]
}

export interface RecapPlayer {
  riotId: string
  rank: number | null
  joined: boolean
  /** Totaux du classement : complets même si le fil est tronqué */
  score: number
  successes: number
  roundsPlayed: number
  /** Manches présentes dans le fil, la plus récente en premier */
  rounds: RecapRound[]
}

const time = (iso: string): number => Date.parse(iso) || 0

const newestFirst = (a: { occurredAt: string }, b: { occurredAt: string }) =>
  time(b.occurredAt) - time(a.occurredAt)

/** Les manches réglées du fil ; les sabotages n'en sont pas */
export const recapRounds = (feed: FeedEntry[]): RecapRound[] =>
  feed
    .filter((entry) => entry.kind === 'round' && entry.gameId != null && entry.verdict != null)
    .map((entry) => ({
      key: `${entry.gameId}|${entry.riotId}|${entry.card.code}|${entry.occurredAt}`,
      riotId: entry.riotId,
      gameId: entry.gameId as string,
      card: entry.card,
      verdict: entry.verdict as Verdict,
      points: entry.points,
      roundBonus: entry.roundBonus,
      curseApplied: entry.curseApplied,
      occurredAt: entry.occurredAt
    }))
    .sort(newestFirst)

/** Vue « par match » : qui a joué quoi sur la même partie ; le joueur connecté en tête */
export const recapByGame = (feed: FeedEntry[], myRiotId: string | null = null): RecapGame[] => {
  const games = new Map<string, RecapGame>()

  for (const round of recapRounds(feed)) {
    const game = games.get(round.gameId)
    if (!game) {
      games.set(round.gameId, {
        gameId: round.gameId,
        settledAt: round.occurredAt,
        roundBonus: round.roundBonus,
        rounds: [round]
      })
      continue
    }
    game.rounds.push(round)
    game.roundBonus ||= round.roundBonus
    if (time(round.occurredAt) > time(game.settledAt)) game.settledAt = round.occurredAt
  }

  return [...games.values()]
    .map((game) => ({
      ...game,
      rounds: game.rounds
        .slice()
        .sort((a, b) => Number(b.riotId === myRiotId) - Number(a.riotId === myRiotId))
    }))
    .sort((a, b) => time(b.settledAt) - time(a.settledAt))
}

/** Vue « par joueur » : dans l'ordre du classement, y compris ceux qui n'ont rien joué */
export const recapByPlayer = (feed: FeedEntry[], standings: StandingEntry[]): RecapPlayer[] => {
  const roundsByPlayer = new Map<string, RecapRound[]>()
  for (const round of recapRounds(feed)) {
    roundsByPlayer.set(round.riotId, [...(roundsByPlayer.get(round.riotId) ?? []), round])
  }

  const players: RecapPlayer[] = standings
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => ({
      riotId: entry.riotId,
      rank: entry.rank,
      joined: entry.joined,
      score: entry.score,
      successes: entry.successes,
      roundsPlayed: entry.roundsPlayed,
      rounds: roundsByPlayer.get(entry.riotId) ?? []
    }))

  // Classement en retard d'une relecture sur le fil : le joueur reste visible,
  // sans totaux plutôt qu'avec des totaux inventés
  const ranked = new Set(players.map((player) => player.riotId))
  for (const [riotId, rounds] of roundsByPlayer) {
    if (ranked.has(riotId)) continue
    players.push({ riotId, rank: null, joined: true, score: 0, successes: 0, roundsPlayed: 0, rounds })
  }

  return players
}

/** Le fil plein : les manches les plus anciennes ne sont plus dans le récap */
export const isRecapTruncated = (feed: FeedEntry[]): boolean => feed.length >= FEED_RECAP_LIMIT
