import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerHistory } from '../../types/playerHistory'
import { playerDataAPI } from '@/api/apiPlayer'

export const usePlayerHistoryStore = defineStore('playerHistory', () => {
  const PlayerHistoryData = ref<PlayerHistory[]>([])
  const historiesById = ref<Record<number, PlayerHistory[]>>({})
  const historyFetchedAtById = ref<Record<number, number>>({})

  const fetchListPlayerHistoryData = async (id: number) => {
    const now = Date.now()
    const cached = historiesById.value[id]
    const fetchedAt = historyFetchedAtById.value[id]
    const FIFTEEN_MIN = 30 * 60 * 1000

    if (cached && fetchedAt && now - fetchedAt < FIFTEEN_MIN) {
      PlayerHistoryData.value = cached
      return
    }

    const data = await playerDataAPI.getAllHistory(id)

    const list: PlayerHistory[] = data.member.map((item: any) => ({
      id: item.id,
      win: item.isWin,
      dateGameEnd: item.dateGameEnd,
      champion: item.championId,
      championName: item.championName ?? null,
      // Number() tolère l'ancien format string "32" comme le nouveau int 32
      gameDuration: item.gameDuration != null ? Number(item.gameDuration) : null,
      assist: item.assistPlayer,
      deaths: item.deathPlayer,
      kill: item.killPlayer,
      creepScore: item.creepScore ?? null,
      visionScore: item.visionScore ?? null
    }))

    historiesById.value[id] = list
    historyFetchedAtById.value[id] = now
    PlayerHistoryData.value = list
  }

  return {
    fetchListPlayerHistoryData,
    PlayerHistoryData,
    historiesById,
    historyFetchedAtById
  }
})
