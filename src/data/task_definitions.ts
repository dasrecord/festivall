// Centralized Reunion task definitions per department
// Used by AdminTaskManager and department manuals to avoid duplication

export type TaskDef = {
  id: string
  title: string
  description: string
  department: 'front_gate' | 'setup_crew' | 'food_team' | 'stage_crew' | 'cleanup_crew'
  priority: 'low' | 'medium' | 'high'
  // Optional type for special handling (e.g., Front Gate)
  // standard (default) | personal (per-user completion) | one-time (team task)
  type?: 'standard' | 'personal' | 'one-time'
}

const FRONT_GATE: TaskDef[] = [
  {
    id: 'frontgate_001',
    title: 'Initial Gate Setup (First Shift Only)',
    description: 'Set up front gate tent/booth, table, chairs, signage, and entry barriers',
    department: 'front_gate',
    priority: 'high',
    type: 'one-time'
  },
  {
    id: 'frontgate_002',
    title: 'Device Hotspot Configuration (Every Shift)',
    description: 'Connect provided scanner device to your mobile hotspot, verify internet connection',
    department: 'front_gate',
    priority: 'high',
    type: 'personal'
  },
  {
    id: 'frontgate_003',
    title: 'Scanner Testing (Every Shift)',
    description: 'Test QR scanner functionality, verify database connection, check audio alerts',
    department: 'front_gate',
    priority: 'high',
    type: 'personal'
  },
  {
    id: 'frontgate_004',
    title: 'Cash Box Setup (Every Shift)',
    description: 'Count starting cash, verify change amounts, test payment processing for unpaid orders',
    department: 'front_gate',
    priority: 'high',
    type: 'personal'
  },
  {
    id: 'frontgate_005',
    title: 'Operator ID Entry (Every Shift)',
    description: 'Enter your Scanner Operator ID in ticket scanner, verify name appears correctly',
    department: 'front_gate',
    priority: 'high',
    type: 'personal'
  },
  {
    id: 'frontgate_006',
    title: 'Equipment Check (Every Shift)',
    description: 'Verify chargers, backup devices, and all equipment functioning properly',
    department: 'front_gate',
    priority: 'medium',
    type: 'personal'
  },
  {
    id: 'frontgate_007',
    title: 'Shift Handover Documentation',
    description: 'Document attendance numbers, cash collected, and any issues for next shift',
    department: 'front_gate',
    priority: 'medium',
    type: 'personal'
  },
  {
    id: 'frontgate_008',
    title: 'Gate Closure (Last Shift Only)',
    description: 'Close front gate, secure equipment, final cash count, breakdown tent/booth',
    department: 'front_gate',
    priority: 'high',
    type: 'one-time'
  }
]

const SETUP_CREW: TaskDef[] = [
  {
    id: 'setup_001',
    title: 'Vacuum Surfaces',
    description: 'Shop vac + filter to vacuum surfaces (Barn + FOH + seating areas)',
    department: 'setup_crew',
    priority: 'high'
  },
  {
    id: 'setup_002',
    title: 'Weed Whacking',
    description: 'Use weed whacker/hedge trimmers to clean shrubbage around buildings (ensure door access)',
    department: 'setup_crew',
    priority: 'high'
  },
  {
    id: 'setup_003',
    title: 'Fridge Check',
    description: 'Ensure all fridges are clean, working, turned on and closed properly',
    department: 'setup_crew',
    priority: 'medium'
  },
  {
    id: 'setup_004',
    title: 'Wading Pool Setup',
    description: 'Take out wading pool, clean it and set up ready for water',
    department: 'setup_crew',
    priority: 'medium'
  },
  {
    id: 'setup_005',
    title: 'Garbage Removal',
    description: 'Remove all garbage from barn + FOH areas',
    department: 'setup_crew',
    priority: 'high'
  },
  {
    id: 'setup_006',
    title: "Children's Area Prep",
    description: "Clean and prepare children's area (arcade/barn) - set up toys, remove hazards",
    department: 'setup_crew',
    priority: 'medium'
  },
  {
    id: 'setup_007',
    title: 'Kitchen Equipment Prep',
    description: 'Clean ovens/stoves/BBQs to prep for food team',
    department: 'setup_crew',
    priority: 'high'
  }
]

