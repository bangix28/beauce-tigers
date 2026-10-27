import { describe, expect, it } from 'vitest'
import { formatCountdown, msUntil } from './useCountdown'

const MIN = 60 * 1000

describe('formatCountdown', () => {
  it('heures et minutes sur deux chiffres', () => {
    expect(formatCountdown(2 * 60 * MIN + 14 * MIN)).toBe('2 h 14')
    expect(formatCountdown(3 * 60 * MIN + 5 * MIN)).toBe('3 h 05')
  })

  it('jours, heures rondes, minutes seules', () => {
    expect(formatCountdown(3 * 24 * 60 * MIN + 4 * 60 * MIN)).toBe('3 j 4 h')
    expect(formatCountdown(60 * MIN)).toBe('1 h')
    expect(formatCountdown(14 * MIN)).toBe('14 min')
  })

  it('arrondit à la minute supérieure, jamais plus tôt que prévu', () => {
    expect(formatCountdown(14 * MIN + 1)).toBe('15 min')
    expect(formatCountdown(30 * 1000)).toBe('moins d\'une minute')
  })

  it('rien une fois l\'heure passée ou si la date est illisible', () => {
    expect(formatCountdown(0)).toBe('')
    expect(formatCountdown(msUntil('pas une date'))).toBe('')
  })
})
