import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Search, Droplets, Zap, Paintbrush, Hammer, Wrench, Star, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { getJobs, getPublicProfessionals } from '../../services/api';

const COLORS = {
  primary: '#1251c4',
  primaryDark: '#0a2d6b',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
  amber: '#f59e0b',
};

const SERVICE_CATEGORIES = [
  { id: '', label: 'All', icon: Wrench },
  { id: 'plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'painting', label: 'Painting', icon: Paintbrush },
  { id: 'carpentry', label: 'Carpentry', icon: Hammer },
  { id: 'tiling', label: 'Tiling', icon: Paintbrush },
  { id: 'waterproofing', label: 'Waterproofing', icon: Droplets },
  { id: 'roof-gutters', label: 'Roof & Gutters', icon: Hammer },
  { id: 'general-maintenance', label: 'General Maintenance', icon: Hammer },
  { id: 'ceilings', label: 'Ceilings', icon: Hammer },
  { id: 'drywalling', label: 'Drywalling', icon: Hammer },
  { id: 'glazing-aluminum', label: 'Glazing / Aluminum Work', icon: Zap },
  { id: 'welding-steelwork', label: 'Welding & Steelwork', icon: Hammer },
  { id: 'bricklaying-plastering', label: 'Bricklaying & Plastering', icon: Hammer },
  { id: 'flooring', label: 'Flooring', icon: Paintbrush },
  { id: 'landscaping-garden', label: 'Landscaping & Garden', icon: Hammer },
  { id: 'paving', label: 'Paving', icon: Hammer },
  { id: 'built-in-cupboards', label: 'Built-in Cupboards', icon: Hammer },
  { id: 'hvac', label: 'Air Conditioning (HVAC)', icon: Zap },
  { id: 'cctv-security', label: 'CCTV & Security Systems', icon: Zap },
  { id: 'high-pressure-cleaning', label: 'High-Pressure Cleaning', icon: Droplets },
  { id: 'swimming-pool', label: 'Swimming Pool Installation & Repairs', icon: Droplets },
];

const AVATAR_COLORS = [
  { bg: '#e8edfb', text: '#1251c4' },
  { bg: '#fff0e8', text: '#c05c1a' },
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#f0e8fb', text: '#7c3aed' },
];

type Job = {
  id: number;
  title: string;
  service_type: string;
  location: string;
  budget?: string;
  created_at: string;
};

type Artisan = {
  id: number;
  full_name: string;
  primary_service: string;
  location: string;
  rating?: string | number;
  total_jobs: number;
  total_reviews?: string | number;
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ClientHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      setArtisans([]);

      async function fetchData() {
        try {
          const [jobsRes, artisansRes] = await Promise.all([
            getJobs(),
            getPublicProfessionals(activeCategory, ''),
          ]);
          if (!mounted) return;
          setJobs(jobsRes.data.data ?? []);
          setArtisans(artisansRes.data.professionals ?? []);
        } catch (err: any) {
          console.error('fetch error:', err?.message);
          if (!mounted) return;
          setArtisans([]);
        } finally {
          if (mounted) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      }

      fetchData();
      return () => { mounted = false; };
    }, [activeCategory])
  );

  function onRefresh() {
    setRefreshing(true);
    setActiveCategory((prev) => prev);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a2d6b', '#1251c4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Image
            source={require('../../assets/webfinal-01.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(client)/notifications')}
          >
            <Bell size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
        <Text style={styles.subGreeting}>What needs fixing today?</Text>
        <View style={styles.searchBar}>
          <Search size={16} color="#b0b9d0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a service or artisan..."
            placeholderTextColor="#b0b9d0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() =>
              router.push({ pathname: '/(client)/services', params: { q: searchQuery } })
            }
            returnKeyType="search"
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Icon size={13} color={isActive ? '#fff' : '#334'} />
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Near You</Text>
          <TouchableOpacity onPress={() => router.push('/(client)/services')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artisanScroll}
          >
            {artisans.length > 0 ? artisans.map((artisan, i) => {
              const colors = getAvatarColor(i);
              return (
                <TouchableOpacity
                  key={artisan.id}
                  style={styles.artisanCard}
                  onPress={() =>
                    router.push({ pathname: '/(client)/artisan/[id]', params: { id: artisan.id } })
                  }
                >
                  <View style={[styles.artisanAvatar, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.artisanAvatarText, { color: colors.text }]}>
                      {getInitials(artisan.full_name)}
                    </Text>
                  </View>
                  <Text style={styles.artisanName} numberOfLines={1}>{artisan.full_name}</Text>
                  <Text style={styles.artisanTrade} numberOfLines={1}>
                    {artisan.primary_service} · {artisan.location}
                  </Text>
                  <View style={styles.artisanRating}>
                    <Star size={10} color={COLORS.amber} fill={COLORS.amber} />
                    <Text style={styles.artisanRatingText}>
                      {Number(artisan.rating ?? 0).toFixed(1)} · {Number(artisan.total_reviews ?? 0)} reviews
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, paddingVertical: 12 }}>
                No artisans found for this category.
              </Text>
            )}
          </ScrollView>
        )}

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Recent Jobs Posted</Text>
          <TouchableOpacity onPress={() => router.push('/(client)/post-job')}>
            <Text style={styles.seeAll}>+ Post a Job</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No jobs posted yet</Text>
            <Text style={styles.emptySub}>Post your first job to get quotes from artisans</Text>
            <TouchableOpacity
              style={styles.postJobBtn}
              onPress={() => router.push('/(client)/post-job')}
            >
              <Text style={styles.postJobBtnText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.slice(0, 3).map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push({ pathname: '/(client)/jobs/[id]', params: { id: job.id } })}
            >
              <View style={styles.jobCardInner}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMeta}>{job.service_type} · {job.location}</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { width: 110, height: 34 },
  notifBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  searchBar: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary },
  body: { flex: 1, paddingHorizontal: 16 },
  bodyContent: { paddingBottom: 100 },
  categoryScroll: { paddingVertical: 16, gap: 8 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e4e9f5', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 7 },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#334' },
  categoryLabelActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  artisanScroll: { gap: 12, paddingBottom: 4 },
  artisanCard: { width: 140, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  artisanAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  artisanAvatarText: { fontSize: 14, fontWeight: '800' },
  artisanName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  artisanTrade: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  artisanRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artisanRatingText: { fontSize: 11, color: COLORS.amber, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  postJobBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  postJobBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  jobCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  jobCardInner: { flex: 1 },
  jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  jobMeta: { fontSize: 12, color: COLORS.textSecondary },
});