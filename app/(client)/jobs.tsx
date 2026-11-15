import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, ChevronRight, Check, Clock, Star, Briefcase } from 'lucide-react-native';
import { getJobs } from '../../services/api';

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
};

type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

type Job = {
  id: number;
  title: string;
  service_type: string;
  location: string;
  status: JobStatus;
  created_at: string;
  artisan_name?: string;
  artisan_rating?: number;
  bid_count?: number;
};

const STATUS_CONFIG: Record<JobStatus, { label: string; bg: string; color: string }> = {
  open: { label: 'Open', bg: '#e8edfb', color: '#1251c4' },
  in_progress: { label: 'In Progress', bg: COLORS.amberBg, color: COLORS.amber },
  completed: { label: 'Done ✓', bg: COLORS.greenBg, color: COLORS.green },
  cancelled: { label: 'Cancelled', bg: '#fce8e8', color: '#dc2626' },
};

const PROGRESS_STEPS = [
  { key: 'posted', label: 'Posted' },
  { key: 'matched', label: 'Matched' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'rate', label: 'Rate' },
];

function getStepIndex(status: JobStatus) {
  if (status === 'open') return 0;
  if (status === 'in_progress') return 2;
  if (status === 'completed') return 3;
  return 0;
}

function JobProgressBar({ status }: { status: JobStatus }) {
  const activeIndex = getStepIndex(status);
  return (
    <View>
      <View style={styles.progressLine}>
        {PROGRESS_STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <View
              key={step.key}
              style={{ flexDirection: 'row', alignItems: 'center', flex: i < PROGRESS_STEPS.length - 1 ? 1 : 0 }}
            >
              <View style={[styles.progDot, isDone && styles.progDotDone, isActive && styles.progDotActive]}>
                {isDone && <Check size={9} color="#fff" />}
                {isActive && <Clock size={9} color={COLORS.primary} />}
                {!isDone && !isActive && <Star size={9} color={COLORS.textSecondary} />}
              </View>
              {i < PROGRESS_STEPS.length - 1 && (
                <View style={[styles.progConnector, isDone && styles.progConnectorDone]} />
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.progressLabels}>
        {PROGRESS_STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <Text
              key={step.key}
              style={[styles.progLabel, isDone && styles.progLabelDone, isActive && styles.progLabelActive]}
            >
              {step.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | JobStatus>('all');

  async function fetchJobs() {
    try {
      const res = await getJobs();
      setJobs(res.data.data ?? []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
  useCallback(() => {
    fetchJobs()
  }, [])
)

  const filteredJobs = activeFilter === 'all' ? jobs : jobs.filter((j) => j.status === activeFilter);
  const sortedJobs = [...filteredJobs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const activeJob = jobs.find((j) => j.status === 'in_progress');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a2d6b', '#1251c4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Job Tracker</Text>
        {activeJob && (
          <Text style={styles.headerSub}>#{`JOB-${activeJob.id}`} · {activeJob.service_type}</Text>
        )}
        <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/(client)/post-job')}>
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchJobs(); }}
            tintColor={COLORS.primary}
          />
        }
      >
        {activeJob && (
          <View style={styles.activeJobCard}>
            <Text style={styles.activeJobTitle}>{activeJob.title}</Text>
            <Text style={styles.activeJobSub}>
              {activeJob.location}
              {activeJob.artisan_name ? ` · ${activeJob.artisan_name}` : ''}
            </Text>
            <JobProgressBar status={activeJob.status} />
            {activeJob.artisan_name && (
              <View style={styles.artisanRow}>
                <View style={styles.artisanAvatar}>
                  <Text style={styles.artisanAvatarText}>
                    {activeJob.artisan_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.artisanName}>{activeJob.artisan_name}</Text>
                  <Text style={styles.artisanTrade}>
                    {activeJob.service_type}
                    {activeJob.artisan_rating ? ` · ★ ${activeJob.artisan_rating}` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['all', 'open', 'in_progress', 'completed'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            {activeFilter === 'all' ? 'All Jobs' : STATUS_CONFIG[activeFilter].label}
          </Text>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
          ) : sortedJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Briefcase size={36} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No jobs here</Text>
              <Text style={styles.emptySub}>Post a job to get started</Text>
            </View>
          ) : (
            sortedJobs.map((job) => {
              const cfg = STATUS_CONFIG[job.status];
              return (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobRow}
                  onPress={() =>
                    router.push({ pathname: '/(client)/jobs/[id]', params: { id: job.id } })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobMeta}>
                      {new Date(job.created_at).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      · {job.service_type}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <ChevronRight size={14} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  postBtn: {
    position: 'absolute',
    right: 20,
    top: 52,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeJobCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeJobTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  activeJobSub: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 14 },
  progressLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  progDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e8edfb',
    borderWidth: 2,
    borderColor: '#e4e9f5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progDotDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  progDotActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  progConnector: { flex: 1, height: 2, backgroundColor: '#e4e9f5', marginHorizontal: -2 },
  progConnectorDone: { backgroundColor: COLORS.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  progLabel: { flex: 1, fontSize: 9, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  progLabelDone: { color: COLORS.textPrimary },
  progLabelActive: { color: COLORS.primary, fontWeight: '700' },
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
  },
  artisanAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e8edfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artisanAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  artisanName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  artisanTrade: { fontSize: 11, color: COLORS.textSecondary },
  listSection: { paddingHorizontal: 16, marginTop: 4 },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e4e9f5',
  },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#334' },
  filterLabelActive: { color: '#fff' },
  listTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },
  jobRow: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  jobMeta: { fontSize: 11, color: COLORS.textSecondary },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
});