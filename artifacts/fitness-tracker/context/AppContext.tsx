import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { generateWorkoutPlan, ProgramType, WorkoutDay } from '@/constants/workouts';

export type { ProgramType };

export interface UserProfile {
  programType: ProgramType;
  daysPerWeek: number;
  startDate: string;
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
  workoutPlan: WorkoutDay[];
  workoutLogs: WorkoutLog[];
  bodyEntries: BodyEntry[];
  isLoaded: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
  saveWorkoutLog: (log: WorkoutLog) => Promise<void>;
  saveBodyEntry: (entry: BodyEntry) => Promise<void>;
  deleteBodyEntry: (id: string) => Promise<void>;
  getCurrentWorkoutDayIndex: () => number;
  resetProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const KEYS = {
  PROFILE: '@fittrack_profile',
  WORKOUT_LOGS: '@fittrack_workout_logs',
  BODY_ENTRIES: '@fittrack_body_entries',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRaw, logsRaw, bodyRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.PROFILE),
          AsyncStorage.getItem(KEYS.WORKOUT_LOGS),
          AsyncStorage.getItem(KEYS.BODY_ENTRIES),
        ]);
        if (profileRaw) {
          const p: UserProfile = JSON.parse(profileRaw);
          setProfileState(p);
          setWorkoutPlan(generateWorkoutPlan(p.programType, p.daysPerWeek));
        }
        if (logsRaw) setWorkoutLogs(JSON.parse(logsRaw));
        if (bodyRaw) setBodyEntries(JSON.parse(bodyRaw));
      } catch (_) {
        // ignore parse errors
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  const setProfile = useCallback(async (p: UserProfile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    setProfileState(p);
    setWorkoutPlan(generateWorkoutPlan(p.programType, p.daysPerWeek));
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

  const getCurrentWorkoutDayIndex = useCallback(() => {
    if (!profile) return 0;
    const completed = workoutLogs.filter(l => l.completed).length;
    return completed % profile.daysPerWeek;
  }, [profile, workoutLogs]);

  const resetProfile = useCallback(async () => {
    await AsyncStorage.multiRemove([KEYS.PROFILE, KEYS.WORKOUT_LOGS, KEYS.BODY_ENTRIES]);
    setProfileState(null);
    setWorkoutPlan([]);
    setWorkoutLogs([]);
    setBodyEntries([]);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, workoutPlan, workoutLogs, bodyEntries, isLoaded,
      setProfile, saveWorkoutLog, saveBodyEntry, deleteBodyEntry,
      getCurrentWorkoutDayIndex, resetProfile,
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
