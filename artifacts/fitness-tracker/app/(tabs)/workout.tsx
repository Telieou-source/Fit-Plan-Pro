import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, WorkoutLog, ExerciseLog, SetLog } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { Exercise, WorkoutDay, PROGRAM_INFO, getProgramExercisePool, EXERCISE_LIBRARY, LibraryExercise, libraryExToExercise } from '@/constants/workouts';
import { openExerciseVideo } from '@/constants/exerciseLinks';
import { estimateCalories } from '@/constants/calories';

// ─── Constants ───────────────────────────────────────────────────────────────

const TIMER_PRESETS = [
  { label: '20s', secs: 20 },
  { label: '30s', secs: 30 },
  { label: '45s', secs: 45 },
  { label: '1 min', secs: 60 },
  { label: '90s', secs: 90 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fuzzy muscle-group match: "Back/Biceps" matches "Back", "Quads/Glutes" matches "Quads" */
function muscleGroupMatches(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const pa = a.split('/')[0].trim().toLowerCase();
  const pb = b.split('/')[0].trim().toLowerCase();
  return pa === pb || a.toLowerCase().includes(pb) || b.toLowerCase().includes(pa);
}

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function initSets(exercise: Exercise, count: number, lastWeight?: number | null): SetLog[] {
  return Array.from({ length: count }, () => ({
    weight: lastWeight ?? null,
    reps: null,
    durationSecs: null,
    completed: false,
  }));
}

function getLastUsedWeight(exerciseId: string, logs: WorkoutLog[]): number | null {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    for (const el of log.exerciseLogs) {
      if (el.exerciseId === exerciseId) {
        for (const set of el.sets) {
          if (set.completed && set.weight != null) return set.weight;
        }
      }
    }
  }
  return null;
}

function initExerciseLogs(workout: WorkoutDay, prevLogs: WorkoutLog[] = []): ExerciseLog[] {
  return workout.exercises.map(ex => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    sets: initSets(ex, ex.targetSets, getLastUsedWeight(ex.id, prevLogs)),
  }));
}

