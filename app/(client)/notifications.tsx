import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bell, X } from 'lucide-react-native';
import { getJobs } from '../../services/api';

const COLORS = {
  primary: '#1251c4',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

type Job = {
  id: number;
  title: string;
  status: string;
  created_at: string;
};

export default function ClientNotifications() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromSettings = params.from === 'settings';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    getJobs()
      .then((res) => setJobs(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (fromSettings) {
              router.push('/(client)/settings');
            } else {
              router.back();
            }
          }}
        >
          <X size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Orders & Notifications</Text>
          <Text style={styles.subtitle}>Manage order history and alerts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates and alerts for new order activity.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? COLORS.primary : '#fff'}
              trackColor={{ false: '#d9d9d9', true: '#cde0ff' }}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your orders</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={40} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your active and past orders will appear here.</Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.orderCard}>
              <Text style={styles.orderTitle}>{job.title}</Text>
              <Text style={styles.orderMeta}>{job.status.replace('_', ' ')} • {new Date(job.created_at).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  headerText: { marginLeft: 12 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  content: { padding: 16 },
  settingCard: { marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  settingDescription: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  orderCard: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12 },
  orderTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  orderMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
  emptyState: { marginTop: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});