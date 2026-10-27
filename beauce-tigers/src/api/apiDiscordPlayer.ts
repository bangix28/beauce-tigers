import playerClient from './playerHttp'
import type { AgentPairing, DiscordLoginResponse, PlayerProfile } from '../../types/player'

// Joueur connecté par Discord : connexion, profil, comptes Riot, agent de LAN
export const discordPlayerAPI = {
  login: async (code: string): Promise<DiscordLoginResponse> => {
    const response = await playerClient.post('/auth/discord', { code })
    return response.data
  },

  getProfile: async (): Promise<PlayerProfile> => {
    const response = await playerClient.get('/me')
    return response.data
  },

  /** Rejouable sans risque, casse ignorée ; renvoie le profil à jour */
  linkRiotAccount: async (riotId: string): Promise<PlayerProfile> => {
    const response = await playerClient.post('/me/riot-accounts', { riotId })
    return response.data
  },

  /** Saisie transmise telle quelle : l'API normalise casse, espaces et tiret */
  approveAgentDevice: async (userCode: string): Promise<AgentPairing> => {
    const response = await playerClient.post('/me/agent-devices/approve', { userCode })
    return response.data
  }
}

export default discordPlayerAPI
