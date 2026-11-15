import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
  Image,
  TextInput,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  LogOut,
  Star,
  Briefcase,
  ClipboardList,
  ImageIcon,
  User,
  MessageCircle,
  ChevronRight,
  MapPin,
  Clock,
  Banknote,
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react-native'

import { useAuthStore } from '../../store/authStore'
import { getProfessionalStats, getPublicOpenJobs, placeBid, changePlan } from '../../services/api'
import { getUnreadMessageCount } from '../../services/messaging'
import { supabase } from '../../services/supabase'
import { colors, font, spacing, radius } from '../../constants/theme'

const SERVICES = [
  { id: '', label: 'All Services' },
  { id: 'Plumbing', label: 'Plumbing' },
  { id: 'Electrical', label: 'Electrical' },
  { id: 'Painting', label: 'Painting' },
  { id: 'Carpentry', label: 'Carpentry' },
  { id: 'Tiling', label: 'Tiling' },
  { id: 'Waterproofing', label: 'Waterproofing' },
  { id: 'Roof & Gutters', label: 'Roof & Gutters' },
  { id: 'General Maintenance', label: 'General Maintenance' },
  { id: 'Ceilings', label: 'Ceilings' },
  { id: 'Drywalling', label: 'Drywalling' },
  { id: 'Glazing / Aluminum Work', label: 'Glazing / Aluminum Work' },
  { id: 'Welding & Steelwork', label: 'Welding & Steelwork' },
  { id: 'Bricklaying & Plastering', label: 'Bricklaying & Plastering' },
  { id: 'Flooring', label: 'Flooring' },
  { id: 'Landscaping & Garden', label: 'Landscaping & Garden' },
  { id: 'Paving', label: 'Paving' },
  { id: 'Built-in Cupboards', label: 'Built-in Cupboards' },
  { id: 'Air Conditioning (HVAC)', label: 'Air Conditioning (HVAC)' },
  { id: 'CCTV & Security Systems', label: 'CCTV & Security Systems' },
  { id: 'High-Pressure Cleaning', label: 'High-Pressure Cleaning' },
  { id: 'Swimming Pool Installation & Repairs', label: 'Swimming Pool Installation & Repairs' },
]

const LOCATIONS = [
  { id: '', label: 'All Provinces' },
  { id: 'gauteng', label: 'Gauteng' },
  { id: 'western-cape', label: 'Western Cape' },
  { id: 'kwazulu-natal', label: 'KwaZulu-Natal' },
  { id: 'eastern-cape', label: 'Eastern Cape' },
  { id: 'free-state', label: 'Free State' },
  { id: 'mpumalanga', label: 'Mpumalanga' },
  { id: 'limpopo', label: 'Limpopo' },
  { id: 'northern-cape', label: 'Northern Cape' },
  { id: 'north-west', label: 'North West' },
]

interface Stats {
  total_jobs: number
  pending_jobs: number
  completed_jobs: number
  total_earnings: number
  rating: number
  total_reviews: number
}

interface Job {
  id: number
  title: string
  description: string
  service_type: string
  location: string
  budget_min: number
  budget_max: number
  created_at: string
  client_name: string
}

type PickerType = 'service' | 'location' | null

