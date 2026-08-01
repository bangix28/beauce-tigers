import apiClient from './http';

export const playerDataAPI = {

  getAll: async () => {
    const urlToFetch = import.meta.env.VITE_RIOT_ACCOUNT_URL;
    const response = await apiClient.get(urlToFetch);

    return response.data;
  },

  getAllHistory: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_HISTORY_URL;
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  },

  getMatchDetail: async (id: number) => {
    const urlTemplate = import.meta.env.VITE_RIOT_MATCH_DETAIL_URL;
    const formattedUrl = urlTemplate.replace(':id', String(id));
    const response = await apiClient.get(formattedUrl);

    return response.data;
  }

};

export default {
  playerDataAPI
};