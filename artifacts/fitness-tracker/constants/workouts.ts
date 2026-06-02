export type ProgramType = 'muscle_building' | 'crossfit' | 'aerobics';
export type SkillLevel = 'novice' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps?: string;
  targetDuration?: string;
  muscleGroup?: string;
  unit: 'weight_reps' | 'time' | 'distance' | 'bodyweight';
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  description: string;
  exercises: Exercise[];
  wodFormat?: string; // CrossFit: "AMRAP 20", "For Time", "EMOM 15", etc.
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const e = (
  id: string, name: string, sets: number,
  reps: string | undefined, dur: string | undefined,
  mg: string | undefined, unit: 'weight_reps' | 'time' | 'distance' | 'bodyweight' = 'weight_reps'
): Exercise => ({ id, name, targetSets: sets, targetReps: reps, targetDuration: dur, muscleGroup: mg, unit });

/** Deterministically pick `count` items from `pool` starting at `seed`. */
function pick<T>(pool: T[], seed: number, count: number): T[] {
  if (pool.length === 0) return [];
  const result: T[] = [];
  for (let i = 0; i < count; i++) result.push(pool[(seed + i) % pool.length]);
  return result;
}

// ─── Library (for exercise picker) ──────────────────────────────────────────

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps?: string;
  defaultDuration?: string;
  unit: 'weight_reps' | 'time' | 'distance' | 'bodyweight';
  tags: string[];
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Chest
  { id: 'lib_bench', name: 'Bench Press', muscleGroup: 'Chest', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['chest', 'push', 'strength'] },
  { id: 'lib_incline_bb', name: 'Incline Barbell Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: '8-10', unit: 'weight_reps', tags: ['chest', 'push'] },
  { id: 'lib_incline_db', name: 'Incline DB Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: '8-12', unit: 'weight_reps', tags: ['chest', 'push'] },
  { id: 'lib_decline_bench', name: 'Decline Bench Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: '8-10', unit: 'weight_reps', tags: ['chest', 'push'] },
  { id: 'lib_cable_fly', name: 'Cable Fly', muscleGroup: 'Chest', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['chest', 'isolation'] },
  { id: 'lib_pec_deck', name: 'Pec Deck Machine', muscleGroup: 'Chest', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['chest', 'isolation'] },
  { id: 'lib_pushups', name: 'Push-ups', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 'AMRAP', unit: 'bodyweight', tags: ['chest', 'bodyweight'] },
  { id: 'lib_dips', name: 'Dips', muscleGroup: 'Chest/Triceps', defaultSets: 3, defaultReps: 'AMRAP', unit: 'bodyweight', tags: ['chest', 'triceps', 'bodyweight'] },
  // Back
  { id: 'lib_deadlift', name: 'Deadlift', muscleGroup: 'Back', defaultSets: 4, defaultReps: '4-6', unit: 'weight_reps', tags: ['back', 'strength', 'compound'] },
  { id: 'lib_bb_row', name: 'Barbell Row', muscleGroup: 'Back', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['back', 'pull', 'strength'] },
  { id: 'lib_lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_seated_row', name: 'Seated Cable Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_db_row', name: 'Single-Arm DB Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_pull_ups', name: 'Pull-ups', muscleGroup: 'Back', defaultSets: 3, defaultReps: 'AMRAP', unit: 'bodyweight', tags: ['back', 'bodyweight'] },
  { id: 'lib_chin_ups', name: 'Chin-ups', muscleGroup: 'Back/Biceps', defaultSets: 3, defaultReps: 'AMRAP', unit: 'bodyweight', tags: ['back', 'biceps', 'bodyweight'] },
  { id: 'lib_face_pull', name: 'Face Pull', muscleGroup: 'Rear Delts', defaultSets: 3, defaultReps: '15-20', unit: 'weight_reps', tags: ['back', 'shoulders'] },
  // Shoulders
  { id: 'lib_ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['shoulders', 'push', 'strength'] },
  { id: 'lib_db_ohp', name: 'DB Shoulder Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '8-12', unit: 'weight_reps', tags: ['shoulders', 'push'] },
  { id: 'lib_arnold', name: 'Arnold Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['shoulders', 'push'] },
  { id: 'lib_lat_raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['shoulders', 'isolation'] },
  { id: 'lib_shrug', name: 'Barbell Shrugs', muscleGroup: 'Traps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['traps', 'shoulders'] },
  // Biceps
  { id: 'lib_bb_curl', name: 'Barbell Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_db_curl', name: 'DB Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_hammer', name: 'Hammer Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_cable_curl', name: 'Cable Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  // Triceps
  { id: 'lib_tricep_push', name: 'Tricep Pushdown', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_skullcrush', name: 'Skull Crushers', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_overhead_tri', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_close_bench', name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '8-10', unit: 'weight_reps', tags: ['triceps', 'push'] },
  // Legs
  { id: 'lib_squat', name: 'Barbell Squat', muscleGroup: 'Quads', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['legs', 'quads', 'strength', 'compound'] },
  { id: 'lib_rdl', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', defaultSets: 4, defaultReps: '8-10', unit: 'weight_reps', tags: ['legs', 'hamstrings', 'compound'] },
  { id: 'lib_leg_press', name: 'Leg Press', muscleGroup: 'Quads', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'quads'] },
  { id: 'lib_leg_curl', name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'hamstrings'] },
  { id: 'lib_calf', name: 'Standing Calf Raise', muscleGroup: 'Calves', defaultSets: 4, defaultReps: '15-20', unit: 'weight_reps', tags: ['legs', 'calves'] },
  { id: 'lib_hip_thrust', name: 'Hip Thrust', muscleGroup: 'Glutes', defaultSets: 4, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'glutes'] },
  // Core
  { id: 'lib_plank', name: 'Plank', muscleGroup: 'Core', defaultSets: 3, defaultDuration: '45 sec', unit: 'time', tags: ['core', 'bodyweight'] },
  { id: 'lib_crunches', name: 'Crunches', muscleGroup: 'Core', defaultSets: 3, defaultReps: '20', unit: 'bodyweight', tags: ['core', 'bodyweight'] },
  { id: 'lib_ab_wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Core', defaultSets: 3, defaultReps: '10', unit: 'bodyweight', tags: ['core'] },
  { id: 'lib_leg_raise', name: 'Hanging Leg Raise', muscleGroup: 'Core', defaultSets: 3, defaultReps: '12', unit: 'bodyweight', tags: ['core'] },
  { id: 'lib_russian_twist', name: 'Russian Twist', muscleGroup: 'Core', defaultSets: 3, defaultReps: '20', unit: 'bodyweight', tags: ['core', 'bodyweight'] },
  // Cardio
  { id: 'lib_run', name: 'Running', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '30 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_cycling', name: 'Stationary Bike', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '40 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_rowing', name: 'Rowing Machine', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '25 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_elliptical', name: 'Elliptical', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '35 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_jump_rope', name: 'Jump Rope', muscleGroup: 'Cardio', defaultSets: 5, defaultDuration: '3 min', unit: 'time', tags: ['cardio', 'hiit'] },
  { id: 'lib_sprints', name: 'Sprint Intervals', muscleGroup: 'Cardio', defaultSets: 8, defaultDuration: '1 min on / 1 off', unit: 'time', tags: ['cardio', 'hiit'] },
  { id: 'lib_burpees', name: 'Burpees', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: '10', unit: 'bodyweight', tags: ['cardio', 'hiit', 'crossfit'] },
  // CrossFit
  { id: 'lib_thruster', name: 'Thrusters', muscleGroup: 'Full Body', defaultSets: 5, defaultReps: '15', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_box_jump', name: 'Box Jumps', muscleGroup: 'Legs', defaultSets: 5, defaultReps: '10', unit: 'bodyweight', tags: ['crossfit', 'plyometric'] },
  { id: 'lib_kb_swing', name: 'Kettlebell Swings', muscleGroup: 'Posterior Chain', defaultSets: 5, defaultReps: '20', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_wall_ball', name: 'Wall Ball Shots', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: '20', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_power_clean', name: 'Power Clean', muscleGroup: 'Full Body', defaultSets: 5, defaultReps: '3', unit: 'weight_reps', tags: ['crossfit', 'olympic'] },
  { id: 'lib_row_erg', name: 'Row Erg', muscleGroup: 'Cardio', defaultSets: 4, defaultDuration: '500m', unit: 'distance', tags: ['crossfit', 'cardio'] },
];

export function libraryExToExercise(lib: LibraryExercise): Exercise {
  return {
    id: lib.id + '_' + Date.now(),
    name: lib.name,
    targetSets: lib.defaultSets,
    targetReps: lib.defaultReps,
    targetDuration: lib.defaultDuration,
    muscleGroup: lib.muscleGroup,
    unit: lib.unit,
  };
}

// ─── Muscle Building exercise pools ─────────────────────────────────────────

// Fixed core lifts (always present, vary by skill)
const MB_CORE: Record<SkillLevel, { push: Exercise; pull: Exercise; hinge: Exercise; squat: Exercise }> = {
  novice: {
    push: e('mb_chest_press', 'Machine Chest Press', 4, '10-12', undefined, 'Chest'),
    pull: e('mb_lat_pull', 'Lat Pulldown', 4, '10-12', undefined, 'Back'),
    hinge: e('mb_rdl_db', 'DB Romanian Deadlift', 3, '10-12', undefined, 'Hamstrings'),
    squat: e('mb_goblet', 'Goblet Squat', 4, '10-12', undefined, 'Quads'),
  },
  intermediate: {
    push: e('mb_bench', 'Bench Press', 4, '6-8', undefined, 'Chest'),
    pull: e('mb_bb_row', 'Barbell Row', 4, '6-8', undefined, 'Back'),
    hinge: e('mb_deadlift', 'Deadlift', 4, '4-6', undefined, 'Back'),
    squat: e('mb_squat', 'Barbell Squat', 4, '6-8', undefined, 'Quads'),
  },
  advanced: {
    push: e('mb_bench_adv', 'Bench Press (Paused)', 5, '4-6', undefined, 'Chest'),
    pull: e('mb_bb_row_adv', 'Pendlay Row', 5, '4-6', undefined, 'Back'),
    hinge: e('mb_dead_adv', 'Deadlift', 5, '3-5', undefined, 'Back'),
    squat: e('mb_sq_adv', 'Low-Bar Squat', 5, '4-6', undefined, 'Quads'),
  },
};

// Accessory pools that rotate week to week
const MB_CHEST_ACC: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('ch_a1', 'DB Chest Press', 3, '12-15', undefined, 'Chest'),
    e('ch_a2', 'Chest Fly Machine', 3, '12-15', undefined, 'Chest'),
    e('ch_a3', 'Push-ups', 3, 'AMRAP', undefined, 'Chest', 'bodyweight'),
    e('ch_a4', 'Cable Crossover', 3, '12-15', undefined, 'Chest'),
  ],
  intermediate: [
    e('ch_b1', 'Incline DB Press', 3, '8-12', undefined, 'Chest'),
    e('ch_b2', 'Cable Fly', 3, '12-15', undefined, 'Chest'),
    e('ch_b3', 'Weighted Dips', 3, 'AMRAP', undefined, 'Chest/Triceps'),
    e('ch_b4', 'Decline Bench Press', 3, '8-10', undefined, 'Chest'),
    e('ch_b5', 'Pec Deck Machine', 3, '12-15', undefined, 'Chest'),
  ],
  advanced: [
    e('ch_c1', 'Incline Barbell Press', 4, '6-8', undefined, 'Chest'),
    e('ch_c2', 'DB Pullovers', 3, '10-12', undefined, 'Chest/Lats'),
    e('ch_c3', 'Cable Fly (Low)', 3, '15-20', undefined, 'Chest'),
    e('ch_c4', 'Ring Push-ups', 3, 'AMRAP', undefined, 'Chest', 'bodyweight'),
  ],
};

const MB_BACK_ACC: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('bk_a1', 'Seated Cable Row', 3, '12-15', undefined, 'Back'),
    e('bk_a2', 'DB Row', 3, '12-15', undefined, 'Back'),
    e('bk_a3', 'Face Pull', 3, '15-20', undefined, 'Rear Delts'),
    e('bk_a4', 'Band Pull-Apart', 3, '20', undefined, 'Rear Delts'),
  ],
  intermediate: [
    e('bk_b1', 'Weighted Pull-ups', 3, 'AMRAP', undefined, 'Back'),
    e('bk_b2', 'Seated Cable Row', 3, '10-12', undefined, 'Back'),
    e('bk_b3', 'Face Pull', 3, '15-20', undefined, 'Rear Delts'),
    e('bk_b4', 'Meadows Row', 3, '10-12', undefined, 'Back'),
    e('bk_b5', 'Lat Pulldown (Wide)', 3, '10-12', undefined, 'Back'),
  ],
  advanced: [
    e('bk_c1', 'Weighted Chin-ups', 4, 'AMRAP', undefined, 'Back/Biceps'),
    e('bk_c2', 'T-Bar Row', 4, '6-8', undefined, 'Back'),
    e('bk_c3', 'Seal Row', 3, '8-10', undefined, 'Back'),
    e('bk_c4', 'Cable Row (Single-arm)', 3, '10-12', undefined, 'Back'),
  ],
};

const MB_SHOULDER_ACC: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('sh_a1', 'DB Shoulder Press', 3, '12-15', undefined, 'Shoulders'),
    e('sh_a2', 'Lateral Raise', 3, '15-20', undefined, 'Shoulders'),
    e('sh_a3', 'Front Raise', 3, '15-20', undefined, 'Shoulders'),
    e('sh_a4', 'Machine Lateral Raise', 3, '15-20', undefined, 'Shoulders'),
  ],
  intermediate: [
    e('sh_b1', 'Arnold Press', 3, '10-12', undefined, 'Shoulders'),
    e('sh_b2', 'Lateral Raise', 3, '12-15', undefined, 'Shoulders'),
    e('sh_b3', 'Rear Delt Fly', 3, '15-20', undefined, 'Rear Delts'),
    e('sh_b4', 'Barbell Shrugs', 3, '12-15', undefined, 'Traps'),
    e('sh_b5', 'Upright Row', 3, '12-15', undefined, 'Shoulders/Traps'),
  ],
  advanced: [
    e('sh_c1', 'Push Press', 4, '6-8', undefined, 'Shoulders'),
    e('sh_c2', 'Lateral Raise Drop Set', 3, '15+', undefined, 'Shoulders'),
    e('sh_c3', 'Snatch-Grip High Pull', 3, '8-10', undefined, 'Traps/Shoulders'),
    e('sh_c4', 'Cable Lateral Raise', 3, '15-20', undefined, 'Shoulders'),
  ],
};

const MB_ARM_ACC: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('ar_a1', 'DB Curl', 3, '12-15', undefined, 'Biceps'),
    e('ar_a2', 'Tricep Pushdown', 3, '12-15', undefined, 'Triceps'),
    e('ar_a3', 'Hammer Curl', 3, '12-15', undefined, 'Biceps'),
    e('ar_a4', 'Overhead Tricep Extension', 3, '12-15', undefined, 'Triceps'),
  ],
  intermediate: [
    e('ar_b1', 'Barbell Curl', 3, '10-12', undefined, 'Biceps'),
    e('ar_b2', 'Skull Crushers', 3, '10-12', undefined, 'Triceps'),
    e('ar_b3', 'Preacher Curl', 3, '10-12', undefined, 'Biceps'),
    e('ar_b4', 'Close-Grip Bench Press', 3, '8-10', undefined, 'Triceps'),
    e('ar_b5', 'Incline DB Curl', 3, '10-12', undefined, 'Biceps'),
    e('ar_b6', 'Rope Pushdown', 3, '12-15', undefined, 'Triceps'),
  ],
  advanced: [
    e('ar_c1', 'Spider Curl', 3, '10-12', undefined, 'Biceps'),
    e('ar_c2', 'French Press', 3, '8-10', undefined, 'Triceps'),
    e('ar_c3', 'Cable Curl (Single)', 3, '12-15', undefined, 'Biceps'),
    e('ar_c4', 'Tate Press', 3, '10-12', undefined, 'Triceps'),
    e('ar_c5', 'Reverse Curl', 3, '12-15', undefined, 'Forearms'),
  ],
};

