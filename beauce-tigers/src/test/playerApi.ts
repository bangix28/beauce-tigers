import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { playerClient } from '@/api/playerHttp'

// API simulée au niveau HTTP : on remplace l'adaptateur d'un client axios, si
// bien que tout le reste (intercepteurs, en-têtes, normalisation des erreurs)
// tourne pour de vrai. Aucune requête ne sort.

export interface RecordedRequest {
  method: string
  url: string
  body: unknown
  authorization: string | null
}

export interface SimulatedReply {
  status: number
  data: unknown
}

export const simulateApi = (
  client: AxiosInstance,
  reply: SimulatedReply | ((request: RecordedRequest) => SimulatedReply)
) => {
  const requests: RecordedRequest[] = []

  client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const request: RecordedRequest = {
      method: config.method ?? 'get',
      url: `${config.baseURL ?? ''}${config.url ?? ''}`,
      body: typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? null),
      authorization: (config.headers.Authorization as string | undefined) ?? null
    }
    requests.push(request)

    const { status, data } = typeof reply === 'function' ? reply(request) : reply
    const response = { data, status, statusText: '', headers: {}, config }
    if (status < 400) return response
    throw new AxiosError('échec simulé', AxiosError.ERR_BAD_REQUEST, config, null, response)
  }

  return { requests }
}

/** Le client des routes joueur, le plus souvent simulé */
export const simulatePlayerApi = (reply: Parameters<typeof simulateApi>[1]) =>
  simulateApi(playerClient, reply)
