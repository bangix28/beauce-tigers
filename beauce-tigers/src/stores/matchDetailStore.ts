import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MatchDetail } from '../../types/matchDetail'
import { playerDataAPI } from '@/api/apiPlayer'

export const useMatchDetailStore = defineStore('matchDetail', () => {
  const matchDetail = ref<MatchDetail | null>(null)
  const detailsById = ref<Record<number, MatchDetail>>({})
  const detailFetchedAtById = ref<Record<number, number>>({})
  const notFound = ref(false)
  const error = ref(false)

  // Anti-corruption layer : on normalise ici le JSON-LD de l'API
  // pour que les composants ne consomment que des types propres
  const mapToMatchDetail = (item: any): MatchDetail => ({
    id: item.id,
    matchId: item.matchId ?? null,
    queueId: item.queueId ?? null,
    win: item.isWin,
    championId: item.championId,
    championName: item.championName ?? null,
    teamPosition: item.teamPosition ?? null,
    dateGameEnd: item.dateGameEnd,
    kill: item.killPlayer,
    deaths: item.deathPlayer,
    assist: item.assistPlayer,
    champLevel: item.champLevel ?? null,
    creepScore: item.creepScore ?? null,
    visionScore: item.visionScore ?? null,
    // Number() tolère l'ancien format string "32" comme le nouveau int 32
    gameDuration: item.gameDuration != null ? Number(item.gameDuration) : null,
    goldEarned: item.goldEarned ?? null,
    // 0 côté Riot = slot vide → null pour afficher une case vide stylée
    items: [item.item0, item.item1, item.item2, item.item3, item.item4, item.item5, item.item6].map(
      (i: any) => (i == null || i === 0 ? null : i)
    ),
    summonerSpell1Id: item.summonerSpell1Id ?? null,
    summonerSpell2Id: item.summonerSpell2Id ?? null,
    runeKeystoneId: item.runeKeystoneId ?? null,
    runePrimaryStyleId: item.runePrimaryStyleId ?? null,
    runeSubStyleId: item.runeSubStyleId ?? null,
    runeStatDefense: item.runeStatDefense ?? null,
    runeStatFlex: item.runeStatFlex ?? null,
    runeStatOffense: item.runeStatOffense ?? null,
    totalDamageDealtToChampions: item.totalDamageDealtToChampions ?? null,
    totalDamageTaken: item.totalDamageTaken ?? null,
    doubleKills: item.doubleKills ?? null,
    tripleKills: item.tripleKills ?? null,
    quadraKills: item.quadraKills ?? null,
    pentaKills: item.pentaKills ?? null,
    firstBloodKill: item.firstBloodKill ?? null,
    gameEndedInSurrender: item.gameEndedInSurrender ?? null,
    kda: item.kda ?? null,
    killParticipation: item.killParticipation ?? null,
    damagePerMinute: item.damagePerMinute ?? null,
    goldPerMinute: item.goldPerMinute ?? null,
    visionScorePerMinute: item.visionScorePerMinute ?? null
  })

  const fetchMatchDetail = async (id: number) => {
    notFound.value = false
    error.value = false

    const now = Date.now()
    const cached = detailsById.value[id]
    const fetchedAt = detailFetchedAtById.value[id]
    const THIRTY_MIN = 30 * 60 * 1000

    if (cached && fetchedAt && now - fetchedAt < THIRTY_MIN) {
      matchDetail.value = cached
      return
    }

    try {
      const data = await playerDataAPI.getMatchDetail(id)
      const detail = mapToMatchDetail(data)

      detailsById.value[id] = detail
      detailFetchedAtById.value[id] = now
      matchDetail.value = detail
    } catch (e: any) {
      matchDetail.value = null
      if (e?.response?.status === 404) {
        notFound.value = true
      } else {
        // Visible en console : aide à distinguer une panne réseau d'une
        // variable VITE_RIOT_MATCH_DETAIL_URL absente (urlTemplate undefined)
        console.error('Erreur lors de la récupération du détail du match :', e)
        error.value = true
      }
    }
  }

  return {
    fetchMatchDetail,
    matchDetail,
    detailsById,
    detailFetchedAtById,
    notFound,
    error
  }
})
