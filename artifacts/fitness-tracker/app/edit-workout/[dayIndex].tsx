import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { EXERCISE_LIBRARY, LibraryExercise, libraryExToExercise, Exercise, PROGRAM_INFO } from '@/constants/workouts';
import { openExerciseVideo } from '@/constants/exerciseLinks';

function makeId() {
  return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

export default function EditWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dayIndex: rawIndex } = useLocalSearchParams<{ dayIndex: string }>();
  const dayIndex = parseInt(rawIndex ?? '0', 10);
  const { effectivePlan, workoutPlan, profile, updateWorkoutDay, resetWorkoutPlan } = useAppContext();

  const day = effectivePlan[dayIndex];
  const [exercises, setExercises] = useState<Exercise[]>(day?.exercises ?? []);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');

  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const filteredLibrary = useMemo(() => {
    if (!search.trim()) return EXERCISE_LIBRARY;
    const q = search.toLowerCase();
    return EXERCISE_LIBRARY.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.muscleGroup.toLowerCase().includes(q) ||
      e.tags.some(t => t.includes(q))
    );
  }, [search]);

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) { Alert.alert('Cannot remove', 'A workout must have at least one exercise.'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const addFromLibrary = (lib: LibraryExercise) => {
    Haptics.selectionAsync();
    setExercises(prev => [...prev, libraryExToExercise(lib)]);
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    Haptics.selectionAsync();
    const custom: Exercise = {
      id: makeId(),
      name,
      targetSets: 3,
      targetReps: '8-12',
      muscleGroup: 'Custom',
      unit: 'weight_reps',
    };
    setExercises(prev => [...prev, custom]);
    setCustomName('');
  };

  const handleSave = async () => {
    if (!day) return;
    await updateWorkoutDay(dayIndex, { ...day, exercises });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleReset = () => {
    const defaultDay = workoutPlan[dayIndex];
    if (!defaultDay) return;
    Alert.alert('Reset to Default', 'This will restore the original exercises for this day.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setExercises(defaultDay.exercises);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  if (!day) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Workout day not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{day.focus}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{day.name}</Text>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.headerBtn}>
          <Ionicons name="refresh-outline" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EXERCISES ({exercises.length})</Text>

        {exercises.map((ex, i) => (
          <View key={ex.id + i} style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.exMain}>
              <View style={styles.exInfo}>
                <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                <Text style={[styles.exMeta, { color: colors.mutedForeground }]}>
                  {ex.targetSets} sets{ex.targetReps ? ` · ${ex.targetReps} reps` : ''}{ex.targetDuration ? ` · ${ex.targetDuration}` : ''}
                  {ex.muscleGroup ? ` · ${ex.muscleGroup}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeExercise(i)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => { setSearch(''); setShowPicker(true); }}
          style={[styles.addBtn, { borderColor: accentColor }]}
        >
          <Ionicons name="add-circle-outline" size={20} color={accentColor} />
          <Text style={[styles.addBtnText, { color: accentColor }]}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: accentColor }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Exercise</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Custom exercise input */}
          <View style={[styles.customRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.customInput, { color: colors.foreground }]}
              placeholder="Type a custom exercise name..."
              placeholderTextColor={colors.mutedForeground}
              value={customName}
              onChangeText={setCustomName}
              onSubmitEditing={addCustom}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => { addCustom(); setShowPicker(false); }}
              disabled={!customName.trim()}
              style={[styles.customAddBtn, { backgroundColor: customName.trim() ? accentColor : colors.muted }]}
            >
              <Text style={[styles.customAddBtnText, { color: customName.trim() ? '#fff' : colors.mutedForeground }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {customName.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => openExerciseVideo(customName.trim())}
              style={[styles.ytPreviewRow, { borderColor: colors.border }]}
            >
              <Ionicons name="logo-youtube" size={16} color="#FF3B30" />
              <Text style={[styles.ytPreviewText, { color: colors.mutedForeground }]} numberOfLines={1}>
                Preview "{customName.trim()}" on YouTube
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          {/* Search */}
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredLibrary}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={[styles.libRow, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                <Pressable
                  onPress={() => { addFromLibrary(item); setShowPicker(false); }}
                  style={({ pressed }) => [styles.libPressable, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={styles.libInfo}>
                    <Text style={[styles.libName, { color: colors.foreground }]}>{item.name}</Text>
                    <Text style={[styles.libMeta, { color: colors.mutedForeground }]}>
                      {item.muscleGroup} · {item.defaultSets} sets{item.defaultReps ? ` · ${item.defaultReps}` : ''}{item.defaultDuration ? ` · ${item.defaultDuration}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="add" size={22} color={accentColor} />
                </Pressable>
                <TouchableOpacity onPress={() => openExerciseVideo(item.name)} style={styles.libYtBtn}>
                  <Ionicons name="logo-youtube" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  scroll: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  exCard: { borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  exMain: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: '600', marginBottom: 3 },
  exMeta: { fontSize: 12 },
  deleteBtn: { padding: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 4 },
  addBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  customRow: { flexDirection: 'row', alignItems: 'center', margin: 12, borderRadius: 12, borderWidth: 1, paddingLeft: 14, overflow: 'hidden' },
  customInput: { flex: 1, height: 44, fontSize: 15 },
  customAddBtn: { paddingHorizontal: 16, height: 44, alignItems: 'center', justifyContent: 'center' },
  customAddBtnText: { fontSize: 14, fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, height: 42 },
  libRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  libPressable: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 16, paddingRight: 8 },
  libInfo: { flex: 1 },
  libName: { fontSize: 15, fontWeight: '600' },
  libMeta: { fontSize: 12, marginTop: 2 },
  libYtBtn: { padding: 12 },
  ytPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginBottom: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  ytPreviewText: { flex: 1, fontSize: 13 },
});
