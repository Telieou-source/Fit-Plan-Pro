import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext, ProgramType, SkillLevel } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO, SKILL_INFO, DAYS_OF_WEEK } from '@/constants/workouts';

const PROGRAMS: { type: ProgramType; icon: string }[] = [
  { type: 'muscle_building', icon: 'barbell-outline' },
  { type: 'crossfit', icon: 'flame-outline' },
  { type: 'aerobics', icon: 'pulse-outline' },
];

const SKILLS: SkillLevel[] = ['novice', 'intermediate', 'advanced'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setProfile } = useAppContext();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([1, 3, 5]));
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const accentColor = selectedProgram ? PROGRAM_INFO[selectedProgram].color : colors.primary;

  const toggleDay = (dow: number) => {
    Haptics.selectionAsync();
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(dow)) { if (next.size > 1) next.delete(dow); }
      else next.add(dow);
      return next;
    });
  };

  const handleFinish = async () => {
    if (!selectedProgram || !selectedSkill) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);
    await setProfile({
      programType: selectedProgram,
      skillLevel: selectedSkill,
      daysPerWeek: selectedDays.size,
      preferredDays: sortedDays,
      workoutDuration: selectedDuration,
      startDate: new Date().toISOString(),
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map(s => (
            <View
              key={s}
              style={[
                styles.stepDot,
                { backgroundColor: s <= step ? accentColor : colors.muted },
                s === step && { width: 24 },
              ]}
            />
          ))}
        </View>

        {/* ── Step 1: Program ── */}
        {step === 1 && (
          <>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 1 OF 4</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Choose your{'\n'}program</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              We'll build your workout plan around this.
            </Text>
            <View style={styles.list}>
              {PROGRAMS.map(({ type, icon }) => {
                const info = PROGRAM_INFO[type];
                const isSelected = selectedProgram === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => { Haptics.selectionAsync(); setSelectedProgram(type); }}
                    style={({ pressed }) => [
                      styles.card,
                      { backgroundColor: isSelected ? info.color : colors.card, borderColor: isSelected ? info.color : colors.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.secondary }]}>
                      <Ionicons name={icon as any} size={28} color={isSelected ? '#fff' : info.color} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardLabel, { color: isSelected ? '#fff' : colors.foreground }]}>{info.label}</Text>
                      <Text style={[styles.cardSub, { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>{info.subtitle}</Text>
                      <Text style={[styles.cardDesc, { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.mutedForeground }]} numberOfLines={2}>{info.description}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => { if (selectedProgram) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(2); } }}
              disabled={!selectedProgram}
              style={[styles.btn, { backgroundColor: selectedProgram ? accentColor : colors.muted }]}
            >
              <Text style={[styles.btnText, { color: selectedProgram ? '#fff' : colors.mutedForeground }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={selectedProgram ? '#fff' : colors.mutedForeground} />
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 2: Skill Level ── */}
        {step === 2 && (
          <>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 2 OF 4</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Your fitness{'\n'}level</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Shapes exercise complexity, WOD formats, and weekly rotation.
            </Text>
            <View style={styles.list}>
              {SKILLS.map(skill => {
                const info = SKILL_INFO[skill];
                const isSelected = selectedSkill === skill;
                return (
                  <Pressable
                    key={skill}
                    onPress={() => { Haptics.selectionAsync(); setSelectedSkill(skill); }}
                    style={({ pressed }) => [
                      styles.card,
                      { backgroundColor: isSelected ? accentColor : colors.card, borderColor: isSelected ? accentColor : colors.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.secondary }]}>
                      <Ionicons name={info.icon as any} size={26} color={isSelected ? '#fff' : accentColor} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardLabel, { color: isSelected ? '#fff' : colors.foreground }]}>{info.label}</Text>
                      <Text style={[styles.cardSub, { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>{info.subtitle}</Text>
                      <Text style={[styles.cardDesc, { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.mutedForeground }]} numberOfLines={3}>{info.description}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => { if (selectedSkill) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(3); } }}
              disabled={!selectedSkill}
              style={[styles.btn, { backgroundColor: selectedSkill ? accentColor : colors.muted }]}
            >
              <Text style={[styles.btnText, { color: selectedSkill ? '#fff' : colors.mutedForeground }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={selectedSkill ? '#fff' : colors.mutedForeground} />
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 3: Training Days ── */}
        {step === 3 && (
          <>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 3 OF 4</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Pick your{'\n'}training days</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Select which days you'll train. Workouts rotate as you progress.
            </Text>
            <View style={styles.daysGrid}>
              {DAY_ORDER.map(dow => {
                const isOn = selectedDays.has(dow);
                return (
                  <Pressable
                    key={dow}
                    onPress={() => toggleDay(dow)}
                    style={({ pressed }) => [
                      styles.dayBtn,
                      { backgroundColor: isOn ? accentColor : colors.card, borderColor: isOn ? accentColor : colors.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: isOn ? '#fff' : colors.foreground }]}>{DAYS_OF_WEEK[dow]}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={18} color={accentColor} />
              <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
                <Text style={{ color: accentColor, fontWeight: '700' }}>{selectedDays.size} days/week</Text>
                {selectedProgram && selectedSkill ? ` · ${PROGRAM_INFO[selectedProgram].label} · ${SKILL_INFO[selectedSkill].label}` : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(4); }}
              style={[styles.btn, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 4: Workout Duration ── */}
        {step === 4 && (
          <>
            <TouchableOpacity onPress={() => setStep(3)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 4 OF 4</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Session{'\n'}duration</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              How long is each workout? Exercises scale to fit your time — and training fewer days means more per session.
            </Text>

            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map(mins => {
                const isOn = selectedDuration === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => { Haptics.selectionAsync(); setSelectedDuration(mins); }}
                    style={({ pressed }) => [
                      styles.durationBtn,
                      { backgroundColor: isOn ? accentColor : colors.card, borderColor: isOn ? accentColor : colors.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.durationNum, { color: isOn ? '#fff' : colors.foreground }]}>{mins}</Text>
                    <Text style={[styles.durationUnit, { color: isOn ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>min</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={18} color={accentColor} />
              <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
                <Text style={{ color: accentColor, fontWeight: '700' }}>{selectedDuration} min sessions</Text>
                {` · ${selectedDays.size} days/week`}
                {selectedProgram ? ` · ${PROGRAM_INFO[selectedProgram].label}` : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              style={[styles.btn, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Start Training</Text>
              <Ionicons name="fitness-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
  stepDot: { height: 6, width: 6, borderRadius: 3 },
  stepLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 12 },
  heading: { fontSize: 34, fontWeight: '800', lineHeight: 40, marginBottom: 8 },
  subheading: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  list: { gap: 12, marginBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  cardSub: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8 },
  btnText: { fontSize: 17, fontWeight: '700' },
  backBtn: { marginBottom: 16, width: 40 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  dayBtn: { width: '13%', minWidth: 44, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, fontWeight: '700' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 28 },
  summaryText: { flex: 1, fontSize: 13, lineHeight: 18 },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  durationBtn: { width: '22%', minWidth: 72, paddingVertical: 18, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  durationNum: { fontSize: 20, fontWeight: '800' },
  durationUnit: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
