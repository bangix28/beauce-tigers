import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildAuthorizeUrl,
  consumePendingLogin,
  readDiscordConfig,
  safeReturnTo,
  startDiscordLogin,
  startSilentReLogin
} from './discordAuth'
import { navigateTo } from '@/utils/browserNavigation'

// Jamais de vrai Discord : la sortie du site est simulée
vi.mock('@/utils/browserNavigation', () => ({ navigateTo: vi.fn() }))

// Valeurs du mode test (.env.test) : les assertions suivent la configuration de
// l'environnement plutôt que des valeurs recopiées
const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI

const lastNavigation = () => new URL(vi.mocked(navigateTo).mock.lastCall![0])
const pendingLogin = () => JSON.parse(sessionStorage.getItem('discordPendingLogin') ?? 'null')

describe('départ vers Discord', () => {
  beforeEach(() => sessionStorage.clear())

  it('construit l\'URL d\'autorisation depuis la configuration de l\'environnement', () => {
    const raw = buildAuthorizeUrl('abc')
    const url = new URL(raw)

    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize')
    expect(url.searchParams.get('client_id')).toBe(CLIENT_ID)
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toBe('identify')
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT_URI)
    expect(url.searchParams.get('state')).toBe('abc')
    expect(url.searchParams.has('prompt')).toBe(false)
    // redirect_uri part encodée : sinon ses « / » et « : » casseraient la requête
    expect(raw).toContain(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}`)
  })

  it('tire un state, le garde en sessionStorage et l\'envoie à Discord', () => {
    startDiscordLogin({ returnTo: '/lan' })

    const sent = lastNavigation().searchParams.get('state')
    expect(sent).toMatch(/^[0-9a-f]{32}$/)
    expect(pendingLogin()).toEqual({ state: sent, returnTo: '/lan', silent: false })
  })

  it('tire un state différent à chaque tentative', () => {
    startDiscordLogin()
    const first = lastNavigation().searchParams.get('state')
    startDiscordLogin()
    const second = lastNavigation().searchParams.get('state')

    expect(first).not.toBe(second)
    expect(pendingLogin().state).toBe(second)
  })

  it('reconnexion silencieuse : prompt=none et page en cours retenue', () => {
    expect(startSilentReLogin('/lan?onglet=2')).toBe(true)

    expect(lastNavigation().searchParams.get('prompt')).toBe('none')
    expect(pendingLogin()).toMatchObject({ returnTo: '/lan?onglet=2', silent: true })
  })

  it('ne relance pas une reconnexion silencieuse qui vient d\'avoir lieu (anti-boucle)', () => {
    startSilentReLogin('/lan')
    vi.mocked(navigateTo).mockClear()

    expect(startSilentReLogin('/lan')).toBe(false)
    expect(navigateTo).not.toHaveBeenCalled()
  })
})

describe('readDiscordConfig', () => {
  const env = (redirectUri: string, clientId = '1563985957863212') => ({
    VITE_DISCORD_CLIENT_ID: clientId,
    VITE_DISCORD_REDIRECT_URI: redirectUri
  })

  it('accepte les URL de retour de dev et de prod', () => {
    expect(readDiscordConfig(env('http://localhost:3000/auth/discord/callback')).redirectUri).toBe(
      'http://localhost:3000/auth/discord/callback'
    )
    expect(readDiscordConfig(env('https://beauce-tigers.fr/auth/discord/callback')).redirectUri).toBe(
      'https://beauce-tigers.fr/auth/discord/callback'
    )
  })

  it.each([
    ['un / final', 'https://beauce-tigers.fr/auth/discord/callback/'],
    ['un autre chemin', 'https://beauce-tigers.fr/auth/discord'],
    ['un paramètre', 'https://beauce-tigers.fr/auth/discord/callback?x=1'],
    ['du http hors local', 'http://beauce-tigers.fr/auth/discord/callback'],
    ['une URL invalide', 'beauce-tigers.fr/auth/discord/callback'],
    ['une valeur vide', '']
  ])('refuse une URL de retour avec %s', (_, redirectUri) => {
    expect(() => readDiscordConfig(env(redirectUri))).toThrow(/VITE_DISCORD_REDIRECT_URI/)
  })

  it('refuse un Client ID absent ou qui n\'est pas un identifiant Discord', () => {
    const uri = 'http://localhost:3000/auth/discord/callback'
    expect(() => readDiscordConfig(env(uri, ''))).toThrow(/VITE_DISCORD_CLIENT_ID/)
    expect(() => readDiscordConfig(env(uri, 'mon-app'))).toThrow(/VITE_DISCORD_CLIENT_ID/)
  })
})

describe('consumePendingLogin', () => {
  beforeEach(() => sessionStorage.clear())

  it('ne sert qu\'une fois', () => {
    sessionStorage.setItem(
      'discordPendingLogin',
      JSON.stringify({ state: 'abc', returnTo: '/lan', silent: false })
    )

    expect(consumePendingLogin('abc')).toEqual({ state: 'abc', returnTo: '/lan', silent: false })
    expect(consumePendingLogin('abc')).toBeNull()
  })

  it('refuse un state différent', () => {
    sessionStorage.setItem(
      'discordPendingLogin',
      JSON.stringify({ state: 'abc', returnTo: '/lan', silent: false })
    )

    expect(consumePendingLogin('autre')).toBeNull()
  })
})

describe('safeReturnTo', () => {
  it('n\'accepte qu\'un chemin interne', () => {
    expect(safeReturnTo('/lan?x=1')).toBe('/lan?x=1')
    expect(safeReturnTo('//evil.example')).toBe('/')
    expect(safeReturnTo('https://evil.example')).toBe('/')
    expect(safeReturnTo(null)).toBe('/')
  })
})
