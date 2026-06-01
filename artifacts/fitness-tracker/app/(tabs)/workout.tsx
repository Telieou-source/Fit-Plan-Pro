import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, WorkoutLog, ExerciseLog, SetLog } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { Exercise, WorkoutDay } from '@/constants/workouts';
import { PROGRAM_INFO } from '@/constants/workouts';

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function initSets(exercise: Exercise, count: number): SetLog[] {
  return Array.from({ length: count }, () => ({
    weight: null,
    reps: null,
    durationSecs: null,
    completed: false,
  }));
}

function initExerciseLogs(workout: WorkoutDay): ExerciseLog[] {
  return workout.exercises.map(ex => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    sets: initSets(ex, ex.targetSets),
  }));
}

interface SetRowProps {
  setIndex: number;
  set: SetLog;
  exercise: Exercise;
  onChange: (updated: SetLog) => void;
  accentColor: string;
}

function SetRow({ setIndex, set, exercise, onChange, accentColor }: SetRowProps) {
  const colors = useColors();
  const isTime = exercise.unit === 'time';

  const toggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...set, completed: !set.completed });
  };

  return (
    <View style={[styles.setRow, set.completed && { opacity: 0.6 }]}>
      <Text style={[styles.setNum, { color: colors.mutedForeground }]}>{setIndex + 1}</Text>

      {isTime ? (
        <>
          <View style={[styles.setInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.setInputText, { color: colors.foreground }]}
              placeholder="min"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={set.durationSecs ? String(Math.floor(set.durationSecs / 60)) : ''}
              onChangeText={v => onChange({ ...set, durationSecs: v ? parseInt(v) * 60 : null })}
            />
          </View>
          <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>min</Text>
        </>
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

      <TouchableOpacity onPress={toggleComplete} style={[styles.checkBtn, { backgroundColor: set.completed ? accentColor : colors.card, borderColor: set.completed ? accentColor : colors.border }]}>
        {set.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  log: ExerciseLog;
  onLogChange: (updated: ExerciseLog) => void;
  accentColor: string;
}

function ExerciseCard({ exercise, log, onLogChange, accentColor }: ExerciseCardProps) {
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
        <Text style={[styles.exTarget, { color: colors.mutedForeground }]}>
          {exercise.targetSets} sets
          {exercise.targetReps ? ` · ${exercise.targetReps} reps` : ''}
          {exercise.targetDuration ? ` · ${exercise.targetDuration}` : ''}
        </Text>
      </View>

      <View style={styles.setHeaderRow}>
        <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, width: 24 }]}>SET</Text>
        {exercise.unit === 'time' ? (
          <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>DURATION</Text>
        ) : (
          <>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>WEIGHT</Text>
            <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, flex: 1 }]}>REPS</Text>
          </>
        )}
        <Text style={[styles.setHeaderLabel, { color: colors.mutedForeground, width: 36, textAlign: 'center' }]}>DONE</Text>
      </View>

      {log.sets.map((set, i) => (
        <SetRow key={i} setIndex={i} set={set} exercise={exercise} onChange={u => updateSet(i, u)} accentColor={accentColor} />
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

export default function WorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, workoutPlan, workoutLogs, saveWorkoutLog, getCurrentWorkoutDayIndex } = useAppContext();

  const dayIndex = getCurrentWorkoutDayIndex();
  const todayWorkout: WorkoutDay | null = workoutPlan[dayIndex] ?? null;
  const today = todayStr();

  const existingLog = useMemo(() =>
    workoutLogs.find(l => l.date === today && l.workoutDayIndex === dayIndex) ?? null,
    [workoutLogs, today, dayIndex]
  );

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() =>
    existingLog ? existingLog.exerciseLogs : (todayWorkout ? initExerciseLogs(todayWorkout) : [])
  );
  const [logId] = useState(() => existingLog?.id ?? makeId());

  useEffect(() => {
    if (!existingLog && todayWorkout) {
      setExerciseLogs(initExerciseLogs(todayWorkout));
    } else if (existingLog) {
      setExerciseLogs(existingLog.exerciseLogs);
    }
  }, [todayWorkout?.id]);

  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;
  const completedCount = exerciseLogs.reduce((acc, el) => acc + el.sets.filter(s => s.completed).length, 0);
  const totalSets = exerciseLogs.reduce((acc, el) => acc + el.sets.length, 0);
  const isWorkoutDone = existingLog?.completed ?? false;

  const handleSave = useCallback(async () => {
    if (!todayWorkout) return;
    const log: WorkoutLog = { id: logId, date: today, workoutDayIndex: dayIndex, exerciseLogs, completed: false };
    await saveWorkoutLog(log);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your progress has been saved.');
  }, [todayWorkout, logId, today, dayIndex, exerciseLogs, saveWorkoutLog]);

  const handleComplete = useCallback(async () => {
    if (!todayWorkout) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const log: WorkoutLog = { id: logId, date: today, workoutDayIndex: dayIndex, exerciseLogs, completed: true };
    await saveWorkoutLog(log);
    Alert.alert('Workout Complete!', 'Great work. Rest up and come back tomorrow.');
  }, [todayWorkout, logId, today, dayIndex, exerciseLogs, saveWorkoutLog]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Set up your program first.</Text>
      </View>
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
          <View>
            <Text style={[styles.dayLabel, { color: accentColor }]}>{todayWorkout.name} — {todayWorkout.focus}</Text>
            <Text style={[styles.workoutTitle, { color: colors.foreground }]}>{todayWorkout.description}</Text>
          </View>
          <View style={[styles.progressBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.progressBadgeText, { color: accentColor }]}>{completedCount}/{totalSets}</Text>
            <Text style={[styles.progressBadgeSub, { color: colors.mutedForeground }]}>sets</Text>
          </View>
        </View>

        {isWorkoutDone && (
          <View style={[styles.doneBanner, { backgroundColor: accentColor + '20', borderColor: accentColor }]}>
            <Ionicons name="checkmark-circle" size={18} color={accentColor} />
            <Text style={[styles.doneBannerText, { color: accentColor }]}>Workout completed — great work!</Text>
          </View>
        )}

        <View style={styles.exercises}>
          {todayWorkout.exercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              log={exerciseLogs[i] ?? { exerciseId: exercise.id, exerciseName: exercise.name, sets: [] }}
              onLogChange={updated => {
                const newLogs = exerciseLogs.map((l, li) => li === i ? updated : l);
                setExerciseLogs(newLogs);
              }}
              accentColor={accentColor}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },
  scroll: { paddingHorizontal: 16 },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  dayLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  workoutTitle: { fontSize: 20, fontWeight: '700', flex: 1, maxWidth: '80%' },
  progressBadge: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  progressBadgeText: { fontSize: 20, fontWeight: '700' },
  progressBadgeSub: { fontSize: 11, fontWeight: '500' },
  doneBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  doneBannerText: { fontSize: 14, fontWeight: '600' },
  exercises: { gap: 14 },
  exCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  exHeader: { marginBottom: 14 },
  exTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  exName: { fontSize: 17, fontWeight: '700' },
  muscleTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  muscleTagText: { fontSize: 11, fontWeight: '600' },
  exTarget: { fontSize: 13 },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 },
  setHeaderLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { width: 24, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  setInput: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, justifyContent: 'center' },
  setInputText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  setLabel: { fontSize: 14, width: 16, textAlign: 'center' },
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
});
