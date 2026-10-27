import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PlayerProfile } from '../../types/player'
import { discordPlayerAPI } from '@/api/apiDiscordPlayer'
import { ApiError, playerToken } from '@/api/playerHttp'
import { SILENT_LOGIN_ERRORS, consumePendingLogin, startDiscordLogin } from '@/utils/discordAuth'

export interface DiscordCallbackQuery {
  code?: string | null
  state?: string | null
  error?: string | null
}

export type DiscordCallbackOutcome =
  | { kind: 'success'; returnTo: string }
  | { kind: 'error'; message: string }
  /** Reconnexion silencieuse refusée par Discord : repart sur l'écran classique */
  | { kind: 'redirecting' }

/**
 * Échanges en cours, par code. Le code Discord est à usage unique : un second
 * montage de la page de retour (HMR, double navigation) doit reprendre le même
 * échange, pas en relancer un qui échouerait et effacerait le premier.
 */
const callbacksInFlight = new Map<string, Promise<DiscordCallbackOutcome>>()

export const usePlayerAuthStore = defineStore('playerAuth', () => {
  const token = playerToken
  const profile = ref<PlayerProfile | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  const loginWithCode = async (code: string) => {
    const { token: jwt, player } = await discordPlayerAPI.login(code)
    token.value = jwt
    profile.value = player
  }

  const runCallback = async (query: DiscordCallbackQuery): Promise<DiscordCallbackOutcome> => {
    const pending = consumePendingLogin(query.state)
    if (!pending) {
      return {
        kind: 'error',
        message: 'Le retour de Discord n\'a pas pu être vérifié. Relance la connexion depuis le site.'
      }
    }

    if (query.error) {
      if (pending.silent && SILENT_LOGIN_ERRORS.includes(query.error)) {
        startDiscordLogin({ returnTo: pending.returnTo })
        return { kind: 'redirecting' }
      }
      if (query.error === 'access_denied') {
        return {
          kind: 'error',
          message: 'Connexion annulée : tu as refusé l\'autorisation Discord.'
        }
      }
      return { kind: 'error', message: 'Discord n\'a pas pu te connecter, réessaie.' }
    }

    if (!query.code) {
      return { kind: 'error', message: 'Discord n\'a renvoyé aucun code de connexion, réessaie.' }
    }

    try {
      await loginWithCode(query.code)
      return { kind: 'success', returnTo: pending.returnTo }
    } catch (e) {
      return {
        kind: 'error',
        message: e instanceof ApiError ? e.message : 'La connexion a échoué, réessaie.'
      }
    }
  }

  /** Traite le retour de Discord une seule fois par code (ou par erreur reçue) */
  const completeDiscordCallback = (query: DiscordCallbackQuery): Promise<DiscordCallbackOutcome> => {
    const key = query.code ?? `error:${query.error ?? ''}:${query.state ?? ''}`
    const inFlight = callbacksInFlight.get(key)
    if (inFlight) return inFlight

    const outcome = runCallback(query)
    callbacksInFlight.set(key, outcome)
    return outcome
  }

  const fetchProfile = async () => {
    profile.value = await discordPlayerAPI.getProfile()
  }

  const linkRiotAccount = async (riotId: string) => {
    profile.value = await discordPlayerAPI.linkRiotAccount(riotId)
  }

  const login = (returnTo: string) => startDiscordLogin({ returnTo })

  /** Aucun appel serveur : oublier le jeton suffit */
  const logout = () => {
    token.value = null
    profile.value = null
  }

  return {
    token,
    profile,
    isLoggedIn,
    completeDiscordCallback,
    fetchProfile,
    linkRiotAccount,
    login,
    logout
  }
})
