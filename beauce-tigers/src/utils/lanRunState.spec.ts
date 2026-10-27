import { describe, expect, it } from 'vitest'
import { curseEffectLabel, isTargetSelectable, readRunScreen } from './lanRunState'
import { card, catalogue, curse, myRun, pickpocket, result, run } from '@/test/lanFixtures'

describe('readRunScreen', () => {
  it('propose de rejoindre tant que le joueur n\'a pas rejoint', () => {
    expect(readRunScreen(myRun({ joined: false, run: null }))).toEqual({ kind: 'not_joined' })
  })

  it('affiche l\'offre de 3 cartes, sans résultat avant la première manche', () => {
    const screen = readRunScreen(myRun())

    expect(screen.kind).toBe('offer')
    expect(screen.kind === 'offer' && screen.offer).toHaveLength(3)
    expect(screen.kind === 'offer' && screen.lastResult).toBeNull()
  })

  it('carte choisie, partie pas encore lancée', () => {
    const active = card({ code: 'blitz' })
    const screen = readRunScreen(myRun({ run: run({ offer: null, activeCard: active }) }))

    expect(screen).toEqual({ kind: 'card_chosen', card: active })
  })

  it('carte verrouillée : en partie', () => {
    const active = card({ code: 'blitz' })
    const screen = readRunScreen(
      myRun({ run: run({ offer: null, activeCard: active, cardLocked: true }) })
    )

    expect(screen).toEqual({ kind: 'in_game', card: active })
  })

  it('nouvelle offre après un match : met en avant le dernier résultat', () => {
    const last = result({ gameId: 'EUW1_2', verdict: 'failure', points: 0 })
    const screen = readRunScreen(myRun({ run: run({ results: [result(), last] }) }))

    expect(screen.kind).toBe('offer')
    expect(screen.kind === 'offer' && screen.lastResult).toBe(last)
  })

  it('ni offre ni carte : attente de la prochaine relecture', () => {
    expect(readRunScreen(myRun({ run: run({ offer: null }) }))).toEqual({ kind: 'waiting' })
  })
})

describe('isTargetSelectable', () => {
  const broke = { riotId: 'Fauché#EUW', canBePickpocketed: false }

  it('le Pickpocket ne vise pas un joueur sans relance', () => {
    expect(isTargetSelectable(pickpocket, broke)).toBe(false)
  })

  it('la Malédiction peut le viser', () => {
    expect(isTargetSelectable(curse, broke)).toBe(true)
  })
})

describe('curseEffectLabel', () => {
  it('lit le pourcentage dans les règles de l\'API', () => {
    expect(curseEffectLabel(catalogue())).toBe('points divisés par deux')

    const other = catalogue()
    other.rules.cursePercent = 25
    expect(curseEffectLabel(other)).toBe('points réduits à 25 %')
  })
})
