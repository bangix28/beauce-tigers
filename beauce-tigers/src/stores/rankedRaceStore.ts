import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RaceSelection, RaceStandings, RankedRaceEvent } from '../../types/rankedRace'
import { playerDataAPI } from '@/api/apiPlayer'
import { isCacheFresh } from '@/utils/cache'
import { mapRaceStandings, mapRankedRaceEvent } from '@/utils/raceMapper'

/** Clé de cache : 'solo:week' pour le calendaire, 'event:2' pour un événement */
export const selectionKey = (selection: RaceSelection): string =>
  selection.kind === 'event' ? `event:${selection.id}` : `${selection.queue}:${selection.period}`

export const useRankedRaceStore = defineStore('rankedRace', () => {
  const standingsByKey = ref<Record<string, RaceStandings>>({})
  const standingsFetchedAtByKey = ref<Record<string, number>>({})
  const events = ref<RankedRaceEvent[]>([])
  const eventsFetchedAt = ref<number | undefined>(undefined)
  const notFound = ref(false)
  const error = ref(false)

  const fetchEvents = async () => {
    if (events.value.length && isCacheFresh(eventsFetchedAt.value)) {
      return
    }

    const data = await playerDataAPI.getRankedRaceEvents()
    events.value = (data.member ?? []).map(mapRankedRaceEvent)
    eventsFetchedAt.value = Date.now()
  }

  const fetchStandings = async (selection: RaceSelection) => {
    notFound.value = false
    error.value = false

    const key = selectionKey(selection)
    if (standingsByKey.value[key] && isCacheFresh(standingsFetchedAtByKey.value[key])) {
      return
    }

    try {
      const data =
        selection.kind === 'event'
          ? await playerDataAPI.getRankedRaceEvent(selection.id)
          : await playerDataAPI.getRankedRace(selection.queue, selection.period)

      standingsByKey.value[key] = mapRaceStandings(data)
      standingsFetchedAtByKey.value[key] = Date.now()
    } catch (e: any) {
      // Seul un vrai 404 signifie "cet événement n'existe pas" ; le reste est
      // une panne réessayable, que la vue propose de relancer
      if (e?.response?.status === 404) {
        notFound.value = true
      } else {
        console.error('Erreur lors de la récupération de la course :', e)
        error.value = true
      }
    }
  }

  return {
    fetchEvents,
    fetchStandings,
    standingsByKey,
    standingsFetchedAtByKey,
    events,
    eventsFetchedAt,
    notFound,
    error
  }
})
