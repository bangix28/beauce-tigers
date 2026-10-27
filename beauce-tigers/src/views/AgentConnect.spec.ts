import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AgentConnect from './AgentConnect.vue'
import { discordPlayerAPI } from '@/api/apiDiscordPlayer'
import { ApiError } from '@/api/playerHttp'

vi.mock('@/api/apiDiscordPlayer', () => ({
  discordPlayerAPI: { approveAgentDevice: vi.fn() }
}))

const approve = vi.mocked(discordPlayerAPI.approveAgentDevice)

describe('AgentConnect', () => {
  it('met le code en forme XXXX-XXXX pendant la saisie', async () => {
    const wrapper = mount(AgentConnect)
    const input = wrapper.find('input')

    await input.setValue('k7q f92pz!x')

    expect((input.element as HTMLInputElement).value).toBe('K7QF-92PZ')
    expect(input.attributes('maxlength')).toBe('9')
  })

  it('envoie le code et annonce l\'agent prêt', async () => {
    approve.mockResolvedValue({
      lan: { id: 3, name: "LAN d'automne", startsAt: '', endsAt: '' },
      player: { riotIds: ['Moi#EUW'] }
    })
    const wrapper = mount(AgentConnect)

    await wrapper.find('input').setValue('k7qf92pz')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(approve).toHaveBeenCalledWith('K7QF-92PZ')
    expect(wrapper.find('[data-test="agent-success"]').text()).toContain('Ton agent est prêt')
  })

  it('code expiré : message du contrat', async () => {
    approve.mockRejectedValue(new ApiError(400, 'invalid_user_code', 'Code invalide.'))
    const wrapper = mount(AgentConnect)

    await wrapper.find('input').setValue('AAAA-BBBB')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[data-test="agent-error"]').text()).toContain('Code inconnu ou expiré')
    expect(wrapper.find('[data-test="agent-error"]').attributes('role')).toBe('alert')
  })
})
