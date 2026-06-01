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
import { useAppContext, ProgramType } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO, DAYS_OF_WEEK } from '@/constants/workouts';

const PROGRAMS: { type: ProgramType; icon: string }[] = [
  { type: 'muscle_building', icon: 'barbell-outline' },
  { type: 'crossfit', icon: 'flame-outline' },
  { type: 'aerobics', icon: 'pulse-outline' },
];

// Mon–Sun order for display, but store as 0–6 (Sun=0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon first

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setProfile } = useAppContext();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([1, 3, 5])); // default Mon/Wed/Fri

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const toggleDay = (dow: number) => {
    Haptics.selectionAsync();
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(dow)) {
        if (next.size > 1) next.delete(dow); // keep at least 1
      } else {
        if (next.size < 7) next.add(dow);
      }
      return next;
    });
  };

  const handleFinish = async () => {
    if (!selectedProgram || selectedDays.size === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);
    await setProfile({
      programType: selectedProgram,
      daysPerWeek: selectedDays.size,
      preferredDays: sortedDays,
      startDate: new Date().toISOString(),
    });
    router.replace('/(tabs)');
  };

  const accentColor = selectedProgram ? PROGRAM_INFO[selectedProgram].color : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 1 OF 2</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Choose your{'\n'}program</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              We'll build your workout plan around this.
            </Text>

            <View style={styles.programList}>
              {PROGRAMS.map(({ type, icon }) => {
                const info = PROGRAM_INFO[type];
                const isSelected = selectedProgram === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => { Haptics.selectionAsync(); setSelectedProgram(type); }}
                    style={({ pressed }) => [
                      styles.programCard,
                      { backgroundColor: isSelected ? info.color : colors.card, borderColor: isSelected ? info.color : colors.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.programIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.secondary }]}>
                      <Ionicons name={icon as any} size={28} color={isSelected ? '#fff' : info.color} />
                    </View>
                    <View style={styles.programText}>
                      <Text style={[styles.programLabel, { color: isSelected ? '#fff' : colors.foreground }]}>{info.label}</Text>
                      <Text style={[styles.programSub, { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>{info.subtitle}</Text>
                      <Text style={[styles.programDesc, { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.mutedForeground }]} numberOfLines={2}>{info.description}</Text>
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
        ) : (
          <>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>

            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>STEP 2 OF 2</Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>Pick your{'\n'}training days</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Select which days of the week you'll train. You can change this anytime.
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
                {selectedProgram ? ` · ${PROGRAM_INFO[selectedProgram].label} plan` : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              disabled={selectedDays.size === 0}
              style={[styles.btn, { backgroundColor: selectedDays.size > 0 ? accentColor : colors.muted }]}
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
  stepLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 12 },
  heading: { fontSize: 34, fontWeight: '700', lineHeight: 40, marginBottom: 8 },
  subheading: { fontSize: 16, lineHeight: 22, marginBottom: 32 },
  programList: { gap: 14, marginBottom: 32 },
  programCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1.5, gap: 14 },
  programIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  programText: { flex: 1 },
  programLabel: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  programSub: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  programDesc: { fontSize: 13, lineHeight: 18 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8 },
  btnText: { fontSize: 17, fontWeight: '700' },
  backBtn: { marginBottom: 20, width: 40 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  dayBtn: { width: '13%', minWidth: 44, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, fontWeight: '700' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 28 },
  summaryText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
