import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RunStepper from './RunStepper.vue'

describe('RunStepper', () => {
  it('signale l\'étape en cours et marque les précédentes comme faites', () => {
    const wrapper = mount(RunStepper, { props: { step: 'play' } })

    expect(wrapper.find('[aria-current="step"]').attributes('data-step')).toBe('play')
    expect(wrapper.find('[data-step="choose"]').text()).toContain('(fait)')
    expect(wrapper.find('[data-step="verdict"]').text()).not.toContain('(fait)')
  })

  it('remplit la barre selon l\'étape', async () => {
    const wrapper = mount(RunStepper, { props: { step: 'choose' } })
    expect(wrapper.attributes('style')).toContain('--progress: 0')

    await wrapper.setProps({ step: 'verdict' })
    expect(wrapper.attributes('style')).toContain('--progress: 1')
  })
})
