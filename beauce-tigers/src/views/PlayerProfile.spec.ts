import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerProfile from './PlayerProfile.vue'
import { discordPlayerAPI } from '@/api/apiDiscordPlayer'
import { ApiError } from '@/api/playerHttp'

vi.mock('@/api/apiDiscordPlayer', () => ({
  discordPlayerAPI: { getProfile: vi.fn(), linkRiotAccount: vi.fn() }
}))

const getProfile = vi.mocked(discordPlayerAPI.getProfile)
const linkRiotAccount = vi.mocked(discordPlayerAPI.linkRiotAccount)

const profile = (riotIds: string[] = []) => ({
  discordId: '80351110224678912',
  discordUsername: 'pseudo',
  riotIds
})

const mountProfile = async () => {
  const wrapper = mount(PlayerProfile, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } }
  })
  await flushPromises()
  return wrapper
}

const submitRiotId = async (wrapper: Awaited<ReturnType<typeof mountProfile>>, riotId: string) => {
  await wrapper.find('#riot-id').setValue(riotId)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('PlayerProfile', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche le joueur Discord et invite à lier un compte quand riotIds est vide', async () => {
    getProfile.mockResolvedValue(profile())

    const wrapper = await mountProfile()

    expect(wrapper.text()).toContain('pseudo')
    expect(wrapper.find('[data-test="no-riot-account"]').exists()).toBe(true)
    expect(wrapper.find('#riot-id').exists()).toBe(true)
  })

  it('n\'invite plus à lier une fois un compte lié', async () => {
    getProfile.mockResolvedValue(profile(['Pseudo#EUW']))

    const wrapper = await mountProfile()

    expect(wrapper.text()).toContain('Pseudo#EUW')
    expect(wrapper.find('[data-test="no-riot-account"]').exists()).toBe(false)
  })

  it('lier un compte met le profil à jour', async () => {
    getProfile.mockResolvedValue(profile())
    linkRiotAccount.mockResolvedValue(profile(['Pseudo#EUW']))
    const wrapper = await mountProfile()

    await submitRiotId(wrapper, 'pseudo#euw')

    expect(linkRiotAccount).toHaveBeenCalledWith('pseudo#euw')
    expect(wrapper.find('[data-test="no-riot-account"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Pseudo#EUW')
  })

  it.each([
    [400, 'invalid_riot_id', 'Le Riot ID doit être au format « Pseudo#TAG ».', null],
    [
      404,
      'riot_account_not_tracked',
      'Aucun compte suivi ne porte le Riot ID « Inconnu#EUW ».',
      'demande à un administrateur'
    ],
    [
      409,
      'riot_account_already_linked',
      'Le compte « Pseudo#EUW » est déjà lié à un autre joueur.',
      'Seul un administrateur peut corriger'
    ]
  ])('%i %s : affiche le message de l\'API', async (status, code, message, hint) => {
    getProfile.mockResolvedValue(profile())
    linkRiotAccount.mockRejectedValue(new ApiError(status, code, message))
    const wrapper = await mountProfile()

    await submitRiotId(wrapper, 'Inconnu#EUW')

    const error = wrapper.find('[data-test="link-error"]')
    expect(error.attributes('role')).toBe('alert')
    expect(error.text()).toContain(message)
    if (hint) expect(error.text()).toContain(hint)
    // Le profil reste tel quel : toujours rien de lié
    expect(wrapper.find('[data-test="no-riot-account"]').exists()).toBe(true)
  })
})
