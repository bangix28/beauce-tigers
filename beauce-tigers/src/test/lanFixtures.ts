import type {
  CardCatalogue,
  ChallengeCard,
  CurrentLan,
  FeedEntry,
  MyRun,
  PlayerRun,
  RoundResult,
  StandingEntry
} from '../../types/lanChallenge'

// Réponses d'API factices des défis de LAN, au format de docs/front/defis-lan.md

export const card = (overrides: Partial<ChallengeCard> = {}): ChallengeCard => ({
  code: 'double_kill',
  label: 'Doublé',
  description: 'Réussis un doublé.',
  rarity: 'silver',
  theme: null,
  points: 10,
  secret: false,
  needsTarget: false,
  ...overrides
})

export const whereIsMama = card({
  code: 'where_is_mama',
  label: 'Où est maman ?',
  description: "Fais une assistance sur au moins 12 kills d'un même coéquipier (6 sur la Faille).",
  theme: 'bond'
})

export const pickpocket = card({
  code: 'pickpocket',
  label: 'Pickpocket',
  description: 'Vole une relance au joueur de ton choix.',
  rarity: 'saboteur',
  points: 0,
  secret: true,
  needsTarget: true
})

export const curse = card({
  code: 'curse',
  label: 'Malédiction',
  description: 'Le prochain défi réussi de ta cible ne rapporte que la moitié.',
  rarity: 'saboteur',
  points: 0,
  secret: true,
  needsTarget: true
})

export const result = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  gameId: 'EUW1_1',
  card: card(),
  verdict: 'success',
  points: 10,
  roundBonus: false,
  curseApplied: false,
  ...overrides
})

export const run = (overrides: Partial<PlayerRun> = {}): PlayerRun => ({
  score: 0,
  rerollsLeft: 3,
  offer: [card(), card({ code: 'prudent', label: 'Prudent' }), card({ code: 'blitz', label: 'Blitz', rarity: 'gold', points: 25 })],
  activeCard: null,
  cardLocked: false,
  results: [],
  ...overrides
})

export const myRun = (overrides: Partial<MyRun> = {}): MyRun => ({
  lan: { id: 3, name: "LAN d'automne", startsAt: '2026-11-07T14:00:00+01:00', endsAt: '2026-11-08T04:00:00+01:00' },
  riotId: 'Moi#EUW',
  joined: true,
  run: run(),
  sabotageTargets: [],
  ...overrides
})

export const currentLan = (status: 'upcoming' | 'in_progress' = 'in_progress'): CurrentLan => ({
  lan: {
    id: 3,
    name: "LAN d'automne",
    startsAt: '2026-11-07T14:00:00+01:00',
    endsAt: '2026-11-08T04:00:00+01:00',
    status,
    queues: [{ id: 2400, label: 'ARAM du chaos' }]
  },
  riotIds: ['Moi#EUW']
})

export const catalogue = (): CardCatalogue => ({
  cards: [card(), pickpocket, curse],
  rarities: [
    { rarity: 'silver', points: 10, drawWeight: 62 },
    { rarity: 'gold', points: 25, drawWeight: 28 },
    { rarity: 'prismatic', points: 60, drawWeight: 7 },
    { rarity: 'saboteur', points: 40, drawWeight: 3 }
  ],
  rules: { initialRerolls: 3, roundBonusPercent: 50, cursePercent: 50 }
})

export const standing = (overrides: Partial<StandingEntry> = {}): StandingEntry => ({
  rank: 1,
  riotId: 'Ami#EUW',
  joined: true,
  score: 35,
  successes: 2,
  roundsPlayed: 3,
  rerollsLeft: 2,
  cardChosen: false,
  cardLocked: false,
  ...overrides
})

export const feedEntry = (overrides: Partial<FeedEntry> = {}): FeedEntry => ({
  kind: 'round',
  riotId: 'Ami#EUW',
  card: card(),
  gameId: 'EUW1_1',
  verdict: 'success',
  points: 10,
  roundBonus: false,
  curseApplied: false,
  occurredAt: '2026-11-07T21:12:00+01:00',
  ...overrides
})
