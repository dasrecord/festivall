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
  gateCloseTime: '2:00 AM',                            // Nightly Front Gate closing time
  
  // Meals Config — programmatically generated for Lunch and Supper on main festival days
  get meals() {
    // Festival runs Friday (4th) to Sunday (6th)
    const days = [
      { label: 'Friday', date: '2026-09-04' },
      { label: 'Saturday', date: '2026-09-05' },
      { label: 'Sunday', date: '2026-09-06' }
    ];
    const meals = [];
    days.forEach(day => {
      meals.push({
        label: `${day.label} Lunch`,
        time: `${day.date}T12:00:00-06:00`,
        menu: ['Placeholder Lunch 1', 'Placeholder Lunch 2']
      });
      meals.push({
        label: `${day.label} Supper`,
        time: `${day.date}T18:00:00-06:00`,
        menu: ['Placeholder Supper 1', 'Placeholder Supper 2']
      });
    });
    return meals;
  },
  // Volunteer team reveal phases — controls which teams appear in the application form
  volunteerPhases: {
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
      shift: ['10:00', '18:00'],
      days: [[8, 24, 9, 4]], // [startMonth, startDay, endMonth, endDay]
      duration: 8
    },
    frontgate: {
      label: 'Front Gate',
      shift: ['10:00', '24:00'],
      days: [[9, 4, 9, 6]],
      duration: 2,
      repeat: true
    },
    foodteam: {
      label: 'Food Team',
      shifts: [
        ['11:00', '15:00'],
        ['17:00', '21:00']
      ],
      days: [[9, 4, 9, 6]],
      duration: 4
    },
    stagecrew: {
      label: 'Stage Crew',
      shift: ['08:00', '24:00'],
      overnight: ['00:00', '04:00'],
      days: [[9, 4, 9, 6]],
      duration: 4
    },
    cleanupcrew: {
      label: 'Cleanup Crew',
      shift: ['10:00', '18:00'],
      day: [9, 7],
      duration: 8
    },
    arcadeattendant: {
      label: 'Arcade Attendant',
      shift: ['12:00', '24:00'],
      days: [[9, 4, 9, 6]],
      duration: 4,
      repeat: true
    }
  },
}

// Budget targets per category — update each year once planning is confirmed
export const BUDGET_TARGETS = {
  infrastructure: 500,
  marketing: 0,
  food: 0,
  miscellaneous: 0,
}