/** Parse "45 sec", "2 min", "60s", plain numbers → seconds */
function parseDurationToSecs(dur: string | undefined): number {
  if (!dur) return 60;
  const minMatch = dur.match(/(\d+)\s*(min|m\b)/i);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = dur.match(/(\d+)/);
  if (secMatch) return parseInt(secMatch[1]);
  return 60;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}`;
}

// ─── Timer Modal ─────────────────────────────────────────────────────────────

const RING_R = 90;
const RING_SW = 10;
const RING_C = 2 * Math.PI * RING_R;

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  initialSecs: number;
  autoStart?: boolean;
  accentColor: string;
  onComplete?: () => void;
}

function TimerModal({ visible, onClose, initialSecs, autoStart = false, accentColor, onComplete }: TimerModalProps) {
  const colors = useColors();
  const [target, setTarget] = useState(initialSecs);
  const [remaining, setRemaining] = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visible) {
      if (ivRef.current) clearInterval(ivRef.current);
      setTarget(initialSecs);
      setRemaining(initialSecs);
      setDone(false);
      setRunning(autoStart);
    } else {
      if (ivRef.current) clearInterval(ivRef.current);
      setRunning(false);
    }
  }, [initialSecs, visible, autoStart]);

  useEffect(() => {
    if (running) {
      ivRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(ivRef.current!);
            setRunning(false);
            setDone(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onCompleteRef.current?.();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (ivRef.current) clearInterval(ivRef.current);
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [running]);

  const selectPreset = (secs: number) => {
    if (ivRef.current) clearInterval(ivRef.current);
    setTarget(secs);
    setRemaining(secs);
    setRunning(false);
    setDone(false);
    Haptics.selectionAsync();
  };

  const toggle = () => {
    if (done) {
      setRemaining(target);
      setDone(false);
      setRunning(true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRunning(r => !r);
    }
  };

  const reset = () => {
    if (ivRef.current) clearInterval(ivRef.current);
    setRunning(false);
    setRemaining(target);
    setDone(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClose = () => {
    if (ivRef.current) clearInterval(ivRef.current);
    setRunning(false);
    onClose();
  };

  const progress = target > 0 ? remaining / target : 1;
  const dashOffset = RING_C * (1 - progress);
  const ringColor = done ? '#30D158' : accentColor;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={ts.overlay}>
        <View style={[ts.sheet, { backgroundColor: colors.background }]}>
          <View style={[ts.handle, { backgroundColor: colors.border }]} />

          {/* Ring */}
          <View style={ts.ringWrap}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
              <Circle
                cx="110" cy="110" r={RING_R}
                stroke={colors.border}
                strokeWidth={RING_SW}
                fill="none"
              />
              <Circle
                cx="110" cy="110" r={RING_R}
                stroke={ringColor}
                strokeWidth={RING_SW}
                fill="none"
                strokeDasharray={`${RING_C}`}
                strokeDashoffset={`${dashOffset}`}
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
            </Svg>
            <View style={ts.ringCenter}>
              <Text style={[ts.timeText, { color: done ? '#30D158' : colors.foreground }]}>
                {formatTime(remaining)}
              </Text>
              {done && <Text style={[ts.subText, { color: '#30D158' }]}>Set done!</Text>}
              {!done && running && <Text style={[ts.subText, { color: accentColor }]}>Go!</Text>}
              {!done && !running && remaining < target && (
                <Text style={[ts.subText, { color: colors.mutedForeground }]}>Paused</Text>
              )}
              {!done && !running && remaining === target && (
                <Text style={[ts.subText, { color: colors.mutedForeground }]}>Tap ▶ to start</Text>
              )}
            </View>
          </View>

          {/* Preset pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ts.presets}>
            {TIMER_PRESETS.map(p => {
              const sel = p.secs === target;
              return (
                <Pressable
                  key={p.secs}
                  onPress={() => selectPreset(p.secs)}
                  style={({ pressed }) => [
                    ts.preset,
                    { backgroundColor: sel ? accentColor : colors.card, borderColor: sel ? accentColor : colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={[ts.presetText, { color: sel ? '#fff' : colors.foreground }]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Controls */}
          <View style={ts.controls}>
            <TouchableOpacity onPress={reset} style={[ts.sideBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="refresh-outline" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggle} style={[ts.playBtn, { backgroundColor: done ? '#30D158' : accentColor }]}>
              <Ionicons name={running ? 'pause' : done ? 'refresh' : 'play'} size={34} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={[ts.sideBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ts = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, paddingHorizontal: 24, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, marginVertical: 12 },
  ringWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  timeText: { fontSize: 54, fontWeight: '800', letterSpacing: -2 },
  subText: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  presets: { flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingVertical: 8 },
  preset: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  presetText: { fontSize: 14, fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});

// ─── Set Row ─────────────────────────────────────────────────────────────────

interface SetRowProps {
  setIndex: number;
  set: SetLog;
  exercise: Exercise;
  onChange: (updated: SetLog) => void;
  accentColor: string;
  onTimerPress: (secs: number, onComplete?: () => void, autoStart?: boolean) => void;
}

function SetRow({ setIndex, set, exercise, onChange, accentColor, onTimerPress }: SetRowProps) {
  const colors = useColors();
  const isTime = exercise.unit === 'time';
  const isDistance = exercise.unit === 'distance';
  const isBodyweight = exercise.unit === 'bodyweight';

  const toggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...set, completed: !set.completed });
  };

  const handleTimerTap = () => {
    const secs = parseDurationToSecs(exercise.targetDuration);
    // auto-start the timer and auto-check this set when done
    onTimerPress(secs, () => onChange({ ...set, completed: true }), true);
  };

  return (
    <View style={[styles.setRow, set.completed && { opacity: 0.55 }]}>
      <Text style={[styles.setNum, { color: colors.mutedForeground }]}>{setIndex + 1}</Text>

      {isDistance ? (
        /* Distance exercise: weight input + fixed distance badge */
        <>
          <View style={[styles.setInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.setInputText, { color: colors.foreground }]}
              placeholder="lbs"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={set.weight !== null ? String(set.weight) : ''}
              onChangeText={v => onChange({ ...set, weight: v ? parseFloat(v) : null })}
            />
          </View>
          <View style={[styles.setDistLabel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="navigate-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.setDistText, { color: colors.mutedForeground }]}>
              {exercise.targetDuration ?? '–'}
            </Text>
          </View>
        </>
      ) : isTime ? (
        /* Tappable duration pill — tap to launch & auto-start timer */
        <Pressable
          onPress={handleTimerTap}
          disabled={set.completed}
          style={({ pressed }) => [
            styles.setTimerPill,
            {
              backgroundColor: set.completed ? colors.card : accentColor + '18',
              borderColor: set.completed ? colors.border : accentColor + '55',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name={set.completed ? 'checkmark-circle' : 'timer-outline'}
            size={15}
            color={set.completed ? colors.mutedForeground : accentColor}
          />
          <Text style={[styles.setTimerText, { color: set.completed ? colors.mutedForeground : accentColor }]}>
            {exercise.targetDuration ?? 'Tap to start'}
          </Text>
        </Pressable>
      ) : isBodyweight ? (
        <View style={[styles.setInput, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.setInputText, { color: colors.foreground }]}
            placeholder="reps"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            value={set.reps !== null ? String(set.reps) : ''}
            onChangeText={v => onChange({ ...set, reps: v ? parseInt(v) : null })}
          />
        </View>
      ) : (
        <>
          <View style={[styles.setInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.setInputText, { color: colors.foreground }]}
              placeholder="lbs"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={set.weight !== null ? String(set.weight) : ''}
              onChangeText={v => onChange({ ...set, weight: v ? parseFloat(v) : null })}
            />
          </View>
          <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>×</Text>
          <View style={[styles.setInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.setInputText, { color: colors.foreground }]}
              placeholder="reps"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={set.reps !== null ? String(set.reps) : ''}
              onChangeText={v => onChange({ ...set, reps: v ? parseInt(v) : null })}
            />
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={toggleComplete}
        style={[styles.checkBtn, { backgroundColor: set.completed ? accentColor : colors.card, borderColor: set.completed ? accentColor : colors.border }]}
      >
        {set.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  log: ExerciseLog;
  onLogChange: (updated: ExerciseLog) => void;
  accentColor: string;
  onTimerPress: (secs: number, onComplete?: () => void, autoStart?: boolean) => void;
  onShuffle: () => void;
  onToggleWeight: () => void;
}

function ExerciseCard({ exercise, log, onLogChange, accentColor, onTimerPress, onShuffle, onToggleWeight }: ExerciseCardProps) {
  const colors = useColors();
  const completedSets = log.sets.filter(s => s.completed).length;

  const updateSet = (index: number, updated: SetLog) => {
    const newSets = log.sets.map((s, i) => i === index ? updated : s);
    onLogChange({ ...log, sets: newSets });
  };

  const addSet = () => {
    Haptics.selectionAsync();
    onLogChange({ ...log, sets: [...log.sets, { weight: null, reps: null, durationSecs: null, completed: false }] });
  };

  return (
    <View style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.exHeader}>
        <View style={styles.exTitleRow}>
          <Text style={[styles.exName, { color: colors.foreground }]}>{exercise.name}</Text>
          {exercise.muscleGroup && (
            <View style={[styles.muscleTag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.muscleTagText, { color: colors.mutedForeground }]}>{exercise.muscleGroup}</Text>
            </View>
          )}
        </View>
        <View style={styles.exSubRow}>
          <Text style={[styles.exTarget, { color: colors.mutedForeground }]}>
            {exercise.targetSets} sets
            {exercise.targetReps ? ` · ${exercise.targetReps} reps` : ''}
            {exercise.targetDuration ? ` · ${exercise.targetDuration}` : ''}
          </Text>
          <View style={styles.exActions}>
            <TouchableOpacity
              onPress={onShuffle}
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Ionicons name="swap-horizontal-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Swap</Text>
            </TouchableOpacity>
            {exercise.unit === 'bodyweight' && (
              <TouchableOpacity
                onPress={onToggleWeight}
                style={[styles.actionBtn, { backgroundColor: accentColor + '15', borderColor: accentColor + '40' }]}
              >
                <Ionicons name="barbell-outline" size={13} color={accentColor} />
                <Text style={[styles.actionBtnText, { color: accentColor }]}>+ Weight</Text>
              </TouchableOpacity>
            )}
            {exercise.unit !== 'time' && (
              <TouchableOpacity
                onPress={() => onTimerPress(60)}
                style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Ionicons name="timer-outline" size={13} color={colors.mutedForeground} />
                <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Timer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => openExerciseVideo(exercise.name)}
              style={[styles.actionBtn, { backgroundColor: accentColor + '15', borderColor: accentColor + '40' }]}
            >
              <Ionicons name="logo-youtube" size={13} color={accentColor} />
              <Text style={[styles.actionBtnText, { color: accentColor }]}>How to</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.setHeaderRow}>
        <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, width: 24 }]}>SET</Text>
        {exercise.unit === 'time' ? (
          <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>TAP TO START</Text>
        ) : exercise.unit === 'distance' ? (
          <>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>WEIGHT</Text>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>DIST</Text>
          </>
        ) : exercise.unit === 'bodyweight' ? (
          <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>REPS</Text>
        ) : (
          <>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>WEIGHT</Text>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>REPS</Text>
          </>
        )}
        <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, width: 36, textAlign: 'center' }]}>DONE</Text>
      </View>

      {log.sets.map((set, i) => (
        <SetRow
          key={i}
          setIndex={i}
          set={set}
          exercise={exercise}
          onChange={u => updateSet(i, u)}
          accentColor={accentColor}
          onTimerPress={onTimerPress}
        />
      ))}

      <View style={styles.exFooter}>
        <Text style={[styles.exProgress, { color: accentColor }]}>{completedSets}/{log.sets.length} sets done</Text>
        <TouchableOpacity onPress={addSet} style={styles.addSetBtn}>
          <Ionicons name="add" size={16} color={colors.mutedForeground} />
          <Text style={[styles.addSetText, { color: colors.mutedForeground }]}>Add set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Workout Screen ───────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, effectivePlan, workoutPlan, workoutLogs, bodyEntries, saveWorkoutLog, getCurrentWorkoutDayIndex, customExercises, isRestDay } = useAppContext();

  const dayIndex = getCurrentWorkoutDayIndex();
  const restDay = isRestDay();
  const todayWorkout: WorkoutDay | null = effectivePlan[dayIndex] ?? null;
  const today = todayStr();

  const existingLog = useMemo(() =>
    workoutLogs.find(l => l.date === today && l.workoutDayIndex === dayIndex) ?? null,
    [workoutLogs, today, dayIndex]
  );

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() =>
    existingLog ? existingLog.exerciseLogs : (todayWorkout ? initExerciseLogs(todayWorkout, workoutLogs) : [])
  );
  const [localExercises, setLocalExercises] = useState<Exercise[]>(() => todayWorkout?.exercises ?? []);
  const [logId] = useState(() => existingLog?.id ?? makeId());
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerInitSecs, setTimerInitSecs] = useState(60);
  const [timerAutoStart, setTimerAutoStart] = useState(false);
  const [timerOnComplete, setTimerOnComplete] = useState<(() => void) | undefined>(undefined);

  // ── Rest day ad-hoc workout state ──
  const restDayExistingLog = useMemo(() =>
    workoutLogs.find(l => l.date === today && l.workoutDayIndex === -1) ?? null,
    [workoutLogs, today]
  );
  const [restDayExercises, setRestDayExercises] = useState<Exercise[]>(() => restDayExistingLog?.exerciseLogs.map(el => ({
    id: el.exerciseId, name: el.exerciseName, targetSets: el.sets.length, unit: 'weight_reps' as const, muscleGroup: '',
  })) ?? []);
  const [restDayLogs, setRestDayLogs] = useState<ExerciseLog[]>(() => restDayExistingLog?.exerciseLogs ?? []);
  const [restDayLogId] = useState(() => restDayExistingLog?.id ?? makeId());
  const [showRestDayPicker, setShowRestDayPicker] = useState(false);
  const [restDaySearch, setRestDaySearch] = useState('');

  const exerciseKey = todayWorkout?.exercises.map(e => e.id).join(',') ?? '';

  useEffect(() => {
    if (!existingLog && todayWorkout) {
      setExerciseLogs(initExerciseLogs(todayWorkout, workoutLogs));
    } else if (existingLog) {
      setExerciseLogs(existingLog.exerciseLogs);
    }
  }, [exerciseKey]);

  useEffect(() => {
    if (todayWorkout) setLocalExercises(todayWorkout.exercises);
  }, [exerciseKey]);

  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;
  const completedCount = exerciseLogs.reduce((acc, el) => acc + el.sets.filter(s => s.completed).length, 0);
  const totalSets = exerciseLogs.reduce((acc, el) => acc + el.sets.length, 0);
  const isWorkoutDone = existingLog?.completed ?? false;

  const openTimer = useCallback((secs: number, onComplete?: () => void, autoStart = false) => {
    Haptics.selectionAsync();
    setTimerInitSecs(secs);
    setTimerAutoStart(autoStart);
    setTimerOnComplete(() => onComplete);
    setTimerVisible(true);
  }, []);

  const handleToggleWeight = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalExercises(prev =>
      prev.map((ex, i) =>
        i === index
          ? { ...ex, unit: ex.unit === 'bodyweight' ? 'weight_reps' : 'bodyweight' }
          : ex
      )
    );
  }, []);

  const handleShuffleExercise = useCallback((index: number) => {
    if (!profile) return;
    const pool = [...getProgramExercisePool(profile.programType, profile.skillLevel), ...customExercises];
    const inUseIds = new Set(localExercises.map(ex => ex.id));
    const current = localExercises[index];

    // Priority 1: same muscle group
    let candidates = pool.filter(ex =>
      !inUseIds.has(ex.id) && muscleGroupMatches(ex.muscleGroup, current.muscleGroup)
    );
    // Priority 2: same unit type (time / distance / weight_reps)
    if (candidates.length === 0) {
      candidates = pool.filter(ex => !inUseIds.has(ex.id) && ex.unit === current.unit);
    }
    // Priority 3: anything not already in today's workout
    if (candidates.length === 0) {
      candidates = pool.filter(ex => !inUseIds.has(ex.id));
    }
    if (candidates.length === 0) {
      Alert.alert('No alternatives', "You've already used every available exercise for this slot!");
      return;
    }

    const replacement = candidates[Math.floor(Math.random() * candidates.length)];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalExercises(prev => prev.map((ex, i) => i === index ? replacement : ex));
    setExerciseLogs(prev => prev.map((log, i) =>
      i === index
        ? { exerciseId: replacement.id, exerciseName: replacement.name, sets: initSets(replacement, replacement.targetSets, getLastUsedWeight(replacement.id, workoutLogs)) }
        : log
    ));
  }, [profile, localExercises]);

  const handleSave = useCallback(async () => {
    if (!todayWorkout) return;
    const log: WorkoutLog = { id: logId, date: today, workoutDayIndex: dayIndex, exerciseLogs, completed: false };
    await saveWorkoutLog(log);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your progress has been saved.');
  }, [todayWorkout, logId, today, dayIndex, exerciseLogs, saveWorkoutLog]);

  const handleComplete = useCallback(async () => {
    if (!todayWorkout || !profile) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const latestWeight = [...bodyEntries]
      .filter(e => e.weight != null)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight;
    const calories = estimateCalories(
      exerciseLogs,
      profile.programType,
      profile.workoutDuration,
      latestWeight ?? 154,
      profile.gender,
    );
    const log: WorkoutLog = { id: logId, date: today, workoutDayIndex: dayIndex, exerciseLogs, completed: true, caloriesBurned: calories };
    await saveWorkoutLog(log);
    Alert.alert('Workout Complete! 🔥', `Great work! You burned approximately ${calories} calories.`);
  }, [todayWorkout, profile, bodyEntries, logId, today, dayIndex, exerciseLogs, saveWorkoutLog]);

  const handleRestDaySave = useCallback(async () => {
    if (restDayExercises.length === 0) return;
    const log: WorkoutLog = { id: restDayLogId, date: today, workoutDayIndex: -1, exerciseLogs: restDayLogs, completed: false };
    await saveWorkoutLog(log);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your progress has been saved.');
  }, [restDayExercises, restDayLogId, today, restDayLogs, saveWorkoutLog]);

  const handleRestDayComplete = useCallback(async () => {
    if (!profile || restDayExercises.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const latestWeight = [...bodyEntries]
      .filter(e => e.weight != null)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight;
    const calories = estimateCalories(
      restDayLogs,
      profile.programType,
      profile.workoutDuration,
      latestWeight ?? 154,
      profile.gender,
    );
    const log: WorkoutLog = { id: restDayLogId, date: today, workoutDayIndex: -1, exerciseLogs: restDayLogs, completed: true, caloriesBurned: calories };
    await saveWorkoutLog(log);
    Alert.alert('Workout Complete! 🔥', `Great work! You burned approximately ${calories} calories.`);
  }, [profile, bodyEntries, restDayLogId, today, restDayLogs, restDayExercises, saveWorkoutLog]);

  const filteredRestDayLibrary = useMemo(() => {
    if (!restDaySearch.trim()) return EXERCISE_LIBRARY;
    const q = restDaySearch.toLowerCase();
    return EXERCISE_LIBRARY.filter(e =>
      e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q)
    );
  }, [restDaySearch]);

  const filteredRestDayCustom = useMemo(() => {
    if (!restDaySearch.trim()) return customExercises;
    const q = restDaySearch.toLowerCase();
    return customExercises.filter(e => e.name.toLowerCase().includes(q));
  }, [restDaySearch, customExercises]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Set up your program first.</Text>
      </View>
    );
  }

  if (!todayWorkout && restDay) {
    const restDayDone = restDayExistingLog?.completed ?? false;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.workoutHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>REST DAY</Text>
              <Text style={[styles.workoutTitle, { color: colors.foreground }]}>Active Recovery</Text>
            </View>
            <TouchableOpacity
              onPress={() => openTimer(60)}
              style={[styles.headerTimerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="timer-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.headerTimerText, { color: colors.mutedForeground }]}>Rest timer</Text>
            </TouchableOpacity>
          </View>

          {restDayDone && (
            <View style={[styles.doneBanner, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
              <View style={styles.doneBannerLeft}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={[styles.doneBannerText, { color: colors.primary }]}>Session recorded — great work!</Text>
              </View>
            </View>
          )}

          {restDayExercises.length === 0 && (
            <View style={[styles.restDayEmptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="leaf-outline" size={32} color={colors.mutedForeground} style={{ marginBottom: 10 }} />
              <Text style={[styles.restDayEmptyTitle, { color: colors.foreground }]}>Rest day — but you can still move!</Text>
              <Text style={[styles.restDayEmptyText, { color: colors.mutedForeground }]}>Add stretches, yoga, a walk, or any light exercises you want to track today.</Text>
            </View>
          )}

          <View style={styles.exercises}>
            {restDayExercises.map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                log={restDayLogs[i] ?? { exerciseId: exercise.id, exerciseName: exercise.name, sets: initSets(exercise, exercise.targetSets ?? 3) }}
                onLogChange={updated => {
                  const newLogs = [...restDayLogs];
                  newLogs[i] = updated;
                  setRestDayLogs(newLogs);
                }}
                accentColor={colors.primary}
                onTimerPress={openTimer}
                onShuffle={() => {}}
                onToggleWeight={() => {
                  setRestDayExercises(prev => prev.map((ex, idx) =>
                    idx === i ? { ...ex, unit: ex.unit === 'bodyweight' ? 'weight_reps' : 'bodyweight' } : ex
                  ));
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => { setRestDaySearch(''); setShowRestDayPicker(true); }}
            style={[styles.addExBtn, { borderColor: colors.primary }]}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addExBtnText, { color: colors.primary }]}>Add Exercise</Text>
          </TouchableOpacity>

          {restDayExercises.length > 0 && !restDayDone && (
            <View style={styles.btnRow}>
              <TouchableOpacity onPress={handleRestDaySave} style={[styles.saveBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Ionicons name="save-outline" size={18} color={colors.foreground} />
                <Text style={[styles.saveBtnText, { color: colors.foreground }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRestDayComplete} style={[styles.completeBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <TimerModal
          visible={timerVisible}
          onClose={() => setTimerVisible(false)}
          initialSecs={timerInitSecs}
          autoStart={timerAutoStart}
          accentColor={colors.primary}
          onComplete={timerOnComplete}
        />

        <Modal
          visible={showRestDayPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowRestDayPicker(false)}
        >
          <View style={[styles.pickerModal, { backgroundColor: colors.background }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowRestDayPicker(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={[styles.pickerSearchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.pickerSearchInput, { color: colors.foreground }]}
                placeholder="Search exercises..."
                placeholderTextColor={colors.mutedForeground}
                value={restDaySearch}
                onChangeText={setRestDaySearch}
              />
              {restDaySearch.length > 0 && (
                <TouchableOpacity onPress={() => setRestDaySearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredRestDayLibrary}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListHeaderComponent={
                filteredRestDayCustom.length > 0 ? (
                  <View>
                    <Text style={[styles.pickerSectionLabel, { color: colors.mutedForeground }]}>MY EXERCISES</Text>
                    {filteredRestDayCustom.map(ex => (
                      <TouchableOpacity
                        key={ex.id}
                        style={[styles.pickerRow, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          const newEx = ex;
                          const newLog: ExerciseLog = { exerciseId: newEx.id, exerciseName: newEx.name, sets: initSets(newEx, newEx.targetSets ?? 3) };
                          setRestDayExercises(prev => [...prev, newEx]);
                          setRestDayLogs(prev => [...prev, newLog]);
                          setShowRestDayPicker(false);
                        }}
                      >
                        <View style={styles.pickerRowInfo}>
                          <Text style={[styles.pickerRowName, { color: colors.foreground }]}>{ex.name}</Text>
                          <Text style={[styles.pickerRowMeta, { color: colors.mutedForeground }]}>My exercises · {ex.targetSets} sets</Text>
                        </View>
                        <Ionicons name="add" size={22} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                    <Text style={[styles.pickerSectionLabel, { color: colors.mutedForeground }]}>EXERCISE LIBRARY</Text>
                  </View>
                ) : (
                  <Text style={[styles.pickerSectionLabel, { color: colors.mutedForeground }]}>EXERCISE LIBRARY</Text>
                )
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const newEx = libraryExToExercise(item);
                    const newLog: ExerciseLog = { exerciseId: newEx.id, exerciseName: newEx.name, sets: initSets(newEx, newEx.targetSets) };
                    setRestDayExercises(prev => [...prev, newEx]);
                    setRestDayLogs(prev => [...prev, newLog]);
                    setShowRestDayPicker(false);
                  }}
                >
                  <View style={styles.pickerRowInfo}>
                    <Text style={[styles.pickerRowName, { color: colors.foreground }]}>{item.name}</Text>
                    <Text style={[styles.pickerRowMeta, { color: colors.mutedForeground }]}>{item.muscleGroup} · {item.defaultSets} sets{item.defaultReps ? ` · ${item.defaultReps}` : ''}</Text>
                  </View>
                  <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  if (!todayWorkout) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No workout found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.workoutHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dayLabel, { color: accentColor }]}>{todayWorkout.name} — {todayWorkout.focus}</Text>
            <Text style={[styles.workoutTitle, { color: colors.foreground }]}>{todayWorkout.description}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={[styles.progressBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.progressBadgeText, { color: accentColor }]}>{completedCount}/{totalSets}</Text>
              <Text style={[styles.progressBadgeSub, { color: colors.mutedForeground }]}>sets</Text>
            </View>
            <TouchableOpacity
              onPress={() => openTimer(60)}
              style={[styles.headerTimerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="timer-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.headerTimerText, { color: colors.mutedForeground }]}>Rest timer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isWorkoutDone && (
          <View style={[styles.doneBanner, { backgroundColor: accentColor + '20', borderColor: accentColor }]}>
            <View style={styles.doneBannerLeft}>
              <Ionicons name="checkmark-circle" size={18} color={accentColor} />
              <Text style={[styles.doneBannerText, { color: accentColor }]}>Workout completed — great work!</Text>
            </View>
            {existingLog?.caloriesBurned != null && (
              <View style={[styles.calorieBadge, { backgroundColor: accentColor }]}>
                <Ionicons name="flame" size={12} color="#fff" />
                <Text style={styles.calorieBadgeText}>{existingLog.caloriesBurned} cal</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.exercises}>
          {localExercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              log={exerciseLogs[i] ?? { exerciseId: exercise.id, exerciseName: exercise.name, sets: initSets(exercise, exercise.targetSets ?? 3) }}
              onLogChange={updated => {
                const newLogs = [...exerciseLogs];
                newLogs[i] = updated;
                setExerciseLogs(newLogs);
              }}
              accentColor={accentColor}
              onTimerPress={openTimer}
              onShuffle={() => handleShuffleExercise(i)}
              onToggleWeight={() => handleToggleWeight(i)}
            />
          ))}
        </View>

        {!isWorkoutDone && (
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name="save-outline" size={18} color={colors.foreground} />
              <Text style={[styles.saveBtnText, { color: colors.foreground }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleComplete} style={[styles.completeBtn, { backgroundColor: accentColor }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TimerModal
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        initialSecs={timerInitSecs}
        autoStart={timerAutoStart}
        accentColor={accentColor}
        onComplete={timerOnComplete}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },
  scroll: { paddingHorizontal: 16 },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  dayLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  workoutTitle: { fontSize: 20, fontWeight: '700' },
  progressBadge: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  progressBadgeText: { fontSize: 20, fontWeight: '700' },
  progressBadgeSub: { fontSize: 11, fontWeight: '500' },
  headerTimerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  headerTimerText: { fontSize: 12, fontWeight: '600' },
  doneBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  doneBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  doneBannerText: { fontSize: 14, fontWeight: '600', flex: 1 },
  calorieBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  calorieBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  exercises: { gap: 14 },
  exCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  exHeader: { marginBottom: 14 },
  exTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  exSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  exActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  exName: { fontSize: 17, fontWeight: '700' },
  muscleTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  muscleTagText: { fontSize: 11, fontWeight: '600' },
  exTarget: { fontSize: 13, flex: 1 },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 },
  setHeaderLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { width: 24, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  setInput: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, justifyContent: 'center' },
  setInputText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  setLabel: { fontSize: 14, width: 16, textAlign: 'center' },
  setTimerPill: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  setTimerText: { fontSize: 15, fontWeight: '700' },
  setDistLabel: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  setDistText: { fontSize: 13, fontWeight: '600' },
  checkBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  exFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  exProgress: { fontSize: 13, fontWeight: '600' },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addSetText: { fontSize: 13, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  saveBtnText: { fontSize: 15, fontWeight: '600' },
  completeBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  restDayEmptyCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 16 },
  restDayEmptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  restDayEmptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  addExBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 12 },
  addExBtnText: { fontSize: 15, fontWeight: '600' },
  pickerModal: { flex: 1 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 18, fontWeight: '700' },
  pickerSearchRow: { flexDirection: 'row', alignItems: 'center', margin: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 42, gap: 8 },
  pickerSearchInput: { flex: 1, fontSize: 15, height: 42 },
  pickerSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  pickerRowInfo: { flex: 1 },
  pickerRowName: { fontSize: 15, fontWeight: '600' },
  pickerRowMeta: { fontSize: 12, marginTop: 2 },
});
