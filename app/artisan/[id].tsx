import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import api from '../../services/api'
import { getOrCreateConversation, getSupabaseProfessionalIdByLegacyId } from '../../services/messaging'
import { useAuthStore } from '../../store/authStore'
import { colors, font, spacing, radius } from '../../constants/theme'
import { Star, MessageCircle, ShieldCheck } from 'lucide-react-native'

export default function ArtisanProfile() {
  const params = useLocalSearchParams<{ id?: string }>()
  const id = Number(params.id)
  const [artisan, setArtisan] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  async function openChat() {
    if (!user?.id || !artisan) return
    try {
      const professionalId = await getSupabaseProfessionalIdByLegacyId(artisan.id)
      const conversation = await getOrCreateConversation(user.id, professionalId)
      router.push({
        pathname: '/(client)/chat/[conversationId]',
        params: {
          conversationId: conversation.id,
          otherName: artisan.name ?? 'Artisan',
        },
      })
    } catch (err) {
      console.error('Chat error:', err)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return setLoading(false)
      try {
        const res = await api.get('/dashboard.php', { params: { action: 'artisan_profile', artisan_id: id } })
        if (mounted && res.data?.success) setArtisan(res.data.artisan)
      } catch (err) {
        console.warn('artisan load', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!artisan) return <View style={styles.center}><Text style={{ color: colors.text }}>Artisan not found</Text></View>

  const initials = artisan.name?.split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase() || 'AS'

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.avatarWrap}>
            {artisan.avatar ? (
              <Image source={{ uri: artisan.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}><Text style={styles.initials}>{initials}</Text></View>
            )}
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={styles.name}>{artisan.name}</Text>
            <Text style={styles.meta}>{artisan.service_type} · {artisan.location ?? 'Unknown'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View style={styles.statSmall}><Text style={styles.statValueSmall}>{artisan.rating ?? '—'}</Text><Text style={styles.statLabelSmall}>Rating</Text></View>
              <View style={styles.statSmall}><Text style={styles.statValueSmall}>{artisan.jobs_completed ?? 0}</Text><Text style={styles.statLabelSmall}>Jobs</Text></View>
              <View style={styles.statSmall}><Text style={styles.statValueSmall}>{artisan.years_experience ?? '—'}</Text><Text style={styles.statLabelSmall}>Exp</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => router.push(`/booking/${artisan.id}`)}>
            <Text style={styles.bookText}>Book {artisan.rate ? `· R${artisan.rate}/hr` : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatBtn} onPress={openChat}>
            <MessageCircle size={18} color={colors.primary} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {(artisan.reviews ?? []).length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet</Text>
        ) : (
          (artisan.reviews ?? []).map((r: any, i: number) => (
            <View key={i} style={styles.reviewCard}>
              <Text style={styles.reviewAuthor}>{r.author}</Text>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{artisan.bio ?? 'No bio provided'}</Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primaryDark, paddingTop: 36, paddingBottom: spacing.md, paddingHorizontal: spacing.lg },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 88, height: 88, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 88, height: 88 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontFamily: font.extraBold, fontSize: 28 },
  name: { fontFamily: font.extraBold, fontSize: 20, color: '#fff' },
  meta: { fontFamily: font.semiBold, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statSmall: { backgroundColor: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: 8, alignItems: 'center', marginRight: 6 },
  statValueSmall: { fontFamily: font.semiBold, color: '#fff' },
  statLabelSmall: { fontFamily: font.regular, color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md },
  bookBtn: { flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: radius.button, alignItems: 'center' },
  bookText: { color: '#fff', fontFamily: font.extraBold },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5ff',
    padding: 12,
    borderRadius: radius.button,
  },
  chatBtnText: {
    color: colors.primary,
    fontFamily: font.extraBold,
  },

  section: { padding: spacing.lg },
  sectionTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  noReviews: { color: colors.textSecondary },
  reviewCard: { backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.card, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  reviewAuthor: { fontFamily: font.semiBold, color: colors.text, marginBottom: 6 },
  reviewText: { color: colors.textSecondary },
  bio: { color: colors.textSecondary, fontFamily: font.regular },
})
