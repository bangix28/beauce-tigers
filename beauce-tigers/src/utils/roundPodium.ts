import type { RecapGame, RecapRound } from './roundRecap'

// Podium de fin de manche : les joueurs d'un match classés par points gagnés
// sur ce match. Mise en forme seulement, les points viennent tels quels de l'API.

export interface PodiumPlace {
  round: RecapRound
  /** 1, 2, 3… ; deux joueurs à égalité de points partagent la même place */
  place: number
  /** Meilleur score de la manche, à condition d'avoir marqué : feux d'artifice */
  champion: boolean
}

const VERDICT_ORDER = { success: 0, unknown: 1, failure: 2 }

export const roundPodium = (game: RecapGame): PodiumPlace[] => {
  const rounds = game.rounds
    .slice()
    .sort(
      (a, b) =>
        b.points - a.points ||
        VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] ||
        a.riotId.localeCompare(b.riotId)
    )
  const best = rounds[0]?.points ?? 0

  let place = 0
  return rounds.map((round, index) => {
    if (index === 0 || round.points !== rounds[index - 1].points) place = index + 1
    return { round, place, champion: best > 0 && round.points === best }
  })
}
