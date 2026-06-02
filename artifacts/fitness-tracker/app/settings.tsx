import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO, SKILL_INFO, DAYS_OF_WEEK, SkillLevel } from '@/constants/workouts';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, workoutLogs, bodyEntries, resetProfile, setProfile, customWorkoutPlan, resetWorkoutPlan } = useAppContext();

  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [draftDays, setDraftDays] = useState<Set<number>>(new Set(profile?.preferredDays ?? []));

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const toggleDay = (dow: number) => {
    Haptics.selectionAsync();
    setDraftDays(prev => {
      const next = new Set(prev);
      if (next.has(dow)) {
        if (next.size > 1) next.delete(dow);
      } else {
        next.add(dow);
      }
      return next;
    });
  };

  const handleSaveSchedule = async () => {
    if (!profile) return;
    const sorted = Array.from(draftDays).sort((a, b) => a - b);
    await setProfile({ ...profile, preferredDays: sorted, daysPerWeek: sorted.length });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSchedulePicker(false);
  };

  const handleSaveSkill = async (skill: SkillLevel) => {
    if (!profile) return;
    await setProfile({ ...profile, skillLevel: skill });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSkillPicker(false);
  };

  const handleSaveDuration = async (mins: number) => {
    if (!profile) return;
    await setProfile({ ...profile, workoutDuration: mins });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDurationPicker(false);
  };

  const handleChangeProgram = () => {
    Alert.alert(
      'Change Program',
      'This will clear your workout logs and custom plan. Body measurements are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change Program',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetProfile();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleResetPlan = () => {
    Alert.alert(
      'Reset Custom Plan',
      'Restore all workout days to their original exercises?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetWorkoutPlan();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const programInfo = profile ? PROGRAM_INFO[profile.programType] : null;
  const scheduleSummary = profile?.preferredDays?.length
    ? profile.preferredDays.map(d => DAYS_OF_WEEK[d]).join(', ')
    : `${profile?.daysPerWeek ?? '?'} days/week`;
  const currentDuration = profile?.workoutDuration ?? 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {profile && programInfo && (
          <>
            {/* Program */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROGRAM</Text>
              <View style={styles.programRow}>
                <View style={[styles.programDot, { backgroundColor: programInfo.color }]} />
                <View style={styles.programInfo}>
                  <Text style={[styles.programName, { color: colors.foreground }]}>{programInfo.label}</Text>
                  <Text style={[styles.programMeta, { color: colors.mutedForeground }]}>
                    {workoutLogs.filter(l => l.completed).length} workouts completed
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleChangeProgram}
                style={[styles.actionRow, { borderTopColor: colors.border }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="refresh-outline" size={20} color={colors.foreground} />
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>Change Program</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Skill Level */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FITNESS LEVEL</Text>
              <View style={styles.scheduleRow}>
                <Ionicons name={SKILL_INFO[profile.skillLevel ?? 'intermediate'].icon as any} size={18} color={programInfo.color} />
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleDays, { color: colors.foreground }]}>{SKILL_INFO[profile.skillLevel ?? 'intermediate'].label}</Text>
                  <Text style={[styles.scheduleSub, { color: colors.mutedForeground }]}>{SKILL_INFO[profile.skillLevel ?? 'intermediate'].subtitle}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSkillPicker(true)}
                style={[styles.actionRow, { borderTopColor: colors.border }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="trending-up-outline" size={20} color={colors.foreground} />
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>Change Fitness Level</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Session Duration */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SESSION DURATION</Text>
              <View style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={18} color={programInfo.color} />
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleDays, { color: colors.foreground }]}>{currentDuration} minutes</Text>
                  <Text style={[styles.scheduleSub, { color: colors.mutedForeground }]}>Exercises scale to fit your time</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowDurationPicker(true)}
                style={[styles.actionRow, { borderTopColor: colors.border }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="stopwatch-outline" size={20} color={colors.foreground} />
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>Change Duration</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Schedule */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SCHEDULE</Text>
              <View style={styles.scheduleRow}>
                <Ionicons name="calendar-outline" size={18} color={programInfo.color} />
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleDays, { color: colors.foreground }]}>{scheduleSummary}</Text>
                  <Text style={[styles.scheduleSub, { color: colors.mutedForeground }]}>{profile.daysPerWeek} training days per week</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => { setDraftDays(new Set(profile.preferredDays ?? [])); setShowSchedulePicker(true); }}
                style={[styles.actionRow, { borderTopColor: colors.border }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="calendar-outline" size={20} color={colors.foreground} />
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>Change Training Days</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Custom plan */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>WORKOUT PLAN</Text>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.foreground }]}>Custom exercises</Text>
                <Text style={[styles.statValue, { color: colors.mutedForeground }]}>{customWorkoutPlan ? 'Yes' : 'Using defaults'}</Text>
              </View>
              {customWorkoutPlan && (
                <TouchableOpacity
                  onPress={handleResetPlan}
                  style={[styles.actionRow, { borderTopColor: colors.border }]}
                >
                  <View style={styles.actionLeft}>
                    <Ionicons name="arrow-undo-outline" size={20} color={colors.foreground} />
                    <Text style={[styles.actionLabel, { color: colors.foreground }]}>Reset Plan to Defaults</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>STATS</Text>
          {[
            { label: 'Workouts completed', value: workoutLogs.filter(l => l.completed).length },
            { label: 'Body entries', value: bodyEntries.length },
          ].map((item, i, arr) => (
            <View key={item.label} style={[styles.statRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.statValue, { color: colors.mutedForeground }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Clear All Data', 'Permanently delete all logs, measurements, and your program?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Everything', style: 'destructive', onPress: async () => { await resetProfile(); router.replace('/onboarding'); } },
              ]);
            }}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>Clear All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Skill Level Picker Modal */}
      <Modal visible={showSkillPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSkillPicker(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowSkillPicker(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Fitness Level</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={[styles.modalBody, { gap: 12 }]}>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Changing this reshapes your workout complexity and WOD rotation immediately.
            </Text>
            {(['novice', 'intermediate', 'advanced'] as const).map(skill => {
              const info = SKILL_INFO[skill];
              const isCurrent = profile?.skillLevel === skill;
              const color = programInfo?.color ?? colors.primary;
              return (
                <Pressable
                  key={skill}
                  onPress={() => handleSaveSkill(skill)}
                  style={({ pressed }) => [
                    styles.skillCard,
                    { backgroundColor: isCurrent ? color : colors.card, borderColor: isCurrent ? color : colors.border, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Ionicons name={info.icon as any} size={22} color={isCurrent ? '#fff' : color} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.skillLabel, { color: isCurrent ? '#fff' : colors.foreground }]}>{info.label}</Text>
                    <Text style={[styles.skillSub, { color: isCurrent ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]} numberOfLines={2}>{info.description}</Text>
                  </View>
                  {isCurrent && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Duration Picker Modal */}
      <Modal visible={showDurationPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDurationPicker(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Session Duration</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Exercises per session scale up or down to fill your time. Fewer training days also means more exercises per session.
            </Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map(mins => {
                const isCurrent = currentDuration === mins;
                const color = programInfo?.color ?? colors.primary;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => handleSaveDuration(mins)}
                    style={({ pressed }) => [
                      styles.durationBtn,
                      { backgroundColor: isCurrent ? color : colors.card, borderColor: isCurrent ? color : colors.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.durationNum, { color: isCurrent ? '#fff' : colors.foreground }]}>{mins}</Text>
                    <Text style={[styles.durationUnit, { color: isCurrent ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>min</Text>
                    {isCurrent && (
                      <View style={styles.durationCheck}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Picker Modal */}
      <Modal visible={showSchedulePicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSchedulePicker(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowSchedulePicker(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Training Days</Text>
            <TouchableOpacity onPress={handleSaveSchedule}>
              <Text style={[styles.modalSave, { color: programInfo?.color ?? colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Select which days of the week you train. Tap any day to toggle.
            </Text>
            <View style={styles.daysGrid}>
              {DAY_ORDER.map(dow => {
                const isOn = draftDays.has(dow);
                const color = programInfo?.color ?? colors.primary;
                return (
                  <Pressable
                    key={dow}
                    onPress={() => toggleDay(dow)}
                    style={({ pressed }) => [
                      styles.dayBtn,
                      { backgroundColor: isOn ? color : colors.card, borderColor: isOn ? color : colors.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: isOn ? '#fff' : colors.foreground }]}>{DAYS_OF_WEEK[dow]}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={18} color={programInfo?.color ?? colors.primary} />
              <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
                <Text style={{ color: programInfo?.color ?? colors.primary, fontWeight: '700' }}>{draftDays.size} days/week</Text>
                {' '}— {Array.from(draftDays).sort().map(d => DAYS_OF_WEEK[d]).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  programRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  programDot: { width: 10, height: 10, borderRadius: 5 },
  programInfo: { flex: 1 },
  programName: { fontSize: 17, fontWeight: '700' },
  programMeta: { fontSize: 13, marginTop: 2 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  scheduleInfo: { flex: 1 },
  scheduleDays: { fontSize: 15, fontWeight: '600' },
  scheduleSub: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 10, borderTopWidth: 1 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionLabel: { fontSize: 16, fontWeight: '500' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  statLabel: { fontSize: 15, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: '600' },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalCancel: { fontSize: 16 },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { padding: 24 },
  modalSub: { fontSize: 15, lineHeight: 21, marginBottom: 24 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  dayBtn: { width: '13%', minWidth: 44, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, fontWeight: '700' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  summaryText: { flex: 1, fontSize: 14, lineHeight: 20 },
  skillCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  skillLabel: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  skillSub: { fontSize: 12, lineHeight: 17 },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationBtn: { width: '22%', minWidth: 72, paddingVertical: 18, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  durationNum: { fontSize: 20, fontWeight: '800' },
  durationUnit: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  durationCheck: { position: 'absolute', top: 5, right: 5 },
});
