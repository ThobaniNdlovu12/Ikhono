import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, Link, Smartphone } from 'lucide-react-native';

const COLORS = {
  primary: '#1251c4',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

const devices = ['Home laptop', 'Android phone', 'Office desktop'];
const accounts = ['Google account', 'Apple ID'];

export default function ClientSecurity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: 'settings' | 'profile' }>();
  const fromSettings = params.from === 'settings';
  const fromProfile = params.from === 'profile';
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (fromSettings) {
              router.push('/(client)/settings');
            } else if (fromProfile) {
              router.push('/(client)/profile');
            } else {
              router.back();
            }
          }}
        >
          <ArrowLeft size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Security & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Connected devices</Text>
          {devices.map((device) => (
            <View key={device} style={styles.itemRow}>
              <View style={styles.itemIcon}><Smartphone size={16} color={COLORS.primary} /></View>
              <Text style={styles.itemText}>{device}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Connected accounts</Text>
          {accounts.map((account) => (
            <View key={account} style={styles.itemRow}>
              <View style={styles.itemIcon}><Smartphone size={16} color={COLORS.primary} /></View>
              <Text style={styles.itemText}>{account}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.sectionTitle}>Multi-factor authentication</Text>
              <Text style={styles.itemText}>Send a code to your email on unrecognized devices or browsers.</Text>
            </View>
            <Switch
              value={mfaEnabled}
              onValueChange={setMfaEnabled}
              thumbColor={mfaEnabled ? COLORS.primary : '#fff'}
              trackColor={{ false: '#d9d9d9', true: '#cde0ff' }}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Text style={styles.paragraph}>
            Ikhono does not sell or share your personal information for monetary compensation. We only use your details to improve your service experience and protect your account.
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/privacy-policy')}>
            <Text style={styles.link}>Privacy policy</Text>
          </TouchableOpacity>
          <Text style={[styles.paragraph, { marginTop: 12 }]}>Need help? Visit the privacy policy for more information.</Text>
        </View>
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
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  itemIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#e8edfb', alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  paragraph: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  link: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 8 },
});