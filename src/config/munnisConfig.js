export const MUNNIS_CONFIG = {
  accepting_orders: true,
  advance_hours: 24,
  delivery_fee: 10,
  // TODO: set etransfer address when ready
  etransfer_address: 'TBD',
  pickup_hours: '10:00 AM – 4:00 PM',
  menu: [
    {
      id: 'veg_biryani',
      bengali: 'নিরামিষ বিরিয়ানি',
      name: 'Vegetable Biriyani',
      desc: 'Basmati rice mixed with carrots, cauliflower, potatoes, green beans, and peas',
      price: 25
    },
    {
      id: 'egg_curry',
      bengali: 'ডিম তরকারী',
      name: 'Egg & Curry',
      desc: 'Hard-boiled eggs, simmered in a rich sauce of blended onions',
      price: 35
    },
    {
      id: 'tomato_chutney',
      bengali: 'টমেটো চাটনি',
      name: 'Tomato Chutney',
      desc: 'Tomatoes seasoned with authentic five-spice into a sweet and tangy sauce',
      price: 10
    }
  ]
}
