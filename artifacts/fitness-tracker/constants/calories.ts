import type { ExerciseLog } from '@/context/AppContext';

const MET_BY_PROGRAM: Record<string, number> = {
  muscle_building: 4.5,
  crossfit: 9.0,
  aerobics: 7.0,
};

export function estimateCalories(
  exerciseLogs: ExerciseLog[],
  programType: string,
  workoutDurationMins: number,
  bodyWeightLbs = 154,
): number {
  const totalSets = exerciseLogs.reduce((a, el) => a + el.sets.length, 0);
  const completedSets = exerciseLogs.reduce((a, el) => a + el.sets.filter(s => s.completed).length, 0);
  const completionRate = totalSets > 0 ? Math.max(0.1, completedSets / totalSets) : 0.5;
  const effectiveMins = workoutDurationMins * completionRate;
  const weightKg = bodyWeightLbs / 2.205;
  const met = MET_BY_PROGRAM[programType] ?? 5.0;
  return Math.round(met * weightKg * (effectiveMins / 60));
}
