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

const ex = (id: string, name: string, targetSets: number, targetReps: string | undefined, targetDuration: string | undefined, muscleGroup: string | undefined, unit: 'weight_reps' | 'time'): Exercise => ({
  id, name, targetSets, targetReps, targetDuration, muscleGroup, unit,
});

const MUSCLE_EXERCISES = {
  benchPress: ex('bench_press', 'Bench Press', 4, '6-8', undefined, 'Chest', 'weight_reps'),
  inclineDB: ex('incline_db_press', 'Incline DB Press', 3, '8-12', undefined, 'Chest', 'weight_reps'),
  cableFly: ex('cable_fly', 'Cable Fly', 3, '12-15', undefined, 'Chest', 'weight_reps'),
  dips: ex('dips', 'Dips', 3, 'AMRAP', undefined, 'Triceps', 'weight_reps'),
  pushUps: ex('push_ups', 'Push-ups', 3, 'AMRAP', undefined, 'Chest', 'weight_reps'),
  deadlift: ex('deadlift', 'Deadlift', 4, '4-6', undefined, 'Back', 'weight_reps'),
  barbellRow: ex('barbell_row', 'Barbell Row', 4, '6-8', undefined, 'Back', 'weight_reps'),
  latPulldown: ex('lat_pulldown', 'Lat Pulldown', 3, '10-12', undefined, 'Back', 'weight_reps'),
  seatedCableRow: ex('seated_cable_row', 'Seated Cable Row', 3, '10-12', undefined, 'Back', 'weight_reps'),
  pullUps: ex('pull_ups', 'Pull-ups', 3, 'AMRAP', undefined, 'Back', 'weight_reps'),
  ohp: ex('ohp', 'Overhead Press', 4, '6-8', undefined, 'Shoulders', 'weight_reps'),
  lateralRaise: ex('lateral_raise', 'Lateral Raise', 3, '12-15', undefined, 'Shoulders', 'weight_reps'),
  frontRaise: ex('front_raise', 'Front Raise', 3, '12-15', undefined, 'Shoulders', 'weight_reps'),
  facePull: ex('face_pull', 'Face Pull', 3, '15-20', undefined, 'Shoulders', 'weight_reps'),
  shrugs: ex('shrugs', 'Barbell Shrugs', 3, '12-15', undefined, 'Traps', 'weight_reps'),
  arnoldPress: ex('arnold_press', 'Arnold Press', 3, '10-12', undefined, 'Shoulders', 'weight_reps'),
  bicepCurl: ex('bicep_curl', 'Barbell Curl', 3, '10-12', undefined, 'Biceps', 'weight_reps'),
  hammerCurl: ex('hammer_curl', 'Hammer Curl', 3, '10-12', undefined, 'Biceps', 'weight_reps'),
  preacherCurl: ex('preacher_curl', 'Preacher Curl', 3, '10-12', undefined, 'Biceps', 'weight_reps'),
  tricepPushdown: ex('tricep_pushdown', 'Tricep Pushdown', 3, '12-15', undefined, 'Triceps', 'weight_reps'),
  skullCrushers: ex('skull_crushers', 'Skull Crushers', 3, '10-12', undefined, 'Triceps', 'weight_reps'),
  squat: ex('squat', 'Barbell Squat', 4, '6-8', undefined, 'Quads', 'weight_reps'),
  rdl: ex('rdl', 'Romanian Deadlift', 4, '8-10', undefined, 'Hamstrings', 'weight_reps'),
  legPress: ex('leg_press', 'Leg Press', 3, '10-12', undefined, 'Quads', 'weight_reps'),
  legCurl: ex('leg_curl', 'Lying Leg Curl', 3, '10-12', undefined, 'Hamstrings', 'weight_reps'),
  legExtension: ex('leg_extension', 'Leg Extension', 3, '12-15', undefined, 'Quads', 'weight_reps'),
  calfRaise: ex('calf_raise', 'Standing Calf Raise', 4, '15-20', undefined, 'Calves', 'weight_reps'),
  plank: ex('plank', 'Plank', 3, undefined, '45 sec', 'Core', 'time'),
};

