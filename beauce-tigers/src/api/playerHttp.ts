import axios, { AxiosError } from 'axios'
import { ref, watch } from 'vue'
import { startSilentReLogin } from '@/utils/discordAuth'

// Client des routes joueur du BFF. Volontairement distinct de apiClient : le
// BFF y relaie le JWT Discord du joueur, alors que les classements passent par
// le compte API du front. Les deux jetons ne se croisent jamais.

const TOKEN_KEY = 'playerToken'
const LOGIN_PATH = '/auth/discord'

/** Erreur de l'API, toujours sous la forme { status, code, message } */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * JWT du joueur (1 h). sessionStorage : propre à l'onglet, perdu à sa fermeture ;
 * la reconnexion prompt=none le reprend sans écran. Ref partagée pour que le
 * store et l'intercepteur voient la même valeur.
 */
export const playerToken = ref<string | null>(sessionStorage.getItem(TOKEN_KEY))

watch(playerToken, (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
})

const toApiError = (error: AxiosError<any>): ApiError => {
  const status = error.response?.status ?? 0
  const body = error.response?.data

  if (typeof body?.code === 'string' && typeof body?.message === 'string') {
    return new ApiError(status, body.code, body.message)
  }
  if (!status) {
    return new ApiError(0, 'network_error', 'Impossible de joindre le serveur, vérifie ta connexion.')
  }
  return new ApiError(status, `http_${status}`, 'Une erreur inattendue est survenue, réessaie.')
}

export const playerClient = axios.create({
  baseURL: import.meta.env.VITE_PLAYER_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

playerClient.interceptors.request.use((config) => {
  if (playerToken.value) {
    config.headers.Authorization = `Bearer ${playerToken.value}`
  }
  return config
})

playerClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = toApiError(error)

    // Jeton absent ou expiré : on l'oublie et on repasse par Discord, puis retour
    // sur la page en cours. Pas pour l'échange du code, dont le 401 est métier.
    if (apiError.status === 401 && error.config?.url !== LOGIN_PATH) {
      playerToken.value = null
      if (startSilentReLogin(window.location.pathname + window.location.search)) {
        // La page part chez Discord : ne rien résoudre évite un flash d'erreur
        return new Promise(() => {})
      }
    }

    // Jeton valide mais pas celui d'un joueur (compte API, admin) : inutilisable
    if (apiError.status === 403 && apiError.code === 'forbidden') {
      playerToken.value = null
    }

    return Promise.reject(apiError)
  }
)

export default playerClient
