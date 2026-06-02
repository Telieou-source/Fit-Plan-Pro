import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { generateWorkoutPlan, ProgramType, SkillLevel, WorkoutDay, Exercise } from '@/constants/workouts';

export type { ProgramType, SkillLevel };

export interface UserProfile {
  programType: ProgramType;
  skillLevel: SkillLevel;
  daysPerWeek: number;
  preferredDays: number[]; // 0=Sun, 1=Mon ... 6=Sat; sorted
  workoutDuration: number; // minutes per session (15-120)
  startDate: string;
  heightInches?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  durationSecs: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutDayIndex: number;
  exerciseLogs: ExerciseLog[];
  completed: boolean;
  caloriesBurned?: number;
}

export interface BodyEntry {
  id: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface AppContextType {
  profile: UserProfile | null;
  workoutPlan: WorkoutDay[];            // base generated plan (current week)
  customWorkoutPlan: WorkoutDay[] | null; // user-edited overrides
  effectivePlan: WorkoutDay[];          // customWorkoutPlan ?? workoutPlan
  workoutLogs: WorkoutLog[];
  bodyEntries: BodyEntry[];
  isLoaded: boolean;
  weekNumber: number;                   // how many full weeks completed
  customExercises: Exercise[];
  setProfile: (profile: UserProfile) => Promise<void>;
  saveWorkoutLog: (log: WorkoutLog) => Promise<void>;
  saveBodyEntry: (entry: BodyEntry) => Promise<void>;
  deleteBodyEntry: (id: string) => Promise<void>;
  saveCustomExercise: (exercise: Exercise) => Promise<void>;
  deleteCustomExercise: (id: string) => Promise<void>;
  getCurrentWorkoutDayIndex: () => number; // -1 = rest day
  isRestDay: () => boolean;
  updateWorkoutDay: (dayIndex: number, updatedDay: WorkoutDay) => Promise<void>;
  resetWorkoutPlan: () => Promise<void>;
  resetProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const KEYS = {
  PROFILE: '@fittrack_profile',
  WORKOUT_LOGS: '@fittrack_workout_logs',
  BODY_ENTRIES: '@fittrack_body_entries',
  CUSTOM_PLAN: '@fittrack_custom_plan',
  CUSTOM_EXERCISES: '@fittrack_custom_exercises',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [customWorkoutPlan, setCustomWorkoutPlan] = useState<WorkoutDay[] | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [profileRaw, logsRaw, bodyRaw, customRaw, customExRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.PROFILE),
          AsyncStorage.getItem(KEYS.WORKOUT_LOGS),
          AsyncStorage.getItem(KEYS.BODY_ENTRIES),
          AsyncStorage.getItem(KEYS.CUSTOM_PLAN),
          AsyncStorage.getItem(KEYS.CUSTOM_EXERCISES),
        ]);
        if (profileRaw) {
          const p: UserProfile = JSON.parse(profileRaw);
          if (!p.preferredDays) p.preferredDays = [];
          if (!p.skillLevel) p.skillLevel = 'intermediate'; // back-compat
          if (!p.workoutDuration) p.workoutDuration = 60;  // back-compat
          setProfileState(p);
        }
        if (logsRaw) setWorkoutLogs(JSON.parse(logsRaw));
        if (bodyRaw) setBodyEntries(JSON.parse(bodyRaw));
        if (customRaw) setCustomWorkoutPlan(JSON.parse(customRaw));
        if (customExRaw) setCustomExercises(JSON.parse(customExRaw));
      } catch (_) { /* ignore */ }
      setIsLoaded(true);
    })();
  }, []);

  // Compute week number from completed workouts
  const weekNumber = useMemo(() => {
    if (!profile) return 0;
    const completed = workoutLogs.filter(l => l.completed).length;
    return Math.floor(completed / Math.max(1, profile.daysPerWeek));
  }, [workoutLogs, profile]);

  // Generated plan rotates by week number and skill level
  const workoutPlan = useMemo(() => {
    if (!profile) return [];
    return generateWorkoutPlan(profile.programType, profile.daysPerWeek, profile.skillLevel, weekNumber, profile.workoutDuration ?? 60);
  }, [profile, weekNumber]);

  const effectivePlan: WorkoutDay[] = customWorkoutPlan ?? workoutPlan;

  const setProfile = useCallback(async (p: UserProfile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    setProfileState(p);
    // clear custom plan on program change
    await AsyncStorage.removeItem(KEYS.CUSTOM_PLAN);
    setCustomWorkoutPlan(null);
  }, []);

  const saveWorkoutLog = useCallback(async (log: WorkoutLog) => {
    setWorkoutLogs(prev => {
      const idx = prev.findIndex(l => l.id === log.id);
      const next = idx >= 0 ? prev.map(l => l.id === log.id ? log : l) : [...prev, log];
      AsyncStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveBodyEntry = useCallback(async (entry: BodyEntry) => {
    setBodyEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      const next = idx >= 0 ? prev.map(e => e.id === entry.id ? entry : e) : [entry, ...prev];
      AsyncStorage.setItem(KEYS.BODY_ENTRIES, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteBodyEntry = useCallback(async (id: string) => {
    setBodyEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      AsyncStorage.setItem(KEYS.BODY_ENTRIES, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveCustomExercise = useCallback(async (exercise: Exercise) => {
    setCustomExercises(prev => {
      if (prev.some(e => e.id === exercise.id)) return prev;
      const next = [exercise, ...prev];
      AsyncStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCustomExercise = useCallback(async (id: string) => {
    setCustomExercises(prev => {
      const next = prev.filter(e => e.id !== id);
      AsyncStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(next));
      return next;
    });
  }, []);

  const getCurrentWorkoutDayIndex = useCallback((): number => {
    if (!profile) return 0;
    const { preferredDays, daysPerWeek } = profile;
    if (!preferredDays?.length) {
      const completed = workoutLogs.filter(l => l.completed).length;
      return completed % daysPerWeek;
    }
    const todayDow = new Date().getDay();
    const pos = preferredDays.indexOf(todayDow);
    if (pos === -1) return -1; // rest day
    return pos % daysPerWeek;
  }, [profile, workoutLogs]);

  const isRestDay = useCallback((): boolean => {
    if (!profile?.preferredDays?.length) return false;
    return !profile.preferredDays.includes(new Date().getDay());
  }, [profile]);

  const updateWorkoutDay = useCallback(async (dayIndex: number, updatedDay: WorkoutDay) => {
    const base = customWorkoutPlan ?? workoutPlan;
    const next = base.map((d, i) => i === dayIndex ? updatedDay : d);
    await AsyncStorage.setItem(KEYS.CUSTOM_PLAN, JSON.stringify(next));
    setCustomWorkoutPlan(next);
  }, [customWorkoutPlan, workoutPlan]);

  const resetWorkoutPlan = useCallback(async () => {
    await AsyncStorage.removeItem(KEYS.CUSTOM_PLAN);
    setCustomWorkoutPlan(null);
  }, []);

  const resetProfile = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    setProfileState(null);
    setCustomWorkoutPlan(null);
    setWorkoutLogs([]);
    setBodyEntries([]);
    setCustomExercises([]);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, workoutPlan, customWorkoutPlan, effectivePlan,
      workoutLogs, bodyEntries, isLoaded, weekNumber, customExercises,
      setProfile, saveWorkoutLog, saveBodyEntry, deleteBodyEntry,
      saveCustomExercise, deleteCustomExercise,
      getCurrentWorkoutDayIndex, isRestDay,
      updateWorkoutDay, resetWorkoutPlan, resetProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