const CF = {
  thruster: ex('thruster', 'Thrusters', 5, '15', undefined, 'Full Body', 'weight_reps'),
  boxJump: ex('box_jump', 'Box Jumps', 5, '10', undefined, 'Legs', 'weight_reps'),
  cfPullUps: ex('cf_pull_ups', 'Pull-ups', 5, '10', undefined, 'Back', 'weight_reps'),
  burpees: ex('burpees', 'Burpees', 5, '10', undefined, 'Full Body', 'weight_reps'),
  wallBall: ex('wall_ball', 'Wall Ball Shots', 4, '20', undefined, 'Full Body', 'weight_reps'),
  kettlebellSwing: ex('kb_swing', 'Kettlebell Swings', 5, '20', undefined, 'Posterior Chain', 'weight_reps'),
  clean: ex('clean', 'Power Clean', 5, '3', undefined, 'Full Body', 'weight_reps'),
  snatch: ex('snatch', 'Hang Power Snatch', 5, '3', undefined, 'Full Body', 'weight_reps'),
  rowErg: ex('row_erg', 'Row Erg', 4, undefined, '500m', 'Cardio', 'time'),
  dbSnatch: ex('db_snatch', 'DB Snatch', 5, '10', undefined, 'Shoulders', 'weight_reps'),
  ringDips: ex('ring_dips', 'Ring Dips', 4, '10', undefined, 'Triceps', 'weight_reps'),
  handstandPushUps: ex('hspu', 'Handstand Push-ups', 4, '5', undefined, 'Shoulders', 'weight_reps'),
  musclUps: ex('muscle_ups', 'Muscle-ups', 4, '5', undefined, 'Back', 'weight_reps'),
  frontSquat: ex('front_squat', 'Front Squat', 5, '5', undefined, 'Quads', 'weight_reps'),
  overheadSquat: ex('oh_squat', 'Overhead Squat', 5, '5', undefined, 'Full Body', 'weight_reps'),
};

const AER = {
  run: ex('run', 'Running', 1, undefined, '30 min', 'Cardio', 'time'),
  intervals: ex('intervals', 'Sprint Intervals', 8, undefined, '1 min on / 1 min off', 'Cardio', 'time'),
  cycling: ex('cycling', 'Stationary Bike', 1, undefined, '40 min', 'Cardio', 'time'),
  jumpRope: ex('jump_rope', 'Jump Rope', 5, undefined, '3 min', 'Cardio', 'time'),
  rowing: ex('rowing', 'Rowing Machine', 1, undefined, '25 min', 'Cardio', 'time'),
  stairClimb: ex('stair_climb', 'Stair Climber', 1, undefined, '30 min', 'Cardio', 'time'),
  elliptical: ex('elliptical', 'Elliptical', 1, undefined, '35 min', 'Cardio', 'time'),
  jumpingJacks: ex('jumping_jacks', 'Jumping Jacks', 3, undefined, '2 min', 'Cardio', 'time'),
  mountainClimbers: ex('mountain_climbers', 'Mountain Climbers', 4, undefined, '45 sec', 'Core', 'time'),
  hiJumps: ex('high_knees', 'High Knees', 4, undefined, '45 sec', 'Cardio', 'time'),
  bikeIntervals: ex('bike_intervals', 'Bike Intervals', 6, undefined, '2 min on / 1 min off', 'Cardio', 'time'),
};

