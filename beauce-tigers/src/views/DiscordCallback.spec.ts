import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiscordCallback from './DiscordCallback.vue'
import { discordPlayerAPI } from '@/api/apiDiscordPlayer'
import { ApiError, playerToken } from '@/api/playerHttp'
import { startDiscordLogin } from '@/utils/discordAuth'

vi.mock('@/api/apiDiscordPlayer', () => ({
  discordPlayerAPI: { login: vi.fn() }
}))

// Le vrai module, sauf la redirection vers Discord que jsdom ne sait pas suivre
vi.mock('@/utils/discordAuth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/discordAuth')>()),
  startDiscordLogin: vi.fn()
}))

const login = vi.mocked(discordPlayerAPI.login)

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

describe('DiscordCallback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    playerToken.value = null
    login.mockReset()
  })

  it('abandonne si le state ne revient pas identique', async () => {
    pendingLogin('attendu')

    const { wrapper, router } = mountCallback({ code: 'code-forge', state: 'forge' })
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="callback-error"]').text()).toContain('n\'a pas pu être vérifié')
  })

  it('abandonne sans state en attente (retour rejoué)', async () => {
    const { wrapper } = mountCallback({ code: 'code-rejoue', state: 'abc' })
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="callback-error"]').exists()).toBe(true)
  })

  it('signale le refus du joueur (access_denied)', async () => {
    pendingLogin('abc')

    const { wrapper } = mountCallback({ error: 'access_denied', state: 'abc' })
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="callback-error"]').text()).toContain('tu as refusé')
  })

  it('n\'envoie le code qu\'une fois malgré un double montage', async () => {
    pendingLogin('abc')
    login.mockResolvedValue({
      token: 'header.payload.signature',
      player: { discordId: '1', discordUsername: 'pseudo', riotIds: [] }
    })

    const first = mountCallback({ code: 'code-unique', state: 'abc' })
    const second = mountCallback({ code: 'code-unique', state: 'abc' })
    await flushPromises()

    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith('code-unique')
    expect(playerToken.value).toBe('header.payload.signature')
    expect(first.router.replace).toHaveBeenCalledWith('/lan')
    expect(second.router.replace).toHaveBeenCalledWith('/lan')
    expect(second.wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
  })

  it('affiche le message de l\'API si l\'échange échoue', async () => {
    pendingLogin('abc')
    login.mockRejectedValue(
      new ApiError(401, 'discord_login_failed', 'La connexion Discord a échoué.')
    )

    const { wrapper } = mountCallback({ code: 'code-refuse', state: 'abc' })
    await flushPromises()

    expect(wrapper.find('[data-test="callback-error"]').text()).toBe(
      'La connexion Discord a échoué.'
    )
    expect(playerToken.value).toBeNull()
  })

  it('reconnexion silencieuse refusée par Discord : repart sur l\'écran classique', async () => {
    pendingLogin('abc', { silent: true, returnTo: '/agent' })

    const { wrapper } = mountCallback({ error: 'login_required', state: 'abc' })
    await flushPromises()

    expect(startDiscordLogin).toHaveBeenCalledWith({ returnTo: '/agent' })
    expect(wrapper.find('[data-test="callback-error"]').exists()).toBe(false)
  })
})
