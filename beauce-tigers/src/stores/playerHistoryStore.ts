import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerHistory } from '../../types/playerHistory'
import { playerDataAPI } from '@/api/apiPlayer'
import { isCacheFresh } from '@/utils/cache'

// Taille demandée par la page compte ; sans param, le défaut serveur (5) s'applique
export const ACCOUNT_HISTORY_COUNT = 10

export const usePlayerHistoryStore = defineStore('playerHistory', () => {
  const PlayerHistoryData = ref<PlayerHistory[]>([])
  // Dernière liste connue par compte, toutes tailles confondues (radar de la page match)
  const historiesById = ref<Record<number, PlayerHistory[]>>({})
  // Cache par compte ET par taille demandée : la page compte (10) ne doit pas
  // resservir les 5 mis en cache par l'accueil, ni l'inverse
  const historiesByKey = ref<Record<string, PlayerHistory[]>>({})
  const historyFetchedAtByKey = ref<Record<string, number>>({})

  const fetchListPlayerHistoryData = async (id: number, itemsPerPage?: number) => {
    const key = `${id}:${itemsPerPage ?? 'default'}`
    const cached = historiesByKey.value[key]

    if (cached && isCacheFresh(historyFetchedAtByKey.value[key])) {
      PlayerHistoryData.value = cached
      historiesById.value[id] = cached
      return
    }

    const data = await playerDataAPI.getAllHistory(id, itemsPerPage)

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
      visionScore: item.visionScore ?? null,
      kda: item.kda ?? null,
      killParticipation: item.killParticipation ?? null,
      damagePerMinute: item.damagePerMinute ?? null,
      goldPerMinute: item.goldPerMinute ?? null,
      visionScorePerMinute: item.visionScorePerMinute ?? null
    }))

    historiesByKey.value[key] = list
    historyFetchedAtByKey.value[key] = Date.now()
    historiesById.value[id] = list
    PlayerHistoryData.value = list
  }

  return {
    fetchListPlayerHistoryData,
    PlayerHistoryData,
    historiesById,
    historiesByKey,
    historyFetchedAtByKey
  }
})
