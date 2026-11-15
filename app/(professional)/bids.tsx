import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, ClipboardList } from 'lucide-react-native'
import { colors, font, radius, spacing } from '../../constants/theme'

import { useAuthStore } from '../../store/authStore'

export default function ProfessionalBids() {
  const user = useAuthStore((s) => s.user)
  const isAllowed = true

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>My Bids</Text>
          <Text style={styles.subtitle}>Track the jobs you have bid on</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <ClipboardList size={28} color={colors.primary} />
          <Text style={styles.cardTitle}>No bids yet</Text>
          <Text style={styles.cardText}>
            Browse available jobs and start placing bids for work in your area.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(professional)/home')}>
            <Text style={styles.primaryBtnText}>Browse Jobs</Text>
          </TouchableOpacity>
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
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text, marginTop: spacing.sm },
  cardText: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.button },
  primaryBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.white },
})
