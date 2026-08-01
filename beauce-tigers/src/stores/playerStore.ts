import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerData } from '../../types/playerData'
import { playerDataAPI } from '@/api/apiPlayer'
import { mapToPlayerData } from '@/utils/playerMapper'

export const usePlayerDataStore = defineStore('playerData', () => {
  const playerData = ref<PlayerData[]>([])

  const fetchListPlayerData = async () => {
    let data = await playerDataAPI.getAll()

    playerData.value = data.member.map(mapToPlayerData)
  }

  return {
    fetchListPlayerData: fetchListPlayerData,
    playerData
  }
})
