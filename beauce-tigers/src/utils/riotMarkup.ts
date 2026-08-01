// Balises du markup Riot (descriptions d'items, runes, sorts) → classes CSS
// du tooltip. Toute balise hors de cette liste est supprimée (texte conservé) :
// seul du HTML généré ici est injecté dans les v-html des tooltips.
const RIOT_TAG_CLASSES: Record<string, string | null> = {
  maintext: null, // conteneur racine, aucun style
  stats: 'tt-stats',
  attention: 'tt-attention',
  b: 'tt-attention',
  buffedstat: 'tt-attention',
  scalelevel: 'tt-attention',
  scalearmor: 'tt-attention',
  scalemr: 'tt-attention',
  scalecrit: 'tt-attention',
  scalelethality: 'tt-attention',
  armorpen: 'tt-attention',
  attackspeed: 'tt-attention',
  passive: 'tt-title',
  active: 'tt-title',
  unique: 'tt-title',
  spellname: 'tt-title',
  spellpassive: 'tt-title',
  keyword: 'tt-title',
  keywordmajor: 'tt-title',
  recast: 'tt-title',
  ornnbonus: 'tt-title',
  raritymythic: 'tt-title',
  raritylegendary: 'tt-title',
  raritygeneric: 'tt-title',
  prismatic: 'tt-title',
  jadeunique: 'tt-title',
  titleleft: 'tt-title',
  titleright: 'tt-rules',
  rules: 'tt-rules',
  flavortext: 'tt-rules',
  jaderules: 'tt-rules',
  jadelimit: 'tt-rules',
  physicaldamage: 'tt-physical',
  scalead: 'tt-physical',
  magicdamage: 'tt-magic',
  scaleap: 'tt-magic',
  scalemana: 'tt-magic',
  truedamage: 'tt-true',
  danger: 'tt-true',
  status: 'tt-status',
  keywordstealth: 'tt-status',
  speed: 'tt-status',
  ms: 'tt-status',
  onhit: 'tt-onhit',
  gold: 'tt-onhit',
  healing: 'tt-heal',
  scalehealth: 'tt-heal',
  health: 'tt-heal',
  lifesteal: 'tt-heal',
  omnivamp: 'tt-heal',
  shield: 'tt-shield'
}

// Transforme le markup Riot en HTML sûr pour v-html : les balises connues
// deviennent des <span> stylés, les autres sont retirées, rien d'autre ne passe
export function formatRiotMarkup(description: string): string {
  return description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/?([a-zA-Z]+)[^>]*>/g, (match, tagName: string) => {
      const key = tagName.toLowerCase()
      if (!(key in RIOT_TAG_CLASSES)) return ''
      const cssClass = RIOT_TAG_CLASSES[key]
      if (cssClass == null) return ''
      return match.startsWith('</') ? '</span>' : `<span class="${cssClass}">`
    })
    .replace(/\n/g, '<br>')
}
