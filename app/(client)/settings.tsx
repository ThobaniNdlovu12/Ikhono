import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Shield, Settings } from 'lucide-react-native';

const COLORS = {
  primary: '#1251c4',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

export default function ClientSettings() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>App Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/(client)/notifications?from=settings')}>
          <Bell size={18} color={COLORS.primary} />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Notification settings</Text>
            <Text style={styles.optionSubtitle}>Manage order alerts and updates</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/(client)/security?from=settings')}>
          <Shield size={18} color={COLORS.primary} />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Security & privacy</Text>
            <Text style={styles.optionSubtitle}>Review device access and app privacy</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginLeft: 12 },
  content: { padding: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  optionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});