const MB_LEG_ACC: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('lg_a1', 'Leg Press', 3, '12-15', undefined, 'Quads'),
    e('lg_a2', 'Leg Curl Machine', 3, '12-15', undefined, 'Hamstrings'),
    e('lg_a3', 'Leg Extension', 3, '15-20', undefined, 'Quads'),
    e('lg_a4', 'Seated Calf Raise', 4, '15-20', undefined, 'Calves'),
    e('lg_a5', 'Walking Lunges', 3, '12 each', undefined, 'Quads'),
  ],
  intermediate: [
    e('lg_b1', 'Front Squat', 3, '6-8', undefined, 'Quads'),
    e('lg_b2', 'Romanian Deadlift', 4, '8-10', undefined, 'Hamstrings'),
    e('lg_b3', 'Bulgarian Split Squat', 3, '8-10', undefined, 'Quads/Glutes'),
    e('lg_b4', 'Hip Thrust', 4, '10-12', undefined, 'Glutes'),
    e('lg_b5', 'Standing Calf Raise', 4, '15-20', undefined, 'Calves'),
    e('lg_b6', 'Hack Squat', 3, '10-12', undefined, 'Quads'),
  ],
  advanced: [
    e('lg_c1', 'Pause Squat', 4, '4-6', undefined, 'Quads'),
    e('lg_c2', 'Sumo Deadlift', 4, '4-6', undefined, 'Hamstrings/Glutes'),
    e('lg_c3', 'Leg Press (Single-leg)', 3, '10-12', undefined, 'Quads'),
    e('lg_c4', 'Nordic Hamstring Curl', 3, '6-8', undefined, 'Hamstrings'),
    e('lg_c5', 'Donkey Calf Raise', 4, '15-20', undefined, 'Calves'),
  ],
};

