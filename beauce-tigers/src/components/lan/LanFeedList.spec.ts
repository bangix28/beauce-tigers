import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanFeedList from './LanFeedList.vue'
import { card, feedEntry, pickpocket, whereIsMama } from '@/test/lanFixtures'

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

  it('marque d\'une patte la réussite d\'une carte Lien', () => {
    const wrapper = mount(LanFeedList, {
      props: { entries: [feedEntry({ card: whereIsMama }), feedEntry({ riotId: 'Autre#EUW' })] }
    })

    const items = wrapper.findAll('li')
    expect(items[0].find('[data-test="feed-bond"]').attributes('aria-label')).toBe('carte Lien')
    expect(items[0].text()).toContain('Où est maman ? réussi')
    expect(items[1].find('[data-test="feed-bond"]').exists()).toBe(false)
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
