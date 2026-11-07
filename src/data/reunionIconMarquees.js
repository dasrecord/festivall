const iconFiles = import.meta.glob('../assets/images/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
})

const categories = [
  {
    title: 'Around the grounds',
    names: [
      'campsite_parking', 'tent', 'location',
      'land', 'tree1', 'garden', 'shed', 'fire_pit',
      'fire_extinguisher', 'first_aid_kit', 'lost_and_found', 'off_limits', 'smoking_area'
    ]
  },
  {
    title: 'Amenities',
    names: [
      'food', 'meals', 'kitchen', 'fridge',
      'potable_water', 'washroom', 'showers', 'pool', 'playground', 'quiet'
    ]
  },
  {
    title: 'Tech features',
    names: [
      'front_gate', 'grounds_map', 'lineup', 'ticket_scanner',
      'sms', 'radio', 'speakers', 'projector', 'photography', 'genre_map', 'devops',
      'reminder', 'travel_info', 'budget', 'contract', 'inventory', 'receipt',
      'discounts', 'task_icon', 'bitcoin', 'mix_track', 'flyer'
    ]
  },
  {
    title: 'Inside your ticket',
    names: [
      'ticket', 'my_shifts', 'bonus', 'compensation', 'link'
    ]
  },
  {
    title: 'Roles',
    names: [
      'dj', 'volunteer', 'vendor',
      'workshop', 'art_installation', 'graphics', 'decorations',
      'soundtech', 'guitartech', 'stage_crew', 'setup_crew', 'cleanup_crew',
      'construction', 'promo', 'headphones', 'vectors'
    ]
  },
  {
    title: 'Games & discovery',
    names: ['arcade', 'target', 'quiz', 'quest', 'riddle', 'cypher', 'sequence', 'thought_bubble']
  },
  {
    title: 'Festival philosophy',
    names: ['community', 'ethos', 'profit']
  }
]

const labels = {
  tree1: 'Trees', dj: 'DJ',
  sms: 'Text notifications', devops: 'Web development',
  front_gate: 'Self check-in kiosk', kitchen: 'Shared kitchen',
  potable_water: 'Potable water', meals: 'Red Seal chef',
  task_icon: 'Volunteer task lists', budget: 'Automated budgeting',
  contract: 'Automated contracts', inventory: 'Admin inventory management',
  receipt: 'Volunteer receipt tracking', discounts: 'Seasonal promotions',
  bitcoin: 'Bitcoin and Lightning accepted',
  profit: 'In-house philosophy', ethos: 'Our principles',
  thought_bubble: 'Scavenger hunt trivia', link: 'Linked to your ticket',
  headphones: 'Artists', mix_track: 'Artist mix submissions',
  flyer: 'Guerilla marketing tools', vectors: 'Visuals',
  target: 'Nerf battle arena', quiz: 'Puzzles', quest: 'Scavenger hunt',
  grounds_map: 'Interactive grounds map',
  lineup: 'Customizable schedule',
  ticket_scanner: 'Ticketing system', photography: 'Flipbook generator',
  projector: 'Projection mapped visuals', speakers: 'Custom sound system',
  radio: 'FM radio broadcast',
  compensation: 'Payment status', bonus: 'Referral earnings'
}

export const REUNION_ICON_MARQUEES = categories.map(({ title, names }) => ({
  title,
  items: names.map((name) => ({
    icon: iconFiles[`../assets/images/icons/${name}.svg`],
    label: labels[name] || name.replaceAll('_', ' '),
    name
  }))
}))
