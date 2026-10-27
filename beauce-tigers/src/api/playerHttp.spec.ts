import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, playerClient, playerToken } from './playerHttp'
import { startSilentReLogin } from '@/utils/discordAuth'

vi.mock('@/utils/discordAuth', () => ({ startSilentReLogin: vi.fn() }))

/** Adaptateur axios qui répond toujours `status` avec `data` */
const respondWith = (status: number, data: unknown) => {
  playerClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const response = { data, status, statusText: '', headers: {}, config }
    if (status < 400) return response
    throw new AxiosError('échec', AxiosError.ERR_BAD_REQUEST, config, null, response)
  }
}

const settled = (promise: Promise<unknown>) =>
  Promise.race([
    promise.then(
      () => 'resolved',
      (e) => e
    ),
    new Promise((resolve) => setTimeout(() => resolve('pending'), 20))
  ])

describe('playerClient', () => {
  beforeEach(() => {
    playerToken.value = 'header.payload.signature'
  })

  it('envoie le JWT du joueur en Bearer', async () => {
    let authorization: unknown
    playerClient.defaults.adapter = async (config) => {
      authorization = config.headers.Authorization
      return { data: {}, status: 200, statusText: '', headers: {}, config }
    }

    await playerClient.get('/me')

    expect(authorization).toBe('Bearer header.payload.signature')
  })

  it('normalise les erreurs { code, message }', async () => {
    respondWith(409, { code: 'no_offer', message: 'Aucune offre.' })

    const error = await settled(playerClient.post('/lan-events/3/me/pick', { slot: 0 }))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, code: 'no_offer', message: 'Aucune offre.' })
  })

  it('sur un 401, oublie le jeton et relance Discord en silencieux sur la page en cours', async () => {
    vi.mocked(startSilentReLogin).mockReturnValue(true)
    window.history.replaceState(null, '', '/lan?onglet=2')
    respondWith(401, { code: 'unauthorized', message: 'Session expirée.' })

    const outcome = await settled(playerClient.get('/me'))

    expect(playerToken.value).toBeNull()
    expect(startSilentReLogin).toHaveBeenCalledWith('/lan?onglet=2')
    // La page part chez Discord : la requête ne se règle pas, pas de flash d'erreur
    expect(outcome).toBe('pending')
  })

  it('sur un 401 juste après une reconnexion ratée, rend l\'erreur au lieu de boucler', async () => {
    vi.mocked(startSilentReLogin).mockReturnValue(false)
    respondWith(401, { code: 'unauthorized', message: 'Session expirée.' })

    const error = await settled(playerClient.get('/me'))

    expect(error).toMatchObject({ status: 401, code: 'unauthorized' })
  })

  it('le 401 de l\'échange du code Discord reste une erreur métier', async () => {
    respondWith(401, { code: 'discord_login_failed', message: 'Connexion refusée.' })

    const error = await settled(playerClient.post('/auth/discord', { code: 'x' }))

    expect(startSilentReLogin).not.toHaveBeenCalled()
    expect(error).toMatchObject({ code: 'discord_login_failed' })
  })
})
