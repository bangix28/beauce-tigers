import playerClient from './playerHttp'
import type {
  CardCatalogue,
  CurrentLan,
  LanFeed,
  LanStandings,
  MyRun,
  PickPayload
} from '../../types/lanChallenge'

// Défis de LAN. Les routes /me (join, pick, reroll) renvoient toutes le
// parcours à jour, au format de GET /me : l'appelant remplace son état avec.
export const lanChallengeAPI = {
  /** Point d'entrée : seule source du lanId des autres routes */
  getCurrentLan: async (): Promise<CurrentLan> => {
    const response = await playerClient.get('/me/lan-events/current')
    return response.data
  },

  getCatalogue: async (): Promise<CardCatalogue> => {
    const response = await playerClient.get('/lan-challenges/cards')
    return response.data
  },

  getMyRun: async (lanId: number): Promise<MyRun> => {
    const response = await playerClient.get(`/lan-events/${lanId}/me`)
    return response.data
  },

  join: async (lanId: number): Promise<MyRun> => {
    const response = await playerClient.post(`/lan-events/${lanId}/me/join`)
    return response.data
  },

  pick: async (lanId: number, payload: PickPayload): Promise<MyRun> => {
    const response = await playerClient.post(`/lan-events/${lanId}/me/pick`, payload)
    return response.data
  },

  reroll: async (lanId: number, slot: number): Promise<MyRun> => {
    const response = await playerClient.post(`/lan-events/${lanId}/me/reroll`, { slot })
    return response.data
  },

  getStandings: async (lanId: number): Promise<LanStandings> => {
    const response = await playerClient.get(`/lan-events/${lanId}/standings`)
    return response.data
  },

  getFeed: async (lanId: number, limit = 20): Promise<LanFeed> => {
    const response = await playerClient.get(`/lan-events/${lanId}/feed`, { params: { limit } })
    return response.data
  }
}

export default lanChallengeAPI
