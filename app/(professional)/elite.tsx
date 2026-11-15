import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react-native'
import { useAuthStore } from '../../store/authStore'
import { colors, font, spacing, radius } from '../../constants/theme'

export default function ProfessionalElite() {
  const user = useAuthStore((s) => s.user)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Elite Insights</Text>
          <Text style={styles.subtitle}>Exclusive analytics for Elite members</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Sparkles size={28} color={colors.primary} />
          <Text style={styles.cardTitle}>Priority Match</Text>
          <Text style={styles.cardText}>Your service appears higher in search results for better visibility.</Text>
        </View>
        <View style={styles.card}>
          <BarChart3 size={28} color={colors.primary} />
          <Text style={styles.cardTitle}>Performance Metrics</Text>
          <Text style={styles.cardText}>See engagement, bids won, and client reach to grow your business.</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Current plan</Text>
          <Text style={styles.infoValue}>{user?.plan === 'elite' ? 'Elite' : 'Not Elite'}</Text>
        </View>
      </View>
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
  content: { flex: 1, padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  cardTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text },
  cardText: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  infoBox: { backgroundColor: '#f5f0ff', borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.md },
  infoLabel: { fontFamily: font.semiBold, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  infoValue: { fontFamily: font.bold, fontSize: 16, color: colors.text },
})
