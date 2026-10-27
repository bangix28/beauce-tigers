import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OfferPicker from './OfferPicker.vue'
import { card, curse, pickpocket } from '@/test/lanFixtures'

const targets = [
  { riotId: 'Ami#EUW', canBePickpocketed: true },
  { riotId: 'Fauche#EUW', canBePickpocketed: false }
]

const mountPicker = (offer = [card(), pickpocket, curse]) =>
  mount(OfferPicker, { props: { offer, rerollsLeft: 2, targets } })

const targetButton = (wrapper: ReturnType<typeof mountPicker>, riotId: string) =>
  wrapper.find(`[data-riot-id="${riotId}"]`)

describe('OfferPicker', () => {
  it('demande une confirmation avant de choisir une carte de match', async () => {
    const wrapper = mountPicker()

    await wrapper.find('[data-test="pick-0"]').trigger('click')
    expect(wrapper.emitted('pick')).toBeUndefined()
    expect(wrapper.find('[data-test="pick-confirmation"]').text()).toContain('définitif')

    await wrapper.find('[data-test="confirm-pick"]').trigger('click')
    expect(wrapper.emitted('pick')).toEqual([[{ slot: 0 }]])
  })

  it('une carte qui vise un joueur exige une cible avant confirmation', async () => {
    const wrapper = mountPicker()

    await wrapper.find('[data-test="pick-1"]').trigger('click')
    const confirm = wrapper.find('[data-test="confirm-pick"]')
    expect(confirm.attributes('disabled')).toBeDefined()

    await targetButton(wrapper, 'Ami#EUW').trigger('click')
    expect(confirm.attributes('disabled')).toBeUndefined()

    await confirm.trigger('click')
    expect(wrapper.emitted('pick')).toEqual([[{ slot: 1, target: 'Ami#EUW' }]])
  })

  it('le Pickpocket ne peut pas viser un joueur sans relance', async () => {
    const wrapper = mountPicker()

    await wrapper.find('[data-test="pick-1"]').trigger('click')

    expect(targetButton(wrapper, 'Fauche#EUW').attributes('disabled')).toBeDefined()
    expect(targetButton(wrapper, 'Ami#EUW').attributes('disabled')).toBeUndefined()
  })

  it('la Malédiction peut viser un joueur sans relance', async () => {
    const wrapper = mountPicker()

    await wrapper.find('[data-test="pick-2"]').trigger('click')
    await targetButton(wrapper, 'Fauche#EUW').trigger('click')
    await wrapper.find('[data-test="confirm-pick"]').trigger('click')

    expect(wrapper.emitted('pick')).toEqual([[{ slot: 2, target: 'Fauche#EUW' }]])
  })

  it('la relecture périodique (même offre, nouveau tableau) garde la confirmation et la cible', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="pick-1"]').trigger('click')
    await targetButton(wrapper, 'Ami#EUW').trigger('click')

    await wrapper.setProps({ offer: [card(), { ...pickpocket }, { ...curse }] })

    expect(wrapper.find('[data-test="pick-confirmation"]').exists()).toBe(true)
    await wrapper.find('[data-test="confirm-pick"]').trigger('click')
    expect(wrapper.emitted('pick')).toEqual([[{ slot: 1, target: 'Ami#EUW' }]])
  })

  it('une offre différente (relance) annule la sélection', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="pick-1"]').trigger('click')

    await wrapper.setProps({ offer: [card(), card({ code: 'blitz' }), curse] })

    expect(wrapper.find('[data-test="pick-confirmation"]').exists()).toBe(false)
  })

  it('nomme l\'action du saboteur sur le bouton de confirmation', async () => {
    const wrapper = mountPicker()
    const confirm = () => wrapper.find('[data-test="confirm-pick"]')

    await wrapper.find('[data-test="pick-1"]').trigger('click')
    await targetButton(wrapper, 'Ami#EUW').trigger('click')
    expect(confirm().text()).toBe('Faire les poches à Ami#EUW')

    await wrapper.find('[data-test="pick-2"]').trigger('click')
    await targetButton(wrapper, 'Fauche#EUW').trigger('click')
    expect(confirm().text()).toBe('Maudire Fauche#EUW')

    await wrapper.find('[data-test="pick-0"]').trigger('click')
    expect(confirm().text()).toBe('Oui, je la joue')
  })

  it('marque la carte choisie et estompe les autres', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="pick-0"]').trigger('click')

    expect(wrapper.find('[data-test="pick-0"]').attributes('aria-checked')).toBe('true')
    expect(wrapper.find('[data-test="pick-1"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.findAll('.lan-card--dimmed')).toHaveLength(2)
  })

  it('« Je réfléchis encore » referme la confirmation sans choisir', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="pick-0"]').trigger('click')

    const buttons = wrapper.findAll('[data-test="pick-confirmation"] button')
    const cancel = buttons[buttons.length - 1]
    expect(cancel.text()).toBe('Je réfléchis encore')
    await cancel.trigger('click')

    expect(wrapper.find('[data-test="pick-confirmation"]').exists()).toBe(false)
    expect(wrapper.emitted('pick')).toBeUndefined()
  })

  it('affiche l\'attente dans le bouton de confirmation pendant l\'action', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="pick-0"]').trigger('click')
    await wrapper.setProps({ busy: true })

    const confirm = wrapper.find('[data-test="confirm-pick"]')
    expect(confirm.attributes('aria-busy')).toBe('true')
    expect(confirm.attributes('disabled')).toBeDefined()
    expect(confirm.text()).toContain('Ça mélange')
  })

  it('émet la relance de l\'emplacement cliqué', async () => {
    const wrapper = mountPicker()
    await wrapper.find('[data-test="reroll-2"]').trigger('click')

    expect(wrapper.emitted('reroll')).toEqual([[2]])
  })

  describe('distribution', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('distribue la nouvelle offre face cachée puis la retourne', async () => {
      vi.useFakeTimers()
      const wrapper = mountPicker()
      expect(wrapper.findAll('.lan-card--face-down')).toHaveLength(3)

      await vi.runAllTimersAsync()
      expect(wrapper.findAll('.lan-card--face-down')).toHaveLength(0)
    })

    it('une relance ne retourne que la carte remplacée', async () => {
      vi.useFakeTimers()
      const wrapper = mountPicker()
      await vi.runAllTimersAsync()

      await wrapper.setProps({ offer: [card(), card({ code: 'blitz' }), curse] })

      const faceDown = wrapper.findAll('.lan-card--face-down')
      expect(faceDown).toHaveLength(1)
      expect(faceDown[0].attributes('data-code')).toBe('blitz')
    })
  })

  it('désactive la relance quand il n\'en reste plus', () => {
    const wrapper = mount(OfferPicker, {
      props: { offer: [card(), card(), card()], rerollsLeft: 0 }
    })

    expect(wrapper.find('[data-test="reroll-0"]').attributes('disabled')).toBeDefined()
  })
})
