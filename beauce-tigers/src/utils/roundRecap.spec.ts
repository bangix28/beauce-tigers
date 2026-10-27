import { describe, expect, it } from 'vitest'
import {
  FEED_RECAP_LIMIT,
  isRecapTruncated,
  recapByGame,
  recapByPlayer,
  recapRounds
} from './roundRecap'
import { card, feedEntry, pickpocket, standing } from '@/test/lanFixtures'

// Une petite soirée : deux matchs, un sabotage au milieu
const FEED = [
  feedEntry({
    riotId: 'Rival#EUW',
    gameId: 'EUW1_2',
    card: card({ code: 'blitz', label: 'Blitz', rarity: 'prismatic' }),
    verdict: 'failure',
    points: 0,
    occurredAt: '2026-11-07T22:05:00+01:00'
  }),
  feedEntry({
    riotId: 'Moi#EUW',
    gameId: 'EUW1_2',
    points: 12,
    curseApplied: true,
    occurredAt: '2026-11-07T22:04:00+01:00'
  }),
  feedEntry({ kind: 'sabotage', riotId: 'Ami#EUW', card: pickpocket, gameId: null, verdict: null, points: 0, occurredAt: '2026-11-07T21:40:00+01:00' }),
  feedEntry({ riotId: 'Ami#EUW', gameId: 'EUW1_1', points: 15, roundBonus: true, occurredAt: '2026-11-07T21:12:00+01:00' }),
  feedEntry({ riotId: 'Moi#EUW', gameId: 'EUW1_1', points: 15, roundBonus: true, occurredAt: '2026-11-07T21:11:00+01:00' })
]

const STANDINGS = [
  standing({ rank: 2, riotId: 'Moi#EUW', score: 27, successes: 2, roundsPlayed: 2 }),
  standing({ rank: 1, riotId: 'Ami#EUW', score: 40, successes: 3, roundsPlayed: 4 }),
  standing({ rank: 3, riotId: 'Rival#EUW', score: 0, successes: 0, roundsPlayed: 1 }),
  standing({ rank: 4, riotId: 'Absent#EUW', joined: false, score: 0, successes: 0, roundsPlayed: 0 })
]

describe('recapRounds', () => {
  it('ne garde que les manches réglées, la plus récente en premier', () => {
    const rounds = recapRounds(FEED)

    expect(rounds.map((round) => `${round.riotId}@${round.gameId}`)).toEqual([
      'Rival#EUW@EUW1_2',
      'Moi#EUW@EUW1_2',
      'Ami#EUW@EUW1_1',
      'Moi#EUW@EUW1_1'
    ])
  })

  it('ignore les sabotages et les entrées sans match', () => {
    const rounds = recapRounds([
      feedEntry({ kind: 'sabotage', card: pickpocket, gameId: null, verdict: null }),
      feedEntry({ gameId: null })
    ])

    expect(rounds).toEqual([])
  })
})

describe('recapByGame', () => {
  it('regroupe par match, le plus récent en premier, le joueur connecté en tête', () => {
    const games = recapByGame(FEED, 'Moi#EUW')

    expect(games.map((game) => game.gameId)).toEqual(['EUW1_2', 'EUW1_1'])
    expect(games[0].rounds.map((round) => round.riotId)).toEqual(['Moi#EUW', 'Rival#EUW'])
    expect(games[0].settledAt).toBe('2026-11-07T22:05:00+01:00')
  })

  it('reprend tel quel le bonus de manche et la malédiction de l\'API', () => {
    const [latest, first] = recapByGame(FEED, 'Moi#EUW')

    expect(first.roundBonus).toBe(true)
    expect(latest.roundBonus).toBe(false)
    expect(latest.rounds[0]).toMatchObject({ points: 12, curseApplied: true })
  })
})

describe('recapByPlayer', () => {
  it('suit l\'ordre du classement et garde ceux qui n\'ont rien joué', () => {
    const players = recapByPlayer(FEED, STANDINGS)

    expect(players.map((player) => player.riotId)).toEqual([
      'Ami#EUW',
      'Moi#EUW',
      'Rival#EUW',
      'Absent#EUW'
    ])
    expect(players[3]).toMatchObject({ joined: false, rounds: [] })
  })

  it('prend les totaux du classement, jamais une somme du fil (qui peut être tronqué)', () => {
    const ami = recapByPlayer(FEED, STANDINGS)[0]

    // Le fil ne montre qu'une manche d'Ami (15 pts) ; le classement en compte 4 pour 40 pts
    expect(ami.rounds).toHaveLength(1)
    expect(ami).toMatchObject({ score: 40, successes: 3, roundsPlayed: 4 })
  })

  it('n\'invente pas de totaux pour un joueur absent du classement', () => {
    const players = recapByPlayer(FEED, [])

    expect(players.find((player) => player.riotId === 'Rival#EUW')).toMatchObject({
      rank: null,
      score: 0,
      rounds: [expect.objectContaining({ gameId: 'EUW1_2' })]
    })
  })
})

describe('isRecapTruncated', () => {
  it('signale un fil plein', () => {
    expect(isRecapTruncated(FEED)).toBe(false)
    expect(isRecapTruncated(Array(FEED_RECAP_LIMIT).fill(feedEntry()))).toBe(true)
  })
})
