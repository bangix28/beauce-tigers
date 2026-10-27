import { describe, expect, it } from 'vitest'
import { readDiscordConfig } from './discordAuth'
import envDevelopment from '../../.env.development?raw'
import envProduction from '../../.env.production?raw'
import envTest from '../../.env.test?raw'
import envTemplate from '../../.env.template?raw'

// Garde-fou sur les fichiers de configuration VERSIONNÉS : une URL de retour
// fausse d'un caractère casse la connexion, un secret commité fuit pour de bon.

const ENV_FILES: Record<string, string> = {
  '.env.development': envDevelopment,
  '.env.production': envProduction,
  '.env.test': envTest,
  '.env.template': envTemplate
}

/** KEY=VALUE, commentaires et lignes vides ignorés */
const parseEnvFile = (name: string): Record<string, string> =>
  Object.fromEntries(
    ENV_FILES[name]
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])
  )

describe('configuration Discord par environnement', () => {
  it.each([
    ['.env.development', 'http://localhost:3000/auth/discord/callback'],
    ['.env.production', 'https://beauce-tigers.fr/auth/discord/callback']
  ])('%s déclare une configuration valide', (file, redirectUri) => {
    const config = readDiscordConfig(parseEnvFile(file))

    expect(config.redirectUri).toBe(redirectUri)
  })

  it('dev et prod partagent la même application Discord', () => {
    expect(parseEnvFile('.env.development').VITE_DISCORD_CLIENT_ID).toBe(
      parseEnvFile('.env.production').VITE_DISCORD_CLIENT_ID
    )
  })

  it.each(['.env.development', '.env.production', '.env.test', '.env.template'])(
    '%s ne contient aucun secret',
    (file) => {
      const keys = Object.keys(parseEnvFile(file))

      expect(keys.filter((key) => /SECRET|PASSWORD|TOKEN/i.test(key))).toEqual([])
    }
  )
})
