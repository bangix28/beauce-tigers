import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiscordCallback from '@/views/DiscordCallback.vue'
import apiClient from './http'
import { playerDataAPI } from './apiPlayer'
import { discordPlayerAPI } from './apiDiscordPlayer'
import { lanChallengeAPI } from './apiLanChallenge'
import { playerToken } from './playerHttp'
import { usePlayerAuthStore } from '@/stores/playerAuthStore'
import { navigateTo } from '@/utils/browserNavigation'
import { simulateApi, simulatePlayerApi } from '@/test/playerApi'

// Cycle de vie du jeton du joueur, de bout en bout côté front : seuls le HTTP
// et la sortie vers Discord sont simulés.
vi.mock('@/utils/browserNavigation', () => ({ navigateTo: vi.fn() }))

const PLAYER_JWT = 'joueur.header.signature'
const OK = { status: 200, data: { discordId: '1', discordUsername: 'pseudo', riotIds: [] } }

describe('jeton du joueur', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    playerToken.value = PLAYER_JWT
  })

  afterEach(() => {
    delete apiClient.defaults.headers.common.Authorization
  })

  it('toute requête joueur envoie Authorization: Bearer <jeton>', async () => {
    const api = simulatePlayerApi(OK)

    await discordPlayerAPI.getProfile()
    await discordPlayerAPI.linkRiotAccount('Pseudo#EUW')
    await lanChallengeAPI.getMyRun(3)
    await lanChallengeAPI.pick(3, { slot: 0 })

    expect(api.requests.map((request) => request.authorization)).toEqual(
      Array(4).fill(`Bearer ${PLAYER_JWT}`)
    )
  })

  it('les requêtes du compte API (classements) n\'envoient jamais le jeton du joueur', async () => {
    const classements = simulateApi(apiClient, { status: 200, data: [] })

    await playerDataAPI.getAll()

    expect(classements.requests).toHaveLength(1)
    expect(classements.requests[0].authorization).toBeNull()
  })

  it('et inversement : une requête joueur ne porte que le jeton du joueur', async () => {
    // Même si un en-tête traînait sur le client des classements, il ne fuit pas
    apiClient.defaults.headers.common.Authorization = 'Bearer compte-api-du-front'
    const api = simulatePlayerApi(OK)

    await discordPlayerAPI.getProfile()

    expect(api.requests[0].authorization).toBe(`Bearer ${PLAYER_JWT}`)
  })

  it('la déconnexion efface le jeton : plus aucun Bearer envoyé', async () => {
    usePlayerAuthStore().logout()
    await flushPromises()
    const api = simulatePlayerApi(OK)

    expect(playerToken.value).toBeNull()
    expect(sessionStorage.getItem('playerToken')).toBeNull()
    await discordPlayerAPI.getProfile()
    expect(api.requests[0].authorization).toBeNull()
  })

  it('un 401 relance Discord avec prompt=none, puis ramène le joueur là où il était', async () => {
    window.history.replaceState(null, '', '/lan?onglet=2')

    // 1. Jeton expiré : la route joueur répond 401
    simulatePlayerApi({ status: 401, data: { code: 'unauthorized', message: 'Session expirée.' } })
    void discordPlayerAPI.getProfile()
    await flushPromises()

    expect(playerToken.value).toBeNull()
    const toDiscord = new URL(vi.mocked(navigateTo).mock.lastCall![0])
    expect(toDiscord.searchParams.get('prompt')).toBe('none')
    const state = toDiscord.searchParams.get('state')!

    // 2. Discord revient sans écran d'autorisation : la page de retour échange le code
    const api = simulatePlayerApi({
      status: 200,
      data: { token: 'nouveau.jeton.joueur', player: OK.data }
    })
    const router = { replace: vi.fn() }
    mount(DiscordCallback, {
      global: { mocks: { $route: { query: { code: 'code-silencieux', state } }, $router: router } }
    })
    await flushPromises()

    expect(api.requests).toEqual([
      expect.objectContaining({ method: 'post', body: { code: 'code-silencieux' } })
    ])
    expect(playerToken.value).toBe('nouveau.jeton.joueur')
    expect(router.replace).toHaveBeenCalledWith('/lan?onglet=2')
  })
})