export default function ProfessionalHome() {
  const { user, clearUser, setUser } = useAuthStore()

  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)

  const [stats, setStats] = useState<Stats | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [selectedService, setSelectedService] = useState(SERVICES[0])
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0])
  const [activePicker, setActivePicker] = useState<PickerType>(null)
  const [bidModalVisible, setBidModalVisible] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidNotes, setBidNotes] = useState('')
  const [placingBid, setPlacingBid] = useState(false)
  const [bidMessage, setBidMessage] = useState<string | null>(null)
  const [messageBadgeCount, setMessageBadgeCount] = useState(0)

  async function fetchData(service = selectedService.id, location = selectedLocation.id) {
    if (!user?.id) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const [statsRes, jobsRes] = await Promise.all([
        getProfessionalStats(user.legacy_id ?? user.id),
        getPublicOpenJobs(service, location),
      ])

      if (statsRes.data?.success) setStats(statsRes.data.stats)
      if (jobsRes.data?.success) setJobs(jobsRes.data.jobs ?? [])
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setMessageBadgeCount(0)
      return
    }

    let mounted = true
    let channel: any = null

    async function loadUnreadCount() {
      const currentUser = user
      if (!currentUser?.id || !currentUser?.type) {
        if (mounted) setMessageBadgeCount(0)
        return
      }

      try {
        const count = await getUnreadMessageCount(currentUser.id, currentUser.type)
        if (mounted) setMessageBadgeCount(count)
      } catch (err) {
        console.error('[PRO HOME] unread count failed:', err)
      }
    }

    loadUnreadCount()

    channel = supabase
      .channel(`messages:unread:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadUnreadCount)
      .subscribe()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id, user?.type])

  function applyServiceFilter(item: typeof SERVICES[0]) {
    setSelectedService(item)
    setActivePicker(null)
    setLoading(true)
    fetchData(item.id, selectedLocation.id)
  }

  function applyLocationFilter(item: typeof LOCATIONS[0]) {
    setSelectedLocation(item)
    setActivePicker(null)
    setLoading(true)
    fetchData(selectedService.id, item.id)
  }

  async function handleLogout() {
    await clearUser()
    router.replace('/(auth)/login')
  }

  function openBidModal(job: Job) {
    setSelectedJob(job)
    setBidAmount('')
    setBidNotes('')
    setBidMessage(null)
    setBidModalVisible(true)
  }

  async function submitBid() {
    if (!selectedJob) return

    const amount = Number(bidAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setBidMessage('Please enter a valid bid amount')
      return
    }

    try {
      setPlacingBid(true)
      const response = await placeBid({
        job_id: selectedJob.id,
        amount,
        notes: bidNotes.trim() || 'Interested in this job',
      })

      if (response.data?.success) {
        setBidMessage('Bid submitted successfully')
        setBidModalVisible(false)
        setBidAmount('')
        setBidNotes('')
      } else {
        setBidMessage(response.data?.message ?? 'Unable to submit bid right now')
      }
    } catch {
      setBidMessage('Unable to submit bid right now')
    } finally {
      setPlacingBid(false)
    }
  }

  async function handleChangePlan(targetPlan: 'free' | 'pro' | 'elite') {
    if (!user?.id) {
      Alert.alert('Error', 'User not found')
      return
    }

    if (changingPlan) return

    const label = targetPlan === 'free' ? 'Basic' : targetPlan === 'pro' ? 'Pro' : 'Elite'

    Alert.alert('Change plan', `Are you sure you want to change your plan to ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          ;(async () => {
            setChangingPlan(true)
            try {
              const res = await changePlan(user.legacy_id ?? user.id, targetPlan)
              if (res.data?.success) {
                await setUser({ ...user, plan: targetPlan })
                Alert.alert('Plan Updated', `Your plan is now ${label}.`)
                setPlanModalVisible(false)
              } else {
                Alert.alert('Update Failed', res.data?.message ?? 'Unable to update plan on server')
              }
            } catch (err: any) {
              Alert.alert('Server Error', 'Unable to update on server. Update locally instead?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Update Locally',
                  onPress: async () => {
                    await setUser({ ...user, plan: targetPlan })
                    Alert.alert('Plan Updated', `Locally set to ${label}.`)
                    setPlanModalVisible(false)
                  },
                },
              ])
            } finally {
              setChangingPlan(false)
            }
          })()
        },
      },
    ])
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'Professional'

  const planKey = ((user?.plan ?? 'free') as string).toLowerCase()
  const normalizedPlanKey = (planKey === 'basic' ? 'free' : planKey) as 'free' | 'pro' | 'elite'

  const planColor = {
    free: colors.primary,
    pro: colors.purple,
    elite: colors.warning,
  }[normalizedPlanKey]

  const planLabel = {
    free: 'Basic Plan',
    pro: 'Pro Plan',
    elite: 'Elite Plan',
  }[normalizedPlanKey]

  const planScopeMap = {
    free: { canBid: true, canPortfolio: false, canElite: false },
    pro: { canBid: true, canPortfolio: true, canElite: false },
    elite: { canBid: true, canPortfolio: true, canElite: true },
  } as const

  const planScope = planScopeMap[normalizedPlanKey]

  const quickActions = [
    ...(planScope.canBid
      ? [{ icon: <ClipboardList size={20} color={planColor} />, label: 'My Bids', route: '/(professional)/bids' }]
      : []),
    ...(planScope.canPortfolio
      ? [{ icon: <ImageIcon size={20} color={planColor} />, label: 'Portfolio', route: '/(professional)/portfolio' }]
      : []),
    { icon: <User size={20} color={planColor} />, label: 'Profile', route: '/(professional)/profile' },
    { icon: <MessageCircle size={20} color={planColor} />, label: 'Messages', route: '/(professional)/messages', badgeCount: messageBadgeCount },
    ...(planScope.canElite
      ? [{ icon: <Star size={20} color={planColor} />, label: 'Elite Insights', route: '/(professional)/elite' }]
      : []),
  ]

  const activeFilters = selectedService.id !== '' || selectedLocation.id !== ''

