import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerData } from '../../types/playerData'
import { playerDataAPI } from '@/api/apiPlayer'
import { usePlayerDataStore } from '@/stores/playerStore'
import { isCacheFresh } from '@/utils/cache'
import { mapToPlayerData } from '@/utils/playerMapper'

export const useAccountDetailStore = defineStore('accountDetail', () => {
  const account = ref<PlayerData | null>(null)
  const accountsById = ref<Record<number, PlayerData>>({})
  const accountFetchedAtById = ref<Record<number, number>>({})
  const notFound = ref(false)
  const error = ref(false)

  const fetchAccountDetail = async (id: number) => {
    notFound.value = false
    error.value = false

    const cached = accountsById.value[id]

    if (cached && isCacheFresh(accountFetchedAtById.value[id])) {
      account.value = cached
      return
    }

    // Navigation depuis l'accueil : la collection du classement est déjà chargée
    // (et rafraîchie toutes les 30 min), on affiche sans appel réseau supplémentaire
    const fromList = usePlayerDataStore().playerData.find((p) => p.id === id)
    if (fromList) {
      accountsById.value[id] = fromList
      accountFetchedAtById.value[id] = Date.now()
      account.value = fromList
      return
    }

    try {
      const data = await playerDataAPI.getAccountDetail(id)
      const detail = mapToPlayerData(data)

      accountsById.value[id] = detail
      accountFetchedAtById.value[id] = Date.now()
      account.value = detail
    } catch (e: any) {
      account.value = null
      if (e?.response?.status === 404) {
        notFound.value = true
      } else {
        // Visible en console : aide à distinguer une panne réseau d'une
        // variable VITE_RIOT_ACCOUNT_DETAIL_URL absente (urlTemplate undefined)
        console.error('Erreur lors de la récupération du compte :', e)
        error.value = true
      }
    }
  }

  return {
    fetchAccountDetail,
    account,
    accountsById,
    accountFetchedAtById,
    notFound,
    error
  }
})
