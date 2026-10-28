import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanQueues from './LanQueues.vue'

const aramMayhem = { id: 2400, label: 'ARAM du chaos' }
const rankedSolo = { id: 420, label: 'Classée solo/duo' }
const rankedFlex = { id: 440, label: 'Classée flexible' }

describe('LanQueues', () => {
  it('liste les files où les défis comptent', () => {
    const wrapper = mount(LanQueues, { props: { queues: [aramMayhem, rankedFlex] } })

    expect(wrapper.findAll('[data-test="lan-queue"]').map((queue) => queue.text())).toEqual([
      'ARAM du chaos',
      'Classée flexible'
    ])
  })

  it("rappelle qu'un agent par partie suffit, lancé avant les 90 s", () => {
    const wrapper = mount(LanQueues, { props: { queues: [aramMayhem] } })

    const agentHint = wrapper.find('[data-test="lan-queues-agent"]').text()
    expect(agentHint).toContain('Un agent par partie suffit')
    expect(agentHint).toContain('90 s')
    expect(agentHint).not.toContain('un agent par duo')
  })

  it('en solo/duo, demande un agent par duo', () => {
    const wrapper = mount(LanQueues, { props: { queues: [aramMayhem, rankedSolo] } })

    expect(wrapper.find('[data-test="lan-queues-agent"]').text()).toContain('un agent par duo')
  })
})
