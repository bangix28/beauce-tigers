import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LanChallenges from './LanChallenges.vue'
import { lanChallengeAPI } from '@/api/apiLanChallenge'
import { ApiError } from '@/api/playerHttp'
import {
  card,
  catalogue,
  curse,
  currentLan,
  myRun,
  pickpocket,
  result,
  run
} from '@/test/lanFixtures'
import type { FeedEntry } from '../../types/lanChallenge'

vi.mock('@/api/apiLanChallenge', () => ({
  lanChallengeAPI: {
    getCurrentLan: vi.fn(),
    getCatalogue: vi.fn(),
    getMyRun: vi.fn(),
    join: vi.fn(),
    pick: vi.fn(),
    reroll: vi.fn(),
    getStandings: vi.fn(),
    getFeed: vi.fn()
  }
}))

const api = vi.mocked(lanChallengeAPI)

const sabotageEntry = (overrides: Partial<FeedEntry> = {}): FeedEntry => ({
  kind: 'sabotage',
  riotId: 'Moi#EUW',
  card: pickpocket,
  gameId: null,
  verdict: null,
  points: 0,
  roundBonus: false,
  curseApplied: false,
  occurredAt: '2026-11-07T20:00:00+01:00',
  ...overrides
})
let wrapper: VueWrapper | null = null

const mountPage = async () => {
  wrapper = mount(LanChallenges, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } }
  })
  await flushPromises()
  return wrapper
}

