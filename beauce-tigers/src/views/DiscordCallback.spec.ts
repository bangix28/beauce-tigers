import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiscordCallback from './DiscordCallback.vue'
import { playerToken } from '@/api/playerHttp'
import { navigateTo } from '@/utils/browserNavigation'
import { simulatePlayerApi } from '@/test/playerApi'

// Ni Discord ni l'API : la sortie vers Discord et les réponses HTTP sont simulées
vi.mock('@/utils/browserNavigation', () => ({ navigateTo: vi.fn() }))

const LOGIN_OK = {
  status: 200,
  data: {
    token: 'header.payload.signature',
    player: { discordId: '80351110224678912', discordUsername: 'pseudo', riotIds: [] }
  }
}

const pendingLogin = (state: string, extra: Record<string, unknown> = {}) =>
  sessionStorage.setItem(
    'discordPendingLogin',
    JSON.stringify({ state, returnTo: '/lan', silent: false, ...extra })
  )

const mountCallback = (query: Record<string, string>) => {
  const router = { replace: vi.fn() }
  const wrapper = mount(DiscordCallback, {
    global: { mocks: { $route: { query }, $router: router } }
  })
  return { wrapper, router }
}

const errorText = (wrapper: ReturnType<typeof mountCallback>['wrapper']) =>
  wrapper.find('[data-test="callback-error"]').text()

describe('DiscordCallback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    playerToken.value = null
  })

  describe('code et state valides', () => {
    it('échange le code en un seul POST, stocke le jeton et ramène le joueur', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('abc')

      const { wrapper, router } = mountCallback({ code: 'code-ok', state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(1)
      expect(api.requests[0]).toMatchObject({
        method: 'post',
        url: `${import.meta.env.VITE_PLAYER_API_URL}/auth/discord`,
        body: { code: 'code-ok' }
      })
      expect(sessionStorage.getItem('playerToken')).toBe('header.payload.signature')
      expect(router.replace).toHaveBeenCalledWith('/lan')
      expect(wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
    })

    it('ignore le paramètre iss ajouté par Discord', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('abc')

      const { router } = mountCallback({
        code: 'code-iss',
        state: 'abc',
        iss: 'https://discord.com'
      })
      await flushPromises()

      expect(api.requests).toHaveLength(1)
      expect(api.requests[0].body).toEqual({ code: 'code-iss' })
      expect(router.replace).toHaveBeenCalledWith('/lan')
    })

    it('n\'envoie le code qu\'une fois malgré une double exécution', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('abc')

      const first = mountCallback({ code: 'code-unique', state: 'abc' })
      const second = mountCallback({ code: 'code-unique', state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(1)
      expect(first.router.replace).toHaveBeenCalledWith('/lan')
      expect(second.router.replace).toHaveBeenCalledWith('/lan')
      expect(second.wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
    })

    it('rouverte après une connexion réussie (state consommé) : aucun appel, aucune erreur', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      playerToken.value = 'header.payload.signature'

      const { wrapper, router } = mountCallback({ code: 'code-deja-consomme', state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(0)
      expect(router.replace).toHaveBeenCalledWith('/')
      expect(wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
    })
  })

  describe('retour refusé avant tout appel', () => {
    it.each([
      ['différent', { code: 'code-forge', state: 'forge' }],
      ['absent', { code: 'code-sans-state' }]
    ])('state %s : aucun appel, message, retour à l\'accueil', async (_, query) => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('attendu')

      const { wrapper, router } = mountCallback(query)
      await flushPromises()

      expect(api.requests).toHaveLength(0)
      expect(errorText(wrapper)).toContain('n\'a pas pu être vérifié')
      expect(playerToken.value).toBeNull()

      await wrapper.find('[data-test="callback-home"]').trigger('click')
      expect(router.replace).toHaveBeenCalledWith('/')
    })

    it('le joueur a refusé (access_denied) : aucun appel, connexion annulée', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('abc')

      const { wrapper } = mountCallback({ error: 'access_denied', state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(0)
      expect(errorText(wrapper)).toContain('Connexion annulée')
    })

    it('reconnexion silencieuse refusée par Discord : repart sur l\'écran classique', async () => {
      const api = simulatePlayerApi(LOGIN_OK)
      pendingLogin('abc', { silent: true, returnTo: '/agent' })

      const { wrapper } = mountCallback({ error: 'login_required', state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(0)
      const url = new URL(vi.mocked(navigateTo).mock.lastCall![0])
      expect(url.searchParams.has('prompt')).toBe(false)
      expect(JSON.parse(sessionStorage.getItem('discordPendingLogin')!).returnTo).toBe('/agent')
      expect(wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
    })
  })

  describe('échange refusé par l\'API', () => {
    it.each([
      [401, 'discord_login_failed', 'La connexion Discord a échoué.'],
      [400, 'missing_code', 'Le code d\'autorisation Discord est obligatoire.']
    ])('%i %s : message de l\'API et proposition de réessayer', async (status, code, message) => {
      const api = simulatePlayerApi({ status, data: { code, message } })
      pendingLogin('abc')

      const { wrapper } = mountCallback({ code: `code-${code}`, state: 'abc' })
      await flushPromises()

      expect(api.requests).toHaveLength(1)
      expect(errorText(wrapper)).toBe(message)
      expect(playerToken.value).toBeNull()
      // Le 401 de l'échange est métier : pas de reconnexion silencieuse automatique
      expect(navigateTo).not.toHaveBeenCalled()

      await wrapper.find('[data-test="callback-retry"]').trigger('click')
      const retry = new URL(vi.mocked(navigateTo).mock.lastCall![0])
      expect(retry.hostname).toBe('discord.com')
      expect(retry.searchParams.get('client_id')).toBe(import.meta.env.VITE_DISCORD_CLIENT_ID)
    })
  })
})
