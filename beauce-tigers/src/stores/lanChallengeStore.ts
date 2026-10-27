import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  CardCatalogue,
  CurrentLan,
  FeedEntry,
  LanStandings,
  MyRun,
  PickPayload
} from '../../types/lanChallenge'
import { lanChallengeAPI } from '@/api/apiLanChallenge'
import { ApiError } from '@/api/playerHttp'
import { FEED_RECAP_LIMIT } from '@/utils/roundRecap'

/** Erreurs qui rendent la page inutilisable : on remplace le parcours par le message */
const BLOCKING_CODES = ['not_a_participant', 'lan_not_found', 'several_accounts_in_lan']

const toApiError = (e: unknown): ApiError =>
  e instanceof ApiError
    ? e
    : new ApiError(0, 'unexpected', 'Une erreur inattendue est survenue, réessaie.')

export const useLanChallengeStore = defineStore('lanChallenge', () => {
  const currentLan = ref<CurrentLan | null>(null)
  const myRun = ref<MyRun | null>(null)
  const catalogue = ref<CardCatalogue | null>(null)
  const standings = ref<LanStandings | null>(null)
  const feed = ref<FeedEntry[]>([])
  /** Erreur bloquante (participant inconnu, LAN introuvable…) */
  const pageError = ref<ApiError | null>(null)
  /** Erreur d'une action (choix, relance) : affichée sans masquer le parcours */
  const actionError = ref<ApiError | null>(null)
  /** 409 lan_finished reçu : on consulte encore, on n'agit plus */
  const lanFinished = ref(false)
  const busy = ref(false)

  /** Seule source du lanId : la LAN renvoyée par /me/lan-events/current */
  const lanId = computed(() => currentLan.value?.lan?.id ?? null)
  const isInProgress = computed(() => currentLan.value?.lan?.status === 'in_progress')

  const handleError = (e: unknown) => {
    const error = toApiError(e)
    if (error.code === 'lan_finished') lanFinished.value = true
    if (BLOCKING_CODES.includes(error.code)) pageError.value = error
    return error
  }

  const fetchCurrentLan = async () => {
    pageError.value = null
    try {
      currentLan.value = await lanChallengeAPI.getCurrentLan()
    } catch (e) {
      pageError.value = toApiError(e)
    }
  }

  const fetchMyRun = async () => {
    if (lanId.value == null) return
    myRun.value = await lanChallengeAPI.getMyRun(lanId.value)
  }

  const fetchCatalogue = async () => {
    if (catalogue.value) return
    catalogue.value = await lanChallengeAPI.getCatalogue()
  }

  /** Classement et fil : affichage secondaire, une panne ne bloque pas le parcours */
  const fetchSidePanels = async () => {
    if (lanId.value == null) return
    const id = lanId.value
    const [standingsResult, feedResult] = await Promise.allSettled([
      lanChallengeAPI.getStandings(id),
      // Le maximum de l'API : le fil alimente aussi le récap de la soirée
      lanChallengeAPI.getFeed(id, FEED_RECAP_LIMIT)
    ])
    if (standingsResult.status === 'fulfilled') standings.value = standingsResult.value
    if (feedResult.status === 'fulfilled') feed.value = feedResult.value.entries
  }

  /** Premier chargement du parcours d'une LAN en cours */
  const loadRun = async () => {
    if (!isInProgress.value) return
    try {
      await Promise.all([fetchMyRun(), fetchCatalogue(), fetchSidePanels()])
    } catch (e) {
      const error = handleError(e)
      if (!pageError.value) pageError.value = error
    }
  }

  /**
   * Relecture périodique : le verrouillage et le règlement sont automatiques,
   * le front les constate. Une panne passagère est ignorée, le tour suivant
   * réessaiera ; seules les erreurs bloquantes remontent.
   */
  const refresh = async () => {
    if (!isInProgress.value || busy.value) return
    try {
      await Promise.all([fetchMyRun(), fetchSidePanels()])
    } catch (e) {
      handleError(e)
    }
  }

  /**
   * join, pick et reroll renvoient le parcours à jour : on remplace l'état sans
   * relire. Après un 409, l'état a pu changer (carte verrouillée entre-temps) :
   * on relit GET /me.
   */
  const runAction = async (action: (lanId: number) => Promise<MyRun>): Promise<boolean> => {
    if (lanId.value == null || busy.value) return false
    busy.value = true
    actionError.value = null
    try {
      myRun.value = await action(lanId.value)
      return true
    } catch (e) {
      const error = handleError(e)
      if (!BLOCKING_CODES.includes(error.code)) actionError.value = error
      if (error.status === 409) {
        await fetchMyRun().catch(() => {})
      }
      return false
    } finally {
      busy.value = false
    }
  }

  const join = () => runAction((id) => lanChallengeAPI.join(id))
  const pick = (payload: PickPayload) => runAction((id) => lanChallengeAPI.pick(id, payload))
  const reroll = (slot: number) => runAction((id) => lanChallengeAPI.reroll(id, slot))

  const clearActionError = () => {
    actionError.value = null
  }

  return {
    currentLan,
    myRun,
    catalogue,
    standings,
    feed,
    pageError,
    actionError,
    lanFinished,
    busy,
    lanId,
    isInProgress,
    fetchCurrentLan,
    loadRun,
    refresh,
    join,
    pick,
    reroll,
    clearActionError
  }
})
