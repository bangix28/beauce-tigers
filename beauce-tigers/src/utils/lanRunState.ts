import type {
  CardCatalogue,
  ChallengeCard,
  MyRun,
  RoundResult,
  SabotageTarget
} from '../../types/lanChallenge'

// Lecture de l'état du parcours renvoyé par GET /me (docs/front/defis-lan.md § 7).
// Aucune règle de jeu ici : on se contente de dire QUEL écran afficher.

export type RunScreen =
  /** joined: false — bouton « Rejoindre les défis » */
  | { kind: 'not_joined' }
  /** 3 cartes à choisir ; lastResult : la manche précédente, à mettre en avant */
  | { kind: 'offer'; offer: ChallengeCard[]; lastResult: RoundResult | null }
  /** Carte choisie, la partie n'est pas encore lancée */
  | { kind: 'card_chosen'; card: ChallengeCard }
  /** Carte verrouillée sur un match en cours : on attend le règlement */
  | { kind: 'in_game'; card: ChallengeCard }
  /** Ni offre ni carte : état transitoire, la prochaine relecture tranchera */
  | { kind: 'waiting' }

export const readRunScreen = (myRun: MyRun): RunScreen => {
  const run = myRun.run
  if (!myRun.joined || !run) return { kind: 'not_joined' }

  if (run.offer?.length) {
    return { kind: 'offer', offer: run.offer, lastResult: run.results[run.results.length - 1] ?? null }
  }
  if (run.activeCard) {
    return run.cardLocked
      ? { kind: 'in_game', card: run.activeCard }
      : { kind: 'card_chosen', card: run.activeCard }
  }
  return { kind: 'waiting' }
}

/** Code stable de la carte qui vole une relance (seul cas où une cible se désactive) */
export const PICKPOCKET_CODE = 'pickpocket'

/** Le Pickpocket ne peut viser qu'un joueur qui a encore une relance ; la Malédiction vise tout le monde */
export const isTargetSelectable = (card: ChallengeCard, target: SabotageTarget): boolean =>
  card.code !== PICKPOCKET_CODE || target.canBePickpocketed

/** « divisés par deux » pour 50 %, sinon le pourcentage brut venu de l'API */
export const curseEffectLabel = (catalogue: CardCatalogue | null): string => {
  const percent = catalogue?.rules.cursePercent
  if (percent == null) return 'points réduits'
  return percent === 50 ? 'points divisés par deux' : `points réduits à ${percent} %`
}
