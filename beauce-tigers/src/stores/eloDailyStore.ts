import { defineStore } from 'pinia'
import { ref } from 'vue'
import { EloDailyPoint } from '../../types/eloDaily'
import { playerDataAPI } from '@/api/apiPlayer'
import { isCacheFresh } from '@/utils/cache'

export const useEloDailyStore = defineStore('eloDaily', () => {
  const seriesById = ref<Record<number, EloDailyPoint[]>>({})
  const seriesFetchedAtById = ref<Record<number, number>>({})

  const fetchEloDaily = async (id: number) => {
    if (seriesById.value[id] && isCacheFresh(seriesFetchedAtById.value[id])) {
      return
    }

    const data = await playerDataAPI.getEloDaily(id)

    const list: EloDailyPoint[] = (data.member ?? [])
      // score est encore un string côté API ("4230") : on normalise ici,
      // les points invalides sont écartés plutôt que tracés comme des 0
      .map((item: any) => ({ date: item.dateScore, score: Number(item.score) }))
      .filter((p: EloDailyPoint) => p.date != null && Number.isFinite(p.score))
      // Tri défensif : l'API renvoie déjà dateScore ASC, mais le graphique
      // serait illisible si l'ordre changeait un jour
      .sort(
        (a: EloDailyPoint, b: EloDailyPoint) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )

    seriesById.value[id] = list
    seriesFetchedAtById.value[id] = Date.now()
  }

  return {
    fetchEloDaily,
    seriesById,
    seriesFetchedAtById
  }
})
