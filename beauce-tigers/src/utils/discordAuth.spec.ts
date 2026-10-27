import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildAuthorizeUrl, consumePendingLogin, safeReturnTo } from './discordAuth'

describe('buildAuthorizeUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DISCORD_CLIENT_ID', '1234')
    vi.stubEnv('VITE_DISCORD_REDIRECT_URI', 'http://localhost:3000/auth/discord/callback')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('encode l\'URL de retour et le state', () => {
    const url = new URL(buildAuthorizeUrl('abc'))

    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize')
    expect(url.searchParams.get('client_id')).toBe('1234')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toBe('identify')
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/discord/callback')
    expect(url.searchParams.get('state')).toBe('abc')
    expect(url.searchParams.has('prompt')).toBe(false)
  })

  it('ajoute prompt=none pour une reconnexion silencieuse', () => {
    expect(new URL(buildAuthorizeUrl('abc', true)).searchParams.get('prompt')).toBe('none')
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
