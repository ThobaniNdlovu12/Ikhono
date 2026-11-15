import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, Star, ShieldCheck, Trophy } from 'lucide-react-native'
import { useAuthStore } from '../../store/authStore'
import { colors, font, spacing, radius } from '../../constants/theme'

export default function ProfessionalUpgrade() {
  const user = useAuthStore((s) => s.user)
  const planKey = (user?.plan ?? 'free').toString().toLowerCase()
  const currentPlan = planKey === 'pro' ? 'pro' : planKey === 'elite' ? 'elite' : 'free'
  const currentPlanLabel = currentPlan === 'free' ? 'Basic' : currentPlan === 'pro' ? 'Pro' : 'Elite'

  const proDisabled = currentPlan === 'pro' || currentPlan === 'elite'
  const eliteDisabled = currentPlan === 'elite'

  const planColor = {
    free: colors.primary,
    pro: colors.purple,
    elite: colors.warning,
  }[currentPlan]

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: planColor }]}> 
        <TouchableOpacity onPress={() => router.replace('/(professional)/home')} style={[styles.backBtn, { backgroundColor: planColor === colors.white ? colors.surface : 'rgba(255,255,255,0.12)' }]}>
          <ArrowLeft size={18} color={planColor === colors.white ? colors.text : colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: planColor === colors.white ? colors.text : colors.white }]}>Upgrade Plan</Text>
          <Text style={[styles.subtitle, { color: planColor === colors.white ? colors.textSecondary : 'rgba(255,255,255,0.9)', marginTop: 2 }]}>Choose the plan that fits your goals</Text>
          <Text style={[styles.currentPlan, { color: planColor === colors.white ? colors.textSecondary : 'rgba(255,255,255,0.9)' }]}>Current plan: {currentPlanLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderColor: colors.purple }]}> 
          <Star size={28} color={colors.purple} />
          <Text style={styles.cardTitle}>Pro Plan</Text>
          <Text style={styles.cardText}>Place bids, upload portfolio items, and access premium matching.</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Place unlimited bids</Text>
            <Text style={styles.featureItem}>• Upload portfolio work from your phone</Text>
            <Text style={styles.featureItem}>• Better visibility for professional leads</Text>
          </View>
          <Text style={[styles.cardPrice, { color: colors.purple }]}>R200 / month</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.purple }, proDisabled && styles.disabledPrimaryBtn]}
            onPress={() => router.push(`/(professional)/payment?plan=pro`)}
            disabled={proDisabled}
          >
            <Text style={[styles.primaryBtnText, proDisabled && styles.disabledPrimaryBtnText]}>
              {currentPlan === 'pro' ? 'Current Plan' : currentPlan === 'elite' ? 'Already Elite' : 'Select Pro'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: colors.warning }]}> 
          <ShieldCheck size={28} color={colors.warning} />
          <Text style={styles.cardTitle}>Elite Plan</Text>
          <Text style={styles.cardText}>All Pro features plus the highest visibility, direct leads and premium support.</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Top placement — homepage highlights</Text>
            <Text style={styles.featureItem}>• Dedicated account manager</Text>
            <Text style={styles.featureItem}>• Direct leads and priority matching</Text>
            <Text style={styles.featureItem}>• Publish articles / thought leadership</Text>
            <Text style={styles.featureItem}>• Access to enterprise clients</Text>
            <Text style={styles.featureItem}>• CRM tools — manage leads in platform</Text>
            <Text style={styles.featureItem}>• Lowest commission on the platform</Text>
          </View>
          <Text style={[styles.cardPrice, { color: colors.warning }]}>R500 / month</Text>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.warning }, eliteDisabled && styles.disabledSecondaryBtn]}
            onPress={() => router.push(`/(professional)/payment?plan=elite`)}
            disabled={eliteDisabled}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.warning }, eliteDisabled && styles.disabledSecondaryBtnText]}>
              {currentPlan === 'elite' ? 'Current Plan' : 'Select Elite'}
            </Text>
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
  content: { flexGrow: 1, padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text },
  cardText: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  featureList: { marginTop: spacing.sm, alignSelf: 'stretch' },
  featureItem: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginTop: 6 },
  cardPrice: { fontFamily: font.semiBold, fontSize: 20, color: colors.primary, marginTop: spacing.sm },
  currentPlan: { fontFamily: font.semiBold, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  primaryBtn: { marginTop: spacing.md, width: '100%', backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.white },
  secondaryBtn: { marginTop: spacing.md, width: '100%', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.button, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.primary },
  disabledPrimaryBtn: { backgroundColor: colors.border, opacity: 0.7 },
  disabledPrimaryBtnText: { color: colors.textSecondary },
  disabledSecondaryBtn: { borderColor: colors.border, opacity: 0.7 },
  disabledSecondaryBtnText: { color: colors.textSecondary },
})
