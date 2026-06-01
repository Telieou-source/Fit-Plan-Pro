import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PROGRAM_INFO, WorkoutDay } from "@/constants/workouts";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface PlanDayCardProps {
  day: WorkoutDay;
  index: number;
  isCurrentDay: boolean;
  isCompleted: boolean;
  accentColor: string;
}

function PlanDayCard({ day, index, isCurrentDay, isCompleted, accentColor }: PlanDayCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        planStyles.card,
        {
          backgroundColor: isCurrentDay ? accentColor + "12" : colors.card,
          borderColor: isCurrentDay ? accentColor : colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setExpanded(e => !e);
        }}
        style={planStyles.cardHeader}
      >
        <View style={[planStyles.dayBadge, { backgroundColor: isCompleted ? accentColor : isCurrentDay ? accentColor + "30" : colors.secondary }]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={13} color="#fff" />
          ) : (
            <Text style={[planStyles.dayBadgeText, { color: isCurrentDay ? accentColor : colors.mutedForeground }]}>{index + 1}</Text>
          )}
        </View>
        <View style={planStyles.cardMeta}>
          <View style={planStyles.cardTitleRow}>
            <Text style={[planStyles.cardFocus, { color: colors.foreground }]}>{day.focus}</Text>
            {isCurrentDay && (
              <View style={[planStyles.todayPill, { backgroundColor: accentColor }]}>
                <Text style={planStyles.todayPillText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={[planStyles.cardName, { color: colors.mutedForeground }]}>
            {day.name} · {day.exercises.length} exercises
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>

      {expanded && (
        <View style={[planStyles.exerciseList, { borderTopColor: colors.border }]}>
          <Text style={[planStyles.dayDesc, { color: colors.mutedForeground }]}>{day.description}</Text>
          {day.exercises.map((ex, i) => (
            <View
              key={ex.id}
              style={[
                planStyles.exRow,
                i < day.exercises.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[planStyles.exName, { color: colors.foreground }]}>{ex.name}</Text>
              <Text style={[planStyles.exTarget, { color: colors.mutedForeground }]}>
                {ex.targetSets}×{ex.targetReps ?? ex.targetDuration}
              </Text>
            </View>
          ))}
          {isCurrentDay && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/workout")}
              style={[planStyles.goBtn, { backgroundColor: accentColor }]}
            >
              <Text style={planStyles.goBtnText}>Go to Workout</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const planStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  dayBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  dayBadgeText: { fontSize: 13, fontWeight: "700" },
  cardMeta: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardFocus: { fontSize: 16, fontWeight: "700" },
  todayPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  todayPillText: { fontSize: 9, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  cardName: { fontSize: 12, marginTop: 2 },
  exerciseList: { borderTopWidth: 1, paddingHorizontal: 14, paddingBottom: 14 },
  dayDesc: { fontSize: 13, lineHeight: 18, paddingVertical: 10 },
  exRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  exName: { fontSize: 14, fontWeight: "500", flex: 1 },
  exTarget: { fontSize: 13, fontWeight: "500" },
  goBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 10, marginTop: 10 },
  goBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    workoutPlan,
    workoutLogs,
    bodyEntries,
    getCurrentWorkoutDayIndex,
  } = useAppContext();

  const dayIndex = getCurrentWorkoutDayIndex();
  const todayWorkout = workoutPlan[dayIndex] ?? null;
  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;

  const completedLogs = useMemo(
    () => workoutLogs.filter((l) => l.completed),
    [workoutLogs]
  );

  const todayLog = useMemo(
    () =>
      workoutLogs.find(
        (l) => l.date === todayStr() && l.workoutDayIndex === dayIndex
      ) ?? null,
    [workoutLogs, dayIndex]
  );

  const streak = useMemo(() => {
    if (completedLogs.length === 0) return 0;
    let count = 1;
    const sorted = [...completedLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date + "T00:00:00");
      const curr = new Date(sorted[i].date + "T00:00:00");
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 2) count++;
      else break;
    }
    return count;
  }, [completedLogs]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No program selected.</Text>
      </View>
    );
  }

  const programInfo = PROGRAM_INFO[profile.programType];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greet()}</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>FitTrack</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings" as any)}
          style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="settings-outline" size={19} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Program badge */}
      <View style={[styles.programBadge, { backgroundColor: programInfo.color + "18", borderColor: programInfo.color + "40" }]}>
        <Ionicons
          name={
            profile.programType === "muscle_building"
              ? "barbell-outline"
              : profile.programType === "crossfit"
              ? "flame-outline"
              : "pulse-outline"
          }
          size={16}
          color={programInfo.color}
        />
        <Text style={[styles.programBadgeText, { color: programInfo.color }]}>
          {programInfo.label} · {profile.daysPerWeek} days/week
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "WORKOUTS", value: completedLogs.length, icon: "checkmark-circle-outline" },
          { label: "STREAK", value: streak, icon: "flame-outline" },
          { label: "DAY", value: `${dayIndex + 1}/${profile.daysPerWeek}`, icon: "calendar-outline" },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={stat.icon as any} size={18} color={accentColor} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's workout card */}
      {todayWorkout && (
        <Pressable
          onPress={() => router.push("/(tabs)/workout")}
          style={({ pressed }) => [
            styles.workoutCard,
            { backgroundColor: accentColor, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <View style={styles.workoutCardTop}>
            <View>
              <Text style={styles.workoutCardLabel}>
                {todayLog?.completed ? "COMPLETED" : "TODAY'S WORKOUT"}
              </Text>
              <Text style={styles.workoutCardTitle}>{todayWorkout.focus}</Text>
              <Text style={styles.workoutCardSub}>{todayWorkout.name}</Text>
            </View>
            <View>
              {todayLog?.completed ? (
                <Ionicons name="checkmark-circle" size={44} color="rgba(255,255,255,0.9)" />
              ) : (
                <Ionicons name="play-circle" size={44} color="rgba(255,255,255,0.9)" />
              )}
            </View>
          </View>
          <Text style={styles.workoutCardDesc} numberOfLines={2}>{todayWorkout.description}</Text>
          <View style={styles.workoutCardMeta}>
            <Ionicons name="barbell-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.workoutCardMetaText}>{todayWorkout.exercises.length} exercises</Text>
          </View>
        </Pressable>
      )}

      {/* Full plan preview */}
      <Text style={[styles.sectionHeader, { color: colors.foreground }]}>Your Full Plan</Text>
      <View style={styles.planList}>
        {workoutPlan.map((day, i) => {
          const isCompleted = completedLogs.some(l => l.workoutDayIndex === i);
          return (
            <PlanDayCard
              key={day.id}
              day={day}
              index={i}
              isCurrentDay={i === dayIndex}
              isCompleted={isCompleted}
              accentColor={accentColor}
            />
          );
        })}
      </View>

      {/* Latest body stats */}
      {bodyEntries[0] && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Latest Body Stats</Text>
          <View style={styles.bodyRow}>
            {bodyEntries[0].weight != null && (
              <View style={styles.bodyItem}>
                <Text style={[styles.bodyVal, { color: accentColor }]}>{bodyEntries[0].weight}</Text>
                <Text style={[styles.bodyLabel, { color: colors.mutedForeground }]}>lbs</Text>
              </View>
            )}
            {bodyEntries[0].waist != null && (
              <View style={styles.bodyItem}>
                <Text style={[styles.bodyVal, { color: accentColor }]}>{bodyEntries[0].waist}"</Text>
                <Text style={[styles.bodyLabel, { color: colors.mutedForeground }]}>waist</Text>
              </View>
            )}
            {bodyEntries[0].arms != null && (
              <View style={styles.bodyItem}>
                <Text style={[styles.bodyVal, { color: accentColor }]}>{bodyEntries[0].arms}"</Text>
                <Text style={[styles.bodyLabel, { color: colors.mutedForeground }]}>arms</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 14, fontWeight: "500", marginBottom: 2 },
  appName: { fontSize: 30, fontWeight: "800" },
  settingsBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  programBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: "flex-start", marginBottom: 18 },
  programBadgeText: { fontSize: 13, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  workoutCard: { borderRadius: 20, padding: 20, marginBottom: 20, gap: 10 },
  workoutCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  workoutCardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, color: "rgba(255,255,255,0.75)", marginBottom: 4 },
  workoutCardTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  workoutCardSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  workoutCardDesc: { fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20 },
  workoutCardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  workoutCardMetaText: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  sectionHeader: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  planList: { gap: 10, marginBottom: 20 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  bodyRow: { flexDirection: "row", gap: 24 },
  bodyItem: { alignItems: "center" },
  bodyVal: { fontSize: 24, fontWeight: "800" },
  bodyLabel: { fontSize: 12, marginTop: 2 },
});
