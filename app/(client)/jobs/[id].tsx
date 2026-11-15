import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ArrowLeft, MapPin, Clock, Banknote, Calendar, Tag,
  User, Star, CheckCircle, Pencil, X,
} from 'lucide-react-native'
import { getJobDetails, getJobBids, acceptBid, updateJob } from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

const COLORS = {
  primary: '#1251c4',
  primaryDark: '#0a2d6b',
  primaryLight: '#e8edfb',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
  green: '#2e7d32',
  greenBg: '#e8f5e9',
  amber: '#f59e0b',
  amberBg: '#fff8e1',
  error: '#dc2626',
  errorBg: '#fef2f2',
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  open:        { label: 'Open',        bg: COLORS.primaryLight, color: COLORS.primary },
  in_progress: { label: 'In Progress', bg: COLORS.amberBg,     color: COLORS.amber },
  completed:   { label: 'Completed',   bg: COLORS.greenBg,     color: COLORS.green },
  cancelled:   { label: 'Cancelled',   bg: COLORS.errorBg,     color: COLORS.error },
}

type Job = {
  id: number
  title: string
  description: string
  service_type: string
  location: string
  budget_min: number
  budget_max: number
  deadline?: string
  status: string
  created_at: string
  client_name: string
}

type Bid = {
  id: number
  professional_id: number
  professional_name: string
  amount: number
  notes: string
  created_at: string
  rating?: number
  status: string
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

export default function JobDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)

  const [job, setJob] = useState<Job | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [accepting, setAccepting] = useState<number | null>(null)
  const [editVisible, setEditVisible] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    try {
      const [jobRes, bidsRes] = await Promise.all([
        getJobDetails(Number(id), user?.legacy_id ?? user?.id),
        getJobBids(Number(id)),
      ])
      if (jobRes.data?.success) setJob(jobRes.data.data)
      if (bidsRes.data?.success) setBids(bidsRes.data.data ?? [])
    } catch {
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchData() }, [id]))

  function openEdit() {
    setEditDescription(job?.description ?? '')
    setEditVisible(true)
  }

  async function handleSaveEdit() {
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const res = await updateJob({ job_id: Number(id), description: editDescription.trim() })
      if (res?.data?.success) {
        setJob(prev => prev ? { ...prev, description: editDescription.trim() } : prev)
        setEditVisible(false)
      } else {
        Alert.alert('Error', res?.data?.message ?? 'Could not save changes.')
      }
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAcceptBid(bid: Bid) {
    Alert.alert(
      'Accept Bid',
      `Accept bid of R${bid.amount} from ${bid.professional_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAccepting(bid.id)
            try {
              const res = await acceptBid({ job_id: Number(id), bid_id: bid.id })
              if (res.data?.success) {
                Alert.alert('Bid Accepted!', `${bid.professional_name} has been assigned to this job.`)
                fetchData()
              } else {
                Alert.alert('Error', res.data?.message ?? 'Something went wrong.')
              }
            } catch {
              Alert.alert('Error', 'Could not accept bid. Please try again.')
            } finally {
              setAccepting(null)
            }
          },
        },
      ]
    )
  }

  const statusCfg = STATUS_CONFIG[job?.status ?? 'open']

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, marginTop: 12, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0a2d6b', '#1251c4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{job.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.statusBadgeText}>{statusCfg.label}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData() }}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <InfoRow icon={<Tag size={14} color={COLORS.primary} />} label="Service" value={job.service_type} />
          <InfoRow icon={<MapPin size={14} color={COLORS.primary} />} label="Location" value={job.location} />
          <InfoRow
            icon={<Banknote size={14} color={COLORS.primary} />}
            label="Budget"
            value={`R${Number(job.budget_min).toLocaleString()} – R${Number(job.budget_max).toLocaleString()}`}
          />
          {job.deadline && (
            <InfoRow icon={<Calendar size={14} color={COLORS.primary} />} label="Deadline" value={job.deadline.split(' ')[0]} />
          )}
          <InfoRow
            icon={<Clock size={14} color={COLORS.primary} />}
            label="Posted"
            value={new Date(job.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Description</Text>
            {job.status === 'open' && (
              <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
                <Pencil size={13} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.bidsHeader}>
            <Text style={styles.sectionTitle}>Bids Received</Text>
            <View style={styles.bidCountBadge}>
              <Text style={styles.bidCountText}>{bids.length}</Text>
            </View>
          </View>

          {bids.length === 0 ? (
            <View style={styles.emptyBids}>
              <User size={28} color={COLORS.textSecondary} />
              <Text style={styles.emptyBidsText}>No bids yet</Text>
              <Text style={styles.emptyBidsSub}>Artisans will start bidding shortly</Text>
            </View>
          ) : (
            bids.map((bid) => (
              <View key={bid.id} style={[styles.bidCard, bid.status === 'accepted' && styles.bidCardAccepted]}>
                <View style={styles.bidTop}>
                  <View style={styles.bidAvatar}>
                    <Text style={styles.bidAvatarText}>
                      {bid.professional_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.bidInfo}>
                    <Text style={styles.bidName}>{bid.professional_name}</Text>
                    <View style={styles.bidMeta}>
                      {bid.rating && (
                        <View style={styles.ratingRow}>
                          <Star size={10} color={COLORS.amber} fill={COLORS.amber} />
                          <Text style={styles.ratingText}>{bid.rating}</Text>
                        </View>
                      )}
                      <Text style={styles.bidDate}>
                        {new Date(bid.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bidAmount}>R{Number(bid.amount).toLocaleString()}</Text>
                </View>

                {bid.notes ? <Text style={styles.bidNotes}>{bid.notes}</Text> : null}

                {bid.status === 'accepted' ? (
                  <View style={styles.acceptedRow}>
                    <CheckCircle size={14} color={COLORS.green} />
                    <Text style={styles.acceptedText}>Accepted</Text>
                  </View>
                ) : job.status === 'open' ? (
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptBid(bid)}
                    disabled={accepting === bid.id}
                  >
                    {accepting === bid.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.acceptBtnText}>Accept Bid</Text>
                    }
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditVisible(false)}>
                  <X size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Description</Text>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSaveEdit}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.modalSaveBtnText}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.editTextArea}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  textAlignVertical="top"
                  placeholder="Describe the job in detail..."
                  placeholderTextColor={COLORS.textSecondary}
                  autoFocus
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  errorText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  header: {
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16 },
  section: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 20,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  infoIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  description: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 20 },
  bidsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  bidCountBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  bidCountText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  emptyBids: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyBidsText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  emptyBidsSub: { fontSize: 12, color: COLORS.textSecondary },
  bidCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  bidCardAccepted: { borderColor: COLORS.green, backgroundColor: COLORS.greenBg },
  bidTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  bidAvatar: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  bidAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  bidInfo: { flex: 1 },
  bidName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  bidMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, color: COLORS.amber, fontWeight: '600' },
  bidDate: { fontSize: 11, color: COLORS.textSecondary },
  bidAmount: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  bidNotes: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  acceptBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  acceptedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  acceptedText: { fontSize: 13, fontWeight: '700', color: COLORS.green },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  modalSaveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  modalSaveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  modalBody: { padding: 20 },
  editTextArea: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.textPrimary,
    minHeight: 160, textAlignVertical: 'top',
  },
})