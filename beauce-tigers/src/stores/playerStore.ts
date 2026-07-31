import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerData } from '../../types/playerData'
import { playerDataAPI } from '@/api/apiPlayer'

// L'API renvoie encore LP/losses en string ("93") mais wins en int ; demain tout sera int.
// On normalise ici une bonne fois : les composants ne consomment que des number | null.
const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export const usePlayerDataStore = defineStore('playerData', () => {
  const playerData = ref<PlayerData[]>([])

  const fetchListPlayerData = async () => {
    let data = await playerDataAPI.getAll()

    playerData.value = data.member.map((item: any) => ({
      id: item.id,
      lastUpdate: item.lastUpdate,
      logoId: item.logoId,
      score: item.score,
      level: item.summonerLevel,
      name: item.summonerName,
      rankedSoloPoints: toNumber(item.summonerRankedSoloLeaguePoints),
      rankedSoloRanks: item.summonerRankedSoloRank ?? null,
      rankedSoloLosses: toNumber(item.summonerRankedSoloLosses),
      rankedSoloTiers: item.summonerRankedSoloTier ?? null,
      // Tolérant aux deux conventions : clé snake_case actuelle de l'API,
      // camelCase si la propriété est renommée un jour côté Symfony
      rankedSoloWins: toNumber(item.summonerRankedSoloWins ?? item.summoner_ranked_solo_wins),
      soloHotStreak: item.soloHotStreak ?? false,
      soloVeteran: item.soloVeteran ?? false,
      soloFreshBlood: item.soloFreshBlood ?? false,
      soloMiniSeriesWins: toNumber(item.soloMiniSeriesWins),
      soloMiniSeriesLosses: toNumber(item.soloMiniSeriesLosses),
      soloMiniSeriesTarget: toNumber(item.soloMiniSeriesTarget),
      soloMiniSeriesProgress: item.soloMiniSeriesProgress ?? null
    }))
  }

  return {
    fetchListPlayerData: fetchListPlayerData,
    playerData
  }
})