const MB_CORE_EX: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('co_a1', 'Plank', 3, undefined, '30 sec', 'Core', 'time'),
    e('co_a2', 'Crunches', 3, '20', undefined, 'Core', 'bodyweight'),
    e('co_a3', 'Bird Dog', 3, '10 each', undefined, 'Core', 'bodyweight'),
    e('co_a4', 'Dead Bug', 3, '10 each', undefined, 'Core', 'bodyweight'),
  ],
  intermediate: [
    e('co_b1', 'Plank', 3, undefined, '45 sec', 'Core', 'time'),
    e('co_b2', 'Cable Crunch', 3, '15', undefined, 'Core'),
    e('co_b3', 'Russian Twist', 3, '20', undefined, 'Core', 'bodyweight'),
    e('co_b4', 'Hanging Knee Raise', 3, '12', undefined, 'Core', 'bodyweight'),
    e('co_b5', 'Ab Wheel Rollout', 3, '10', undefined, 'Core', 'bodyweight'),
  ],
  advanced: [
    e('co_c1', 'Hanging Leg Raise', 3, '12', undefined, 'Core', 'bodyweight'),
    e('co_c2', 'L-Sit Hold', 3, undefined, '20 sec', 'Core', 'time'),
    e('co_c3', 'Dragon Flag', 3, '8', undefined, 'Core', 'bodyweight'),
    e('co_c4', 'Cable Crunch', 3, '15', undefined, 'Core'),
    e('co_c5', 'Pallof Press', 3, '12 each', undefined, 'Core'),
  ],
};

// ─── CrossFit exercise pools (large variety!) ────────────────────────────────

const CF_BARBELL: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('cfb_n1', 'DB Deadlift', 5, '5', undefined, 'Full Body'),
    e('cfb_n2', 'DB Thruster', 5, '10', undefined, 'Full Body'),
    e('cfb_n3', 'Goblet Squat', 5, '10', undefined, 'Quads'),
    e('cfb_n4', 'DB Push Press', 5, '10', undefined, 'Shoulders'),
    e('cfb_n5', 'KB Sumo Deadlift', 5, '10', undefined, 'Posterior Chain'),
    e('cfb_n6', 'DB Hang Power Clean', 5, '5', undefined, 'Full Body'),
    e('cfb_n7', 'DB Romanian Deadlift', 5, '8', undefined, 'Hamstrings'),
    e('cfb_n8', 'Box Squat (Light)', 5, '5', undefined, 'Quads'),
  ],
  intermediate: [
    e('cfb_i1', 'Power Clean', 5, '3', undefined, 'Full Body'),
    e('cfb_i2', 'Front Squat', 5, '3', undefined, 'Quads'),
    e('cfb_i3', 'Push Press', 5, '5', undefined, 'Shoulders'),
    e('cfb_i4', 'Hang Power Clean', 5, '3', undefined, 'Full Body'),
    e('cfb_i5', 'Deadlift', 5, '3', undefined, 'Posterior Chain'),
    e('cfb_i6', 'Back Squat', 5, '3', undefined, 'Quads'),
    e('cfb_i7', 'Romanian Deadlift', 4, '5', undefined, 'Hamstrings'),
    e('cfb_i8', 'Push Jerk', 5, '3', undefined, 'Shoulders/Triceps'),
    e('cfb_i9', 'Clean & Jerk Complex', 4, '2', undefined, 'Full Body'),
  ],
  advanced: [
    e('cfb_a1', 'Squat Clean', 5, '2', undefined, 'Full Body'),
    e('cfb_a2', 'Hang Power Snatch', 5, '2', undefined, 'Full Body'),
    e('cfb_a3', 'Clean & Jerk', 5, '1', undefined, 'Full Body'),
    e('cfb_a4', 'Overhead Squat', 5, '3', undefined, 'Full Body'),
    e('cfb_a5', 'Snatch Pull', 5, '3', undefined, 'Posterior Chain'),
    e('cfb_a6', 'Split Jerk', 5, '2', undefined, 'Full Body'),
    e('cfb_a7', 'Snatch Balance', 4, '3', undefined, 'Full Body'),
    e('cfb_a8', 'Power Snatch + OHS', 4, '2+2', undefined, 'Full Body'),
    e('cfb_a9', 'Clean Pull', 4, '3', undefined, 'Posterior Chain'),
  ],
};

