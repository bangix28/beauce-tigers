import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import UpdateBanner from './UpdateBanner.vue'

let wrapper: VueWrapper | null = null

const deployed = (build: string, version = '1.0.0') =>
  vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ version, build }) })

const mountBanner = (currentBuild: string, currentVersion = '1.0.0') => {
  wrapper = mount(UpdateBanner, { props: { currentBuild, currentVersion } })
  return wrapper
}

const banner = () => wrapper!.find('[data-test="update-banner"]')

const checkNow = async () => {
  vi.advanceTimersByTime(5 * 60 * 1000)
  await flushPromises()
}

describe('UpdateBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('propose de recharger après un déploiement, même sans changement de version', async () => {
    const fetch = deployed('build-2')
    vi.stubGlobal('fetch', fetch)

    mountBanner('build-1')
    expect(banner().exists()).toBe(false)

    await checkNow()

    expect(fetch).toHaveBeenCalledWith('/version.json', { cache: 'no-store' })
    expect(banner().text()).toContain('Une nouvelle version du site est disponible.')
  })

  it('annonce le numéro quand une nouvelle version sort', async () => {
    vi.stubGlobal('fetch', deployed('build-2', '1.1.0'))

    mountBanner('build-1', '1.0.0')
    await checkNow()

    expect(banner().text()).toContain('La version 1.1.0 du site est disponible.')
  })

  it('reste discret tant que le build déployé est celui chargé', async () => {
    vi.stubGlobal('fetch', deployed('build-1'))

    mountBanner('build-1')
    await checkNow()

    expect(banner().exists()).toBe(false)
  })

  it('une panne réseau ne fait rien apparaître', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    mountBanner('build-1')
    await checkNow()

    expect(banner().exists()).toBe(false)
  })

  it('en développement, ne vérifie rien', async () => {
    const fetch = deployed('build-2')
    vi.stubGlobal('fetch', fetch)

    mountBanner('dev')
    await checkNow()

    expect(fetch).not.toHaveBeenCalled()
  })
})
