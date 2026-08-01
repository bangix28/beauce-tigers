import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Enregistrement tree-shaké : uniquement ce dont les graphiques du site ont besoin.
// Ce module n'est importé que par les composants charts (chargés en lazy avec la
// page match), il ne pèse donc pas sur le bundle de l'accueil.
ChartJS.register(
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
)

// Couleurs du design system LoL (mêmes valeurs que le @theme de index.css)
export const LOL_GOLD = '#C8AA6E'
export const LOL_BLUE = '#0AC8B9'
export const LOL_DARKER = '#0A1428'
// Rouge désaturé pour les défaites/dégâts subis (moins agressif que le rouge pur)
export const LOL_RED = '#c6403b'
// Gris foncé des grilles et pistes (assorti aux bordures du site)
export const LOL_GRID = '#1e2d45'

// Thème global partagé par tous les graphiques, actuels et futurs
ChartJS.defaults.color = '#9ca3af'
ChartJS.defaults.font.family = 'Spiegel, sans-serif'
ChartJS.defaults.borderColor = LOL_GRID
ChartJS.defaults.plugins.tooltip.backgroundColor = LOL_DARKER
ChartJS.defaults.plugins.tooltip.borderColor = LOL_GOLD
ChartJS.defaults.plugins.tooltip.borderWidth = 1
ChartJS.defaults.plugins.tooltip.titleColor = LOL_GOLD
ChartJS.defaults.plugins.tooltip.bodyColor = '#e5e7eb'
ChartJS.defaults.plugins.tooltip.padding = 10

export { ChartJS }
