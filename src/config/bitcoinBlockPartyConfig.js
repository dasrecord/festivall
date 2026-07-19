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
    { name: 'Leo Weese',    bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Kurtis Warren', bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Jennifer Zee',   bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Curtis Heinen', bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
    { name: 'Roger Huang',  bio: 'Event organizer, Vancouver Bitcoin.',    email: 'party@vanbitcoin.ca' },
  ],

  // ── Itinerary ─────────────────────────────────────────────────────────────
  itinerary: [
    { time: '12:00 PM', label: 'Doors Open' },
    { time: '2:00 PM',label: 'Film Screening',            note: '"My Trust In You Is Broken"' },
    { time: '3:00 PM',label: 'Speakers' },
    { time: '4:00 PM',label: 'Film Screening',            note: '"What\'s The Problem?"' },
    { time: '5:00 PM',label: 'Dinner' },
    { time: '5:45 PM',label: 'Announcements & Acknowledgements' },
    { time: '6:00 PM',label: 'DJs & Mixer' },
    { time: '8:00 PM',label: 'Doors Close' },
  ],

  // ── Film Screenings (for map popup + landing) ─────────────────────────────
  screenings: [
    {
      id: 'screening_1',
      time: '2:00 - 3:00 PM',
      title: 'My Trust In You Is Broken',
      description:
        'Feature documentary by Parker Worthington that chronicles Bitcoin\'s origins as a payments system and Nicolas Dorier\'s pivotal role in creating BTCPay Server during the Block Size Wars. The film highlights merchant adoption, privacy, autonomy, and the risks of trusted third parties.',
      director: 'Parker Worthington',
      directorUrl: 'https://twitter.com/webworthy',
      infoUrl: 'https://bitcoinfilmfest.com/bff2024/',
    },
    {
      id: 'screening_2',
      time: '4:00 - 5:00 PM',
      title: "What's The Problem?",
      description:
        'Demystifying why we all need Bitcoin. How can anyone properly value a solution if they do not understand the problem? "What\'s The Problem?" helps everyone, regardless of background, understand what the problem is. Fix the money, fix the world.',
      creator: 'Joe Bryan',
      creatorUrl: 'https://x.com/satmojoe',
    },
  ],

  // ── Archive / previous years ─────────────────────────────────────────────
  archive: [
    {
      year: 2025,
      title: 'Bitcoin Block Party 2025',
      venue: 'The Beaumont Studios, Vancouver, BC',
      summary: 'Community meetup format with live music, speaker sessions, and Bitcoin-first vendors.',
      performers: [
        { name: 'Das Record', role: 'DJ Set', note: 'Ambient Instrumental' },
      ],
      speakers: [
        { name: 'Vancouver Bitcoin Organizers', topic: 'Local Bitcoin adoption' },
      ],
    },
    {
      year: 2024,
      title: 'Bitcoin Block Party 2024',
      venue: 'The Beaumont Studios, Vancouver, BC',
      summary: 'Pilot-year format focused on education, community meetups, and merchant onboarding.',
      performers: [
        { name: 'Das Record', role: 'DJ Set', note: 'Ambient Instrumental' },
        { name: 'MoriMori', role: 'DJ Set', note: 'Hiphop' },
      ],
      speakers: [
        { name: 'Local Bitcoin Builders', topic: 'Self-custody and payments' },
      ],
    },
  ],

  // ── DJ (for map popup) ────────────────────────────────────────────────────
  dj: {
    name: 'MoriMori',
    shortDescription: 'Live DJ set from 6:00 PM to 8:00 PM.',
    url: 'https://www.instagram.com/morimoribeats/'
  },

  // ── Sponsor tiers (from pitch deck) ───────────────────────────────────────
  sponsorTiers: [
    {
      id: 'satoshi',
      name: 'SATOSHI',
      label: 'Presenting',
      price: 2100,
      capacity: 1,
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
      id: 'whale',
      name: 'WHALE',
      label: 'Premium',
      price: 700,
      capacity: 3,
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
      id: 'bull',
      name: 'BULL',
      label: 'Supporting',
      price: 420,
      capacity: 5,
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
      shortDescription: 'SATOSHI presenting sponsor. Bitcoin payments infrastructure.',
      url: 'https://zeusln.com',
      status: 'confirmed',
    },
    {
      id: 'funk',
      tier: 'whale',
      displayName: 'FUNK',
      shortDescription: 'Whale sponsor. Coffee bar and event host.',
      url: 'https://funk.coffee/',
      status: 'confirmed',
    },
    {
      id: 'coincards',
      tier: 'bull',
      displayName: 'Coincards',
      shortDescription: 'Bull sponsor. Bitcoin gift cards and payments.',
      url: 'https://coincards.com/',
      status: 'confirmed',
    },
    {
      id: 'printprint',
      tier: 'bull',
      displayName: 'PrintPrint',
      shortDescription: 'Bull sponsor. Local print production and creative services.',
      url: 'https://printprint.ca/',
      status: 'confirmed',
    },
    {
      id: 'block_rewards',
      tier: 'bull',
      displayName: 'Block Rewards',
      shortDescription: 'Bull sponsor. Bitcoin rewards and education.',
      url: 'https://blockrewards.ca/',
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
      capacity: 50,
      perks: [
        'Bring your own 6 or 8-foot table',
        'Must accept Bitcoin',
      ],
    },
    {
      id: 'diamond_hands',
      name: 'DIAMOND HANDS',
      label: 'Premium',
      price: 150,
      capacity: 25,
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

  // ── MC announcement generator seeds ─────────────────────────────────────
  mc: {
    opening: 'Welcome to Bitcoin Block Party {{year}} at {{venue}} in {{city}}.',
    safety: 'Please stay hydrated, follow event staff directions, and keep pathways clear.',
    sponsorIntro: 'Big thank-you to our sponsors supporting the Bitcoin community:',
    screeningIntro: 'Film screening begins now in the presenting area.',
    speakerIntro: 'Speaker segment is starting now at the presenting area.',
    dinnerIntro: 'Dinner window is now open. Please make your way to food vendors.',
    djIntro: 'DJs and mixer are now live. Enjoy the evening set.',
    closing: 'Thank you for joining us. Safe travels and we will see you next year.',
  },

  // ── Route constants ───────────────────────────────────────────────────────
  routes: {
    landing:       '/bitcoinblockparty',
    archive:       '/bitcoinblockparty/archive',
    map:           '/bitcoinblockpartymap',
    quiz:          '/bitcoinquiz',
    wallet:        '/bitcoin-wallet',
    vendorApply:   '/bitcoinblockparty/vendor',
    sponsorApply:  '/bitcoinblockparty/sponsor',
    volunteer:     '/bitcoinblockparty/volunteer',
  },
}
