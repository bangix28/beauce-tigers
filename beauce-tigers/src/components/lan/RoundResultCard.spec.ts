import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RoundResultCard from './RoundResultCard.vue'
import { card, catalogue, result } from '@/test/lanFixtures'

describe('RoundResultCard', () => {
  it('annonce clairement une malédiction subie', () => {
    const wrapper = mount(RoundResultCard, {
      props: { result: result({ points: 5, curseApplied: true }), catalogue: catalogue() }
    })

    expect(wrapper.find('[data-test="curse-applied"]').text()).toBe(
      'Tu étais maudit : points divisés par deux.'
    )
    expect(wrapper.text()).toContain('+5 pts')
  })

  it('n\'affiche rien de la malédiction sans curseApplied', () => {
    const wrapper = mount(RoundResultCard, {
      props: { result: result(), catalogue: catalogue() }
    })

    expect(wrapper.find('[data-test="curse-applied"]').exists()).toBe(false)
  })

  it('affiche le bonus de manche avec le pourcentage des règles', () => {
    const wrapper = mount(RoundResultCard, {
      props: { result: result({ roundBonus: true }), catalogue: catalogue() }
    })

    expect(wrapper.find('[data-test="round-bonus"]').text()).toContain('+50 %')
  })

  it('félicite un défi réussi et compte ses points', () => {
    const wrapper = mount(RoundResultCard, {
      props: { result: result({ points: 25 }), catalogue: catalogue() }
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('Bien joué !')
    expect(wrapper.text()).toContain('+25 pts')
  })

  it('une prismatique ratée rappelle la relance rendue', () => {
    const wrapper = mount(RoundResultCard, {
      props: {
        result: result({ verdict: 'failure', points: 0, card: card({ rarity: 'prismatic' }) }),
        catalogue: catalogue()
      }
    })

    expect(wrapper.text()).toContain('une prismatique ratée te rend une relance')
  })

  it('rassure quand la partie n\'a pas pu être lue', () => {
    const wrapper = mount(RoundResultCard, {
      props: { result: result({ verdict: 'unknown', points: 0 }), catalogue: catalogue() }
    })

    expect(wrapper.text()).toContain('ta relance t\'est rendue')
    expect(wrapper.find('.round-result__score').exists()).toBe(false)
  })
})