describe('LanChallenges', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.getCurrentLan.mockResolvedValue(currentLan())
    api.getCatalogue.mockResolvedValue(catalogue())
    api.getMyRun.mockResolvedValue(myRun())
    api.getStandings.mockResolvedValue({ lan: myRun().lan, entries: [] })
    api.getFeed.mockResolvedValue({ entries: [] })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  describe('point d\'entrée : la LAN du joueur', () => {
    it('sans LAN, l\'annonce sans rien charger d\'autre', async () => {
      api.getCurrentLan.mockResolvedValue({ lan: null, riotIds: [] })

      const page = await mountPage()

      expect(page.find('[data-test="no-lan"]').text()).toContain('Aucune LAN prévue pour toi')
      expect(api.getMyRun).not.toHaveBeenCalled()
    })

    it('LAN à venir : nom et date de début, pas de parcours', async () => {
      api.getCurrentLan.mockResolvedValue(currentLan('upcoming'))

      const page = await mountPage()

      expect(page.find('[data-test="lan-upcoming"]').text()).toContain("LAN d'automne")
      expect(page.find('[data-test="lan-upcoming"]').text()).toContain('07/11/2026')
      expect(api.getMyRun).not.toHaveBeenCalled()
    })

    it('LAN en cours : ouvre le parcours avec le lanId renvoyé', async () => {
      await mountPage()

      expect(api.getMyRun).toHaveBeenCalledWith(3)
      expect(api.getStandings).toHaveBeenCalledWith(3)
    })
  })

  describe('les états du parcours', () => {
    it('pas encore rejoint : bouton Rejoindre qui appelle join', async () => {
      api.getMyRun.mockResolvedValue(myRun({ joined: false, run: null }))
      api.join.mockResolvedValue(myRun())

      const page = await mountPage()
      await page.find('[data-test="screen-not-joined"] button').trigger('click')
      await flushPromises()

      expect(api.join).toHaveBeenCalledWith(3)
      expect(page.find('[data-test="screen-offer"]').exists()).toBe(true)
    })

    it('offre : score, relances et 3 cartes', async () => {
      api.getMyRun.mockResolvedValue(myRun({ run: run({ score: 37, rerollsLeft: 2 }) }))

      const page = await mountPage()

      expect(page.find('[data-test="screen-offer"]').exists()).toBe(true)
      expect(page.find('[data-test="score"]').text()).toBe('37')
      expect(page.find('[data-test="rerolls"]').text()).toBe('2')
      expect(page.findAll('[data-test^="pick-"]')).toHaveLength(3)
    })

    it('carte choisie : invite à lancer la partie', async () => {
      api.getMyRun.mockResolvedValue(myRun({ run: run({ offer: null, activeCard: card() }) }))

      const page = await mountPage()

      expect(page.find('[data-test="screen-card_chosen"]').text()).toContain('Lance ta partie')
      expect(page.find('[data-test="screen-card_chosen"]').text()).toContain('Ton agent tourne ?')
    })

    it('carte verrouillée : en partie', async () => {
      api.getMyRun.mockResolvedValue(
        myRun({ run: run({ offer: null, activeCard: card(), cardLocked: true }) })
      )

      const page = await mountPage()

      expect(page.find('[data-test="screen-in_game"]').text()).toContain('En partie')
    })

    it('nouvelle offre après un match : dernier résultat maudit mis en avant', async () => {
      api.getMyRun.mockResolvedValue(
        myRun({ run: run({ results: [result({ points: 5, curseApplied: true })] }) })
      )

      const page = await mountPage()

      expect(page.find('[data-test="last-result"]').text()).toContain(
        'Tu étais maudit : points divisés par deux'
      )
    })
  })

  describe('carte qui vise un joueur', () => {
    it('envoie la cible puis enchaîne « Sabotage effectué » sur l\'offre neuve', async () => {
      api.getMyRun.mockResolvedValue(
        myRun({
          run: run({ offer: [card(), pickpocket, card({ code: 'blitz' })], results: [result()] }),
          sabotageTargets: [{ riotId: 'Ami#EUW', canBePickpocketed: true }]
        })
      )
      api.pick.mockResolvedValue(myRun({ run: run({ rerollsLeft: 3, results: [result()] }) }))

      const page = await mountPage()
      await page.find('[data-test="pick-1"]').trigger('click')
      await page.find('[data-riot-id="Ami#EUW"]').trigger('click')
      await page.find('[data-test="confirm-pick"]').trigger('click')
      await flushPromises()

      expect(api.pick).toHaveBeenCalledWith(3, { slot: 1, target: 'Ami#EUW' })
      const done = page.find('[data-test="sabotage-done"]')
      expect(done.attributes('role')).toBe('status')
      expect(done.text()).toContain('Ami#EUW perd une relance')
      // Le toast ne remplace plus la dernière manche
      expect(page.find('[data-test="last-result"]').exists()).toBe(true)
      expect(page.find('[data-test="screen-offer"]').text()).toContain('Choisis ta carte pour ce match')
    })

    it('Malédiction : le toast annonce la cible maudite', async () => {
      api.getMyRun.mockResolvedValue(
        myRun({
          run: run({ offer: [curse, card(), card({ code: 'blitz' })] }),
          sabotageTargets: [{ riotId: 'Ami#EUW', canBePickpocketed: false }]
        })
      )
      api.pick.mockResolvedValue(myRun())

      const page = await mountPage()
      await page.find('[data-test="pick-0"]').trigger('click')
      await page.find('[data-riot-id="Ami#EUW"]').trigger('click')
      await page.find('[data-test="confirm-pick"]').trigger('click')
      await flushPromises()

      expect(page.find('[data-test="sabotage-done"]').text()).toContain(
        'Ami#EUW est maudit… et ne le sait pas encore.'
      )
    })
  })

  describe('côté victime', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('un Pickpocket arrivé au fil depuis l\'arrivée sur la page déclenche un toast', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      // Ancien vol déjà au fil à l'arrivée : pas une nouvelle
      api.getFeed.mockResolvedValue({ entries: [sabotageEntry({ occurredAt: '2026-11-07T19:00:00+01:00' })] })

      const page = await mountPage()
      expect(page.text()).not.toContain('Quelqu\'un t\'a fait les poches')

      api.getFeed.mockResolvedValue({
        entries: [
          sabotageEntry(),
          sabotageEntry({ riotId: 'Ami#EUW', occurredAt: '2026-11-07T20:05:00+01:00' }),
          sabotageEntry({ occurredAt: '2026-11-07T19:00:00+01:00' })
        ]
      })
      vi.advanceTimersByTime(15 * 1000)
      await flushPromises()

      const toasts = page.findAll('[role="status"]').filter((t) =>
        t.text().includes('Quelqu\'un t\'a fait les poches… une relance en moins.')
      )
      expect(toasts).toHaveLength(1)
    })
  })

  describe('erreurs des actions', () => {
    it('après un 409, affiche le message et relit le parcours', async () => {
      api.pick.mockRejectedValue(new ApiError(409, 'no_offer', 'Aucune offre en cours.'))

      const page = await mountPage()
      api.getMyRun.mockResolvedValue(
        myRun({ run: run({ offer: null, activeCard: card(), cardLocked: true }) })
      )
      await page.find('[data-test="pick-0"]').trigger('click')
      await page.find('[data-test="confirm-pick"]').trigger('click')
      await flushPromises()

      expect(page.find('[data-test="action-error"]').text()).toContain('Aucune offre en cours.')
      expect(page.find('[data-test="action-error"]').attributes('role')).toBe('alert')
      expect(api.getMyRun).toHaveBeenCalledTimes(2)
      expect(page.find('[data-test="screen-in_game"]').exists()).toBe(true)
    })

    it('LAN terminée : on consulte encore mais les actions sont désactivées', async () => {
      api.reroll.mockRejectedValue(new ApiError(409, 'lan_finished', 'La LAN est terminée.'))

      const page = await mountPage()
      await page.find('[data-test="reroll-0"]').trigger('click')
      await flushPromises()

      expect(page.find('[data-test="lan-finished"]').exists()).toBe(true)
      expect(page.find('[data-test="pick-0"]').attributes('disabled')).toBeDefined()
    })

    it('joueur non inscrit à la LAN : message bloquant', async () => {
      api.getMyRun.mockRejectedValue(
        new ApiError(403, 'not_a_participant', 'Aucun de tes comptes n\'est inscrit à cette LAN.')
      )

      const page = await mountPage()

      expect(page.find('[data-test="page-error"]').text()).toContain('inscrit à cette LAN')
    })
  })
})
