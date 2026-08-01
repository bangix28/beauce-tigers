// Détail complet d'un match (endpoint /history-account-lol/{id}).
// Tous les champs "détail" sont nullables : les matchs antérieurs à
// l'enrichissement de l'API n'ont que le socle (KDA, champion, durée...).
export interface MatchDetail {
  id: number
  matchId: string | null
  queueId: number | null
  win: boolean
  championId: number
  championName: string | null
  teamPosition: string | null
  dateGameEnd: Date
  kill: number
  deaths: number
  assist: number
  champLevel: number | null
  creepScore: number | null
  visionScore: number | null
  // En minutes (division entière côté API)
  gameDuration: number | null

  // Économie
  goldEarned: number | null

  // Build : 7 slots, index 6 = trinket ; 0 côté Riot = slot vide → null
  items: (number | null)[]
  summonerSpell1Id: number | null
  summonerSpell2Id: number | null

  // Runes (IDs de perks Riot)
  runeKeystoneId: number | null
  runePrimaryStyleId: number | null
  runeSubStyleId: number | null
  runeStatDefense: number | null
  runeStatFlex: number | null
  runeStatOffense: number | null

  // Combat
  totalDamageDealtToChampions: number | null
  totalDamageTaken: number | null
  doubleKills: number | null
  tripleKills: number | null
  quadraKills: number | null
  pentaKills: number | null
  firstBloodKill: boolean | null
  gameEndedInSurrender: boolean | null

  // Challenges Riot (absents sur les vieux matchs / modes spéciaux)
  kda: number | null
  // Ratio 0-1, à multiplier par 100 uniquement à l'affichage
  killParticipation: number | null
  damagePerMinute: number | null
  goldPerMinute: number | null
  visionScorePerMinute: number | null
}
