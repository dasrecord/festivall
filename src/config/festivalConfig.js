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
}
