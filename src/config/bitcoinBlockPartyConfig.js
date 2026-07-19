// Bitcoin Block Party 2026 — central config
// All event data lives here. Update this file to change names, tiers, roster,
// itinerary, map zone content, etc. without touching view code.

export const BITCOIN_BLOCK_PARTY = {
  name: 'Bitcoin Block Party',
  year: 2026,
  date: 'Sunday, August 23, 2026',
  dateISO: '2026-08-23',
  startTime: '12:00 PM',
  endTime: '8:00 PM',
  venue: 'Dunsmuir Plaza',
  city: 'Vancouver, BC',
  contactEmail: 'party@vanbitcoin.ca',

  // ── Admins ────────────────────────────────────────────────────────────────
  admins: [
    { name: 'Leo',    bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Kurtis', bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Jenn',   bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Curtis', bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Roger',  bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
  ],

  // ── Itinerary ─────────────────────────────────────────────────────────────
  itinerary: [
    { time: '12:00 PM',         label: 'Doors Open' },
    { time: '2:00 – 3:00 PM',   label: 'Film Screening',            note: 'Title TBA' },
    { time: '3:00 – 4:00 PM',   label: 'Speakers' },
    { time: '4:00 – 5:00 PM',   label: 'Film Screening',            note: '"What is the Problem"' },
    { time: '5:00 – 6:00 PM',   label: 'Dinnerish' },
    { time: '~6:00 PM',         label: 'Prize Announcements + Sponsor Thank-You + FUNK' },
    { time: '6:00 – 8:00 PM',   label: 'DJs & Mixer' },
    { time: '8:00 PM',          label: 'Doors Close' },
  ],

  // ── Film Screenings (for map popup + landing) ─────────────────────────────
  screenings: [
    {
      id: 'screening_1',
      time: '2:00 – 3:00 PM',
      title: 'TBA',
      description: 'Title to be announced. Stay tuned.',
    },
    {
      id: 'screening_2',
      time: '4:00 – 5:00 PM',
      title: 'What is the Problem',
      description:
        'A documentary exploring the fundamental problems with the current financial system and why Bitcoin is the solution.',
    },
  ],

  // ── DJ (for map popup) ────────────────────────────────────────────────────
  dj: {
    name: 'TBA',
    shortDescription: 'Live DJ set from 6:00 PM to 8:00 PM.',
    url: null,
  },

  // ── Sponsor tiers (from pitch deck) ───────────────────────────────────────
  sponsorTiers: [
    {
      id: 'satoshi',
      name: 'Satoshi',
      label: 'Presenting Sponsor',
      price: 2100,
      perks: [
        'Prime 8-foot table (high-traffic location)',
        '20-minute keynote speaking slot (priority placement)',
        '"Presenting Sponsor" logo on all marketing (print + digital)',
        'Dedicated sponsor spotlight in event announcements/emails',
        'Verbal recognition (opening + closing remarks)',
        'Stage/slide deck branding',
        'Pre- and post-event social media highlight',
        'Opportunity for branded materials/giveaways (check-in or beer garden)',
      ],
    },
    {
      id: 'hodl',
      name: 'HODL',
      label: 'HODL Sponsor',
      price: null,
      perks: [
        '8-foot dedicated sponsor table',
        '10-minute speaking slot (panel or solo depending on agenda)',
        'Logo featured on all print + digital marketing materials',
        'Verbal recognition during event programming',
        'Inclusion in sponsor social media roll-up posts',
        'Opportunity to display branded materials at tables',
        '4 Tickets to Learning Bitcoin',
      ],
    },
    {
      id: 'stacker',
      name: 'Stacker',
      label: 'Stacker Sponsor',
      price: null,
      perks: [
        '4-foot sponsor table',
        '5-minute speaking slot (or panel depending on agenda)',
        'Logo featured on digital + print marketing materials',
        'Verbal mention during event sponsor acknowledgements',
        'Ability to display promotional materials at welcome table',
        'Inclusion in sponsor group social post',
        '2 Tickets to Learning Bitcoin',
      ],
    },
  ],

  // ── Sponsor roster ────────────────────────────────────────────────────────
  // status: 'confirmed' | 'draft'
  // Add/update entries as sponsors are locked in.
  sponsors: [
    {
      id: 'zeus',
      tier: 'satoshi',
      displayName: 'Zeus',
      shortDescription: 'Presenting Sponsor. Bitcoin payments infrastructure.',
      url: 'https://zeusln.com',
      status: 'confirmed',
    },
    // Add more sponsors here as confirmed
  ],

  // ── Vendor tiers (from pitch deck) ────────────────────────────────────────
  vendorTiers: [
    {
      id: 'hodler',
      name: 'HODLER',
      label: 'Most Popular',
      price: 50,
      perks: [
        'Bring your own 6 or 8-foot table',
        'Must accept Bitcoin',
      ],
    },
    {
      id: 'diamond_hands',
      name: 'Diamond Hands',
      label: 'Premium',
      price: 150,
      perks: [
        '6-foot table provided ($25 for each additional 6-foot table)',
        'Assistance with setup and teardown',
        'Must accept Bitcoin',
      ],
    },
  ],

  // ── Vendor roster ─────────────────────────────────────────────────────────
  // status: 'confirmed' | 'draft'
  vendors: [
    // Add vendors here as confirmed
  ],

  // ── Map zone popup content ─────────────────────────────────────────────────
  // keyed by the SVG feature object id
  // type controls which modal template renders:
  //   'admin'     → admin bios + contact email
  //   'schedule'  → event hours + itinerary
  //   'screenings'→ screening list with descriptions
  //   'dj'        → djName from config.dj
  //   'sponsor'   → tier + displayName + shortDescription + url
  //   'vendor'    → tier + displayName + shortDescription + url
  //   'info'      → generic tier + displayName + shortDescription + url
  mapZones: {
    front_gate: {
      type: 'admin',
      tier: 'info',
      displayName: 'Front Gate',
      shortDescription: 'Main entrance. Check in and say hi to the team!',
      url: null,
    },
    presenting_area: {
      type: 'schedule',
      tier: 'info',
      displayName: 'Presenting Area',
      shortDescription: 'Main stage, speakers, and presentations.',
      url: null,
    },
    movie_screening: {
      type: 'screenings',
      tier: 'info',
      displayName: 'Film Screenings',
      shortDescription: 'Two films screening throughout the day.',
      url: null,
    },
    dj: {
      type: 'dj',
      tier: 'info',
      displayName: 'DJ Stage',
      shortDescription: 'Live DJs from 6:00 PM to 8:00 PM.',
      url: null,
    },
    food_truck_0: {
      type: 'info',
      tier: 'vendor',
      displayName: 'Food Truck',
      shortDescription: 'Delicious food available on-site. Bitcoin accepted.',
      url: null,
    },
    food_truck_1: {
      type: 'info',
      tier: 'vendor',
      displayName: 'Food Truck',
      shortDescription: 'Delicious food available on-site. Bitcoin accepted.',
      url: null,
    },
    bar: {
      type: 'info',
      tier: 'info',
      displayName: 'Bar',
      shortDescription: 'Licensed bar. No liquor beyond designated zones.',
      url: null,
    },
    // vendor_0..6 are populated dynamically from the vendors array in the view
    // bull_0..4 and whale_0..2 are populated dynamically from the sponsors array
  },

  // ── Palette ───────────────────────────────────────────────────────────────
  palette: {
    purple: '#512656',
    teal:   '#075e72',
    orange: '#c83f0f',
    tan:    '#bcbaa5',
    cream:  '#f4f2e6',
  },

  // ── Firestore collection names (all on festivall_db) ─────────────────────
  collections: {
    sponsors:       'bbp_sponsors_2026',
    vendors:        'bbp_vendors_2026',
    volunteers:     'bbp_volunteers_2026',
    applications:   'bbp_applications_2026',
    quizLeaderboard:'bbp_quiz_leaderboard_2026',
  },

  // ── Route constants ───────────────────────────────────────────────────────
  routes: {
    landing:       '/bitcoinblockparty',
    map:           '/bitcoinblockpartymap',
    quiz:          '/bitcoinquiz',
    wallet:        '/bitcoin-wallet',
    vendorApply:   '/bitcoinblockparty/vendor',
    sponsorApply:  '/bitcoinblockparty/sponsor',
    volunteer:     '/bitcoinblockparty/volunteer',
  },
}