const shouldShowUpgradeBanner = normalizedPlanKey !== 'elite'
  const upgradeLabel = normalizedPlanKey === 'free' ? 'Upgrade plans' : 'Go Elite'

  return (
    <View style={styles.root}>
      <View style={[styles.header, { backgroundColor: planColor }]}> 
        <Image
          source={require('../../assets/webfinal-01.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerBottom}>
          <View>
            <Text style={styles.greeting}>Welcome, {firstName} </Text>
            <Text style={styles.subGreeting}>{user?.primary_service ?? 'Professional'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData() }}
            tintColor={planColor}
          />
        }
      >
        <TouchableOpacity
          activeOpacity={shouldShowUpgradeBanner ? 0.8 : 1}
          onPress={() => shouldShowUpgradeBanner && router.push('/(professional)/upgrade')}
        >
          <View style={[styles.planBadge, { borderColor: planColor }]}> 
            <View style={styles.planLeft}>
              <Star size={14} color={planColor} />
              <Text style={[styles.planText, { color: planColor }]}>{planLabel}</Text>
            </View>
            {shouldShowUpgradeBanner ? (
                <View style={styles.upgradeBtn}>
                    <Text style={[styles.upgradeText, { color: planColor }]}>{upgradeLabel}</Text>
                    <ChevronRight size={14} color={planColor} />
                  </View>
              ) : null}
                <TouchableOpacity style={styles.manageBtn} onPress={() => setPlanModalVisible(true)}>
                  <Text style={[styles.manageText, { color: planColor }]}>Manage</Text>
                  <ChevronRight size={14} color={planColor} />
                </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Star size={18} color={colors.warning} />
            <Text style={styles.statValue}>{stats ? stats.rating.toFixed(1) : '—'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Briefcase size={18} color={colors.primary} />
            <Text style={styles.statValue}>{stats?.completed_jobs ?? '—'}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Banknote size={18} color={colors.success} />
            <Text style={styles.statValue}>{stats ? `R${stats.total_earnings}` : '—'}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
            >
              {item.badgeCount && item.badgeCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeCount > 99 ? '99+' : item.badgeCount}</Text>
                </View>
              ) : null}
              {item.icon}
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.jobsSectionHeader}>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          <TouchableOpacity
            style={[styles.filterToggle, activeFilters && styles.filterToggleActive, { borderColor: planColor }, activeFilters && { backgroundColor: planColor }]}
            onPress={() => setActivePicker('service')}
          >
            <SlidersHorizontal size={14} color={activeFilters ? colors.white : planColor} />
            <Text style={[styles.filterToggleText, activeFilters && styles.filterToggleTextActive, { color: activeFilters ? colors.white : planColor }]}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setActivePicker('service')}
          >
            <Text style={[styles.filterPillText, { color: planColor }]} numberOfLines={1}>
              {selectedService.label}
            </Text>
            <ChevronDown size={12} color={planColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setActivePicker('location')}
          >
            <MapPin size={12} color={planColor} />
            <Text style={[styles.filterPillText, { color: planColor }]} numberOfLines={1}>
              {selectedLocation.label}
            </Text>
            <ChevronDown size={12} color={planColor} />
          </TouchableOpacity>

          {activeFilters && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSelectedService(SERVICES[0])
                setSelectedLocation(LOCATIONS[0])
                setLoading(true)
                fetchData('', '')
              }}
            >
              <X size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Briefcase size={32} color={colors.border} />
            <Text style={styles.emptyText}>No jobs available right now</Text>
            <Text style={styles.emptySubtext}>Try a different service or location</Text>
          </View>
        ) : (
          jobs.map(job => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                <View style={styles.budgetBadge}>
                  <Text style={[styles.budgetText, { color: planColor }]}>R{job.budget_min}–R{job.budget_max}</Text>
                </View>
              </View>
              <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={11} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={11} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{job.created_at?.slice(0, 10)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.bidBtn, { backgroundColor: planColor }, !planScope.canBid && styles.disabledButton]}
                onPress={() => (planScope.canBid ? openBidModal(job) : router.push('/(professional)/upgrade'))}
                disabled={!planScope.canBid}
              >
                <Text style={styles.bidBtnText}>{planScope.canBid ? 'Place Bid' : 'Upgrade to Bid'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={activePicker !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'service' ? 'Select Service' : 'Select Province'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activePicker === 'service' ? (
              <>
                <FlatList
                  data={SERVICES}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                      const isSelected = item.id === selectedService.id
                      return (
                        <TouchableOpacity
                          style={styles.modalRow}
                          onPress={() => applyServiceFilter(item)}
                        >
                          <Text style={[styles.modalRowText, isSelected && styles.modalRowTextActive, isSelected && { color: planColor }]}>
                            {item.label}
                          </Text>
                          {isSelected && <Check size={16} color={planColor} />}
                        </TouchableOpacity>
                      )
                    }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <TouchableOpacity
                  style={styles.switchPickerBtn}
                  onPress={() => setActivePicker('location')}
                >
                  <MapPin size={14} color={planColor} />
                  <Text style={[styles.switchPickerText, { color: planColor }]}>Switch to Province filter</Text>
                  <ChevronRight size={14} color={planColor} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <FlatList
                  data={LOCATIONS}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                      const isSelected = item.id === selectedLocation.id
                      return (
                        <TouchableOpacity
                          style={styles.modalRow}
                          onPress={() => applyLocationFilter(item)}
                        >
                          <Text style={[styles.modalRowText, isSelected && styles.modalRowTextActive, isSelected && { color: planColor }]}>
                            {item.label}
                          </Text>
                          {isSelected && <Check size={16} color={planColor} />}
                        </TouchableOpacity>
                      )
                    }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <TouchableOpacity
                  style={styles.switchPickerBtn}
                  onPress={() => setActivePicker('service')}
                >
                  <SlidersHorizontal size={14} color={planColor} />
                  <Text style={[styles.switchPickerText, { color: planColor }]}>Switch to Service filter</Text>
                  <ChevronRight size={14} color={planColor} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={planModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPlanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.planModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Plan</Text>
              <TouchableOpacity onPress={() => setPlanModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={{ marginBottom: 8, color: colors.textSecondary }}>Current plan: {planLabel}</Text>
              {normalizedPlanKey === 'elite' && (
                <TouchableOpacity
                  style={styles.planOption}
                  onPress={async () => await handleChangePlan('pro')}
                  disabled={changingPlan}
                >
                  <Text style={styles.planOptionText}>Downgrade to Pro</Text>
                </TouchableOpacity>
              )}

              {(normalizedPlanKey === 'elite' || normalizedPlanKey === 'pro') && (
                <TouchableOpacity
                  style={styles.planOption}
                  onPress={async () => await handleChangePlan('free')}
                  disabled={changingPlan}
                >
                  <Text style={styles.planOptionText}>Downgrade to Basic</Text>
                </TouchableOpacity>
              )}

              {changingPlan ? <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} /> : null}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={bidModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bidSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place a Bid</Text>
              <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.bidBody}>
              <Text style={styles.bidJobTitle}>{selectedJob?.title ?? 'Selected job'}</Text>
              <Text style={styles.bidJobMeta}>Suggested amount and notes for the client.</Text>

              <Text style={styles.inputLabel}>Your bid amount (R)</Text>
              <TextInput
                style={styles.input}
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder="e.g. 2500"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bidNotes}
                onChangeText={setBidNotes}
                placeholder="Tell the client why you are a good fit"
                multiline
                numberOfLines={4}
              />

              {bidMessage ? <Text style={styles.bidMessage}>{bidMessage}</Text> : null}

              <TouchableOpacity style={[styles.submitBidBtn, { backgroundColor: planColor }]} onPress={submitBid} disabled={placingBid}>
                {placingBid ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitBidText}>Submit Bid</Text>
                )}
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  greeting: { fontFamily: font.extraBold, fontSize: 22, color: colors.white },
  subGreeting: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

