import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RerollPips from './RerollPips.vue'

const pips = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[data-test="reroll-pip"]')
const full = (wrapper: ReturnType<typeof mount>) =>
  pips(wrapper).filter((pip) => pip.classes('reroll-pips__pip--full'))

describe('RerollPips', () => {
  it('montre les relances restantes parmi les relances de départ', () => {
    const wrapper = mount(RerollPips, { props: { left: 2, initial: 3 } })

    expect(pips(wrapper)).toHaveLength(3)
    expect(full(wrapper)).toHaveLength(2)
    expect(wrapper.attributes('aria-label')).toBe('Il te reste 2 relances')
  })

  it('ajoute des jetons au-delà du départ quand on en gagne', () => {
    const wrapper = mount(RerollPips, { props: { left: 5, initial: 3 } })

    expect(pips(wrapper)).toHaveLength(5)
    expect(full(wrapper)).toHaveLength(5)
  })

  it('fait réagir le jeton qui vient de changer', async () => {
    const wrapper = mount(RerollPips, { props: { left: 2 } })

    await wrapper.setProps({ left: 1 })
    expect(pips(wrapper)[1].classes()).toContain('reroll-pips__pip--lost')

    await wrapper.setProps({ left: 2 })
    expect(pips(wrapper)[1].classes()).toContain('reroll-pips__pip--gained')
  })

  it('dit clairement quand il n\'en reste plus', () => {
    const wrapper = mount(RerollPips, { props: { left: 0 } })

    expect(full(wrapper)).toHaveLength(0)
    expect(wrapper.attributes('aria-label')).toBe('Plus aucune relance')
  })
})
