// Contrat des routes joueur (connexion Discord) de l'api-bot, relayées par le
// BFF avec le jeton du joueur : docs/front/connexion-discord.md côté api-bot.

export interface PlayerProfile {
  discordId: string
  discordUsername: string
  /** 'Pseudo#EUW' ; vide tant que le joueur n'a lié aucun compte */
  riotIds: string[]
}

export interface DiscordLoginResponse {
  /** JWT valable 1 heure, sans jeton de rafraîchissement */
  token: string
  player: PlayerProfile
}

export interface LanSummary {
  id: number
  name: string
  /** ISO 8601 avec fuseau */
  startsAt: string
  endsAt: string
}

export interface AgentPairing {
  lan: LanSummary
  player: { riotIds: string[] }
}
