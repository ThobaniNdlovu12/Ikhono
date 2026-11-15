import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, User, Mail, MapPin, Briefcase } from 'lucide-react-native'
import { useAuthStore } from '../../store/authStore'
import { colors, font, radius, spacing } from '../../constants/theme'

export default function ProfessionalProfile() {
  const { user } = useAuthStore()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your professional details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <User size={24} color={colors.primary} />
          </View>
          <Text style={styles.name}>{user?.full_name ?? 'Professional'}</Text>
          <Text style={styles.role}>{user?.primary_service ?? 'Service Provider'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={16} color={colors.primary} />
            <Text style={styles.infoText}>{user?.email ?? 'No email provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.infoText}>{user?.location ?? 'No location set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Briefcase size={16} color={colors.primary} />
            <Text style={styles.infoText}>{user?.plan ? `${user.plan} plan` : 'Free plan'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  headerText: { marginLeft: spacing.sm },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  content: { flexGrow: 1, padding: spacing.lg },
  heroCard: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  name: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  infoCard: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  infoText: { fontFamily: font.semiBold, fontSize: 13, color: colors.text, flex: 1 },
})
