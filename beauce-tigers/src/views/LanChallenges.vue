<template>
  <div class="lan-page container mx-auto px-4 py-6">
    <Transition name="fade" mode="out-in">
      <!-- Chargement : la forme de ce qui arrive plutôt qu'une page vide -->
      <div v-if="loading" key="loading" aria-busy="true" class="space-y-6">
        <p class="sr-only" role="status">Chargement de tes défis…</p>
        <SkeletonCard variant="panel" :lines="2" />
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard v-for="n in 3" :key="n" />
        </div>
      </div>

      <!-- Erreur bloquante : participant inconnu, LAN introuvable, panne… -->
      <section
        v-else-if="pageError"
        key="error"
        class="lan-panel lan-empty"
        role="alert"
        data-test="page-error"
      >
        <CircleAlert class="lan-empty__icon text-[var(--lan-fail)]" aria-hidden="true" />
        <h2 class="lan-title">{{ pageErrorView.title }}</h2>
        <p class="lan-empty__text">{{ pageError.message }}</p>
        <p v-if="pageErrorView.hint" class="lan-muted">{{ pageErrorView.hint }}</p>
        <router-link
          v-if="pageError.code === 'not_a_participant'"
          to="/profil"
          class="lan-btn lan-btn--primary"
        >
          Vérifier mes comptes liés
        </router-link>
        <button
          v-else-if="pageError.code !== 'several_accounts_in_lan'"
          type="button"
          class="lan-btn lan-btn--primary"
          @click="start"
        >
          <RefreshCw class="w-4 h-4" aria-hidden="true" /> Réessayer
        </button>
      </section>

      <!-- Inscrit à aucune LAN en cours ou à venir -->
      <section
        v-else-if="currentLan && !currentLan.lan"
        key="no-lan"
        class="lan-panel lan-empty"
        data-test="no-lan"
      >
        <CalendarClock class="lan-empty__icon text-[var(--lan-gold)]" aria-hidden="true" />
        <h2 class="lan-title">Aucune LAN prévue pour toi</h2>
        <p class="lan-muted">
          Dès que tu seras inscrit à une LAN, ton tableau de bord apparaîtra ici.
        </p>
        <router-link to="/profil" class="lan-btn lan-btn--ghost">
          Vérifier mes comptes liés
        </router-link>
      </section>

      <!-- LAN à venir : les défis ouvrent à startsAt -->
      <section
        v-else-if="lan && lan.status === 'upcoming'"
        key="upcoming"
        class="lan-panel lan-empty"
        data-test="lan-upcoming"
      >
        <Hourglass class="lan-empty__icon text-[var(--lan-gold)]" aria-hidden="true" />
        <h2 class="lan-title lan-title--gold">{{ lan.name }}</h2>
        <CountdownText :target="lan.startsAt" class="lan-countdown" />
        <p class="lan-muted max-w-md">
          Les défis ouvrent le {{ formatDate(lan.startsAt, "dd/MM/yyyy 'à' HH:mm") }} — la page
          s'ouvrira d'elle-même à ce moment-là.
        </p>
        <LanQueues v-if="lan.queues?.length" :queues="lan.queues" class="max-w-md" />
        <router-link to="/agent" class="lan-btn lan-btn--ghost">
          <PlugZap class="w-4 h-4" aria-hidden="true" /> Préparer mon agent
        </router-link>
      </section>

      <div v-else-if="lan && myRun" key="run" class="space-y-6">
        <!-- En-tête vivant : où j'en suis, quoi faire maintenant -->
        <header class="lan-panel">
          <div class="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="lan-title lan-title--gold mb-0">{{ lan.name }}</h2>
                <LiveIndicator v-if="!lanFinished" />
              </div>
              <p class="lan-muted text-sm mt-1">{{ myRun.riotId }}</p>
            </div>

            <div v-if="run" class="flex items-start gap-8">
              <div class="text-right">
                <p class="lan-muted text-sm">Score</p>
                <AnimatedNumber
                  :value="run.score"
                  class="run-score"
                  aria-hidden="true"
                  data-test="score"
                />
                <p class="sr-only" role="status">Ton score : {{ run.score }} points</p>
              </div>
              <div>
                <p class="lan-muted text-sm mb-2">Relances</p>
                <RerollPips :left="run.rerollsLeft" :initial="initialRerolls" />
                <span class="sr-only">
                  Relances restantes : <span data-test="rerolls">{{ run.rerollsLeft }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Pleine largeur : coincée à côté du score, la consigne se lisait mot à mot sur mobile -->
          <StatusLine :text="nextStepText" class="mt-4" />
          <RunStepper v-if="run && !lanFinished" :step="step" class="mt-5" />
          <LanQueues v-if="!lanFinished && lan.queues?.length" :queues="lan.queues" class="mt-5" />
        </header>

        <p v-if="lanFinished" class="lan-finished" role="status" data-test="lan-finished">
          La LAN est terminée : tu peux encore consulter ton parcours, mais plus jouer.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6 min-w-0">
            <Transition name="rise" mode="out-in">
              <!-- Pas encore inscrit aux défis -->
              <section
                v-if="screen.kind === 'not_joined'"
                key="not_joined"
                class="lan-panel lan-empty"
                data-test="screen-not-joined"
              >
                <Dices class="lan-empty__icon text-[var(--lan-tiger)]" aria-hidden="true" />
                <h2 class="lan-title">Prêt à pimenter tes parties ?</h2>
                <p class="lan-muted max-w-md">
                  Avant chaque match, tu tires 3 cartes défi. Garde-en une, réussis-la, marque des
                  points.
                </p>
                <button
                  type="button"
                  class="lan-btn lan-btn--primary"
                  :disabled="actionsDisabled"
                  :aria-busy="busy ? 'true' : 'false'"
                  @click="join"
                >
                  <span v-if="busy" class="motion-spinner" aria-hidden="true" />
                  {{ busy ? 'Ça mélange…' : 'Je rejoins les défis' }}
                </button>
              </section>

              <!-- Offre ; après un match, le verdict passe devant -->
              <div v-else-if="screen.kind === 'offer'" key="offer" class="space-y-6">
                <section v-if="screen.lastResult" class="lan-panel" data-test="last-result">
                  <h2 class="lan-title">
                    {{ step === 'verdict' ? 'Le verdict est tombé' : 'Ta dernière manche' }}
                  </h2>
                  <RoundResultCard :result="screen.lastResult" :catalogue="catalogue" />
                </section>

                <section class="lan-panel" data-test="screen-offer">
                  <h2 class="lan-title mb-1">À toi de jouer ! Choisis ta carte pour ce match</h2>
                  <p class="lan-muted mb-5">{{ rerollHint }}</p>
                  <OfferPicker
                    :offer="screen.offer"
                    :rerolls-left="run.rerollsLeft"
                    :targets="myRun.sabotageTargets"
                    :disabled="actionsDisabled"
                    :busy="busy"
                    @pick="pick"
                    @reroll="reroll"
                  />
                </section>
              </div>

              <!-- Carte en main, puis carte jouée sur le match en cours -->
              <section
                v-else-if="screen.kind === 'card_chosen' || screen.kind === 'in_game'"
                :key="screen.kind"
                class="lan-panel flex flex-col sm:flex-row items-center gap-6"
                :data-test="`screen-${screen.kind}`"
              >
                <div class="w-56 flex-shrink-0">
                  <LanCard :card="screen.card" :locked="screen.kind === 'in_game'" />
                </div>
                <div class="flex flex-col gap-3 text-center sm:text-left">
                  <template v-if="screen.kind === 'card_chosen'">
                    <h2 class="lan-title mb-0">C'est noté !</h2>
                    <p class="text-[var(--lan-ink)]">
                      Lance ta partie : ta carte se verrouille au chargement.
                    </p>
                    <div class="agent-reminder">
                      <PlugZap class="agent-reminder__icon" aria-hidden="true" />
                      <p>
                        Un agent tourne dans ta partie ? Le tien ou celui d'un autre joueur
                        suffit, lancé avant le chargement. Sans agent, ta carte ne se
                        verrouillera pas.
                        <router-link to="/agent" class="agent-reminder__link">
                          Connecter mon agent
                        </router-link>
                      </p>
                    </div>
                  </template>
                  <template v-else>
                    <h2 class="lan-title mb-0 flex items-center justify-center sm:justify-start gap-2">
                      <Gamepad2 class="w-6 h-6 text-[var(--lan-tiger)]" aria-hidden="true" />
                      En partie… on croise les doigts.
                    </h2>
                    <p class="text-[var(--lan-ink)]">Ton défi sera jugé à la fin du match.</p>
                  </template>
                </div>
              </section>

              <section
                v-else
                key="waiting"
                class="lan-panel lan-empty"
                data-test="screen-waiting"
              >
                <Hourglass class="lan-empty__icon text-[var(--lan-gold)]" aria-hidden="true" />
                <p class="lan-muted">On prépare ta prochaine offre…</p>
              </section>
            </Transition>

            <section v-if="run" class="lan-panel">
              <h2 class="lan-title">Mes manches</h2>
              <RunHistory :results="run.results" />
            </section>

            <section class="lan-panel" data-test="recap-section">
              <h2 class="lan-title mb-1">Récap de la soirée</h2>
              <p class="lan-muted text-sm mb-4">Qui a joué quoi, et comment ça s'est fini.</p>
              <LanRoundRecap
                :feed="feed"
                :standings="standings?.entries ?? []"
                :my-riot-id="myRun.riotId"
              />
            </section>
          </div>

          <aside class="space-y-6 min-w-0">
            <section class="lan-panel">
              <h2 class="lan-title">Classement</h2>
              <LanStandingsTable :entries="standings?.entries ?? []" :my-riot-id="myRun.riotId" />
            </section>
            <section class="lan-panel">
              <h2 class="lan-title">Exploits de la soirée</h2>
              <LanFeedList :entries="latestFeed" :my-riot-id="myRun.riotId" />
            </section>
          </aside>
        </div>
      </div>
    </Transition>

    <ToastStack :toasts="visibleToasts" @dismiss="dismissToast" />
  </div>
</template>

<script>
import {
  CalendarClock,
  CircleAlert,
  Dices,
  Gamepad2,
  Hourglass,
  PlugZap,
  RefreshCw
} from 'lucide-vue-next'
import LanCard from '@/components/lan/LanCard.vue'
import LanFeedList from '@/components/lan/LanFeedList.vue'
import LanQueues from '@/components/lan/LanQueues.vue'
import LanRoundRecap from '@/components/lan/LanRoundRecap.vue'
import LanStandingsTable from '@/components/lan/LanStandingsTable.vue'
import OfferPicker from '@/components/lan/OfferPicker.vue'
import RerollPips from '@/components/lan/RerollPips.vue'
import RoundResultCard from '@/components/lan/RoundResultCard.vue'
import RunHistory from '@/components/lan/RunHistory.vue'
import RunStepper from '@/components/lan/RunStepper.vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import CountdownText from '@/components/ui/CountdownText.vue'
import LiveIndicator from '@/components/ui/LiveIndicator.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import StatusLine from '@/components/ui/StatusLine.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import { useLanChallengeStore } from '@/stores/lanChallengeStore'
import { PICKPOCKET_CODE, readRunScreen } from '@/utils/lanRunState'
import { utilsTools } from '@/mixins/utilsTools.js'

/** Verrouillage et règlement sont automatiques : on relit le parcours à ce rythme */
const REFRESH_INTERVAL_MS = 15 * 1000
/** Plafond de setTimeout (~24,8 jours) : au-delà, le délai déborde et part tout de suite */
const MAX_TIMEOUT_MS = 2 ** 31 - 1
const SABOTAGE_TOAST_MS = 4000
/** Exploits visibles dans la colonne : le reste du fil sert au récap */
const EXPLOITS_SHOWN = 20
const VICTIM_TOAST_MS = 6000

/** Titre humain + ce que le joueur peut faire ; le message de l'API reste affiché tel quel */
const PAGE_ERRORS = {
  not_a_participant: {
    title: 'Tu n\'es pas inscrit à cette LAN',
    hint: 'Vérifie que le bon compte Riot est lié à ton profil.'
  },
  several_accounts_in_lan: {
    title: 'Plusieurs de tes comptes sont inscrits',
    hint: 'Un administrateur doit intervenir.'
  },
  lan_not_found: {
    title: 'LAN introuvable',
    hint: 'Elle vient peut-être d\'être déplacée : réessaie dans un instant.'
  }
}
const DEFAULT_PAGE_ERROR = {
  title: 'Impossible d\'afficher tes défis',
  hint: 'Vérifie ta connexion puis réessaie.'
}

/** Clé d'une entrée du fil : le fil n'a pas d'identifiant, on compose le nôtre */
const feedKey = (entry) =>
  [entry.kind, entry.riotId, entry.card?.code, entry.gameId, entry.occurredAt].join('|')

// Tableau de bord du joueur pour les défis de LAN. La LAN (et donc le lanId)
// vient de GET /me/lan-events/current : rien dans l'URL ni la configuration.
export default {
  name: 'LanChallenges',
  components: {
    AnimatedNumber,
    CalendarClock,
    CircleAlert,
    CountdownText,
    Dices,
    Gamepad2,
    Hourglass,
    LanCard,
    LanFeedList,
    LanQueues,
    LanRoundRecap,
    LanStandingsTable,
    LiveIndicator,
    OfferPicker,
    PlugZap,
    RefreshCw,
    RerollPips,
    RoundResultCard,
    RunHistory,
    RunStepper,
    SkeletonCard,
    StatusLine,
    ToastStack
  },
  mixins: [utilsTools],
  created() {
    this.lanChallengeStore = useLanChallengeStore()
    this.refreshTimer = null
    this.openingTimer = null
    /** Entrées du fil déjà vues ; null tant que le premier chargement n'est pas fait */
    this.seenFeedKeys = null
    this.toastSeq = 0
    // Ici et pas dans `watch` : les watchers d'options s'évaluent avant created,
    // quand le store n'est pas encore rattaché. Sorti de l'offre (carte
    // choisie), le toast de sabotage n'a plus lieu d'être.
    this.$watch('screen.kind', (kind) => {
      if (kind !== 'offer') this.dismissTag('sabotage')
    })
    this.$watch(() => this.lanChallengeStore.feed, this.onFeedChange)
  },
  data() {
    return {
      // Vrai dès le départ : le squelette s'affiche au premier rendu
      loading: true,
      toasts: [],
      /**
       * gameId du dernier résultat dont le joueur a pris connaissance (il a
       * relancé ou choisi depuis). Tant qu'il ne l'a pas fait, l'étape est « Verdict ».
       */
      acknowledgedGameId: null
    }
  },
  computed: {
    currentLan() {
      return this.lanChallengeStore.currentLan
    },
    lan() {
      return this.currentLan?.lan ?? null
    },
    myRun() {
      return this.lanChallengeStore.myRun
    },
    run() {
      return this.myRun?.run ?? null
    },
    screen() {
      return this.myRun ? readRunScreen(this.myRun) : { kind: 'waiting' }
    },
    catalogue() {
      return this.lanChallengeStore.catalogue
    },
    initialRerolls() {
      return this.catalogue?.rules.initialRerolls ?? 3
    },
    standings() {
      return this.lanChallengeStore.standings
    },
    feed() {
      return this.lanChallengeStore.feed
    },
    /** Le fil est chargé large pour le récap ; les exploits n'en montrent que le haut */
    latestFeed() {
      return this.feed.slice(0, EXPLOITS_SHOWN)
    },
    pageError() {
      return this.lanChallengeStore.pageError
    },
    pageErrorView() {
      return PAGE_ERRORS[this.pageError?.code] ?? DEFAULT_PAGE_ERROR
    },
    actionError() {
      return this.lanChallengeStore.actionError
    },
    lanFinished() {
      return this.lanChallengeStore.lanFinished
    },
    busy() {
      return this.lanChallengeStore.busy
    },
    actionsDisabled() {
      return this.lanFinished || this.busy
    },
    /** Choisir → Jouer → Verdict, lu sur l'écran courant */
    step() {
      switch (this.screen.kind) {
        case 'card_chosen':
        case 'in_game':
          return 'play'
        case 'waiting':
          return 'verdict'
        case 'offer':
          return this.screen.lastResult &&
            this.screen.lastResult.gameId !== this.acknowledgedGameId
            ? 'verdict'
            : 'choose'
        default:
          return 'choose'
      }
    },
    nextStepText() {
      if (this.lanFinished) return 'La LAN est terminée. Merci d\'avoir joué, ton parcours reste consultable.'
      switch (this.screen.kind) {
        case 'not_joined':
          return 'Rejoins les défis pour tirer tes premières cartes.'
        case 'offer':
          return this.step === 'verdict'
            ? 'Ta dernière manche est jugée. Prochaine étape : choisis ta carte pour le match suivant.'
            : 'Choisis une carte avant de lancer ta prochaine partie.'
        case 'card_chosen':
          return 'Carte en main : il ne reste plus qu\'à lancer ta partie.'
        case 'in_game':
          return 'Partie en cours : le verdict tombe à la fin du match.'
        default:
          return 'Le verdict arrive : la page se met à jour toute seule.'
      }
    },
    rerollHint() {
      const left = this.run?.rerollsLeft ?? 0
      return left > 0
        ? `Aucune ne te plaît ? Relance-en une (il t'en reste ${left}).`
        : 'Plus de relance : à toi de faire avec ces trois-là.'
    },
    /** L'erreur d'action vit dans le store : on la montre en tête de pile, sans délai */
    visibleToasts() {
      if (!this.actionError) return this.toasts
      const errorToast = {
        id: 'action-error',
        tone: 'error',
        role: 'alert',
        title: 'Ça n\'est pas passé',
        text: this.actionError.message,
        hint:
          this.actionError.status === 409
            ? 'Ton parcours vient d\'être remis à jour.'
            : 'Réessaie dans un instant.',
        dataTest: 'action-error'
      }
      return [errorToast, ...this.toasts]
    }
  },
  mounted() {
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.start()
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.stopTimers()
  },
  methods: {
    async start() {
      this.stopTimers()
      this.loading = true
      this.seenFeedKeys = null
      await this.lanChallengeStore.fetchCurrentLan()

      if (this.lan?.status === 'upcoming') {
        this.scheduleOpening()
      } else if (this.lan?.status === 'in_progress') {
        await this.lanChallengeStore.loadRun()
        // Ce qui est déjà au fil à l'arrivée n'est pas une nouvelle
        this.seenFeedKeys = new Set(this.feed.map(feedKey))
        this.refreshTimer = setInterval(this.refresh, REFRESH_INTERVAL_MS)
      }
      this.loading = false
    },
    /** Les défis ouvrent à startsAt : on relit la LAN à ce moment-là */
    scheduleOpening() {
      const delay = new Date(this.lan.startsAt).getTime() - Date.now()
      this.openingTimer = setTimeout(this.start, Math.min(Math.max(delay, 0) + 1000, MAX_TIMEOUT_MS))
    },
    stopTimers() {
      clearInterval(this.refreshTimer)
      clearTimeout(this.openingTimer)
      this.refreshTimer = null
      this.openingTimer = null
    },
    refresh() {
      // Onglet caché : inutile de solliciter l'API, on rattrape au retour
      if (document.hidden) return
      this.lanChallengeStore.refresh()
    },
    onVisibilityChange() {
      if (!document.hidden && this.refreshTimer) this.lanChallengeStore.refresh()
    },
    /** Côté victime : un Pickpocket arrivé au fil depuis la dernière lecture */
    onFeedChange(entries) {
      if (!this.seenFeedKeys || !this.myRun) return
      entries.forEach((entry) => {
        const key = feedKey(entry)
        if (this.seenFeedKeys.has(key)) return
        this.seenFeedKeys.add(key)
        // La Malédiction reste secrète pour sa cible : seul le vol se remarque
        if (
          entry.kind === 'sabotage' &&
          entry.riotId === this.myRun.riotId &&
          entry.card?.code === PICKPOCKET_CODE
        ) {
          this.pushToast({
            tag: 'pickpocketed',
            tone: 'sabotage',
            icon: 'pickpocketed',
            text: 'Quelqu\'un t\'a fait les poches… une relance en moins.',
            duration: VICTIM_TOAST_MS
          })
        }
      })
    },
    join() {
      this.lanChallengeStore.join()
    },
    async pick(payload) {
      const card = this.screen.offer?.[payload.slot]
      this.acknowledgeLastResult()
      this.dismissTag('sabotage')
      const picked = await this.lanChallengeStore.pick(payload)
      // Carte qui vise un joueur : effet immédiat, la réponse contient déjà
      // l'offre neuve. Le toast confirme le coup, l'offre neuve prend la place.
      if (picked && card?.needsTarget) {
        this.pushToast({
          tag: 'sabotage',
          tone: 'sabotage',
          title: 'Coup monté !',
          text: this.sabotageText(card, payload.target),
          dataTest: 'sabotage-done',
          duration: SABOTAGE_TOAST_MS
        })
      }
    },
    sabotageText(card, target) {
      if (card.code === PICKPOCKET_CODE) {
        return `Coup bas réussi : ${target} perd une relance. Ton secret est bien gardé.`
      }
      if (card.code === 'curse') return `${target} est maudit… et ne le sait pas encore.`
      return 'Personne ne saura que c\'était toi.'
    },
    reroll(slot) {
      this.acknowledgeLastResult()
      this.dismissTag('sabotage')
      this.lanChallengeStore.reroll(slot)
    },
    acknowledgeLastResult() {
      if (this.screen.kind === 'offer') {
        this.acknowledgedGameId = this.screen.lastResult?.gameId ?? null
      }
    },
    /** Un seul toast par sujet : le nouveau remplace l'ancien */
    pushToast(toast) {
      this.toastSeq += 1
      this.toasts = [
        ...this.toasts.filter((t) => t.tag !== toast.tag),
        { ...toast, id: `${toast.tag}-${this.toastSeq}` }
      ]
    },
    dismissTag(tag) {
      if (this.toasts.some((t) => t.tag === tag)) {
        this.toasts = this.toasts.filter((t) => t.tag !== tag)
      }
    },
    dismissToast(id) {
      if (id === 'action-error') this.lanChallengeStore.clearActionError()
      else this.toasts = this.toasts.filter((t) => t.id !== id)
    }
  }
}
</script>

<style scoped>
.lan-page {
  color: var(--lan-ink);
  font-size: 1rem;
  line-height: 1.5;
}

/* États « vides » : une icône, un titre, une phrase, une action */
.lan-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-block: 3rem;
  text-align: center;
}

.lan-empty .lan-title {
  margin-bottom: 0;
}

.lan-empty__icon {
  width: 3rem;
  height: 3rem;
  opacity: 0.85;
}

.lan-empty__text {
  max-width: 32rem;
  color: var(--lan-ink);
}

.lan-empty .lan-btn {
  margin-top: 0.5rem;
}

.lan-countdown {
  font-family: var(--font-beaufort), serif;
  font-size: 1.5rem;
  color: var(--lan-tiger);
}

.run-score {
  font-family: var(--font-beaufort), serif;
  font-size: 2.25rem;
  line-height: 1.1;
  color: var(--lan-points);
}

.lan-finished {
  padding: 0.875rem 1rem;
  border: 1px solid var(--lan-line-strong);
  border-radius: 14px;
  background: var(--lan-surface);
  color: var(--lan-ink-soft);
  text-align: center;
}

.agent-reminder {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border: 1px dashed var(--lan-line-strong);
  border-radius: 10px;
  color: var(--lan-ink-soft);
  text-align: left;
}

.agent-reminder__icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
  color: var(--lan-tiger);
}

.agent-reminder__link {
  color: var(--lan-tiger);
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}

.agent-reminder__link:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
  border-radius: 4px;
}
</style>
