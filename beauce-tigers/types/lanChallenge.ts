// Contrat des défis de LAN exposés par l'api-bot : docs/front/defis-lan.md.
// Toute la logique de jeu (tirages, verdicts, points) vit côté API : le front
// ne fait que lire ces formes et les afficher.

import type { LanSummary } from './player'

/** File où les parties de la LAN comptent : 2400 ARAM du chaos, 420 classée solo/duo, 440 classée flexible */
export interface LanQueue {
  id: number
  label: string
}

/** LAN du joueur connecté : en cours, sinon la prochaine. Une LAN terminée n'y figure plus */
export interface CurrentLan {
  /** null : inscrit à aucune LAN en cours ou à venir */
  lan: (LanSummary & { status: 'upcoming' | 'in_progress'; queues: LanQueue[] }) | null
  /** Comptes du joueur inscrits à cette LAN */
  riotIds: string[]
}

export type CardRarity ='silver' | 'gold' | 'prismatic' | 'saboteur'
export type Verdict = 'success' | 'failure' | 'unknown'

/** Une carte a la même forme partout : offre, carte active, résultats, fil */
export interface ChallengeCard {
  /** Stable : clé des icônes et animations, jamais `label` */
  code: string
  label: string
  description: string
  rarity: CardRarity
  points: number
  /** Carte saboteur : ne jamais l'afficher aux autres joueurs */
  secret: boolean
  /** Choisir cette carte demande une cible parmi `sabotageTargets` */
  needsTarget: boolean
}

export interface RoundResult {
  gameId: string
  card: ChallengeCard
  verdict: Verdict
  points: number
  /** +roundBonusPercent : au moins deux joueurs sur le match, tous ont réussi */
  roundBonus: boolean
  /** Le joueur était maudit : points réduits à cursePercent % */
  curseApplied: boolean
}

export interface PlayerRun {
  score: number
  rerollsLeft: number
  /** 3 cartes, ou null une fois la carte choisie */
  offer: ChallengeCard[] | null
  activeCard: ChallengeCard | null
  /** Vrai dès le lancement de la partie : la carte est jouée sur ce match */
  cardLocked: boolean
  /** Ordre chronologique : le dernier résultat est en fin de tableau */
  results: RoundResult[]
}

export interface SabotageTarget {
  riotId: string
  /** false : plus de relance à voler, le Pickpocket ne peut pas le viser */
  canBePickpocketed: boolean
}

export interface MyRun {
  lan: LanSummary
  riotId: string
  joined: boolean
  /** null tant que joined vaut false */
  run: PlayerRun | null
  /** Rempli seulement quand l'offre contient une carte qui vise un joueur */
  sabotageTargets: SabotageTarget[]
}

export interface RarityRule {
  rarity: CardRarity
  points: number
  /** Chance, sur 100, qu'un emplacement d'offre tire cette rareté */
  drawWeight: number
}

export interface CardCatalogue {
  cards: ChallengeCard[]
  rarities: RarityRule[]
  rules: {
    initialRerolls: number
    roundBonusPercent: number
    cursePercent: number
  }
}

export interface StandingEntry {
  rank: number
  riotId: string
  joined: boolean
  score: number
  successes: number
  roundsPlayed: number
  rerollsLeft: number
  /** null aussi quand la carte est secrète (voir secretCard) */
  activeCard: ChallengeCard | null
  secretCard: boolean
  cardLocked: boolean
}

export interface LanStandings {
  lan: LanSummary
  entries: StandingEntry[]
}

export interface FeedEntry {
  kind: 'round' | 'sabotage'
  /** round : le joueur de la manche ; sabotage : la CIBLE, jamais le saboteur */
  riotId: string
  card: ChallengeCard
  gameId: string | null
  verdict: Verdict | null
  points: number
  roundBonus: boolean
  curseApplied: boolean
  occurredAt: string
}

export interface LanFeed {
  entries: FeedEntry[]
}

export interface PickPayload {
  slot: number
  target?: string
}
