import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO } from '@/constants/workouts';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekKey(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sun = new Date(d.setDate(diff));
  return sun.toISOString().split('T')[0];
}

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  max: number;
  color: string;
}

function MiniBarChart({ data, max, color }: MiniBarChartProps) {
  const colors = useColors();
  if (data.length === 0) return null;
  return (
    <View style={chartStyles.container}>
      {data.map((d, i) => (
        <View key={i} style={chartStyles.barCol}>
          <View style={chartStyles.barTrack}>
            <View
              style={[
                chartStyles.barFill,
                {
                  height: max > 0 ? `${(d.value / max) * 100}%` : '0%',
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={[chartStyles.barLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
          <Text style={[chartStyles.barValue, { color: colors.foreground }]}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', backgroundColor: 'rgba(128,128,128,0.15)', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, fontWeight: '500' },
  barValue: { fontSize: 11, fontWeight: '700' },
});

interface StatCardProps { label: string; value: string | number; sub?: string; color: string }
function StatCard({ label, value, sub, color }: StatCardProps) {
  const colors = useColors();
  return (
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      {sub && <Text style={[statStyles.sub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  value: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  sub: { fontSize: 11 },
});

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, workoutLogs, workoutPlan } = useAppContext();

  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;

  const completedLogs = useMemo(() =>
    [...workoutLogs].filter(l => l.completed).sort((a, b) => a.date.localeCompare(b.date)),
    [workoutLogs]
  );

  const totalCalories = useMemo(() =>
    completedLogs.reduce((sum, l) => sum + (l.caloriesBurned ?? 0), 0),
    [completedLogs]
  );

  const weeklyData = useMemo(() => {
    const counts: Record<string, number> = {};
    completedLogs.forEach(l => {
      const key = getWeekKey(l.date);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const weeks = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
    return weeks.map(([key, val]) => {
      const d = new Date(key + 'T00:00:00');
      const label = (d.getMonth() + 1) + '/' + d.getDate();
      return { label, value: val };
    });
  }, [completedLogs]);

  const weeklyCalories = useMemo(() => {
    const cals: Record<string, number> = {};
    completedLogs.forEach(l => {
      const key = getWeekKey(l.date);
      cals[key] = (cals[key] ?? 0) + (l.caloriesBurned ?? 0);
    });
    const weeks = Object.entries(cals).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
    return weeks.map(([key, val]) => {
      const d = new Date(key + 'T00:00:00');
      const label = (d.getMonth() + 1) + '/' + d.getDate();
      return { label, value: val };
    });
  }, [completedLogs]);

  const weeklyCalMax = useMemo(() => Math.max(...weeklyCalories.map(d => d.value), 1), [weeklyCalories]);

  const weekMax = useMemo(() => Math.max(...weeklyData.map(d => d.value), profile?.daysPerWeek ?? 1), [weeklyData, profile]);

  const streak = useMemo(() => {
    if (completedLogs.length === 0) return 0;
    let count = 1;
    const sorted = [...completedLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date + 'T00:00:00');
      const curr = new Date(sorted[i].date + 'T00:00:00');
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 2) count++;
      else break;
    }
    return count;
  }, [completedLogs]);

  const exercisePRs = useMemo(() => {
    const bests: Record<string, { name: string; weight: number; reps: number; date: string }> = {};
    completedLogs.forEach(log => {
      log.exerciseLogs.forEach(el => {
        el.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            const vol = set.weight * set.reps;
            if (!bests[el.exerciseId] || vol > bests[el.exerciseId].weight * bests[el.exerciseId].reps) {
              bests[el.exerciseId] = { name: el.exerciseName, weight: set.weight, reps: set.reps, date: log.date };
            }
          }
        });
      });
    });
    return Object.values(bests).slice(0, 8);
  }, [completedLogs]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Progress</Text>

      {completedLogs.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="trophy-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workouts yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Complete your first workout to start tracking progress.</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard label="WORKOUTS" value={completedLogs.length} sub="completed" color={accentColor} />
            <StatCard label="STREAK" value={streak} sub="workouts" color={accentColor} />
          </View>
          {totalCalories > 0 && (
            <View style={styles.statsRow}>
              <StatCard label="TOTAL CALORIES" value={totalCalories.toLocaleString()} sub="kcal burned" color="#FF6B35" />
              <StatCard label="AVG / SESSION" value={Math.round(totalCalories / completedLogs.length).toLocaleString()} sub="kcal" color="#FF6B35" />
            </View>
          )}

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Workouts per Week</Text>
            {weeklyData.length > 0 ? (
              <MiniBarChart data={weeklyData} max={weekMax} color={accentColor} />
            ) : (
              <Text style={[styles.noData, { color: colors.mutedForeground }]}>No data yet</Text>
            )}
          </View>

          {weeklyCalories.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Calories per Week</Text>
              <MiniBarChart data={weeklyCalories} max={weeklyCalMax} color="#FF6B35" />
            </View>
          )}

          {exercisePRs.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal Records</Text>
              {exercisePRs.map((pr, i) => (
                <View key={i} style={[styles.prRow, i < exercisePRs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={styles.prLeft}>
                    <Text style={[styles.prName, { color: colors.foreground }]}>{pr.name}</Text>
                    <Text style={[styles.prDate, { color: colors.mutedForeground }]}>{formatDate(pr.date)}</Text>
                  </View>
                  <View style={styles.prRight}>
                    <Text style={[styles.prValue, { color: accentColor }]}>{pr.weight} lbs</Text>
                    <Text style={[styles.prReps, { color: colors.mutedForeground }]}>× {pr.reps}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Workouts</Text>
            {[...completedLogs].reverse().slice(0, 10).map((log, i, arr) => {
              const day = workoutPlan[log.workoutDayIndex];
              return (
                <View key={log.id} style={[styles.logRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[styles.logDot, { backgroundColor: accentColor }]} />
                  <View style={styles.logInfo}>
                    <Text style={[styles.logName, { color: colors.foreground }]}>{day?.focus ?? 'Workout'}</Text>
                    <Text style={[styles.logDate, { color: colors.mutedForeground }]}>{formatDate(log.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[styles.logSets, { color: colors.mutedForeground }]}>
                      {log.exerciseLogs.reduce((a, el) => a + el.sets.filter(s => s.completed).length, 0)} sets
                    </Text>
                    {log.caloriesBurned != null && (
                      <Text style={[styles.logCal, { color: '#FF6B35' }]}>🔥 {log.caloriesBurned} cal</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  screenTitle: { fontSize: 30, fontWeight: '800', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  noData: { fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  emptyState: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  prRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  prLeft: {},
  prName: { fontSize: 15, fontWeight: '600' },
  prDate: { fontSize: 12, marginTop: 2 },
  prRight: { alignItems: 'flex-end' },
  prValue: { fontSize: 17, fontWeight: '700' },
  prReps: { fontSize: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logInfo: { flex: 1 },
  logName: { fontSize: 15, fontWeight: '600' },
  logDate: { fontSize: 12, marginTop: 2 },
  logSets: { fontSize: 13, fontWeight: '500' },
  logCal: { fontSize: 11, fontWeight: '600' },
});