function muscleBuildingPlan(days: number): WorkoutDay[] {
  if (days === 1) {
    return [{
      id: 'fb1', name: 'Day 1', focus: 'Full Body', description: 'Complete full body stimulus hitting all major muscle groups.',
      exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.plank],
    }];
  }
  if (days === 2) {
    return [
      { id: 'ul_upper', name: 'Day 1', focus: 'Upper Body', description: 'Chest, back, shoulders and arms.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.tricepPushdown] },
      { id: 'ul_lower', name: 'Day 2', focus: 'Lower Body', description: 'Quads, hamstrings, glutes and calves.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.calfRaise, MUSCLE_EXERCISES.plank] },
    ];
  }
  if (days === 3) {
    return [
      { id: 'ppl_push', name: 'Day 1', focus: 'Push', description: 'Chest, shoulders and triceps.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.tricepPushdown, MUSCLE_EXERCISES.dips] },
      { id: 'ppl_pull', name: 'Day 2', focus: 'Pull', description: 'Back and biceps.', exercises: [MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.hammerCurl] },
      { id: 'ppl_legs', name: 'Day 3', focus: 'Legs', description: 'Quads, hamstrings, glutes and calves.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.calfRaise, MUSCLE_EXERCISES.plank] },
    ];
  }
  if (days === 4) {
    return [
      { id: 'ub_chest_tri', name: 'Day 1', focus: 'Chest & Triceps', description: 'Heavy chest work with tricep finishers.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.cableFly, MUSCLE_EXERCISES.tricepPushdown, MUSCLE_EXERCISES.skullCrushers, MUSCLE_EXERCISES.dips] },
      { id: 'ub_back_bi', name: 'Day 2', focus: 'Back & Biceps', description: 'Thick back development and arm peak.', exercises: [MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.seatedCableRow, MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.hammerCurl] },
      { id: 'ub_shoulders', name: 'Day 3', focus: 'Shoulders', description: 'Complete shoulder development — press, lateral, rear.', exercises: [MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.arnoldPress, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.frontRaise, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.shrugs] },
      { id: 'ub_legs', name: 'Day 4', focus: 'Legs', description: 'Quad and hamstring dominant leg day.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.legExtension, MUSCLE_EXERCISES.calfRaise] },
    ];
  }
  if (days === 5) {
    return [
      { id: '5_chest', name: 'Day 1', focus: 'Chest', description: 'Full chest focus from multiple angles.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.cableFly, MUSCLE_EXERCISES.pushUps, MUSCLE_EXERCISES.dips] },
      { id: '5_back', name: 'Day 2', focus: 'Back', description: 'Width and thickness back training.', exercises: [MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.seatedCableRow, MUSCLE_EXERCISES.pullUps] },
      { id: '5_shoulders', name: 'Day 3', focus: 'Shoulders', description: 'Pressing and isolation for all three heads.', exercises: [MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.frontRaise, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.shrugs] },
      { id: '5_arms', name: 'Day 4', focus: 'Arms', description: 'Biceps and triceps specialization.', exercises: [MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.hammerCurl, MUSCLE_EXERCISES.preacherCurl, MUSCLE_EXERCISES.tricepPushdown, MUSCLE_EXERCISES.skullCrushers, MUSCLE_EXERCISES.dips] },
      { id: '5_legs', name: 'Day 5', focus: 'Legs', description: 'Complete lower body — quads, hams, calves.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.calfRaise, MUSCLE_EXERCISES.plank] },
    ];
  }
  if (days === 6) {
    const push = { id: 'ppl6_push1', name: 'Day 1', focus: 'Push', description: 'Chest, shoulders and triceps — heavy.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.tricepPushdown, MUSCLE_EXERCISES.dips] };
    const pull = { id: 'ppl6_pull1', name: 'Day 2', focus: 'Pull', description: 'Back and biceps — heavy.', exercises: [MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.hammerCurl] };
    const legs = { id: 'ppl6_legs1', name: 'Day 3', focus: 'Legs', description: 'Quads, hamstrings, calves.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.calfRaise] };
    return [
      push, pull, legs,
      { ...push, id: 'ppl6_push2', name: 'Day 4', description: 'Chest, shoulders and triceps — volume.', exercises: [MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.cableFly, MUSCLE_EXERCISES.arnoldPress, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.skullCrushers, MUSCLE_EXERCISES.tricepPushdown] },
      { ...pull, id: 'ppl6_pull2', name: 'Day 5', description: 'Back and biceps — volume.', exercises: [MUSCLE_EXERCISES.seatedCableRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.pullUps, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.preacherCurl, MUSCLE_EXERCISES.hammerCurl] },
      { ...legs, id: 'ppl6_legs2', name: 'Day 6', description: 'Legs — volume and isolation.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.legExtension, MUSCLE_EXERCISES.calfRaise, MUSCLE_EXERCISES.plank] },
    ];
  }
  // 7 days
  const push = { id: 'ppl7_push1', name: 'Day 1', focus: 'Push', description: 'Chest, shoulders and triceps.', exercises: [MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.inclineDB, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.lateralRaise, MUSCLE_EXERCISES.tricepPushdown, MUSCLE_EXERCISES.dips] };
  const pull = { id: 'ppl7_pull1', name: 'Day 2', focus: 'Pull', description: 'Back and biceps.', exercises: [MUSCLE_EXERCISES.deadlift, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.latPulldown, MUSCLE_EXERCISES.facePull, MUSCLE_EXERCISES.bicepCurl, MUSCLE_EXERCISES.hammerCurl] };
  const legs = { id: 'ppl7_legs1', name: 'Day 3', focus: 'Legs', description: 'Quads, hamstrings, calves.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.rdl, MUSCLE_EXERCISES.legPress, MUSCLE_EXERCISES.legCurl, MUSCLE_EXERCISES.calfRaise] };
  return [
    push, pull, legs,
    { ...push, id: 'ppl7_push2', name: 'Day 4' },
    { ...pull, id: 'ppl7_pull2', name: 'Day 5' },
    { ...legs, id: 'ppl7_legs2', name: 'Day 6' },
    { id: 'ppl7_fb', name: 'Day 7', focus: 'Full Body', description: 'Active recovery — light full body movement.', exercises: [MUSCLE_EXERCISES.squat, MUSCLE_EXERCISES.benchPress, MUSCLE_EXERCISES.barbellRow, MUSCLE_EXERCISES.ohp, MUSCLE_EXERCISES.plank] },
  ];
}

function crossfitPlan(days: number): WorkoutDay[] {
  const allWods: WorkoutDay[] = [
    { id: 'cf1', name: 'Day 1', focus: 'Strength + Conditioning', description: 'Heavy barbell work followed by metabolic conditioning.', exercises: [CF.clean, CF.frontSquat, CF.thruster, CF.burpees, CF.cfPullUps] },
    { id: 'cf2', name: 'Day 2', focus: 'Olympic Lifting', description: 'Snatch and clean complex with accessory work.', exercises: [CF.snatch, CF.overheadSquat, CF.dbSnatch, CF.boxJump, CF.rowErg] },
    { id: 'cf3', name: 'Day 3', focus: 'Gymnastics + Cardio', description: 'Bodyweight skills and rowing intervals.', exercises: [CF.musclUps, CF.handstandPushUps, CF.ringDips, CF.cfPullUps, CF.rowErg] },
    { id: 'cf4', name: 'Day 4', focus: 'AMRAP WOD', description: '20-minute AMRAP — push your limits.', exercises: [CF.wallBall, CF.kettlebellSwing, CF.boxJump, CF.burpees, CF.cfPullUps] },
    { id: 'cf5', name: 'Day 5', focus: 'Barbell Cycling', description: 'High-rep barbell conditioning.', exercises: [CF.clean, CF.thruster, CF.frontSquat, CF.overheadSquat, CF.rowErg] },
    { id: 'cf6', name: 'Day 6', focus: 'Hero WOD', description: 'Long benchmark workout — test your engine.', exercises: [CF.cfPullUps, CF.burpees, CF.kettlebellSwing, CF.wallBall, CF.boxJump] },
    { id: 'cf7', name: 'Day 7', focus: 'Active Recovery', description: 'Light movement to promote recovery.', exercises: [CF.rowErg, CF.dbSnatch, CF.kettlebellSwing] },
  ];
  return allWods.slice(0, days);
}

function aerobicsPlan(days: number): WorkoutDay[] {
  const allDays: WorkoutDay[] = [
    { id: 'aer1', name: 'Day 1', focus: 'Steady State Cardio', description: 'Maintain a conversational pace for the full duration.', exercises: [AER.run] },
    { id: 'aer2', name: 'Day 2', focus: 'HIIT Intervals', description: 'High intensity intervals to spike your heart rate.', exercises: [AER.intervals, AER.jumpRope, AER.mountainClimbers, AER.hiJumps] },
    { id: 'aer3', name: 'Day 3', focus: 'Low Impact Cardio', description: 'Easy on the joints — great for recovery days.', exercises: [AER.cycling, AER.elliptical] },
    { id: 'aer4', name: 'Day 4', focus: 'Rowing & Core', description: 'Row machine with core finishers.', exercises: [AER.rowing, AER.jumpingJacks, AER.mountainClimbers] },
    { id: 'aer5', name: 'Day 5', focus: 'Stair & Bike', description: 'Vertical work and cycling power output.', exercises: [AER.stairClimb, AER.bikeIntervals] },
    { id: 'aer6', name: 'Day 6', focus: 'Endurance Run', description: 'Longer steady-state endurance work.', exercises: [AER.run, AER.jumpRope] },
    { id: 'aer7', name: 'Day 7', focus: 'Active Recovery', description: 'Light easy movement to flush the legs.', exercises: [AER.cycling] },
  ];
  return allDays.slice(0, days);
}

export function generateWorkoutPlan(programType: ProgramType, daysPerWeek: number): WorkoutDay[] {
  switch (programType) {
    case 'muscle_building': return muscleBuildingPlan(daysPerWeek);
    case 'crossfit': return crossfitPlan(daysPerWeek);
    case 'aerobics': return aerobicsPlan(daysPerWeek);
  }
}

export const PROGRAM_INFO = {
  muscle_building: {
    label: 'Muscle Building',
    subtitle: 'Hypertrophy & Strength',
    description: 'Progressive overload training focused on maximizing muscle size and strength gains.',
    color: '#E63946',
  },
  crossfit: {
    label: 'CrossFit',
    subtitle: 'Functional Fitness',
    description: 'High-intensity functional movements combining cardio, strength, and gymnastics.',
    color: '#FF9500',
  },
  aerobics: {
    label: 'Aerobics',
    subtitle: 'Cardio & Endurance',
    description: 'Cardiovascular conditioning to improve heart health, stamina, and fat burning.',
    color: '#30D158',
  },
} as const;