const STAGE_CREW: TaskDef[] = [
  {
    id: 'stage_001',
    title: 'Sound System Setup',
    description: 'Set up main PA system, monitors, and mixing console',
    department: 'stage_crew',
    priority: 'high'
  },
  {
    id: 'stage_002',
    title: 'Stage Platform Assembly',
    description: 'Assemble and secure stage platform, barriers, and safety equipment',
    department: 'stage_crew',
    priority: 'high'
  },
  {
    id: 'stage_003',
    title: 'Lighting Installation',
    description: 'Install stage lighting, test controls, and program lighting cues',
    department: 'stage_crew',
    priority: 'medium'
  },
  {
    id: 'stage_004',
    title: 'Power & Electrical',
    description: 'Run power cables, set up electrical distribution, and test all connections',
    department: 'stage_crew',
    priority: 'high'
  },
  {
    id: 'stage_005',
    title: 'Monitor System',
    description: 'Set up artist monitor system and wedges',
    department: 'stage_crew',
    priority: 'medium'
  },
  {
    id: 'stage_006',
    title: 'Sound Check Coordination',
    description: 'Coordinate and conduct sound checks with all performing artists',
    department: 'stage_crew',
    priority: 'high'
  },
  {
    id: 'stage_007',
    title: 'Equipment Inventory',
    description: 'Check and organize all audio/visual equipment and spare parts',
    department: 'stage_crew',
    priority: 'medium'
  },
  {
    id: 'stage_008',
    title: 'Backstage Area Setup',
    description: 'Prepare artist backstage area and equipment storage',
    department: 'stage_crew',
    priority: 'low'
  }
]

const FOOD_TEAM: TaskDef[] = [
  {
    id: 'food_001',
    title: 'Kitchen Setup & Prep',
    description: 'Set up cooking stations, prep ingredients, and organize kitchen workflow',
    department: 'food_team',
    priority: 'high'
  },
  {
    id: 'food_002',
    title: 'Food Safety & Sanitation',
    description: 'Implement food safety protocols, temperature monitoring, and sanitation procedures',
    department: 'food_team',
    priority: 'high'
  },
  {
    id: 'food_003',
    title: 'Service Station Setup',
    description: 'Set up food service lines, utensils, plates, and serving equipment',
    department: 'food_team',
    priority: 'high'
  },
  {
    id: 'food_004',
    title: 'Inventory Management',
    description: 'Track food inventory, supplies, and coordinate resupply needs',
    department: 'food_team',
    priority: 'medium'
  },
  {
    id: 'food_005',
    title: 'Volunteer Coordination',
    description: 'Organize food service volunteers and assign serving duties',
    department: 'food_team',
    priority: 'medium'
  },
  {
    id: 'food_006',
    title: 'Kitchen Cleanup',
    description: 'Maintain ongoing cleanliness and post-service deep cleaning',
    department: 'food_team',
    priority: 'medium'
  }
]

const CLEANUP_CREW: TaskDef[] = [
  {
    id: 'cleanup_001',
    title: 'Tool & Equipment Inventory',
    description: 'Clean, inspect, and return all tools to designated sheds/trailers with inventory checklist',
    department: 'cleanup_crew',
    priority: 'high'
  },
  {
    id: 'cleanup_002',
    title: 'Decoration Storage Protocol',
    description: 'Clean decorations, sort by category, pack in labeled bins with moisture protection',
    department: 'cleanup_crew',
    priority: 'high'
  },
  {
    id: 'cleanup_003',
    title: 'Large Item Breakdown',
    description: 'Properly disassemble and store trampolines, wading pools, and other awkward items',
    department: 'cleanup_crew',
    priority: 'high'
  },
  {
    id: 'cleanup_004',
    title: 'Pest-Proof Storage Prep',
    description: 'Seal storage containers, use rodent deterrents, elevate items off ground',
    department: 'cleanup_crew',
    priority: 'high'
  },
  {
    id: 'cleanup_005',
    title: 'Storage Area Organization',
    description: 'Create clear zones in sheds/trailers, document locations, create access maps',
    department: 'cleanup_crew',
    priority: 'medium'
  },
  {
    id: 'cleanup_006',
    title: 'Material Condition Assessment',
    description: 'Document damaged items, create replacement/repair list for next year',
    department: 'cleanup_crew',
    priority: 'medium'
  },
  {
    id: 'cleanup_007',
    title: 'Labeling & Documentation',
    description: 'Create detailed labels, photo inventory, and setup instructions for next year',
    department: 'cleanup_crew',
    priority: 'high'
  },
  {
    id: 'cleanup_008',
    title: 'Next Year Setup Notes',
    description: 'Document lessons learned, storage improvements, and setup recommendations',
    department: 'cleanup_crew',
    priority: 'medium'
  }
]

const TASKS_BY_DEPT: Record<TaskDef['department'], TaskDef[]> = {
  front_gate: FRONT_GATE,
  setup_crew: SETUP_CREW,
  food_team: FOOD_TEAM,
  stage_crew: STAGE_CREW,
  cleanup_crew: CLEANUP_CREW
}

export function getTasksForDepartment(
  deptId: TaskDef['department']
): TaskDef[] {
  return TASKS_BY_DEPT[deptId] ? [...TASKS_BY_DEPT[deptId]] : []
}

export function getTaskMapForDepartment(
  deptId: TaskDef['department']
): Record<string, TaskDef> {
  const map: Record<string, TaskDef> = {}
  for (const t of getTasksForDepartment(deptId)) {
    map[t.id] = t
  }
  return map
}
