import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CardPeek from './CardPeek.vue'
import { card } from '@/test/lanFixtures'

const BAD_LOSER = card({
  code: 'bad_loser',
  label: 'Mauvais perdant',
  description: 'Perds la partie.',
  rarity: 'saboteur',
  points: 40,
  secret: true
})

let wrapper: VueWrapper | null = null

const mountPeek = () => {
  // attachTo : la carte est téléportée dans body, le déclencheur doit y être aussi
  wrapper = mount(CardPeek, {
    props: { card: BAD_LOSER },
    slots: { default: '<span class="label">Mauvais perdant</span>' },
    attachTo: document.body
  })
  return wrapper
}

const peek = () => document.body.querySelector('[data-test="card-peek"]')

describe('CardPeek', () => {
  beforeEach(() => vi.useFakeTimers())

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('au survol, la vraie carte sort après un court délai d\'intention', async () => {
    const trigger = mountPeek().find('.card-peek-trigger')

    await trigger.trigger('mouseenter')
    expect(peek()).toBeNull()

    vi.advanceTimersByTime(100)
    await wrapper!.vm.$nextTick()

    expect(peek()?.textContent).toContain('Mauvais perdant')
    expect(peek()?.textContent).toContain('Perds la partie.')
    // Déjà jouée, donc révélée : pas de « Carte secrète »
    expect(peek()?.textContent).not.toContain('Carte secrète')
    expect(peek()?.getAttribute('aria-hidden')).toBe('true')
  })

  it('balayer la liste sans s\'arrêter n\'ouvre rien', async () => {
    const trigger = mountPeek().find('.card-peek-trigger')

    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(40)
    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(200)
    await wrapper!.vm.$nextTick()

    expect(peek()).toBeNull()
  })

  it('au clavier : le focus l\'ouvre tout de suite, Échap la referme', async () => {
    const trigger = mountPeek().find('.card-peek-trigger')

    await trigger.trigger('focus')
    expect(peek()).not.toBeNull()

    await trigger.trigger('keydown', { key: 'Escape' })
    vi.advanceTimersByTime(200)
    await wrapper!.vm.$nextTick()
    expect((wrapper!.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('reste dans l\'écran : passe à gauche quand la droite manque de place', async () => {
    const trigger = mountPeek().find('.card-peek-trigger')
    trigger.element.getBoundingClientRect = () =>
      ({ top: 100, bottom: 120, left: window.innerWidth - 40, right: window.innerWidth - 10, width: 30, height: 20 }) as DOMRect

    await trigger.trigger('focus')
    await wrapper!.vm.$nextTick()

    expect(peek()?.getAttribute('data-side')).toBe('left')
  })
})
