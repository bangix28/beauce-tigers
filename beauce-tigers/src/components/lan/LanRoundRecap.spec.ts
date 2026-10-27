import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanRoundRecap from './LanRoundRecap.vue'
import { FEED_RECAP_LIMIT } from '@/utils/roundRecap'
import { card, feedEntry, pickpocket, standing } from '@/test/lanFixtures'

const FEED = [
  feedEntry({
    riotId: 'Rival#EUW',
    gameId: 'EUW1_2',
    card: card({ code: 'blitz', label: 'Blitz', rarity: 'prismatic' }),
    verdict: 'failure',
    points: 0,
    occurredAt: '2026-11-07T22:05:00+01:00'
  }),
  feedEntry({
    riotId: 'Moi#EUW',
    gameId: 'EUW1_2',
    card: card({ code: 'triple_kill', label: 'Triplé', rarity: 'gold', points: 25 }),
    points: 12,
    curseApplied: true,
    occurredAt: '2026-11-07T22:04:00+01:00'
  }),
  feedEntry({ kind: 'sabotage', riotId: 'Ami#EUW', card: pickpocket, gameId: null, verdict: null, points: 0 }),
  feedEntry({ riotId: 'Ami#EUW', gameId: 'EUW1_1', points: 15, roundBonus: true, occurredAt: '2026-11-07T21:12:00+01:00' }),
  feedEntry({ riotId: 'Moi#EUW', gameId: 'EUW1_1', points: 15, roundBonus: true, occurredAt: '2026-11-07T21:11:00+01:00' })
]

const STANDINGS = [
  standing({ rank: 1, riotId: 'Ami#EUW', score: 40, successes: 3, roundsPlayed: 4 }),
  standing({ rank: 2, riotId: 'Moi#EUW', score: 27, successes: 2, roundsPlayed: 2 }),
  standing({ rank: 3, riotId: 'Rival#EUW', score: 0, successes: 0, roundsPlayed: 1 }),
  standing({ rank: 4, riotId: 'Absent#EUW', joined: false, score: 0, successes: 0, roundsPlayed: 0 })
]

const mountRecap = (feed = FEED) =>
  mount(LanRoundRecap, { props: { feed, standings: STANDINGS, myRiotId: 'Moi#EUW' } })

describe('LanRoundRecap', () => {
  it('sans manche réglée : état vide, pas d\'onglets', () => {
    const wrapper = mountRecap([FEED[2]])

    expect(wrapper.find('[data-test="recap-empty"]').text()).toContain('Aucune manche jouée')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
  })

  describe('par match (vue par défaut)', () => {
    it('un bloc par match, le plus récent en premier, sabotages exclus', () => {
      const games = mountRecap().findAll('[data-test="recap-game"]')

      expect(games).toHaveLength(2)
      expect(games[0].text()).toContain('Rival#EUW')
      expect(games[0].text()).toContain('Blitz')
      expect(mountRecap().text()).not.toContain('Pickpocket')
    })

    it('le joueur connecté en tête, « Toi », avec malédiction et points', () => {
      const latest = mountRecap().findAll('[data-test="recap-game"]')[0]
      const rows = latest.findAll('.history-row')

      expect(rows[0].text()).toContain('Toi')
      expect(rows[0].text()).toContain('maudit')
      expect(rows[0].text()).toContain('+12')
      expect(rows[1].text()).toContain('raté')
    })

    it('la description de chaque carte est lue sans survol (lecteurs d\'écran)', () => {
      const trigger = mountRecap()
        .findAll('[data-test="recap-game"]')[0]
        .find('.card-peek-trigger')

      expect(trigger.attributes('tabindex')).toBe('0')
      const description = trigger.find(`#${trigger.attributes('aria-describedby')}`)
      expect(description.text()).toBe('Or, 25 points. Réussis un doublé.')
    })

    it('signale le bonus de manche sur le match où il a été gagné', () => {
      const [latest, first] = mountRecap().findAll('[data-test="recap-game"]')

      expect(first.find('[data-test="recap-game-bonus"]').exists()).toBe(true)
      expect(latest.find('[data-test="recap-game-bonus"]').exists()).toBe(false)
    })
  })

  describe('par joueur', () => {
    const openPlayerTab = async () => {
      const wrapper = mountRecap()
      await wrapper.find('[data-test="recap-tab-player"]').trigger('click')
      return wrapper
    }

    it('dans l\'ordre du classement, avec les totaux du classement', async () => {
      const players = (await openPlayerTab()).findAll('[data-test="recap-player"]')

      expect(players.map((player) => player.find('.recap-player__name').text())).toEqual([
        'Ami#EUW',
        'Toi',
        'Rival#EUW',
        'Absent#EUW'
      ])
      // Ami : 40 pts et 3 défis sur 4 manches, même si le fil n'en montre qu'une
      expect(players[0].text()).toContain('40')
      expect(players[0].text()).toContain('3 défis réussis sur 4 manches')
      expect(players[3].text()).toContain('Pas encore dans le jeu')
    })

    it('déplie un joueur pour voir ses manches', async () => {
      const wrapper = await openPlayerTab()
      const ami = wrapper.findAll('[data-test="recap-player"]')[0]
      const toggle = ami.find('[data-test="recap-player-toggle"]')

      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(ami.find('.history-row').exists()).toBe(false)

      await toggle.trigger('click')

      expect(toggle.attributes('aria-expanded')).toBe('true')
      expect(ami.findAll('.history-row')).toHaveLength(1)
      expect(ami.find('.history-row').text()).toContain('bonus')
    })

    it('un joueur qui n\'a pas encore joué l\'annonce une fois déplié', async () => {
      const wrapper = await openPlayerTab()
      const absent = wrapper.findAll('[data-test="recap-player"]')[3]

      await absent.find('[data-test="recap-player-toggle"]').trigger('click')

      expect(absent.text()).toContain('Pas encore joué')
    })
  })

  it('onglets accessibles : flèches du clavier et aria-selected', async () => {
    const wrapper = mountRecap()
    const tabs = () => wrapper.findAll('[role="tab"]')

    expect(tabs().map((tab) => tab.attributes('aria-selected'))).toEqual(['true', 'false'])

    await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(tabs().map((tab) => tab.attributes('aria-selected'))).toEqual(['false', 'true'])
    expect(wrapper.find('[data-test="recap-player"]').exists()).toBe(true)
  })

  it('fil plein : prévient que les manches les plus anciennes ne sont plus là', () => {
    const full = Array.from({ length: FEED_RECAP_LIMIT }, (_, index) =>
      feedEntry({ gameId: `EUW1_${index}`, occurredAt: new Date(Date.UTC(2026, 10, 7, 20, index)).toISOString() })
    )

    expect(mountRecap(FEED).find('[data-test="recap-truncated"]').exists()).toBe(false)
    expect(mountRecap(full).find('[data-test="recap-truncated"]').text()).toContain(
      'Seules les 50 dernières actions'
    )
  })
})
