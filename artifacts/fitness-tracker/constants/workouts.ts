export type ProgramType = 'muscle_building' | 'crossfit' | 'aerobics';

export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps?: string;
  targetDuration?: string;
  muscleGroup?: string;
  unit: 'weight_reps' | 'time';
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  description: string;
  exercises: Exercise[];
}

const ex = (
  id: string,
  name: string,
  targetSets: number,
  targetReps: string | undefined,
  targetDuration: string | undefined,
  muscleGroup: string | undefined,
  unit: 'weight_reps' | 'time',
): Exercise => ({ id, name, targetSets, targetReps, targetDuration, muscleGroup, unit });

// ─── Library exercises (for picker) ─────────────────────────────────────────

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps?: string;
  defaultDuration?: string;
  unit: 'weight_reps' | 'time';
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
  { id: 'lib_pushups', name: 'Push-ups', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 'AMRAP', unit: 'weight_reps', tags: ['chest', 'bodyweight'] },
  { id: 'lib_dips', name: 'Dips', muscleGroup: 'Chest/Triceps', defaultSets: 3, defaultReps: 'AMRAP', unit: 'weight_reps', tags: ['chest', 'triceps', 'bodyweight'] },
  // Back
  { id: 'lib_deadlift', name: 'Deadlift', muscleGroup: 'Back', defaultSets: 4, defaultReps: '4-6', unit: 'weight_reps', tags: ['back', 'strength', 'compound'] },
  { id: 'lib_bb_row', name: 'Barbell Row', muscleGroup: 'Back', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['back', 'pull', 'strength'] },
  { id: 'lib_lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_seated_row', name: 'Seated Cable Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_db_row', name: 'Single-Arm DB Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['back', 'pull'] },
  { id: 'lib_pull_ups', name: 'Pull-ups', muscleGroup: 'Back', defaultSets: 3, defaultReps: 'AMRAP', unit: 'weight_reps', tags: ['back', 'bodyweight'] },
  { id: 'lib_chin_ups', name: 'Chin-ups', muscleGroup: 'Back/Biceps', defaultSets: 3, defaultReps: 'AMRAP', unit: 'weight_reps', tags: ['back', 'biceps', 'bodyweight'] },
  { id: 'lib_face_pull', name: 'Face Pull', muscleGroup: 'Rear Delts', defaultSets: 3, defaultReps: '15-20', unit: 'weight_reps', tags: ['back', 'shoulders'] },
  { id: 'lib_hyperext', name: 'Hyperextensions', muscleGroup: 'Lower Back', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['back', 'isolation'] },
  // Shoulders
  { id: 'lib_ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['shoulders', 'push', 'strength'] },
  { id: 'lib_db_ohp', name: 'DB Shoulder Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '8-12', unit: 'weight_reps', tags: ['shoulders', 'push'] },
  { id: 'lib_arnold', name: 'Arnold Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['shoulders', 'push'] },
  { id: 'lib_lat_raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['shoulders', 'isolation'] },
  { id: 'lib_front_raise', name: 'Front Raise', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['shoulders', 'isolation'] },
  { id: 'lib_shrug', name: 'Barbell Shrugs', muscleGroup: 'Traps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['traps', 'shoulders'] },
  // Biceps
  { id: 'lib_bb_curl', name: 'Barbell Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_db_curl', name: 'DB Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_hammer', name: 'Hammer Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_preacher', name: 'Preacher Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  { id: 'lib_cable_curl', name: 'Cable Curl', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['biceps', 'isolation'] },
  // Triceps
  { id: 'lib_tricep_push', name: 'Tricep Pushdown', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_skullcrush', name: 'Skull Crushers', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_overhead_tri', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['triceps', 'isolation'] },
  { id: 'lib_close_bench', name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: '8-10', unit: 'weight_reps', tags: ['triceps', 'push'] },
  // Legs
  { id: 'lib_squat', name: 'Barbell Squat', muscleGroup: 'Quads', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['legs', 'quads', 'strength', 'compound'] },
  { id: 'lib_front_sq', name: 'Front Squat', muscleGroup: 'Quads', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['legs', 'quads', 'strength'] },
  { id: 'lib_rdl', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', defaultSets: 4, defaultReps: '8-10', unit: 'weight_reps', tags: ['legs', 'hamstrings', 'compound'] },
  { id: 'lib_leg_press', name: 'Leg Press', muscleGroup: 'Quads', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'quads'] },
  { id: 'lib_leg_curl', name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', defaultSets: 3, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'hamstrings'] },
  { id: 'lib_leg_ext', name: 'Leg Extension', muscleGroup: 'Quads', defaultSets: 3, defaultReps: '12-15', unit: 'weight_reps', tags: ['legs', 'quads', 'isolation'] },
  { id: 'lib_calf', name: 'Standing Calf Raise', muscleGroup: 'Calves', defaultSets: 4, defaultReps: '15-20', unit: 'weight_reps', tags: ['legs', 'calves'] },
  { id: 'lib_lunges', name: 'Walking Lunges', muscleGroup: 'Quads', defaultSets: 3, defaultReps: '12 each', unit: 'weight_reps', tags: ['legs', 'quads'] },
  { id: 'lib_sumo', name: 'Sumo Deadlift', muscleGroup: 'Hamstrings', defaultSets: 4, defaultReps: '6-8', unit: 'weight_reps', tags: ['legs', 'hamstrings', 'strength'] },
  { id: 'lib_hip_thrust', name: 'Hip Thrust', muscleGroup: 'Glutes', defaultSets: 4, defaultReps: '10-12', unit: 'weight_reps', tags: ['legs', 'glutes'] },
  // Core
  { id: 'lib_plank', name: 'Plank', muscleGroup: 'Core', defaultSets: 3, defaultDuration: '45 sec', unit: 'time', tags: ['core', 'bodyweight'] },
  { id: 'lib_crunches', name: 'Crunches', muscleGroup: 'Core', defaultSets: 3, defaultReps: '20', unit: 'weight_reps', tags: ['core', 'bodyweight'] },
  { id: 'lib_ab_wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Core', defaultSets: 3, defaultReps: '10', unit: 'weight_reps', tags: ['core'] },
  { id: 'lib_leg_raise', name: 'Hanging Leg Raise', muscleGroup: 'Core', defaultSets: 3, defaultReps: '12', unit: 'weight_reps', tags: ['core'] },
  { id: 'lib_cable_crunch', name: 'Cable Crunch', muscleGroup: 'Core', defaultSets: 3, defaultReps: '15', unit: 'weight_reps', tags: ['core'] },
  { id: 'lib_russian_twist', name: 'Russian Twist', muscleGroup: 'Core', defaultSets: 3, defaultReps: '20', unit: 'weight_reps', tags: ['core', 'bodyweight'] },
  // Cardio
  { id: 'lib_run', name: 'Running', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '30 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_cycling', name: 'Stationary Bike', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '40 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_rowing', name: 'Rowing Machine', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '25 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_elliptical', name: 'Elliptical', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '35 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_stairs', name: 'Stair Climber', muscleGroup: 'Cardio', defaultSets: 1, defaultDuration: '30 min', unit: 'time', tags: ['cardio', 'aerobics'] },
  { id: 'lib_jump_rope', name: 'Jump Rope', muscleGroup: 'Cardio', defaultSets: 5, defaultDuration: '3 min', unit: 'time', tags: ['cardio', 'hiit'] },
  { id: 'lib_sprints', name: 'Sprint Intervals', muscleGroup: 'Cardio', defaultSets: 8, defaultDuration: '1 min on / 1 off', unit: 'time', tags: ['cardio', 'hiit'] },
  { id: 'lib_mountain', name: 'Mountain Climbers', muscleGroup: 'Cardio', defaultSets: 4, defaultDuration: '45 sec', unit: 'time', tags: ['cardio', 'hiit', 'core'] },
  { id: 'lib_high_knees', name: 'High Knees', muscleGroup: 'Cardio', defaultSets: 4, defaultDuration: '45 sec', unit: 'time', tags: ['cardio', 'hiit'] },
  { id: 'lib_burpees', name: 'Burpees', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: '10', unit: 'weight_reps', tags: ['cardio', 'hiit', 'crossfit'] },
  // CrossFit
  { id: 'lib_thruster', name: 'Thrusters', muscleGroup: 'Full Body', defaultSets: 5, defaultReps: '15', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_box_jump', name: 'Box Jumps', muscleGroup: 'Legs', defaultSets: 5, defaultReps: '10', unit: 'weight_reps', tags: ['crossfit', 'plyometric'] },
  { id: 'lib_kb_swing', name: 'Kettlebell Swings', muscleGroup: 'Posterior Chain', defaultSets: 5, defaultReps: '20', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_wall_ball', name: 'Wall Ball Shots', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: '20', unit: 'weight_reps', tags: ['crossfit', 'compound'] },
  { id: 'lib_power_clean', name: 'Power Clean', muscleGroup: 'Full Body', defaultSets: 5, defaultReps: '3', unit: 'weight_reps', tags: ['crossfit', 'olympic'] },
  { id: 'lib_snatch', name: 'Hang Power Snatch', muscleGroup: 'Full Body', defaultSets: 5, defaultReps: '3', unit: 'weight_reps', tags: ['crossfit', 'olympic'] },
  { id: 'lib_row_erg', name: 'Row Erg', muscleGroup: 'Cardio', defaultSets: 4, defaultDuration: '500m', unit: 'time', tags: ['crossfit', 'cardio'] },
  { id: 'lib_toes_bar', name: 'Toes-to-Bar', muscleGroup: 'Core', defaultSets: 4, defaultReps: '10', unit: 'weight_reps', tags: ['crossfit', 'core'] },
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

// ─── Built-in workout definitions ───────────────────────────────────────────

const e = (id: string, name: string, sets: number, reps?: string, dur?: string, mg?: string, u: 'weight_reps' | 'time' = 'weight_reps'): Exercise =>
  ({ id, name, targetSets: sets, targetReps: reps, targetDuration: dur, muscleGroup: mg, unit: u });

const M = {
  bench: e('bench_press', 'Bench Press', 4, '6-8', undefined, 'Chest'),
  inclineDB: e('incline_db', 'Incline DB Press', 3, '8-12', undefined, 'Chest'),
  cableFly: e('cable_fly', 'Cable Fly', 3, '12-15', undefined, 'Chest'),
  dips: e('dips', 'Dips', 3, 'AMRAP', undefined, 'Chest/Triceps'),
  pushUps: e('push_ups', 'Push-ups', 3, 'AMRAP', undefined, 'Chest'),
  deadlift: e('deadlift', 'Deadlift', 4, '4-6', undefined, 'Back'),
  bbRow: e('bb_row', 'Barbell Row', 4, '6-8', undefined, 'Back'),
  latPull: e('lat_pull', 'Lat Pulldown', 3, '10-12', undefined, 'Back'),
  seatedRow: e('seated_row', 'Seated Cable Row', 3, '10-12', undefined, 'Back'),
  pullUps: e('pull_ups', 'Pull-ups', 3, 'AMRAP', undefined, 'Back'),
  ohp: e('ohp', 'Overhead Press', 4, '6-8', undefined, 'Shoulders'),
  latRaise: e('lat_raise', 'Lateral Raise', 3, '12-15', undefined, 'Shoulders'),
  frontRaise: e('front_raise', 'Front Raise', 3, '12-15', undefined, 'Shoulders'),
  facePull: e('face_pull', 'Face Pull', 3, '15-20', undefined, 'Rear Delts'),
  shrugs: e('shrugs', 'Barbell Shrugs', 3, '12-15', undefined, 'Traps'),
  arnold: e('arnold', 'Arnold Press', 3, '10-12', undefined, 'Shoulders'),
  bbCurl: e('bb_curl', 'Barbell Curl', 3, '10-12', undefined, 'Biceps'),
  hammerCurl: e('hammer_curl', 'Hammer Curl', 3, '10-12', undefined, 'Biceps'),
  preacher: e('preacher', 'Preacher Curl', 3, '10-12', undefined, 'Biceps'),
  triPush: e('tri_push', 'Tricep Pushdown', 3, '12-15', undefined, 'Triceps'),
  skull: e('skull', 'Skull Crushers', 3, '10-12', undefined, 'Triceps'),
  squat: e('squat', 'Barbell Squat', 4, '6-8', undefined, 'Quads'),
  rdl: e('rdl', 'Romanian Deadlift', 4, '8-10', undefined, 'Hamstrings'),
  legPress: e('leg_press', 'Leg Press', 3, '10-12', undefined, 'Quads'),
  legCurl: e('leg_curl', 'Leg Curl', 3, '10-12', undefined, 'Hamstrings'),
  legExt: e('leg_ext', 'Leg Extension', 3, '12-15', undefined, 'Quads'),
  calf: e('calf', 'Standing Calf Raise', 4, '15-20', undefined, 'Calves'),
  plank: e('plank', 'Plank', 3, undefined, '45 sec', 'Core', 'time'),
};

const CF = {
  thruster: e('thruster', 'Thrusters', 5, '15', undefined, 'Full Body'),
  boxJump: e('box_jump', 'Box Jumps', 5, '10', undefined, 'Legs'),
  pullUp: e('cf_pull_up', 'Pull-ups', 5, '10', undefined, 'Back'),
  burpee: e('burpee', 'Burpees', 5, '10', undefined, 'Full Body'),
  wallBall: e('wall_ball', 'Wall Ball Shots', 4, '20', undefined, 'Full Body'),
  kbSwing: e('kb_swing', 'Kettlebell Swings', 5, '20', undefined, 'Posterior Chain'),
  clean: e('power_clean', 'Power Clean', 5, '3', undefined, 'Full Body'),
  snatch: e('snatch', 'Hang Power Snatch', 5, '3', undefined, 'Full Body'),
  rowErg: e('row_erg', 'Row Erg', 4, undefined, '500m', 'Cardio', 'time'),
  hspu: e('hspu', 'Handstand Push-ups', 4, '5', undefined, 'Shoulders'),
  ringDip: e('ring_dip', 'Ring Dips', 4, '10', undefined, 'Triceps'),
  t2b: e('t2b', 'Toes-to-Bar', 4, '10', undefined, 'Core'),
  frontSq: e('front_sq', 'Front Squat', 5, '5', undefined, 'Quads'),
  ohSq: e('oh_sq', 'Overhead Squat', 5, '5', undefined, 'Full Body'),
};

const AER = {
  run: e('run', 'Running', 1, undefined, '30 min', 'Cardio', 'time'),
  intervals: e('intervals', 'Sprint Intervals', 8, undefined, '1 min on / 1 off', 'Cardio', 'time'),
  bike: e('bike', 'Stationary Bike', 1, undefined, '40 min', 'Cardio', 'time'),
  jumpRope: e('jump_rope', 'Jump Rope', 5, undefined, '3 min', 'Cardio', 'time'),
  row: e('row', 'Rowing Machine', 1, undefined, '25 min', 'Cardio', 'time'),
  stair: e('stair', 'Stair Climber', 1, undefined, '30 min', 'Cardio', 'time'),
  elliptical: e('elliptical', 'Elliptical', 1, undefined, '35 min', 'Cardio', 'time'),
  mountain: e('mountain', 'Mountain Climbers', 4, undefined, '45 sec', 'Core', 'time'),
  highKnees: e('high_knees', 'High Knees', 4, undefined, '45 sec', 'Cardio', 'time'),
  bikeIntervals: e('bike_int', 'Bike Intervals', 6, undefined, '2 min on / 1 off', 'Cardio', 'time'),
  burpees: e('burpees', 'Burpees', 4, '10', undefined, 'Full Body'),
};

function muscleBuildingPlan(days: number): WorkoutDay[] {
  if (days === 1) return [{ id: 'fb1', name: 'Day 1', focus: 'Full Body', description: 'Complete full body stimulus.', exercises: [M.squat, M.bench, M.bbRow, M.ohp, M.deadlift, M.plank] }];
  if (days === 2) return [
    { id: 'ul_u', name: 'Day 1', focus: 'Upper Body', description: 'Chest, back, shoulders and arms.', exercises: [M.bench, M.bbRow, M.inclineDB, M.latPull, M.ohp, M.bbCurl, M.triPush] },
    { id: 'ul_l', name: 'Day 2', focus: 'Lower Body', description: 'Quads, hamstrings, glutes and calves.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.calf, M.plank] },
  ];
  if (days === 3) return [
    { id: 'ppl_push', name: 'Day 1', focus: 'Push', description: 'Chest, shoulders and triceps.', exercises: [M.bench, M.inclineDB, M.ohp, M.latRaise, M.triPush, M.dips] },
    { id: 'ppl_pull', name: 'Day 2', focus: 'Pull', description: 'Back and biceps.', exercises: [M.deadlift, M.bbRow, M.latPull, M.facePull, M.bbCurl, M.hammerCurl] },
    { id: 'ppl_legs', name: 'Day 3', focus: 'Legs', description: 'Quads, hamstrings, glutes and calves.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.calf, M.plank] },
  ];
  if (days === 4) return [
    { id: '4_ct', name: 'Day 1', focus: 'Chest & Triceps', description: 'Heavy chest with tricep finishers.', exercises: [M.bench, M.inclineDB, M.cableFly, M.triPush, M.skull, M.dips] },
    { id: '4_bb', name: 'Day 2', focus: 'Back & Biceps', description: 'Thick back and arm peak.', exercises: [M.deadlift, M.bbRow, M.latPull, M.seatedRow, M.bbCurl, M.hammerCurl] },
    { id: '4_sh', name: 'Day 3', focus: 'Shoulders', description: 'Full shoulder development.', exercises: [M.ohp, M.arnold, M.latRaise, M.frontRaise, M.facePull, M.shrugs] },
    { id: '4_lg', name: 'Day 4', focus: 'Legs', description: 'Quad and hamstring dominant.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.legExt, M.calf] },
  ];
  if (days === 5) return [
    { id: '5_c', name: 'Day 1', focus: 'Chest', description: 'Full chest from multiple angles.', exercises: [M.bench, M.inclineDB, M.cableFly, M.pushUps, M.dips] },
    { id: '5_b', name: 'Day 2', focus: 'Back', description: 'Width and thickness.', exercises: [M.deadlift, M.bbRow, M.latPull, M.seatedRow, M.pullUps] },
    { id: '5_s', name: 'Day 3', focus: 'Shoulders', description: 'All three delt heads.', exercises: [M.ohp, M.latRaise, M.frontRaise, M.facePull, M.shrugs] },
    { id: '5_a', name: 'Day 4', focus: 'Arms', description: 'Biceps and triceps specialization.', exercises: [M.bbCurl, M.hammerCurl, M.preacher, M.triPush, M.skull, M.dips] },
    { id: '5_l', name: 'Day 5', focus: 'Legs', description: 'Complete lower body.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.calf, M.plank] },
  ];
  if (days === 6) return [
    { id: '6p1', name: 'Day 1', focus: 'Push (Heavy)', description: 'Chest, shoulders and triceps — strength focus.', exercises: [M.bench, M.inclineDB, M.ohp, M.latRaise, M.triPush, M.dips] },
    { id: '6pu1', name: 'Day 2', focus: 'Pull (Heavy)', description: 'Back and biceps — strength focus.', exercises: [M.deadlift, M.bbRow, M.latPull, M.facePull, M.bbCurl, M.hammerCurl] },
    { id: '6l1', name: 'Day 3', focus: 'Legs (Heavy)', description: 'Squat-dominant leg day.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.calf] },
    { id: '6p2', name: 'Day 4', focus: 'Push (Volume)', description: 'Chest, shoulders and triceps — volume.', exercises: [M.inclineDB, M.cableFly, M.arnold, M.latRaise, M.skull, M.triPush] },
    { id: '6pu2', name: 'Day 5', focus: 'Pull (Volume)', description: 'Back and biceps — volume.', exercises: [M.seatedRow, M.latPull, M.pullUps, M.facePull, M.preacher, M.hammerCurl] },
    { id: '6l2', name: 'Day 6', focus: 'Legs (Volume)', description: 'Hip-dominant and isolation work.', exercises: [M.rdl, M.legPress, M.legCurl, M.legExt, M.calf, M.plank] },
  ];
  return [
    { id: '7p1', name: 'Day 1', focus: 'Push', description: 'Chest, shoulders and triceps.', exercises: [M.bench, M.inclineDB, M.ohp, M.latRaise, M.triPush, M.dips] },
    { id: '7pu1', name: 'Day 2', focus: 'Pull', description: 'Back and biceps.', exercises: [M.deadlift, M.bbRow, M.latPull, M.facePull, M.bbCurl, M.hammerCurl] },
    { id: '7l1', name: 'Day 3', focus: 'Legs', description: 'Full leg day.', exercises: [M.squat, M.rdl, M.legPress, M.legCurl, M.calf] },
    { id: '7p2', name: 'Day 4', focus: 'Push (Vol)', description: 'Chest, shoulders and triceps — volume.', exercises: [M.inclineDB, M.cableFly, M.arnold, M.latRaise, M.skull, M.triPush] },
    { id: '7pu2', name: 'Day 5', focus: 'Pull (Vol)', description: 'Back and biceps — volume.', exercises: [M.seatedRow, M.latPull, M.pullUps, M.facePull, M.preacher, M.hammerCurl] },
    { id: '7l2', name: 'Day 6', focus: 'Legs (Vol)', description: 'Hip-dominant and isolation.', exercises: [M.rdl, M.legPress, M.legCurl, M.legExt, M.calf, M.plank] },
    { id: '7fb', name: 'Day 7', focus: 'Full Body', description: 'Light full-body active session.', exercises: [M.squat, M.bench, M.bbRow, M.ohp, M.plank] },
  ];
}

function crossfitPlan(days: number): WorkoutDay[] {
  const all: WorkoutDay[] = [
    { id: 'cf1', name: 'Day 1', focus: 'Strength + Conditioning', description: 'Heavy barbell work followed by metcon.', exercises: [CF.clean, CF.frontSq, CF.thruster, CF.burpee, CF.pullUp] },
    { id: 'cf2', name: 'Day 2', focus: 'Olympic Lifting', description: 'Snatch and clean complex.', exercises: [CF.snatch, CF.ohSq, CF.clean, CF.boxJump, CF.rowErg] },
    { id: 'cf3', name: 'Day 3', focus: 'Gymnastics + Cardio', description: 'Bodyweight skills and rowing intervals.', exercises: [CF.pullUp, CF.hspu, CF.ringDip, CF.t2b, CF.rowErg] },
    { id: 'cf4', name: 'Day 4', focus: 'AMRAP WOD', description: '20-minute AMRAP — push your limits.', exercises: [CF.wallBall, CF.kbSwing, CF.boxJump, CF.burpee, CF.pullUp] },
    { id: 'cf5', name: 'Day 5', focus: 'Barbell Cycling', description: 'High-rep barbell conditioning.', exercises: [CF.clean, CF.thruster, CF.frontSq, CF.ohSq, CF.rowErg] },
    { id: 'cf6', name: 'Day 6', focus: 'Hero WOD', description: 'Long benchmark workout — test your engine.', exercises: [CF.pullUp, CF.burpee, CF.kbSwing, CF.wallBall, CF.boxJump] },
    { id: 'cf7', name: 'Day 7', focus: 'Active Recovery', description: 'Light movement to promote recovery.', exercises: [CF.rowErg, CF.kbSwing] },
  ];
  return all.slice(0, days);
}

function aerobicsPlan(days: number): WorkoutDay[] {
  const all: WorkoutDay[] = [
    { id: 'aer1', name: 'Day 1', focus: 'Steady State Cardio', description: 'Maintain a conversational pace.', exercises: [AER.run] },
    { id: 'aer2', name: 'Day 2', focus: 'HIIT Intervals', description: 'Spike your heart rate with intervals.', exercises: [AER.intervals, AER.jumpRope, AER.mountain, AER.highKnees] },
    { id: 'aer3', name: 'Day 3', focus: 'Low Impact Cardio', description: 'Easy on the joints — great recovery day.', exercises: [AER.bike, AER.elliptical] },
    { id: 'aer4', name: 'Day 4', focus: 'Rowing & Core', description: 'Row machine with core finishers.', exercises: [AER.row, AER.jumpRope, AER.mountain] },
    { id: 'aer5', name: 'Day 5', focus: 'Stair & Bike', description: 'Vertical work and cycling output.', exercises: [AER.stair, AER.bikeIntervals] },
    { id: 'aer6', name: 'Day 6', focus: 'Endurance Run', description: 'Longer steady-state endurance.', exercises: [AER.run, AER.jumpRope] },
    { id: 'aer7', name: 'Day 7', focus: 'Active Recovery', description: 'Light movement to flush the legs.', exercises: [AER.bike] },
  ];
  return all.slice(0, days);
}

export function generateWorkoutPlan(programType: ProgramType, daysPerWeek: number): WorkoutDay[] {
  const days = Math.max(1, Math.min(7, daysPerWeek));
  switch (programType) {
    case 'muscle_building': return muscleBuildingPlan(days);
    case 'crossfit': return crossfitPlan(days);
    case 'aerobics': return aerobicsPlan(days);
  }
}

export const PROGRAM_INFO = {
  muscle_building: { label: 'Muscle Building', subtitle: 'Hypertrophy & Strength', description: 'Progressive overload training focused on maximizing muscle size and strength gains.', color: '#E63946' },
  crossfit: { label: 'CrossFit', subtitle: 'Functional Fitness', description: 'High-intensity functional movements combining cardio, strength, and gymnastics.', color: '#FF9500' },
  aerobics: { label: 'Aerobics', subtitle: 'Cardio & Endurance', description: 'Cardiovascular conditioning to improve heart health, stamina, and fat burning.', color: '#30D158' },
} as const;

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