logo: { width: 110, height: 34, marginBottom: 12 },
headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', },

  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: radius.pill,
  },

  scroll: { padding: spacing.lg, paddingBottom: 40 },

  planBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planText: { fontFamily: font.bold, fontSize: 13 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  upgradeText: { fontFamily: font.bold, fontSize: 12, color: colors.primary },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontFamily: font.extraBold, fontSize: 14, color: colors.text },
  statLabel: { fontFamily: font.regular, fontSize: 11, color: colors.textSecondary },

  sectionTitle: { fontFamily: font.bold, fontSize: 15, color: colors.text, marginBottom: spacing.sm },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: font.bold, fontSize: 11, color: colors.white },
  actionLabel: { fontFamily: font.semiBold, fontSize: 10, color: colors.text, textAlign: 'center' },

  jobsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterToggleActive: { backgroundColor: colors.primary },
  filterToggleText: { fontFamily: font.semiBold, fontSize: 11, color: colors.primary },
  filterToggleTextActive: { color: colors.white },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e8edfb',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexShrink: 1,
  },
  filterPillText: {
    fontFamily: font.semiBold,
    fontSize: 11,
    color: colors.primary,
    flexShrink: 1,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { fontFamily: font.bold, fontSize: 14, color: colors.text },
  emptySubtext: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary },

  jobCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobTitle: { fontFamily: font.bold, fontSize: 14, color: colors.text, flex: 1, marginRight: 8 },
  budgetBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  budgetText: { fontFamily: font.bold, fontSize: 11, color: colors.primary },
  jobDesc: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  jobMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: font.regular, fontSize: 11, color: colors.textSecondary },
  bidBtn: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 10, alignItems: 'center' },
  bidBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.white },
  disabledButton: { backgroundColor: colors.border },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalRowText: { fontFamily: font.regular, fontSize: 14, color: colors.text },
  modalRowTextActive: { fontFamily: font.bold, color: colors.primary },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  switchPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 14,
    backgroundColor: '#e8edfb',
    borderRadius: radius.card,
  },
  switchPickerText: { flex: 1, fontFamily: font.semiBold, fontSize: 13, color: colors.primary },
  bidSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  bidBody: { paddingHorizontal: 20, paddingBottom: 8, paddingTop: 8 },
  bidJobTitle: { fontFamily: font.bold, fontSize: 15, color: colors.text },
  bidJobMeta: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 14 },
  inputLabel: { fontFamily: font.semiBold, fontSize: 12, color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  submitBidBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBidText: { fontFamily: font.bold, fontSize: 13, color: colors.white },
  bidMessage: { fontFamily: font.semiBold, fontSize: 12, color: colors.success, marginBottom: 10 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  manageText: { fontFamily: font.semiBold, fontSize: 12, color: colors.primary },

  planModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: '50%',
  },
  planOption: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: '#f7f9fc',
    marginBottom: 8,
  },
  planOptionText: { fontFamily: font.semiBold, fontSize: 14, color: colors.text },
})