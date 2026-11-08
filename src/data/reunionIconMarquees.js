const iconFiles = import.meta.glob('../assets/images/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
})

const categories = [
  {
    title: 'Around the grounds',
    names: [
      'campsite_parking', 'tent', 'kitchen',
       'tree1', 'garden', 'shed', 'fire_pit',
      'fire_extinguisher', 'first_aid_kit', 'lost_and_found', 'smoking_area'
    ]
  },
  {
    title: 'Amenities',
    names: [
      'food', 'meals', 'kitchen', 'fridge','land',
      'potable_water', 'washroom', 'showers', 'pool', 'playground', 'quiet'
    ]
  },
  {
    title: 'Tech features',
    names: [
      'front_gate', 'grounds_map', 'lineup', 
      'sms', 'radio', 'speakers', 'projector', 'photography', 'genre_map', 'devops',
      'reminder',  'budget', 'contract', 'inventory', 'receipt', 'ticket_scanner',
      'discounts', 'task_icon', 'bitcoin', 'mix_track', 'flyer'
    ]
  },
  {
    title: 'Inside your ticket',
    names: [
      'ticket', 'my_shifts', 'bonus', 'compensation', 'link', 'travel_info',
    ]
  },
  {
    title: 'Member Roles',
    names: [
      'dj', 'volunteer', 'vendor',
      'workshop', 'art_installation', 'graphics', 'decorations',
      'soundtech', 'guitartech', 'stage_crew', 'setup_crew', 'cleanup_crew',
      'construction', 'promo', 'headphones', 'vectors'
    ]
  },
  {
    title: 'Games & discovery',
    names: ['arcade', 'target', 'quiz', 'quest', 'riddle', 'cypher', 'sequence', ]
  },
  {
    title: 'Festival philosophy',
    names: ['community', 'ethos', 'profit']
  }
]

const labels = {
  campsite_parking: 'Campsite parking',
  tent: 'Tents',
  kitchen: 'Shared kitchen',
  tree1: 'Nature',
  garden: 'Garden',
  shed: 'Shed',
  fire_pit: 'Fire pit',
  fire_extinguisher: 'Fire extinguisher',
  first_aid_kit: 'First aid kit',
  lost_and_found: 'Lost and found',
  smoking_area: 'Smoking area',
  food: 'Meal tickets',
  meals: 'Red Seal chef',
  fridge: 'Staff Fridge',
  land: 'Private property',
  potable_water: 'Potable water',
  washroom: 'Outhouses',
  showers: 'Warm showers',
  pool: 'Wading pool',
  playground: 'Kids playground',
  quiet: 'Quiet camping',
  front_gate: 'Self check-in kiosk',
  grounds_map: 'Interactive grounds map',
  lineup: 'Customizable schedule',
  ticket_scanner: 'Ticketing system',
  sms: 'SMS notifications',
  radio: 'FM radio broadcast',
  speakers: 'Custom sound system',
  projector: 'Projection mapped visuals',
  photography: 'Flipbook generator',
  genre_map: '3D Genre map',
  devops: 'Web development',
  reminder: 'Reminders',
  travel_info: 'Travel information',
  budget: 'Automated budgeting',
  contract: 'Automated contracts',
  inventory: 'Admin inventory management',
  receipt: 'Volunteer receipt tracking',
  discounts: 'Seasonal promotions',
  task_icon: 'Volunteer task lists',
  bitcoin: 'Bitcoin and Lightning accepted',
  mix_track: 'Artist mix submissions',
  flyer: 'Guerilla marketing tools',
  ticket: 'Weekend Passes',
  my_shifts: 'My shifts',
  bonus: 'Referral earnings',
  compensation: 'Payment status',
  link: 'Interactive Ticket',
  dj: 'DJ',
  volunteer: 'Volunteer',
  vendor: 'Vendor',
  workshop: 'Workshop',
  art_installation: 'Art installation',
  graphics: 'Graphics',
  decorations: 'Decorations',
  soundtech: 'Sound tech',
  guitartech: 'Guitar tech',
  stage_crew: 'Stage crew',
  setup_crew: 'Setup crew',
  cleanup_crew: 'Cleanup crew',
  construction: 'Construction',
  promo: 'Promotion',
  headphones: 'Artist',
  vectors: 'Visuals',
  arcade: 'Arcade',
  target: 'Nerf battle arena',
  quiz: 'Games',
  quest: 'Scavenger hunt',
  riddle: 'Riddles',
  cypher: 'Cyphers',
  sequence: 'Brain Teasers',
  community: 'Community',
  ethos: 'Our principles',
  profit: 'In-house philosophy'
}

export const REUNION_ICON_MARQUEES = categories.map(({ title, names }) => ({
  title,
  items: names.map((name) => ({
    icon: iconFiles[`../assets/images/icons/${name}.svg`],
    label: labels[name] || name.replaceAll('_', ' '),
    name
  }))
}))