const CF_GYMNASTICS: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('cfg_n1', 'Ring Rows', 4, '10', undefined, 'Back', 'bodyweight'),
    e('cfg_n2', 'Box Step-ups', 4, '10 each', undefined, 'Legs', 'bodyweight'),
    e('cfg_n3', 'Push-ups', 4, 'AMRAP', undefined, 'Chest', 'bodyweight'),
    e('cfg_n4', 'Inverted Row', 4, '10', undefined, 'Back', 'bodyweight'),
    e('cfg_n5', 'Assisted Pull-up (Band)', 4, '8', undefined, 'Back', 'bodyweight'),
    e('cfg_n6', 'Pike Push-up', 3, '10', undefined, 'Shoulders', 'bodyweight'),
    e('cfg_n7', 'Dips (Bench-assisted)', 3, 'AMRAP', undefined, 'Triceps', 'bodyweight'),
    e('cfg_n8', 'Hollow Body Hold', 3, undefined, '20 sec', 'Core', 'time'),
    e('cfg_n9', 'Superman Hold', 3, undefined, '20 sec', 'Lower Back', 'time'),
  ],
  intermediate: [
    e('cfg_i1', 'Pull-ups', 5, 'AMRAP', undefined, 'Back', 'bodyweight'),
    e('cfg_i2', 'Ring Dips', 4, '10', undefined, 'Triceps', 'bodyweight'),
    e('cfg_i3', 'Toes-to-Bar', 4, '10', undefined, 'Core', 'bodyweight'),
    e('cfg_i4', 'HSPU (Box or Wall)', 4, '8', undefined, 'Shoulders', 'bodyweight'),
    e('cfg_i5', 'Chest-to-Bar Pull-ups', 4, '8', undefined, 'Back', 'bodyweight'),
    e('cfg_i6', 'Kipping Pull-ups', 4, '15', undefined, 'Back', 'bodyweight'),
    e('cfg_i7', 'Knees-to-Elbows', 4, '12', undefined, 'Core', 'bodyweight'),
    e('cfg_i8', 'Ring Push-ups', 3, 'AMRAP', undefined, 'Chest', 'bodyweight'),
    e('cfg_i9', 'Bar Muscle-up Progressions', 3, '5', undefined, 'Full Body', 'bodyweight'),
    e('cfg_i10', 'Hollow Rocks', 3, '20', undefined, 'Core', 'bodyweight'),
  ],
  advanced: [
    e('cfg_a1', 'Bar Muscle-ups', 5, '5', undefined, 'Full Body', 'bodyweight'),
    e('cfg_a2', 'Strict HSPU', 4, '8', undefined, 'Shoulders', 'bodyweight'),
    e('cfg_a3', 'Ring Muscle-ups', 4, '3', undefined, 'Full Body', 'bodyweight'),
    e('cfg_a4', 'Strict Chest-to-Bar Pull-ups', 5, '8', undefined, 'Back', 'bodyweight'),
    e('cfg_a5', 'L-Pull-ups', 4, '8', undefined, 'Back/Core', 'bodyweight'),
    e('cfg_a6', 'Toes-to-Bar (Strict)', 4, '12', undefined, 'Core', 'bodyweight'),
    e('cfg_a7', 'Freestanding HSPU', 3, 'AMRAP', undefined, 'Shoulders', 'bodyweight'),
    e('cfg_a8', 'Pistol Squats', 4, '5 each', undefined, 'Legs', 'bodyweight'),
    e('cfg_a9', 'Iron Cross Progressions', 3, '5', undefined, 'Full Body', 'bodyweight'),
  ],
};

const CF_CONDITIONING: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('cfc_n1', 'Row Erg (Easy)', 1, undefined, '500m', 'Cardio', 'distance'),
    e('cfc_n2', 'Box Step-ups', 5, '10', undefined, 'Legs', 'bodyweight'),
    e('cfc_n3', 'KB Swings', 5, '15', undefined, 'Posterior Chain'),
    e('cfc_n4', 'Med Ball Slam', 5, '10', undefined, 'Full Body'),
    e('cfc_n5', 'Stationary Bike', 1, undefined, '10 min', 'Cardio', 'time'),
    e('cfc_n6', 'Farmer Carry', 3, undefined, '40m', 'Full Body', 'distance'),
    e('cfc_n7', 'Sled Push (Light)', 4, undefined, '20m', 'Legs', 'distance'),
    e('cfc_n8', 'Bear Crawl', 4, undefined, '20m', 'Full Body', 'distance'),
    e('cfc_n9', 'Shuttle Run', 5, undefined, '10m × 4', 'Cardio', 'distance'),
    e('cfc_n10', 'Jump Rope (Singles)', 5, undefined, '2 min', 'Cardio', 'time'),
  ],
  intermediate: [
    e('cfc_i1', 'Row Erg Intervals', 5, undefined, '500m', 'Cardio', 'distance'),
    e('cfc_i2', 'Box Jumps', 5, '10', undefined, 'Legs', 'bodyweight'),
    e('cfc_i3', 'Burpees', 5, '10', undefined, 'Full Body', 'bodyweight'),
    e('cfc_i4', 'Wall Ball Shots', 4, '20', undefined, 'Full Body'),
    e('cfc_i5', 'KB Swings (Heavy)', 5, '20', undefined, 'Posterior Chain'),
    e('cfc_i6', 'Double-under Attempts', 5, undefined, '1 min', 'Cardio', 'time'),
    e('cfc_i7', 'Assault Bike', 5, undefined, '30 sec on / 30 off', 'Cardio', 'time'),
    e('cfc_i8', 'Sled Pull', 4, undefined, '20m', 'Legs', 'distance'),
    e('cfc_i9', 'Sandbag Carry', 3, undefined, '50m', 'Full Body', 'distance'),
    e('cfc_i10', 'Sprint Intervals', 8, undefined, '100m', 'Cardio', 'distance'),
  ],
  advanced: [
    e('cfc_a1', 'Assault Bike Sprints', 10, undefined, '10 sec max / 50 sec rest', 'Cardio', 'time'),
    e('cfc_a2', 'Double-Unders', 5, '50', undefined, 'Cardio', 'bodyweight'),
    e('cfc_a3', 'Row Erg (2k TT)', 1, undefined, '2000m max effort', 'Cardio', 'distance'),
    e('cfc_a4', 'Box Jumps (30"+)', 5, '10', undefined, 'Legs', 'bodyweight'),
    e('cfc_a5', 'Burpee Box Jump-overs', 5, '10', undefined, 'Full Body', 'bodyweight'),
    e('cfc_a6', 'GHD Sit-ups', 4, '20', undefined, 'Core', 'bodyweight'),
    e('cfc_a7', 'Ski Erg Intervals', 5, undefined, '1 min on / 1 min off', 'Cardio', 'time'),
    e('cfc_a8', 'Yoke Carry', 3, undefined, '20m max load', 'Full Body', 'distance'),
    e('cfc_a9', 'Handstand Walk', 4, undefined, '10m', 'Shoulders/Core', 'distance'),
  ],
};

