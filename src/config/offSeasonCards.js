// Display order of every off-season card. A participant sees the cards that apply to them, in this order.
const CARD_ORDER = [
  'promo',
  'stream',
  'reapply',
  'volunteerHistory',
  'setHistory',
  'saveTheDate',
  'scavenger'
]

// Always-open cards; everything else renders collapsed.
export const PRIORITY_CARDS = ['promo', 'stream']

const BASE_CARDS = ['promo', 'saveTheDate', 'scavenger', 'stream']

const ROLE_CARDS = {
  Artist: ['reapply', 'setHistory'],
  Workshop: ['reapply', 'setHistory'],
  Vendor: ['reapply'],
  Volunteer: ['volunteerHistory']
}

export function offSeasonCardsFor(applicantTypes = []) {
  const wanted = new Set([...BASE_CARDS, ...applicantTypes.flatMap((type) => ROLE_CARDS[type] ?? [])])
  return CARD_ORDER.filter((key) => wanted.has(key))
}
