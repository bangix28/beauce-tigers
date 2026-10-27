import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanFeedList from './LanFeedList.vue'
import { card, feedEntry, pickpocket } from '@/test/lanFixtures'

describe('LanFeedList', () => {
  it('raconte une manche du joueur connecté à la deuxième personne', () => {
    const wrapper = mount(LanFeedList, {
      props: {
        entries: [
          feedEntry({
            riotId: 'Moi#EUW',
            card: card({ label: 'Triplé' }),
            points: 12,
            curseApplied: true
          })
        ],
        myRiotId: 'Moi#EUW'
      }
    })

    expect(wrapper.find('li').text()).toContain('Toi : Triplé réussi, +12 malgré la malédiction')
  })

  it('ne nomme jamais le saboteur', () => {
    const wrapper = mount(LanFeedList, {
      props: {
        entries: [feedEntry({ kind: 'sabotage', riotId: 'Ami#EUW', card: pickpocket, verdict: null })],
        myRiotId: 'Moi#EUW'
      }
    })

    expect(wrapper.text()).toContain('Un saboteur a fait les poches à Ami#EUW')
    expect(wrapper.find('li').attributes('data-verdict')).toBe('sabotage')
  })
})
