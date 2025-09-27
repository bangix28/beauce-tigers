import { defineStore } from 'pinia'
import { ref } from 'vue'
import {PlayerData } from '../../types/playerData'
import { playerDataAPI } from '@/api/apiPlayer'


export const usePlayerDataStore = defineStore('playerData', () => {
    const playerData = ref<PlayerData[]>([]);

    const fetchListPlayerData = async () => {
      let data = await playerDataAPI.getAll();

      playerData.value = data.member.map((item: any) => ({
        id: item.id,
        lastUpdate: item.lastUpdate,
        logoId: item.logoId,
        score: item.score,
        level: item.summonerLevel,
        name: item.summonerName,
        rankedSoloPoints: item.summonerRankedSoloLeaguePoints,
        rankedSoloRanks: item.summonerRankedSoloRank ?? null,
        rankedSoloLosses: item.summonerRankedSoloLosses ?? null,
        rankedSoloTiers: item.summonerRankedSoloTier ?? null,
        rankedSoloWins: item.summoner_ranked_solo_wins ?? null,
      }));


    }

  return {
    fetchListPlayerData: fetchListPlayerData,
    playerData
  }
});