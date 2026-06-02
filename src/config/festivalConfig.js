// Central festival date config — update here to reflect everywhere
export const REUNION_FESTIVAL = {
  year: 2026,
  month: 9,       // 1-indexed (for CountdownTimer props)
  day: 4,         // Friday start
  endDay: 7,      // Monday end

  admins: ['Prasenjit', 'Brandon','Chris'],

  // Pre-built Date objects for programmatic use
  startDate: new Date('2026-09-04T12:00:00'),           // scanners & check-in (local time)
  fridayDate: new Date('2026-09-04T12:00:00-06:00'),    // lineup view (Mountain Time)
  saturdayDate: new Date('2026-09-05T12:00:00-06:00'),
  sundayDate: new Date('2026-09-06T12:00:00-06:00'),
  mondayDate: new Date('2026-09-07T12:00:00-06:00'),
  lineupRevealDate: new Date(2026, 7, 1),               // Aug 1: lineup link becomes visible
  festivalOpenDate: new Date(2026, 8, 4, 12, 0, 0),    // Sept 4 12pm: scavenger hunt opens
  gateCloseTime: '2:00 AM',                            // Nightly Front Gate closing time

  // Ticket pricing — update here each year
  pricing: {
    weekendPass: 200,
    dayPass: 100,
    mealPackage: 30,
    cashSurchargeWeekend: 30,   // admin fee per Weekend Pass for cash payment
    cashSurchargeDayPass: 15,   // admin fee per Day Pass for cash payment
    mealAdHocPrice: 15,         // à la carte meal price for ad hoc purchases
  },

  // Day Pass selectable days — derived from fridayDate/saturdayDate/sundayDate
  get dayPassOptions() {
    const fmt = (date) => date.toLocaleDateString('en-CA', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Regina'
    }).replace(/(\w+), (\w+) (\d+), (\d+)/, (_, wd, mo, d, yr) => {
      const suffix = d === '1' || d === '21' || d === '31' ? 'st' : d === '2' || d === '22' ? 'nd' : d === '3' || d === '23' ? 'rd' : 'th'
      return `${wd}, ${mo} ${d}${suffix}, ${yr}`
    })
    return [this.fridayDate, this.saturdayDate, this.sundayDate].map(d => ({ value: fmt(d), label: fmt(d) }))
  },

  // Firestore collection names
  get participantsCollection() { return `participants_${this.year}` },
  priorYearCollection: 'orders_2025', // 2025 used 'orders_2025' naming; update each year

  // Meals Config — programmatically generated for Lunch and Supper on main festival days
  get meals() {
    const days = [
      { label: 'Friday',   date: this.fridayDate },
      { label: 'Saturday', date: this.saturdayDate },
      { label: 'Sunday',   date: this.sundayDate },
    ]
    const toDateStr = (d) => d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
    const meals = []
    days.forEach(({ label, date }) => {
      const ds = toDateStr(date)
      meals.push({ label: `${label} Lunch`,   time: `${ds}T12:00:00-06:00`, menu: ['Placeholder Lunch 1',  'Placeholder Lunch 2']  })
      meals.push({ label: `${label} Supper`,  time: `${ds}T18:00:00-06:00`, menu: ['Placeholder Supper 1', 'Placeholder Supper 2'] })
    })
    return meals
  },
  // Volunteer team reveal phases — controls which teams appear in the application form
  volunteerPhases: {
    phase1Start: new Date('2026-08-24T12:00:00-06:00'), // Setup Crew begins
    phase1End: new Date('2026-06-15T23:59:59Z'),  // Phase 1: Setup Crew only
    phase2End: new Date('2026-07-01T23:59:59Z'),  // Phase 2: Setup + Front Gate + Food Team + Arcade Attendant
    // Phase 3: All teams visible after phase2End
  },

  // Master ordered list of all volunteer teams (display names)
  orderedVolunteerTeams: ['Setup Crew', 'Front Gate', 'Food Team', 'Arcade Attendant', 'Stage Crew', 'Cleanup Crew'],

  // Teams visible per phase
  volunteerTeamsByPhase: {
    phase1: ['Setup Crew'],
    phase2: ['Setup Crew', 'Front Gate', 'Food Team', 'Arcade Attendant'],
    phase3: ['Setup Crew', 'Front Gate', 'Food Team', 'Arcade Attendant', 'Stage Crew', 'Cleanup Crew'],
  },

  // Volunteer shift parameters for each team (minimalist structure)
  volunteerShiftParams: {
    setupcrew: {
      label: 'Setup Crew',
      minimumLabel: 'Minimum One 8-Hour Shift PreShow',
      shift: ['10:00', '18:00'],
      days: [[8, 24, 9, 4]], // [startMonth, startDay, endMonth, endDay]
      duration: 8
    },
    frontgate: {
      label: 'Front Gate',
      minimumLabel: 'Minimum Three 2-Hour Shifts Per Weekend',
      shift: ['10:00', '24:00'],
      days: [[9, 4, 9, 6]],
      duration: 2,
      repeat: true
    },
    foodteam: {
      label: 'Food Team',
      minimumLabel: 'Minimum Two 4-Hour Shifts Per Weekend',
      shifts: [
        ['11:00', '15:00'],
        ['17:00', '21:00']
      ],
      days: [[9, 4, 9, 6]],
      duration: 4
    },
    stagecrew: {
      label: 'Stage Crew',
      minimumLabel: 'Minimum Two 4-Hour Shifts Per Weekend',
      shift: ['08:00', '24:00'],
      overnight: ['00:00', '04:00'],
      days: [[9, 4, 9, 6]],
      duration: 4
    },
    cleanupcrew: {
      label: 'Cleanup Crew',
      minimumLabel: 'Minimum One 8-Hour Shift PostShow',
      shift: ['10:00', '18:00'],
      day: [9, 7],
      duration: 8
    },
    arcadeattendant: {
      label: 'Arcade Attendant',
      minimumLabel: 'Minimum Two 4-Hour Shifts Per Weekend',
      shift: ['12:00', '24:00'],
      days: [[9, 4, 9, 6]],
      duration: 4,
      repeat: true
    }
  },

  // Artist self-service editing (TicketPageView "Edit Artist Info" modal)
  artistEditing: {
    // Fields under application.data.* that artists may self-edit
    editableFields: [
      'mix_track_url',
      'act_description',
      'bio',
      'social_url',
      'act_website',
      'press_kit_url',
      'logo_url',
    ],
    // Logo upload constraints
    maxLogoMB: 5,
    allowedLogoMimes: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'],
    // Hard cutoff: 1 month before festival start. After this date, edits & visuals
    // selection are blocked (chips hide, save fails fast with a friendly message).
    editCutoff: new Date('2026-08-04T00:00:00-06:00'),
  },

  // Visuals picker (TicketPageView "Choose Your Visuals" modal)
  visuals: {
    // Nighttime window: a settime starting between these local hours qualifies the artist
    // for the Visuals picker. Wrap-around aware (start > end means it crosses midnight).
    // Local Mountain Time (America/Regina).
    nighttimeWindow: { start: '20:50', end: '04:00' },
    // Min/max picks per library
    selectionLimits: {
      video: { min: 1, max: 5 },
      mask:  { min: 1, max: 2 },
    },
  },
}

// Budget targets per category — update each year once planning is confirmed
export const BUDGET_TARGETS = {
  infrastructure: 500,
  marketing: 0,
  food: 0,
  miscellaneous: 0,
}
