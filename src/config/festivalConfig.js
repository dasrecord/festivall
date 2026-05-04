// Central festival date config — update here to reflect everywhere
export const REUNION_FESTIVAL = {
  year: 2026,
  month: 9,       // 1-indexed (for CountdownTimer props)
  day: 4,         // Friday start
  endDay: 7,      // Monday end

  // Pre-built Date objects for programmatic use
  startDate: new Date('2026-09-04T12:00:00'),           // scanners & check-in (local time)
  fridayDate: new Date('2026-09-04T12:00:00-06:00'),    // lineup view (Mountain Time)
  saturdayDate: new Date('2026-09-05T12:00:00-06:00'),
  sundayDate: new Date('2026-09-06T12:00:00-06:00'),
  mondayDate: new Date('2026-09-07T12:00:00-06:00'),
  lineupRevealDate: new Date(2026, 7, 1),               // Aug 1: lineup link becomes visible
  festivalOpenDate: new Date(2026, 8, 4, 12, 0, 0),    // Sept 4 12pm: scavenger hunt opens

  // Meal schedule — update before each festival with real times & menus.
  // Times are ISO 8601 with -06:00 (Mountain Daylight Time).
  // Each meal is visible on the map overlay for 1.5 h after its start time.
  meals: [
    {
      time: '2026-09-04T12:30:00-06:00',
      label: 'Friday Lunch',
      menu: ['Mixed green salad', 'Grilled sandwiches', 'Lemonade']
    },
    {
      time: '2026-09-04T18:00:00-06:00',
      label: 'Friday Dinner',
      menu: ['Roasted chicken', 'Seasonal vegetables', 'Rice pilaf', 'Dessert']
    },
    {
      time: '2026-09-05T12:30:00-06:00',
      label: 'Saturday Lunch',
      menu: ['Tacos & toppings bar', 'Nachos', 'Agua fresca']
    },
    {
      time: '2026-09-05T18:00:00-06:00',
      label: 'Saturday Dinner',
      menu: ["BBQ ribs & pulled pork", 'Corn on the cob', 'Coleslaw', "Campfire s'mores"]
    },

    {
      time: '2026-09-06T12:30:00-06:00',
      label: 'Sunday Lunch',
      menu: ['Pasta salad', 'Grilled veggies', 'Garlic bread', 'Lemonade']
    },
    {
      time: '2026-09-06T18:00:00-06:00',
      label: 'Sunday Dinner',
      menu: ['Vegetable stew', 'Crusty bread', 'Cheese board', 'Pie']
    },
    {
      time: '2026-09-07T08:00:00-06:00',
      label: 'Monday Breakfast',
      menu: ['Oatmeal & granola', 'Bagels & cream cheese', 'Coffee & tea']
    }
  ]
}
