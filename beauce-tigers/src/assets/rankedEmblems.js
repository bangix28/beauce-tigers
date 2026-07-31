// Emblèmes ranked rognés (source : Community Dragon, marge transparente supprimée via sharp).
// Imports explicites pour que Vite fingerprinte et bundle les assets.
import iron from '@/assets/img/ranked/iron.png'
import bronze from '@/assets/img/ranked/bronze.png'
import silver from '@/assets/img/ranked/silver.png'
import gold from '@/assets/img/ranked/gold.png'
import platinum from '@/assets/img/ranked/platinum.png'
import emerald from '@/assets/img/ranked/emerald.png'
import diamond from '@/assets/img/ranked/diamond.png'
import master from '@/assets/img/ranked/master.png'
import grandmaster from '@/assets/img/ranked/grandmaster.png'
import challenger from '@/assets/img/ranked/challenger.png'
import unranked from '@/assets/img/ranked/unranked.png' // poro endormi

export const RANKED_EMBLEMS = {
  IRON: iron,
  BRONZE: bronze,
  SILVER: silver,
  GOLD: gold,
  PLATINUM: platinum,
  EMERALD: emerald,
  DIAMOND: diamond,
  MASTER: master,
  GRANDMASTER: grandmaster,
  CHALLENGER: challenger,
  UNRANKED: unranked,
}
