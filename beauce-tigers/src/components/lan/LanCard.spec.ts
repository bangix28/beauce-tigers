import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanCard from './LanCard.vue'
import { card, whereIsMama } from '@/test/lanFixtures'

describe('LanCard', () => {
  it('une carte Lien garde sa rareté et porte le badge « Lien »', () => {
    const wrapper = mount(LanCard, { props: { card: whereIsMama } })

    expect(wrapper.classes()).toContain('lan-card--silver')
    expect(wrapper.classes()).toContain('lan-card--bond')
    expect(wrapper.find('[data-test="card-theme"]').text()).toBe('Lien')
  })

  it('une carte sans thème n\'a pas de badge', () => {
    const wrapper = mount(LanCard, { props: { card: card() } })

    expect(wrapper.classes()).not.toContain('lan-card--bond')
    expect(wrapper.find('[data-test="card-theme"]').exists()).toBe(false)
  })

  it('un thème inconnu du front s\'affiche sans badge, sans planter', () => {
    const wrapper = mount(LanCard, { props: { card: { ...card(), theme: 'futur_theme' } } })

    expect(wrapper.find('[data-test="card-theme"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Doublé')
  })
})
