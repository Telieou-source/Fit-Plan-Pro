import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
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
import { PROGRAM_INFO } from '@/constants/workouts';

const PROGRAMS: { type: ProgramType; icon: string }[] = [
  { type: 'muscle_building', icon: 'barbell-outline' },
  { type: 'crossfit', icon: 'flame-outline' },
  { type: 'aerobics', icon: 'pulse-outline' },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setProfile } = useAppContext();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);

  const handleProgramSelect = (type: ProgramType) => {
    Haptics.selectionAsync();
    setSelectedProgram(type);
  };

  const handleContinue = () => {
    if (!selectedProgram) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleFinish = async () => {
    if (!selectedProgram || !selectedDays) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setProfile({
      programType: selectedProgram,
      daysPerWeek: selectedDays,
      startDate: new Date().toISOString(),
    });
    router.replace('/(tabs)');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 }]}
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
                    onPress={() => handleProgramSelect(type)}
                    style={({ pressed }) => [
                      styles.programCard,
                      {
                        backgroundColor: isSelected ? info.color : colors.card,
                        borderColor: isSelected ? info.color : colors.border,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
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
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.checkmark} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedProgram}
              style={[styles.btn, { backgroundColor: selectedProgram ? PROGRAM_INFO[selectedProgram].color : colors.muted }]}
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
            <Text style={[styles.heading, { color: colors.foreground }]}>How many days{'\n'}per week?</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Your schedule adapts to your availability.
            </Text>

            <View style={styles.daysGrid}>
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const isSelected = selectedDays === day;
                const color = selectedProgram ? PROGRAM_INFO[selectedProgram].color : colors.primary;
                return (
                  <Pressable
                    key={day}
                    onPress={() => { Haptics.selectionAsync(); setSelectedDays(day); }}
                    style={({ pressed }) => [
                      styles.dayBtn,
                      {
                        backgroundColor: isSelected ? color : colors.card,
                        borderColor: isSelected ? color : colors.border,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.94 : 1 }],
                      },
                    ]}
                  >
                    <Text style={[styles.dayNum, { color: isSelected ? '#fff' : colors.foreground }]}>{day}</Text>
                    <Text style={[styles.dayWord, { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>
                      {day === 1 ? 'day' : 'days'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedDays && selectedProgram && (
              <View style={[styles.planPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={18} color={PROGRAM_INFO[selectedProgram].color} />
                <Text style={[styles.planPreviewText, { color: colors.mutedForeground }]}>
                  {selectedDays}-day {PROGRAM_INFO[selectedProgram].label} split — we'll build your full plan automatically.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleFinish}
              disabled={!selectedDays}
              style={[
                styles.btn,
                { backgroundColor: (selectedDays && selectedProgram) ? PROGRAM_INFO[selectedProgram].color : colors.muted },
              ]}
            >
              <Text style={[styles.btnText, { color: (selectedDays && selectedProgram) ? '#fff' : colors.mutedForeground }]}>
                Start Training
              </Text>
              <Ionicons name="fitness-outline" size={20} color={(selectedDays && selectedProgram) ? '#fff' : colors.mutedForeground} />
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
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  programIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programText: { flex: 1 },
  programLabel: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  programSub: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  programDesc: { fontSize: 13, lineHeight: 18 },
  checkmark: { marginLeft: 4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  btnText: { fontSize: 17, fontWeight: '700' },
  backBtn: { marginBottom: 20, width: 40 },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  dayBtn: {
    width: '13%',
    minWidth: 46,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 20, fontWeight: '700' },
  dayWord: { fontSize: 10, fontWeight: '500', marginTop: 1 },
  planPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 28,
  },
  planPreviewText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
