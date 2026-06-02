import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO } from '@/constants/workouts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtShort(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return (d.getMonth() + 1) + '/' + d.getDate();
}
function getWeekKey(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const sun = new Date(d.setDate(d.getDate() - d.getDay()));
  return sun.toISOString().split('T')[0];
}
function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso + 'T00:00:00').getTime()) / 86400000);
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function MiniBarChart({ data, max, color }: { data: { label: string; value: number }[]; max: number; color: string }) {
  const colors = useColors();
  if (data.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 90 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ flex: 1, width: '100%', backgroundColor: 'rgba(128,128,128,0.15)', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' }}>
            <View style={{ width: '100%', height: max > 0 ? `${(d.value / max) * 100}%` : '0%', backgroundColor: color, borderRadius: 4 }} />
          </View>
          <Text style={{ fontSize: 9, fontWeight: '500', color: colors.mutedForeground }}>{d.label}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.foreground }}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────

function TrendChart({ data, color, unit }: { data: { label: string; value: number }[]; color: string; unit: string }) {
  const colors = useColors();
  const { width: screenW } = useWindowDimensions();
  const W = screenW - 64, H = 90, PL = 42, PR = 8, PT = 12, PB = 24;
  const pw = W - PL - PR, ph = H - PT - PB;
  if (data.length < 2) return null;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const x = (i: number) => PL + (i / (data.length - 1)) * pw;
  const y = (v: number) => PT + ph - ((v - minV) / range) * ph;
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  return (
    <Svg width={W} height={H}>
      <SvgText x={PL - 4} y={PT + 4} fontSize="9" fill={colors.mutedForeground} textAnchor="end">{maxV}{unit}</SvgText>
      <SvgText x={PL - 4} y={PT + ph + 4} fontSize="9" fill={colors.mutedForeground} textAnchor="end">{minV}{unit}</SvgText>
      <Line x1={PL} y1={PT} x2={PL} y2={PT + ph} stroke={colors.border} strokeWidth="1" />
      <Line x1={PL} y1={PT + ph} x2={PL + pw} y2={PT + ph} stroke={colors.border} strokeWidth="1" />
      <Path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <React.Fragment key={i}>
          <Circle cx={x(i)} cy={y(d.value)} r="3" fill={color} />
          {data.length <= 8 && (
            <SvgText x={x(i)} y={H - 4} fontSize="8.5" fill={colors.mutedForeground} textAnchor="middle">{d.label}</SvgText>
          )}
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[s.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[s.tileLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[s.tileValue, { color }]}>{value}</Text>
      {sub && <Text style={[s.tileSub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProgressReportScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, workoutLogs, bodyEntries, workoutPlan } = useAppContext();

  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;
  const programInfo = profile ? PROGRAM_INFO[profile.programType] : null;

  const completedLogs = useMemo(() =>
    [...workoutLogs].filter(l => l.completed).sort((a, b) => a.date.localeCompare(b.date)),
    [workoutLogs]
  );

  // ── Summary stats ──────────────────────────────────────────────────────────

  const totalCalories = useMemo(() =>
    completedLogs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0), [completedLogs]);

  const streak = useMemo(() => {
    if (!completedLogs.length) return 0;
    let count = 1;
    const sorted = [...completedLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i - 1].date + 'T00:00:00').getTime() - new Date(sorted[i].date + 'T00:00:00').getTime()) / 86400000;
      if (diff <= 2) count++; else break;
    }
    return count;
  }, [completedLogs]);

  const avgPerWeek = useMemo(() => {
    if (!completedLogs.length) return 0;
    const weekKeys = new Set(completedLogs.map(l => getWeekKey(l.date)));
    return (completedLogs.length / weekKeys.size).toFixed(1);
  }, [completedLogs]);

  // ── Weekly charts ──────────────────────────────────────────────────────────

  const weeklyWorkouts = useMemo(() => {
    const counts: Record<string, number> = {};
    completedLogs.forEach(l => { const k = getWeekKey(l.date); counts[k] = (counts[k] ?? 0) + 1; });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-8)
      .map(([k, v]) => ({ label: fmtShort(k), value: v }));
  }, [completedLogs]);

  const weeklyCalories = useMemo(() => {
    const cals: Record<string, number> = {};
    completedLogs.forEach(l => { const k = getWeekKey(l.date); cals[k] = (cals[k] ?? 0) + (l.caloriesBurned ?? 0); });
    return Object.entries(cals).sort(([a], [b]) => a.localeCompare(b)).slice(-8)
      .map(([k, v]) => ({ label: fmtShort(k), value: v }));
  }, [completedLogs]);

  const wMax = useMemo(() => Math.max(...weeklyWorkouts.map(d => d.value), 1), [weeklyWorkouts]);
  const cMax = useMemo(() => Math.max(...weeklyCalories.map(d => d.value), 1), [weeklyCalories]);

  // ── Strength progression ───────────────────────────────────────────────────

  const exerciseProgression = useMemo(() => {
    const history: Record<string, { name: string; sessions: { date: string; maxWeight: number }[] }> = {};
    completedLogs.forEach(log => {
      log.exerciseLogs.forEach(el => {
        const weights = el.sets.filter(s => s.completed && s.weight != null).map(s => s.weight!);
        if (!weights.length) return;
        const maxW = Math.max(...weights);
        if (!history[el.exerciseId]) history[el.exerciseId] = { name: el.exerciseName, sessions: [] };
        history[el.exerciseId].sessions.push({ date: log.date, maxWeight: maxW });
      });
    });
    return Object.entries(history)
      .map(([id, { name, sessions }]) => ({
        id, name,
        sessions: sessions.sort((a, b) => a.date.localeCompare(b.date)).slice(-8),
      }))
      .filter(e => e.sessions.length >= 2)
      .sort((a, b) => b.sessions.length - a.sessions.length);
  }, [completedLogs]);

  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  // ── Personal records ───────────────────────────────────────────────────────

  const prs = useMemo(() => {
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
    return Object.values(bests).sort((a, b) => b.weight - a.weight);
  }, [completedLogs]);

  // ── Body composition ───────────────────────────────────────────────────────

  const sortedBody = useMemo(() =>
    [...bodyEntries].sort((a, b) => a.date.localeCompare(b.date)), [bodyEntries]);

  const latestBody = sortedBody[sortedBody.length - 1];

  const bmi = useMemo(() => {
    const h = profile?.heightInches, w = latestBody?.weight;
    if (!h || !w) return null;
    return (703 * w) / (h * h);
  }, [profile, latestBody]);

  const bmiCat = (b: number) => {
    if (b < 18.5) return { label: 'Underweight', color: '#FF9500' };
    if (b < 25)   return { label: 'Normal', color: '#30D158' };
    if (b < 30)   return { label: 'Overweight', color: '#FF9500' };
    return { label: 'Obese', color: '#FF3B30' };
  };

  const bodyCharts = useMemo(() => {
    const fields: { key: 'weight' | 'chest' | 'waist' | 'hips' | 'arms' | 'thighs'; label: string; unit: string }[] = [
      { key: 'weight', label: 'Body Weight', unit: ' lbs' },
      { key: 'chest',  label: 'Chest',        unit: '"' },
      { key: 'waist',  label: 'Waist',        unit: '"' },
      { key: 'hips',   label: 'Hips',         unit: '"' },
      { key: 'arms',   label: 'Arms',         unit: '"' },
      { key: 'thighs', label: 'Thighs',       unit: '"' },
    ];
    return fields
      .map(f => ({
        ...f,
        data: sortedBody
          .filter(e => e[f.key] != null)
          .map(e => ({ label: fmtShort(e.date), value: e[f.key] as number }))
          .slice(-12),
      }))
      .filter(c => c.data.length >= 2);
  }, [sortedBody]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[s.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Progress Report</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Program card */}
      {profile && programInfo && (
        <View style={[s.programCard, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
          <View style={s.programRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.programName, { color: accentColor }]}>{programInfo.label}</Text>
              <Text style={[s.programSub, { color: colors.mutedForeground }]}>
                {profile.skillLevel.charAt(0).toUpperCase() + profile.skillLevel.slice(1)} · {profile.daysPerWeek}×/week · {profile.workoutDuration} min
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.programDays, { color: accentColor }]}>{daysSince(profile.startDate)}</Text>
              <Text style={[s.programDaysSub, { color: colors.mutedForeground }]}>days active</Text>
            </View>
          </View>
          <Text style={[s.programStart, { color: colors.mutedForeground }]}>
            Started {fmtDate(profile.startDate)}
          </Text>
          {(profile.heightInches || profile.gender) && (
            <View style={s.profileTags}>
              {profile.heightInches && (
                <View style={[s.tag, { backgroundColor: accentColor + '25' }]}>
                  <Text style={[s.tagText, { color: accentColor }]}>
                    {Math.floor(profile.heightInches / 12)}'{profile.heightInches % 12}"
                  </Text>
                </View>
              )}
              {profile.gender && (
                <View style={[s.tag, { backgroundColor: accentColor + '25' }]}>
                  <Text style={[s.tagText, { color: accentColor }]}>
                    {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {completedLogs.length === 0 ? (
        <View style={[s.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="document-text-outline" size={44} color={colors.mutedForeground} />
          <Text style={[s.emptyTitle, { color: colors.foreground }]}>No data yet</Text>
          <Text style={[s.emptySub, { color: colors.mutedForeground }]}>Complete workouts to generate your progress report.</Text>
        </View>
      ) : (
        <>
          {/* Summary tiles */}
          <View style={s.tilesRow}>
            <StatTile label="WORKOUTS" value={completedLogs.length} sub="completed" color={accentColor} />
            <StatTile label="STREAK" value={streak} sub="sessions" color={accentColor} />
          </View>
          <View style={s.tilesRow}>
            <StatTile label="CALORIES" value={totalCalories > 0 ? totalCalories.toLocaleString() : '—'} sub="kcal total" color="#FF6B35" />
            <StatTile label="AVG / WEEK" value={avgPerWeek} sub="sessions" color={accentColor} />
          </View>

          {/* Activity charts */}
          <Section title="Workout Activity">
            <Text style={[s.chartLabel, { color: colors.mutedForeground }]}>SESSIONS PER WEEK</Text>
            <MiniBarChart data={weeklyWorkouts} max={wMax} color={accentColor} />
            {weeklyCalories.some(d => d.value > 0) && (
              <>
                <View style={[s.divider, { borderColor: colors.border }]} />
                <Text style={[s.chartLabel, { color: colors.mutedForeground }]}>CALORIES PER WEEK</Text>
                <MiniBarChart data={weeklyCalories.map(d => ({ label: d.label, value: d.value }))} max={cMax} color="#FF6B35" />
              </>
            )}
          </Section>

          {/* Body composition */}
          {(bodyCharts.length > 0 || bmi != null) && (
            <Section title="Body Composition">
              {/* BMI + latest */}
              {latestBody && (
                <View style={[s.bodyLatest, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[s.bodyLatestLabel, { color: colors.mutedForeground }]}>LATEST — {fmtDate(latestBody.date)}</Text>
                  <View style={s.bodyLatestRow}>
                    {latestBody.weight != null && (
                      <View style={s.bodyLatestItem}>
                        <Text style={[s.bodyLatestVal, { color: accentColor }]}>{latestBody.weight}</Text>
                        <Text style={[s.bodyLatestUnit, { color: colors.mutedForeground }]}>lbs</Text>
                      </View>
                    )}
                    {bmi != null && (
                      <View style={s.bodyLatestItem}>
                        <Text style={[s.bodyLatestVal, { color: bmiCat(bmi).color }]}>{bmi.toFixed(1)}</Text>
                        <Text style={[s.bodyLatestUnit, { color: colors.mutedForeground }]}>BMI</Text>
                        <Text style={[s.bodyLatestCat, { color: bmiCat(bmi).color }]}>{bmiCat(bmi).label}</Text>
                      </View>
                    )}
                    {latestBody.waist != null && (
                      <View style={s.bodyLatestItem}>
                        <Text style={[s.bodyLatestVal, { color: accentColor }]}>{latestBody.waist}"</Text>
                        <Text style={[s.bodyLatestUnit, { color: colors.mutedForeground }]}>waist</Text>
                      </View>
                    )}
                    {latestBody.arms != null && (
                      <View style={s.bodyLatestItem}>
                        <Text style={[s.bodyLatestVal, { color: accentColor }]}>{latestBody.arms}"</Text>
                        <Text style={[s.bodyLatestUnit, { color: colors.mutedForeground }]}>arms</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              {/* Trend charts */}
              {bodyCharts.map((c, i) => {
                const delta = c.data[c.data.length - 1].value - c.data[0].value;
                const deltaColor = (c.key === 'weight' || c.key === 'waist' || c.key === 'hips' || c.key === 'thighs')
                  ? (delta <= 0 ? '#30D158' : '#FF6B35')
                  : (delta >= 0 ? accentColor : '#FF6B35');
                return (
                  <View key={c.key} style={[s.chartBlock, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <View style={s.chartHeaderRow}>
                      <Text style={[s.chartSubLabel, { color: colors.mutedForeground }]}>{c.label.toUpperCase()}</Text>
                      <Text style={[s.chartDelta, { color: deltaColor }]}>
                        {(delta >= 0 ? '+' : '') + delta.toFixed(1)}{c.unit}
                      </Text>
                    </View>
                    <TrendChart data={c.data} color={accentColor} unit={c.unit} />
                  </View>
                );
              })}
            </Section>
          )}

          {/* Strength progression */}
          {exerciseProgression.length > 0 && (
            <Section title="Strength Progression">
              {exerciseProgression.map((ex, i) => {
                const first = ex.sessions[0].maxWeight;
                const last = ex.sessions[ex.sessions.length - 1].maxWeight;
                const delta = last - first;
                const expanded = expandedEx === ex.id;
                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => setExpandedEx(expanded ? null : ex.id)}
                    activeOpacity={0.7}
                    style={[s.exRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                  >
                    <View style={s.exRowHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.exName, { color: colors.foreground }]}>{ex.name}</Text>
                        <Text style={[s.exSub, { color: colors.mutedForeground }]}>
                          {ex.sessions.length} sessions · {first} → {last} lbs
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Text style={[s.exDelta, { color: delta >= 0 ? accentColor : '#FF3B30' }]}>
                          {delta >= 0 ? '+' : ''}{delta} lbs
                        </Text>
                        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={colors.mutedForeground} />
                      </View>
                    </View>
                    {expanded && (
                      <View style={{ marginTop: 12 }}>
                        <MiniBarChart
                          data={ex.sessions.map(s => ({ label: fmtShort(s.date), value: s.maxWeight }))}
                          max={Math.max(...ex.sessions.map(s => s.maxWeight))}
                          color={accentColor}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Section>
          )}

          {/* Personal records */}
          {prs.length > 0 && (
            <Section title="Personal Records">
              {prs.map((pr, i) => (
                <View
                  key={i}
                  style={[s.prRow, i < prs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.prName, { color: colors.foreground }]}>{pr.name}</Text>
                    <Text style={[s.prDate, { color: colors.mutedForeground }]}>{fmtDate(pr.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.prWeight, { color: accentColor }]}>{pr.weight} lbs</Text>
                    <Text style={[s.prReps, { color: colors.mutedForeground }]}>× {pr.reps} reps</Text>
                  </View>
                </View>
              ))}
            </Section>
          )}

          {/* Recent workouts */}
          <Section title="Workout History">
            {[...completedLogs].reverse().map((log, i, arr) => {
              const day = workoutPlan[log.workoutDayIndex];
              return (
                <View
                  key={log.id}
                  style={[s.histRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={[s.histDot, { backgroundColor: accentColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.histName, { color: colors.foreground }]}>{day?.focus ?? 'Workout'}</Text>
                    <Text style={[s.histDate, { color: colors.mutedForeground }]}>{fmtDate(log.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[s.histSets, { color: colors.mutedForeground }]}>
                      {log.exerciseLogs.reduce((a, el) => a + el.sets.filter(s => s.completed).length, 0)} sets
                    </Text>
                    {log.caloriesBurned != null && (
                      <Text style={[s.histCal, { color: '#FF6B35' }]}>🔥 {log.caloriesBurned}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Section>
        </>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  programCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  programRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  programName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  programSub: { fontSize: 13 },
  programDays: { fontSize: 28, fontWeight: '800' },
  programDaysSub: { fontSize: 11, fontWeight: '600' },
  programStart: { fontSize: 12, marginBottom: 10 },
  profileTags: { flexDirection: 'row', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '700' },

  tilesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tile: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14 },
  tileLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 4 },
  tileValue: { fontSize: 24, fontWeight: '800', marginBottom: 1 },
  tileSub: { fontSize: 11 },

  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  divider: { borderTopWidth: 1, marginVertical: 14 },
  chartLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  chartBlock: { paddingVertical: 14 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartSubLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  chartDelta: { fontSize: 14, fontWeight: '700' },

  bodyLatest: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14 },
  bodyLatestLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  bodyLatestRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  bodyLatestItem: { alignItems: 'center' },
  bodyLatestVal: { fontSize: 22, fontWeight: '800' },
  bodyLatestUnit: { fontSize: 11, marginTop: 1 },
  bodyLatestCat: { fontSize: 10, fontWeight: '700' },

  exRow: { paddingVertical: 12 },
  exRowHeader: { flexDirection: 'row', alignItems: 'center' },
  exName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  exSub: { fontSize: 12 },
  exDelta: { fontSize: 14, fontWeight: '700' },

  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  prName: { fontSize: 15, fontWeight: '600' },
  prDate: { fontSize: 12, marginTop: 1 },
  prWeight: { fontSize: 16, fontWeight: '700' },
  prReps: { fontSize: 11 },

  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histName: { fontSize: 15, fontWeight: '600' },
  histDate: { fontSize: 12, marginTop: 1 },
  histSets: { fontSize: 12, fontWeight: '500' },
  histCal: { fontSize: 11, fontWeight: '600' },

  empty: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: 'center', gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
