import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanStandingsTable from './LanStandingsTable.vue'
import { card, standing } from '@/test/lanFixtures'

describe('LanStandingsTable', () => {
  it('affiche « Toi » pour le joueur connecté', () => {
    const wrapper = mount(LanStandingsTable, {
      props: {
        entries: [standing(), standing({ rank: 2, riotId: 'Moi#EUW' })],
        myRiotId: 'Moi#EUW'
      }
    })

    const rows = wrapper.findAll('li')
    expect(rows[0].text()).toContain('Ami#EUW')
    expect(rows[1].text()).toContain('Toi')
    expect(rows[1].text()).not.toContain('Moi#EUW')
  })

  it('accorde le nombre de défis réussis', () => {
    const wrapper = mount(LanStandingsTable, {
      props: {
        entries: [standing({ successes: 1 }), standing({ rank: 2, riotId: 'B#EUW', successes: 2 })]
      }
    })

    const rows = wrapper.findAll('li')
    expect(rows[0].text()).toContain('1 défi réussi')
    expect(rows[1].text()).toContain('2 défis réussis')
  })

  it('ne révèle jamais une carte secrète', () => {
    const wrapper = mount(LanStandingsTable, {
      props: { entries: [standing({ secretCard: true, activeCard: null, cardLocked: true })] }
    })

    expect(wrapper.text()).toContain('En partie · Carte secrète')
    expect(wrapper.text()).not.toContain(card().label)
  })
})
