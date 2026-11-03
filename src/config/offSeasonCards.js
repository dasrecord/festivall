// Cards shown on the off-season ticket page, in order, per participant role.
// Add role-specific cards (e.g. 'artistReapply', 'volunteerHistory') here as they are built.
const BASE_CARDS = ['promo', 'stream']

const ROLE_CARDS = {
  Artist: [],
  Workshop: [],
  Volunteer: [],
  Vendor: [],
}

export function offSeasonCardsFor(applicantTypes = []) {
  const extras = applicantTypes.flatMap((type) => ROLE_CARDS[type] ?? [])
  return [...new Set([...BASE_CARDS, ...extras])]
}