const CF_METCON_OBJ: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('cfm_n1', 'KB Swing', 4, '20', undefined, 'Posterior Chain'),
    e('cfm_n2', 'Box Step-up', 4, '15', undefined, 'Legs', 'bodyweight'),
    e('cfm_n3', 'Push-up', 4, '15', undefined, 'Chest', 'bodyweight'),
    e('cfm_n4', 'DB Thruster', 4, '10', undefined, 'Full Body'),
    e('cfm_n5', 'Row Erg', 1, undefined, '500m', 'Cardio', 'distance'),
    e('cfm_n6', 'Burpee', 4, '10', undefined, 'Full Body', 'bodyweight'),
    e('cfm_n7', 'Ring Row', 4, '10', undefined, 'Back', 'bodyweight'),
    e('cfm_n8', 'Jump Rope', 1, undefined, '2 min', 'Cardio', 'time'),
  ],
  intermediate: [
    e('cfm_i1', 'Wall Ball', 5, '20', undefined, 'Full Body'),
    e('cfm_i2', 'Pull-up', 5, '10', undefined, 'Back', 'bodyweight'),
    e('cfm_i3', 'Box Jump', 5, '10', undefined, 'Legs', 'bodyweight'),
    e('cfm_i4', 'Thruster', 5, '15', undefined, 'Full Body'),
    e('cfm_i5', 'Burpee', 5, '10', undefined, 'Full Body', 'bodyweight'),
    e('cfm_i6', 'Toes-to-Bar', 4, '10', undefined, 'Core', 'bodyweight'),
    e('cfm_i7', 'Row Erg', 1, undefined, '500m', 'Cardio', 'distance'),
    e('cfm_i8', 'KB Swing', 5, '20', undefined, 'Posterior Chain'),
    e('cfm_i9', 'Double-under', 1, undefined, '1 min', 'Cardio', 'time'),
    e('cfm_i10', 'HSPU', 4, '8', undefined, 'Shoulders', 'bodyweight'),
  ],
  advanced: [
    e('cfm_a1', 'CTB Pull-ups', 5, '10', undefined, 'Back', 'bodyweight'),
    e('cfm_a2', 'Thruster (Heavy)', 5, '10', undefined, 'Full Body'),
    e('cfm_a3', 'Double-unders', 3, '50', undefined, 'Cardio', 'bodyweight'),
    e('cfm_a4', 'Muscle-up', 4, '5', undefined, 'Full Body', 'bodyweight'),
    e('cfm_a5', 'GHD Sit-up', 4, '20', undefined, 'Core', 'bodyweight'),
    e('cfm_a6', 'Burpee Box Jump-over', 4, '10', undefined, 'Full Body', 'bodyweight'),
    e('cfm_a7', 'Row Erg', 1, undefined, '500m', 'Cardio', 'distance'),
    e('cfm_a8', 'Handstand Walk', 2, undefined, '10m', 'Shoulders', 'distance'),
  ],
};

// ─── Aerobics exercise pools ─────────────────────────────────────────────────

const AER_STEADY: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('aer_ss_n1', 'Walking', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_n2', 'Easy Jog', 1, undefined, '20 min', 'Cardio', 'time'),
    e('aer_ss_n3', 'Stationary Bike (Easy)', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_n4', 'Elliptical (Easy)', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_n5', 'Swimming (Easy Laps)', 1, undefined, '20 min', 'Cardio', 'time'),
    e('aer_ss_n6', 'Stair Walk', 1, undefined, '20 min', 'Cardio', 'time'),
  ],
  intermediate: [
    e('aer_ss_i1', 'Tempo Run', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_i2', 'Stationary Bike', 1, undefined, '45 min', 'Cardio', 'time'),
    e('aer_ss_i3', 'Rowing Machine', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_i4', 'Elliptical', 1, undefined, '40 min', 'Cardio', 'time'),
    e('aer_ss_i5', 'Stair Climber', 1, undefined, '30 min', 'Cardio', 'time'),
    e('aer_ss_i6', 'Long Run', 1, undefined, '45 min', 'Cardio', 'time'),
  ],
  advanced: [
    e('aer_ss_a1', 'Long Run (Moderate Pace)', 1, undefined, '60 min', 'Cardio', 'time'),
    e('aer_ss_a2', 'Bike Ride (Zone 2)', 1, undefined, '60 min', 'Cardio', 'time'),
    e('aer_ss_a3', 'Open Water Row Sim', 1, undefined, '40 min', 'Cardio', 'time'),
    e('aer_ss_a4', 'Stair Climber (Moderate)', 1, undefined, '40 min', 'Cardio', 'time'),
    e('aer_ss_a5', 'Fartlek Run', 1, undefined, '45 min', 'Cardio', 'time'),
  ],
};

const AER_HIIT: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('aer_hi_n1', 'Walk-Jog Intervals', 8, undefined, '1 min on / 2 off', 'Cardio', 'time'),
    e('aer_hi_n2', 'Bike Intervals (Easy)', 6, undefined, '1 min on / 2 off', 'Cardio', 'time'),
    e('aer_hi_n3', 'March Intervals', 6, undefined, '45 sec on / 1.5 min off', 'Cardio', 'time'),
    e('aer_hi_n4', 'High Knees (Low Impact)', 5, undefined, '30 sec', 'Cardio', 'time'),
    e('aer_hi_n5', 'Step-up Cardio', 4, undefined, '1 min', 'Cardio', 'time'),
    e('aer_hi_n6', 'Swimming Intervals', 6, undefined, '50m on / 30 sec rest', 'Cardio', 'time'),
  ],
  intermediate: [
    e('aer_hi_i1', 'Sprint Intervals', 8, undefined, '1 min on / 1 min off', 'Cardio', 'time'),
    e('aer_hi_i2', 'Jump Rope Intervals', 8, undefined, '2 min on / 1 min off', 'Cardio', 'time'),
    e('aer_hi_i3', 'Bike Sprints', 8, undefined, '30 sec max / 1.5 min off', 'Cardio', 'time'),
    e('aer_hi_i4', 'Mountain Climbers', 5, undefined, '45 sec', 'Core/Cardio', 'time'),
    e('aer_hi_i5', 'High Knees', 5, undefined, '45 sec', 'Cardio', 'time'),
    e('aer_hi_i6', 'Burpees', 5, '10', undefined, 'Full Body', 'bodyweight'),
    e('aer_hi_i7', 'Lateral Shuffles', 5, undefined, '30 sec', 'Cardio', 'time'),
  ],
  advanced: [
    e('aer_hi_a1', 'All-Out Sprint Intervals', 10, undefined, '30 sec max / 90 sec rest', 'Cardio', 'time'),
    e('aer_hi_a2', 'Assault Bike Tabata', 8, undefined, '20 sec on / 10 sec off', 'Cardio', 'time'),
    e('aer_hi_a3', 'Hill Sprint Repeats', 8, undefined, '30 sec uphill / walk down', 'Cardio', 'time'),
    e('aer_hi_a4', 'Double-under Practice', 5, undefined, '2 min', 'Cardio', 'time'),
    e('aer_hi_a5', 'Row Sprints', 8, undefined, '250m max / 90 sec rest', 'Cardio', 'time'),
    e('aer_hi_a6', 'Plyo Box Intervals', 6, undefined, '30 sec on / 30 sec off', 'Legs', 'time'),
  ],
};

