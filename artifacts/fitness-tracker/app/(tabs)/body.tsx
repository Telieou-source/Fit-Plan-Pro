import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
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
import { useAppContext, BodyEntry } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { PROGRAM_INFO } from '@/constants/workouts';

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface FieldInputProps {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}

function FieldInput({ label, unit, value, onChange }: FieldInputProps) {
  const colors = useColors();
  return (
    <View style={fieldStyles.row}>
      <Text style={[fieldStyles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[fieldStyles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[fieldStyles.input, { color: colors.foreground }]}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
        />
        <Text style={[fieldStyles.unit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 16, fontWeight: '500', flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 40, minWidth: 100 },
  input: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'right' },
  unit: { fontSize: 13, marginLeft: 6 },
});

interface EntryCardProps {
  entry: BodyEntry;
  onDelete: () => void;
  accentColor: string;
}

function EntryCard({ entry, onDelete, accentColor }: EntryCardProps) {
  const colors = useColors();
  const fields: { label: string; key: keyof BodyEntry; unit: string }[] = [
    { label: 'Weight', key: 'weight', unit: 'lbs' },
    { label: 'Chest', key: 'chest', unit: 'in' },
    { label: 'Waist', key: 'waist', unit: 'in' },
    { label: 'Hips', key: 'hips', unit: 'in' },
    { label: 'Arms', key: 'arms', unit: 'in' },
    { label: 'Thighs', key: 'thighs', unit: 'in' },
  ];
  const filled = fields.filter(f => entry[f.key] != null);

  return (
    <View style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={cardStyles.header}>
        <Text style={[cardStyles.date, { color: colors.foreground }]}>{formatDate(entry.date)}</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Delete Entry', 'Remove this measurement?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={17} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      <View style={cardStyles.stats}>
        {filled.map(f => (
          <View key={f.key} style={cardStyles.stat}>
            <Text style={[cardStyles.statVal, { color: accentColor }]}>{entry[f.key]}</Text>
            <Text style={[cardStyles.statLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            <Text style={[cardStyles.statUnit, { color: colors.mutedForeground }]}>{f.unit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  date: { fontSize: 15, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { alignItems: 'center', minWidth: 60 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statUnit: { fontSize: 10 },
});

export default function BodyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, bodyEntries, saveBodyEntry, deleteBodyEntry } = useAppContext();
  const accentColor = profile ? PROGRAM_INFO[profile.programType].color : colors.primary;

  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  const resetForm = () => {
    setWeight(''); setChest(''); setWaist(''); setHips(''); setArms(''); setThighs('');
  };

  const handleSave = async () => {
    const entry: BodyEntry = {
      id: makeId(),
      date: todayStr(),
      weight: weight ? parseFloat(weight) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
    };
    if (!entry.weight && !entry.chest && !entry.waist && !entry.hips && !entry.arms && !entry.thighs) {
      Alert.alert('Enter at least one measurement');
      return;
    }
    await saveBodyEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
    setShowForm(false);
  };

  const latestEntry = bodyEntries[0];
  const previousEntry = bodyEntries[1];

  const weightDelta = latestEntry?.weight && previousEntry?.weight
    ? (latestEntry.weight - previousEntry.weight).toFixed(1)
    : null;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Body Stats</Text>
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); setShowForm(!showForm); }}
            style={[styles.addBtn, { backgroundColor: accentColor }]}
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {latestEntry && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>LATEST — {formatDate(latestEntry.date)}</Text>
            <View style={styles.summaryRow}>
              {latestEntry.weight != null && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: accentColor }]}>{latestEntry.weight}</Text>
                  <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>lbs</Text>
                  {weightDelta !== null && (
                    <Text style={[styles.summaryDelta, { color: parseFloat(weightDelta) < 0 ? '#30D158' : '#FF3B30' }]}>
                      {parseFloat(weightDelta) > 0 ? '+' : ''}{weightDelta}
                    </Text>
                  )}
                </View>
              )}
              {latestEntry.waist != null && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: accentColor }]}>{latestEntry.waist}</Text>
                  <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>waist</Text>
                </View>
              )}
              {latestEntry.arms != null && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: accentColor }]}>{latestEntry.arms}</Text>
                  <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>arms</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Measurement</Text>
            <View style={[styles.formDivider, { borderBottomColor: colors.border }]}>
              <FieldInput label="Body Weight" unit="lbs" value={weight} onChange={setWeight} />
            </View>
            <Text style={[styles.formSection, { color: colors.mutedForeground }]}>MEASUREMENTS (inches)</Text>
            <FieldInput label="Chest" unit="in" value={chest} onChange={setChest} />
            <FieldInput label="Waist" unit="in" value={waist} onChange={setWaist} />
            <FieldInput label="Hips" unit="in" value={hips} onChange={setHips} />
            <FieldInput label="Arms (bicep)" unit="in" value={arms} onChange={setArms} />
            <FieldInput label="Thighs" unit="in" value={thighs} onChange={setThighs} />

            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: accentColor }]}>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {bodyEntries.length === 0 && !showForm && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="body-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No measurements yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Tap the + button to log your first body stats.</Text>
          </View>
        )}

        {bodyEntries.length > 0 && (
          <>
            <Text style={[styles.historyLabel, { color: colors.mutedForeground }]}>HISTORY</Text>
            {bodyEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => deleteBodyEntry(entry.id)}
                accentColor={accentColor}
              />
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 30, fontWeight: '800' },
  addBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 24 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 30, fontWeight: '800' },
  summaryUnit: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  summaryDelta: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  formDivider: { borderBottomWidth: 1, paddingBottom: 14, marginBottom: 14 },
  formSection: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, marginTop: 4 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyState: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  historyLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
});
