import { describe, expect, it } from 'vitest'
import { roundPodium } from './roundPodium'
import type { RecapGame, RecapRound } from './roundRecap'
import { card } from '@/test/lanFixtures'

const round = (riotId: string, points: number, verdict: RecapRound['verdict'] = points > 0 ? 'success' : 'failure'): RecapRound => ({
  key: riotId,
  riotId,
  gameId: 'EUW1_1',
  card: card(),
  verdict,
  points,
  roundBonus: false,
  curseApplied: false,
  occurredAt: '2026-11-07T21:00:00+01:00'
})

const game = (...rounds: RecapRound[]): RecapGame => ({
  gameId: 'EUW1_1',
  settledAt: '2026-11-07T21:00:00+01:00',
  roundBonus: false,
  rounds
})

describe('roundPodium', () => {
  it('classe les joueurs par points gagnés sur la manche, le premier est champion', () => {
    const podium = roundPodium(game(round('A#EUW', 10), round('B#EUW', 60), round('C#EUW', 0)))

    expect(podium.map((p) => [p.round.riotId, p.place, p.champion])).toEqual([
      ['B#EUW', 1, true],
      ['A#EUW', 2, false],
      ['C#EUW', 3, false]
    ])
  })

  it('à égalité de points, la place et les feux d\'artifice se partagent', () => {
    const podium = roundPodium(game(round('A#EUW', 25), round('B#EUW', 25), round('C#EUW', 10)))

    expect(podium.map((p) => [p.place, p.champion])).toEqual([
      [1, true],
      [1, true],
      [3, false]
    ])
  })

  it('personne n\'a marqué : pas de champion', () => {
    const podium = roundPodium(game(round('A#EUW', 0), round('B#EUW', 0, 'unknown')))

    expect(podium.some((p) => p.champion)).toBe(false)
    // À zéro point, un échec passe après un verdict inconnu
    expect(podium.map((p) => p.round.riotId)).toEqual(['B#EUW', 'A#EUW'])
  })
})