const AER_FUNCTIONAL: Record<SkillLevel, Exercise[]> = {
  novice: [
    e('aer_fn_n1', 'Jumping Jacks', 4, undefined, '1 min', 'Cardio', 'time'),
    e('aer_fn_n2', 'March in Place', 4, undefined, '1 min', 'Cardio', 'time'),
    e('aer_fn_n3', 'Side Step', 4, undefined, '1 min', 'Cardio', 'time'),
    e('aer_fn_n4', 'Arm Circles', 3, undefined, '1 min', 'Shoulders', 'time'),
    e('aer_fn_n5', 'Modified Burpee (No Jump)', 3, '10', undefined, 'Full Body', 'bodyweight'),
    e('aer_fn_n6', 'Standing Bicycle Crunch', 3, '20', undefined, 'Core', 'bodyweight'),
  ],
  intermediate: [
    e('aer_fn_i1', 'Squat Jumps', 4, '15', undefined, 'Legs', 'bodyweight'),
    e('aer_fn_i2', 'Lateral Bounds', 4, '12 each', undefined, 'Legs', 'bodyweight'),
    e('aer_fn_i3', 'Mountain Climbers', 4, undefined, '45 sec', 'Core', 'time'),
    e('aer_fn_i4', 'Jumping Lunges', 4, '12 each', undefined, 'Legs', 'bodyweight'),
    e('aer_fn_i5', 'Burpees', 4, '10', undefined, 'Full Body', 'bodyweight'),
    e('aer_fn_i6', 'Plank Jacks', 4, undefined, '30 sec', 'Core', 'time'),
    e('aer_fn_i7', 'Skaters', 4, '15 each', undefined, 'Legs', 'bodyweight'),
  ],
  advanced: [
    e('aer_fn_a1', 'Box Jump Burpees', 5, '10', undefined, 'Full Body', 'bodyweight'),
    e('aer_fn_a2', 'Single-leg Bounds', 5, '10 each', undefined, 'Legs', 'bodyweight'),
    e('aer_fn_a3', 'Tuck Jumps', 4, '15', undefined, 'Legs', 'bodyweight'),
    e('aer_fn_a4', 'Explosive Push-ups', 4, '10', undefined, 'Chest', 'bodyweight'),
    e('aer_fn_a5', 'Sprint Starts', 8, undefined, '20m', 'Cardio', 'distance'),
    e('aer_fn_a6', 'Broad Jumps', 4, '8', undefined, 'Legs', 'bodyweight'),
  ],
};

// ─── WOD format descriptions ─────────────────────────────────────────────────

const CF_FORMATS = [
  'AMRAP 20 min',
  'For Time',
  'EMOM 15 min',
  '5 Rounds For Time',
  '3 Rounds For Reps',
  'Tabata (8×20/10)',
  '21-15-9 For Time',
  'Death By…',
];

// ─── Budget helper ───────────────────────────────────────────────────────────

/**
 * Exercises per session scaled by duration and training frequency.
 * More time → more exercises. More training days → smaller sessions
 * (volume is spread across sessions; reference point is 4 days/week).
 */
function sessionBudget(duration: number, daysPerWeek: number, minsPerExercise: number): number {
  const raw = Math.max(2, Math.floor(duration / minsPerExercise));
  const dayFactor = Math.max(0.5, Math.min(2.0, 4 / Math.max(1, daysPerWeek)));
  return Math.max(2, Math.min(12, Math.round(raw * dayFactor)));
}

// ─── Plan generators ─────────────────────────────────────────────────────────

