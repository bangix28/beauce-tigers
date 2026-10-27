// Aller-retour OAuth2 avec Discord (scope identify). Le code reçu au retour est
// échangé contre un JWT par l'api-bot, via le BFF : voir playerAuthStore.

const AUTHORIZE_URL = 'https://discord.com/oauth2/authorize'
const PENDING_LOGIN_KEY = 'discordPendingLogin'
const SILENT_ATTEMPT_KEY = 'discordSilentAttemptAt'
/**
 * Une reconnexion silencieuse qui retombe sur un 401 dans ce délai signale un
 * problème durable (configuration, compte) : on arrête de rebondir sur Discord
 */
const SILENT_RETRY_GUARD_MS = 30 * 1000

/** Ce qu'on retrouve au retour de Discord, indexé par le `state` tiré à l'aller */
export interface PendingLogin {
  state: string
  /** Page à rouvrir une fois connecté : chemin interne uniquement */
  returnTo: string
  /** Aller avec prompt=none : un refus silencieux bascule sur l'écran classique */
  silent: boolean
}

/** Erreurs de prompt=none : Discord veut une interaction, pas un refus du joueur */
export const SILENT_LOGIN_ERRORS = ['login_required', 'consent_required', 'interaction_required']

/** Chemin interne seulement : un returnTo forgé ne doit pas renvoyer hors du site */
export const safeReturnTo = (path: string | null | undefined): string =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/'

export const randomState = (): string => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const buildAuthorizeUrl = (state: string, silent = false): string => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: 'code',
    scope: 'identify',
    redirect_uri: import.meta.env.VITE_DISCORD_REDIRECT_URI,
    state
  })
  if (silent) params.set('prompt', 'none')

  return `${AUTHORIZE_URL}?${params.toString()}`
}

export const startDiscordLogin = ({ returnTo = '/', silent = false } = {}): void => {
  if (!import.meta.env.VITE_DISCORD_CLIENT_ID || !import.meta.env.VITE_DISCORD_REDIRECT_URI) {
    throw new Error(
      'VITE_DISCORD_CLIENT_ID ou VITE_DISCORD_REDIRECT_URI manquante dans le .env (voir .env.template)'
    )
  }

  const pending: PendingLogin = { state: randomState(), returnTo: safeReturnTo(returnTo), silent }
  sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending))
  window.location.assign(buildAuthorizeUrl(pending.state, silent))
}

/**
 * Reconnexion après expiration du jeton (1 h, sans rafraîchissement) : prompt=none
 * épargne l'écran d'autorisation au joueur qui a déjà accepté. Renvoie false sans
 * rien faire si une tentative vient d'avoir lieu, pour ne pas boucler.
 */
export const startSilentReLogin = (returnTo: string): boolean => {
  const lastAttempt = Number(sessionStorage.getItem(SILENT_ATTEMPT_KEY))
  if (lastAttempt && Date.now() - lastAttempt < SILENT_RETRY_GUARD_MS) {
    return false
  }

  sessionStorage.setItem(SILENT_ATTEMPT_KEY, String(Date.now()))
  startDiscordLogin({ returnTo, silent: true })
  return true
}

/**
 * Lit ET efface la connexion en attente : un `state` ne sert qu'une fois. Null si
 * rien n'était en attente ou si le `state` reçu diffère (retour forgé, CSRF).
 */
export const consumePendingLogin = (state: string | null | undefined): PendingLogin | null => {
  const raw = sessionStorage.getItem(PENDING_LOGIN_KEY)
  sessionStorage.removeItem(PENDING_LOGIN_KEY)
  if (!raw || !state) return null

  try {
    const pending = JSON.parse(raw) as PendingLogin
    return pending.state === state ? { ...pending, returnTo: safeReturnTo(pending.returnTo) } : null
  } catch {
    return null
  }
}
