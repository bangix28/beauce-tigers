import apiClient from './http';

export const playerDataAPI = {

  getAll: async () => {
    const urlToFetch = import.meta.env.VITE_RIOT_ACCOUNT_URL;
    const response = await apiClient.get(urlToFetch);

    return response.data;
  },

  getAllHistory: async (id: number, itemsPerPage?: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_HISTORY_URL;
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl, {
      // Sans param : le défaut serveur (5) s'applique ; la page compte demande 10
      params: itemsPerPage != null ? { itemsPerPage } : undefined
    });

    return response.data;
  },

  getMatchDetail: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_MATCH_DETAIL_URL;
    if (!urlTemplate) {
      throw new Error('VITE_RIOT_MATCH_DETAIL_URL manquante dans le .env (voir .env.template)');
    }
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  },

  getAccountDetail: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_ACCOUNT_DETAIL_URL;
    if (!urlTemplate) {
      throw new Error('VITE_RIOT_ACCOUNT_DETAIL_URL manquante dans le .env (voir .env.template)');
    }
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  },

  getEloDaily: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_ELO_DAILY_URL;
    if (!urlTemplate) {
      throw new Error('VITE_RIOT_ELO_DAILY_URL manquante dans le .env (voir .env.template)');
    }
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  },

  getRankedRace: async (queue?: string, period?: string) => {
    const urlToFetch = import.meta.env.VITE_RIOT_RANKED_RACE_URL;
    if (!urlToFetch) {
      throw new Error('VITE_RIOT_RANKED_RACE_URL manquante dans le .env (voir .env.template)');
    }
    const response = await apiClient.get(urlToFetch, {
      // Sans param : les défauts amont s'appliquent (solo / week)
      params: { queue, period }
    });

    return response.data;
  },

  getRankedRaceEvents: async () => {
    const urlToFetch = import.meta.env.VITE_RIOT_RANKED_RACE_EVENTS_URL;
    if (!urlToFetch) {
      throw new Error('VITE_RIOT_RANKED_RACE_EVENTS_URL manquante dans le .env (voir .env.template)');
    }
    const response = await apiClient.get(urlToFetch);

    return response.data;
  },

  getRankedRaceEvent: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_RANKED_RACE_EVENT_URL;
    if (!urlTemplate) {
      throw new Error('VITE_RIOT_RANKED_RACE_EVENT_URL manquante dans le .env (voir .env.template)');
    }
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  }

};

export default {
  playerDataAPI
};