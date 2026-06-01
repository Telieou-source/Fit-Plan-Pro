import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO } from '@/constants/workouts';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, workoutLogs, bodyEntries, resetProfile } = useAppContext();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleChangeProgram = () => {
    Alert.alert(
      'Change Program',
      'This will clear your current workout logs. Body measurements will be kept. Continue?',
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

  const programInfo = profile ? PROGRAM_INFO[profile.programType] : null;

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
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CURRENT PROGRAM</Text>
            <View style={styles.programRow}>
              <View style={[styles.programDot, { backgroundColor: programInfo.color }]} />
              <View style={styles.programInfo}>
                <Text style={[styles.programName, { color: colors.foreground }]}>{programInfo.label}</Text>
                <Text style={[styles.programMeta, { color: colors.mutedForeground }]}>
                  {profile.daysPerWeek} days per week · {workoutLogs.filter(l => l.completed).length} workouts completed
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
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>STATS</Text>
          {[
            { label: 'Workouts logged', value: workoutLogs.filter(l => l.completed).length },
            { label: 'Body entries', value: bodyEntries.length },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.statRow,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.statValue, { color: colors.mutedForeground }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Clear All Data',
                'This will permanently delete all workout logs, body entries, and your program. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                      await resetProfile();
                      router.replace('/onboarding');
                    },
                  },
                ]
              );
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
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
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 10, borderTopWidth: 1 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionLabel: { fontSize: 16, fontWeight: '500' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  statLabel: { fontSize: 15, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: '600' },
});
