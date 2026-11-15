import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { getProfessionalStats } from '../../services/api'
import { colors, font, spacing, radius } from '../../constants/theme'

export default function Earnings() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user?.id) return setLoading(false)
      try {
        const res = await getProfessionalStats(user.legacy_id ?? user.id)
        if (mounted && res.data?.success) setStats(res.data.stats)
      } catch (err) {
        console.warn('Earnings load error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.id])

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Earnings Summary</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Earned</Text>
          <Text style={styles.cardValue}>R{stats?.total_earnings ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Completed Jobs</Text>
          <Text style={styles.cardValue}>{stats?.completed_jobs ?? 0}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending Jobs</Text>
          <Text style={styles.cardValue}>{stats?.pending_jobs ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rating</Text>
          <Text style={styles.cardValue}>{stats?.rating?.toFixed?.(1) ?? '—'}</Text>
        </View>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.surface, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: font.bold, fontSize: 20, color: colors.text, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardLabel: { fontFamily: font.semiBold, fontSize: 12, color: colors.textSecondary },
  cardValue: { fontFamily: font.extraBold, fontSize: 18, color: colors.text, marginTop: spacing.sm },
})