function muscleBuildingPlan(days: number, skill: SkillLevel, week: number, duration: number): WorkoutDay[] {
  const core = MB_CORE[skill];
  const seed = week * 7;
  const budget = sessionBudget(duration, days, 10); // ~10 min per exercise incl. rest

  function pushDay(id: string, name: string, label: string): WorkoutDay {
    const acc = Math.max(0, budget - 1);
    const ch = Math.max(1, Math.round(acc * 0.40));
    const tr = Math.max(0, Math.round(acc * 0.30));
    const sh = Math.max(0, Math.round(acc * 0.20));
    const co = Math.max(0, acc - ch - tr - sh);
    return {
      id, name, focus: label,
      description: 'Chest, shoulders and triceps — progressive overload focus.',
      exercises: [
        core.push,
        ...pick(MB_CHEST_ACC[skill], seed + 1, ch),
        ...(sh > 0 ? pick(MB_SHOULDER_ACC[skill], seed, sh) : []),
        ...(tr > 0 ? pick(MB_ARM_ACC[skill], seed + 3, tr) : []),
        ...(co > 0 ? pick(MB_CORE_EX[skill], seed + 2, co) : []),
      ],
    };
  }
  function pullDay(id: string, name: string, label: string): WorkoutDay {
    const acc = Math.max(0, budget - 2);
    const bk = Math.max(0, Math.round(acc * 0.60));
    const bi = Math.max(0, acc - bk);
    return {
      id, name, focus: label,
      description: 'Back and biceps — width and thickness.',
      exercises: [
        core.pull, core.hinge,
        ...pick(MB_BACK_ACC[skill], seed + 2, bk),
        ...(bi > 0 ? pick(MB_ARM_ACC[skill], seed + 4, bi) : []),
      ],
    };
  }
  function legDay(id: string, name: string, label: string): WorkoutDay {
    return {
      id, name, focus: label,
      description: 'Quads, hamstrings, glutes and calves.',
      exercises: [core.squat, ...pick(MB_LEG_ACC[skill], seed + 3, Math.max(0, budget - 1))],
    };
  }
  function upperDay(id: string, name: string, label: string): WorkoutDay {
    const acc = Math.max(0, budget - 2);
    const ch = Math.max(0, Math.round(acc * 0.25));
    const bk = Math.max(0, Math.round(acc * 0.25));
    const sh = Math.max(0, Math.round(acc * 0.20));
    const ar = Math.max(0, acc - ch - bk - sh);
    return {
      id, name, focus: label,
      description: 'Full upper body stimulus.',
      exercises: [
        core.push, core.pull,
        ...pick(MB_CHEST_ACC[skill], seed, ch),
        ...pick(MB_BACK_ACC[skill], seed + 1, bk),
        ...(sh > 0 ? pick(MB_SHOULDER_ACC[skill], seed + 2, sh) : []),
        ...(ar > 0 ? pick(MB_ARM_ACC[skill], seed, ar) : []),
      ],
    };
  }
  function fullDay(id: string, name: string, label: string): WorkoutDay {
    const acc = Math.max(0, budget - 3);
    return {
      id, name, focus: label,
      description: 'Light full-body active session.',
      exercises: [core.squat, core.push, core.pull, ...pick(MB_CORE_EX[skill], seed, acc)],
    };
  }
  function shDay(id: string, name: string, label: string): WorkoutDay {
    const sh = Math.max(1, Math.round(budget * 0.80));
    const co = Math.max(0, budget - sh);
    return {
      id, name, focus: label,
      description: 'All three delt heads and trap work.',
      exercises: [
        ...pick(MB_SHOULDER_ACC[skill], seed, sh),
        ...(co > 0 ? pick(MB_CORE_EX[skill], seed + 1, co) : []),
      ],
    };
  }

  if (days === 1) return [fullDay('mb1', 'Day 1', 'Full Body')];
  if (days === 2) return [upperDay('mb_u', 'Day 1', 'Upper Body'), legDay('mb_l', 'Day 2', 'Lower Body')];
  if (days === 3) return [pushDay('ppl_p', 'Day 1', 'Push'), pullDay('ppl_pu', 'Day 2', 'Pull'), legDay('ppl_l', 'Day 3', 'Legs')];
  if (days === 4) return [pushDay('4_p', 'Day 1', 'Chest & Triceps'), pullDay('4_pu', 'Day 2', 'Back & Biceps'), shDay('4_sh', 'Day 3', 'Shoulders'), legDay('4_l', 'Day 4', 'Legs')];
  if (days === 5) return [
    { ...pushDay('5_c', 'Day 1', 'Chest'), focus: 'Chest' },
    { ...pullDay('5_b', 'Day 2', 'Back'), focus: 'Back' },
    shDay('5_s', 'Day 3', 'Shoulders'),
    { ...pullDay('5_a', 'Day 4', 'Arms'), focus: 'Arms', description: 'Biceps and triceps specialization.', exercises: pick(MB_ARM_ACC[skill], seed, Math.max(2, budget)) },
    legDay('5_l', 'Day 5', 'Legs'),
  ];
  if (days >= 6) {
    const plan = [
      pushDay('6_p1', 'Day 1', 'Push (Heavy)'),
      pullDay('6_pu1', 'Day 2', 'Pull (Heavy)'),
      legDay('6_l1', 'Day 3', 'Legs (Heavy)'),
      pushDay('6_p2', 'Day 4', 'Push (Volume)'),
      pullDay('6_pu2', 'Day 5', 'Pull (Volume)'),
      legDay('6_l2', 'Day 6', 'Legs (Volume)'),
    ];
    if (days === 7) plan.push(fullDay('7_fb', 'Day 7', 'Full Body'));
    return plan;
  }
  return [];
}

function crossfitPlan(days: number, skill: SkillLevel, week: number, duration: number): WorkoutDay[] {
  const seed = week * 7;
  const fmt = (offset: number) => CF_FORMATS[(seed + offset) % CF_FORMATS.length];
  const budget = sessionBudget(duration, days, 12); // ~12 min per piece

  function strengthMetcon(id: string, name: string): WorkoutDay {
    const bb   = Math.max(1, Math.round(budget * 0.34));
    const gym  = Math.max(0, Math.round(budget * 0.28));
    const cond = Math.max(0, budget - bb - gym);
    return {
      id, name, focus: 'Strength + Conditioning',
      description: `Heavy barbell work, then ${fmt(0)} metcon.`,
      wodFormat: fmt(0),
      exercises: [
        ...pick(CF_BARBELL[skill], seed, bb),
        ...(gym > 0 ? pick(CF_GYMNASTICS[skill], seed + 1, gym) : []),
        ...(cond > 0 ? pick(CF_CONDITIONING[skill], seed + 2, cond) : []),
      ],
    };
  }
  function olympicLifting(id: string, name: string): WorkoutDay {
    const bb   = Math.max(1, Math.round(budget * 0.60));
    const cond = Math.max(0, budget - bb);
    return {
      id, name, focus: 'Olympic Lifting',
      description: `Snatch/clean complex, then ${fmt(1)} conditioning.`,
      wodFormat: fmt(1),
      exercises: [
        ...pick(CF_BARBELL[skill], seed + 3, bb),
        ...(cond > 0 ? pick(CF_CONDITIONING[skill], seed + 4, cond) : []),
      ],
    };
  }
  function gymnasticsFocus(id: string, name: string): WorkoutDay {
    const gym  = Math.max(1, Math.round(budget * 0.75));
    const cond = Math.max(0, budget - gym);
    return {
      id, name, focus: 'Gymnastics + Cardio',
      description: `Bodyweight skill work, then ${fmt(2)} cardio finisher.`,
      wodFormat: fmt(2),
      exercises: [
        ...pick(CF_GYMNASTICS[skill], seed + 2, gym),
        ...(cond > 0 ? pick(CF_CONDITIONING[skill], seed, cond) : []),
      ],
    };
  }
  function amrapWod(id: string, name: string): WorkoutDay {
    return {
      id, name, focus: 'AMRAP WOD',
      description: `${fmt(3)} — push your limit every round.`,
      wodFormat: fmt(3),
      exercises: pick(CF_METCON_OBJ[skill], seed + 5, Math.max(2, budget)),
    };
  }
  function barbellCycling(id: string, name: string): WorkoutDay {
    const bb  = Math.max(1, Math.round(budget * 0.40));
    const gym = Math.max(0, Math.round(budget * 0.30));
    const met = Math.max(0, budget - bb - gym);
    return {
      id, name, focus: 'Barbell Cycling',
      description: `High-rep barbell conditioning, ${fmt(4)} format.`,
      wodFormat: fmt(4),
      exercises: [
        ...pick(CF_BARBELL[skill], seed + 6, bb),
        ...(gym > 0 ? pick(CF_GYMNASTICS[skill], seed + 3, gym) : []),
        ...(met > 0 ? pick(CF_METCON_OBJ[skill], seed, met) : []),
      ],
    };
  }
  function heroWod(id: string, name: string): WorkoutDay {
    const full = Math.max(2, Math.round(budget * 0.65));
    const cond = Math.max(0, budget - full);
    return {
      id, name, focus: 'Hero WOD',
      description: `Long benchmark workout — ${fmt(5)}. Test your engine.`,
      wodFormat: fmt(5),
      exercises: [
        ...pick(CF_METCON_OBJ[skill], seed + 2, full),
        ...(cond > 0 ? pick(CF_CONDITIONING[skill], seed + 6, cond) : []),
      ],
    };
  }
  function activeRecovery(id: string, name: string): WorkoutDay {
    return {
      id, name, focus: 'Active Recovery',
      description: 'Light movement to flush out and promote recovery.',
      exercises: pick(CF_CONDITIONING[skill], seed + 1, Math.max(1, Math.min(2, Math.floor(budget * 0.4)))),
    };
  }

  const all = [
    strengthMetcon('cf1', 'Day 1'),
    olympicLifting('cf2', 'Day 2'),
    gymnasticsFocus('cf3', 'Day 3'),
    amrapWod('cf4', 'Day 4'),
    barbellCycling('cf5', 'Day 5'),
    heroWod('cf6', 'Day 6'),
    activeRecovery('cf7', 'Day 7'),
  ];
  return all.slice(0, days);
}

