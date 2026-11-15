import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { getDashboard } from '../../services/api';

const COLORS = {
  primary: '#1251c4',
  primaryDark: '#0a2d6b',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

type DashboardStats = {
  total_jobs: number;
  active_jobs: number;
  total_spent: number;
};

export default function ClientProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.stats ?? null))
      .catch(() => {});
  }, []);

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearUser();
          router.replace('/');
        },
      },
    ]);
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  const menuItems = [
    { icon: User, label: 'Edit Profile', onPress: () => router.push('/(client)/edit-profile?from=profile') },
    { icon: Shield, label: 'Security & Privacy', onPress: () => router.push('/(client)/security?from=profile') },
    { icon: Settings, label: 'App Settings', onPress: () => router.push('/(client)/settings') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {user?.avatar_uri ? (
            <Image source={{ uri: user.avatar_uri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{user ? getInitials(user.full_name) : '?'}</Text>
          )}
        </View>
        <Text style={styles.name}>{user?.full_name ?? '—'}</Text>
        <Text style={styles.role}>Client Account</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.infoText}>{user?.location ?? '—'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Phone size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.infoText}>{user?.phone ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statVal}>{stats?.total_jobs ?? 0}</Text>
          <Text style={styles.statKey}>Total Jobs</Text>
        </View>
        <View style={[styles.statBlock, styles.statBlockBorder]}>
          <Text style={styles.statVal}>{stats?.active_jobs ?? 0}</Text>
          <Text style={styles.statKey}>Active</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statVal}>
            R{((stats?.total_spent ?? 0) / 100).toFixed(0)}
          </Text>
          <Text style={styles.statKey}>Spent</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <View style={styles.infoCard}>
          <View style={styles.infoCardRow}>
            <Mail size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoCardLabel}>Email</Text>
            <Text style={styles.infoCardValue}>{user?.email ?? '—'}</Text>
          </View>
          <View style={[styles.infoCardRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
            <Briefcase size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoCardLabel}>Member since</Text>
            <Text style={styles.infoCardValue}>2025</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <Icon size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statBlock: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBlockBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  statKey: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  infoCardLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  infoCardValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    backgroundColor: '#e8edfb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fce8e8',
    padding: 16,
    marginBottom: 8,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
});