function aerobicsPlan(days: number, skill: SkillLevel, week: number, duration: number): WorkoutDay[] {
  const seed = week * 7;
  const budget = sessionBudget(duration, days, 20); // aerobics pieces run longer

  function steadyState(id: string, name: string): WorkoutDay {
    const [main] = pick(AER_STEADY[skill], seed + parseInt(id, 36) % 3, 1);
    return { id, name, focus: 'Steady-State Cardio', description: 'Maintain a comfortable, sustainable pace.', exercises: [main] };
  }
  function hiit(id: string, name: string): WorkoutDay {
    return { id, name, focus: 'HIIT Intervals', description: 'Spike your heart rate — max effort each interval.', exercises: pick(AER_HIIT[skill], seed + 1, Math.max(1, Math.min(6, budget))) };
  }
  function crossTraining(id: string, name: string): WorkoutDay {
    return { id, name, focus: 'Cross-Training', description: 'Mix of functional movements to challenge the whole body.', exercises: pick(AER_FUNCTIONAL[skill], seed + 2, Math.max(1, Math.min(7, budget))) };
  }
  function endurance(id: string, name: string): WorkoutDay {
    const [main] = pick(AER_STEADY[skill], seed + 3, 1);
    const extras = budget > 1 ? pick(AER_HIIT[skill], seed + 2, Math.min(3, budget - 1)) : [];
    return { id, name, focus: 'Endurance Build', description: 'Longer session to build aerobic base.', exercises: [main, ...extras] };
  }
  function mixed(id: string, name: string): WorkoutDay {
    const [steady] = pick(AER_STEADY[skill], seed, 1);
    return { id, name, focus: 'Mixed Cardio', description: 'Combine modalities for a full aerobic challenge.', exercises: [steady, ...pick(AER_HIIT[skill], seed + 4, Math.max(1, Math.min(4, budget - 1)))] };
  }
  function recovery(id: string, name: string): WorkoutDay {
    const [easy] = pick(AER_STEADY[skill], 0, 1);
    return { id, name, focus: 'Active Recovery', description: 'Easy movement to promote blood flow and recovery.', exercises: [easy] };
  }

  const all: WorkoutDay[] = [
    steadyState('aer1', 'Day 1'),
    hiit('aer2', 'Day 2'),
    crossTraining('aer3', 'Day 3'),
    endurance('aer4', 'Day 4'),
    mixed('aer5', 'Day 5'),
    steadyState('aer6', 'Day 6'),
    recovery('aer7', 'Day 7'),
  ];
  return all.slice(0, days);
}

// ─── Exercise pool for shuffler ──────────────────────────────────────────────

/** Returns every exercise available for a given program + skill level (flat list, no duplicates). */
export function getProgramExercisePool(programType: ProgramType, skillLevel: SkillLevel): Exercise[] {
  if (programType === 'muscle_building') {
    const core = MB_CORE[skillLevel];
    return [
      core.push, core.pull, core.hinge, core.squat,
      ...MB_CHEST_ACC[skillLevel],
      ...MB_BACK_ACC[skillLevel],
      ...MB_SHOULDER_ACC[skillLevel],
      ...MB_ARM_ACC[skillLevel],
      ...MB_LEG_ACC[skillLevel],
      ...MB_CORE_EX[skillLevel],
    ];
  }
  if (programType === 'crossfit') {
    return [
      ...CF_BARBELL[skillLevel],
      ...CF_GYMNASTICS[skillLevel],
      ...CF_CONDITIONING[skillLevel],
      ...CF_METCON_OBJ[skillLevel],
    ];
  }
  return [
    ...AER_STEADY[skillLevel],
    ...AER_HIIT[skillLevel],
    ...AER_FUNCTIONAL[skillLevel],
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function generateWorkoutPlan(
  programType: ProgramType,
  daysPerWeek: number,
  skillLevel: SkillLevel = 'intermediate',
  weekNumber: number = 0,
  workoutDuration: number = 60,
): WorkoutDay[] {
  const days = Math.max(1, Math.min(7, daysPerWeek));
  switch (programType) {
    case 'muscle_building': return muscleBuildingPlan(days, skillLevel, weekNumber, workoutDuration);
    case 'crossfit':        return crossfitPlan(days, skillLevel, weekNumber, workoutDuration);
    case 'aerobics':        return aerobicsPlan(days, skillLevel, weekNumber, workoutDuration);
  }
}

export const PROGRAM_INFO = {
  muscle_building: { label: 'Muscle Building', subtitle: 'Hypertrophy & Strength', description: 'Progressive overload training focused on maximizing muscle size and strength gains.', color: '#E63946' },
  crossfit:        { label: 'CrossFit', subtitle: 'Functional Fitness', description: 'High-intensity functional movements combining cardio, strength, and gymnastics.', color: '#FF9500' },
  aerobics:        { label: 'Aerobics', subtitle: 'Cardio & Endurance', description: 'Cardiovascular conditioning to improve heart health, stamina, and fat burning.', color: '#30D158' },
} as const;

export const SKILL_INFO: Record<SkillLevel, { label: string; subtitle: string; description: string; icon: string }> = {
  novice:       { label: 'Novice',       subtitle: 'Just Getting Started', description: 'Machine-based and dumbbell work, shorter sessions, accessible movements. Perfect if you have less than 1 year of consistent training.', icon: 'leaf-outline' },
  intermediate: { label: 'Intermediate', subtitle: 'Building Momentum',    description: 'Free weights, barbell compound lifts, and moderate volume. Ideal if you have 1-3 years of training experience.', icon: 'trending-up-outline' },
  advanced:     { label: 'Advanced',     subtitle: 'High Performance',     description: 'Heavy compounds, Olympic movements, high volume and intensity. Best for 3+ years of serious training.', icon: 'trophy-outline' },
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAYS_FULL    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
