import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Star, MessageCircle, ChevronRight, Search } from 'lucide-react-native';
import { getPublicProfessionals } from '../../services/api';
import { getOrCreateConversation, getSupabaseProfessionalIdByLegacyId } from '../../services/messaging';
import { useAuthStore } from '../../store/authStore';

const COLORS = {
  primary: '#1251c4',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
  success: '#2e7d32',
  muted: '#6b7280',
};

const LOCATIONS = [
  { id: '', label: 'Any location' },
  { id: 'johannesburg', label: 'Johannesburg' },
  { id: 'cape-town', label: 'Cape Town' },
  { id: 'durban', label: 'Durban' },
  { id: 'pretoria', label: 'Pretoria' },
  { id: 'mahikeng', label: 'Mahikeng' },
  { id: 'upington', label: 'Upington' },
  { id: 'kimberley', label: 'Kimberley' },
  { id: 'pietermaritzburg', label: 'Pietermaritzburg' },
  { id: 'thohoyandou', label: 'Thohoyandou' },
  { id: 'polokwane', label: 'Polokwane' },
  { id: 'bloemfontein', label: 'Bloemfontein' },
  { id: 'mbombela', label: 'Mbombela' },
];

type Artisan = {
  id?: number;
  artisan_id?: number;
  full_name?: string;
  name?: string;
  primary_service?: string;
  service_type?: string;
  location?: string;
  rating?: string | number;
  total_jobs?: string | number;
  total_reviews?: string | number;
  rate?: number;
  hourly_rate?: number;
  available?: string | boolean;
};

export default function ArtisanSearch() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{ service?: string; location?: string }>();
  const service = params.service ?? '';
  const location = params.location ?? '';
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedLocation = LOCATIONS.find((item) => item.id === location) ?? LOCATIONS[0];

  useEffect(() => {
    let mounted = true;

    async function loadArtisans() {
      setLoading(true);
      try {
        if (!service) {
          setArtisans([]);
          return;
        }

        const res = await getPublicProfessionals(service, location);
        if (!mounted) return;
        setArtisans(res.data.professionals ?? []);
      } catch (err: any) {
        if (mounted) setArtisans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadArtisans();
    return () => {
      mounted = false;
    };
  }, [service, location]);

  async function openChat(artisan: Artisan) {
    if (!user?.id) {
      return;
    }

    try {
      const legacyId = artisan.id ?? artisan.artisan_id;
      if (!legacyId) throw new Error('Missing artisan id');

      const professionalId = await getSupabaseProfessionalIdByLegacyId(legacyId);

      const conversation = await getOrCreateConversation(user.id, professionalId);

      router.push({
        pathname: '/(client)/chat/[conversationId]',
        params: {
          conversationId: conversation.id,
          otherName: artisan.full_name ?? artisan.name ?? 'Artisan',
        },
      });
    } catch (err) {
      console.error('Chat error:', err);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Artisans for {service || 'your service'}</Text>
          <View style={styles.locationTag}>
            <MapPin size={14} color={COLORS.primary} />
            <Text style={styles.locationLabel}>{selectedLocation.label}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Find artisans offering this service in the selected city, with ratings, hourly rate, reviews, and chat access.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <Search size={14} color={COLORS.textSecondary} />
        <Text style={styles.searchText}>Filtered by service and location</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : !service ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Choose a service first</Text>
            <Text style={styles.emptyText}>Go back to services and pick the trade you need.</Text>
          </View>
        ) : artisans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No artisans found</Text>
            <Text style={styles.emptyText}>Try another location or service.</Text>
          </View>
        ) : (
          artisans.map((artisan) => {
            const name = artisan.full_name ?? artisan.name ?? 'Artisan';
            const trade = artisan.primary_service ?? artisan.service_type ?? service;
            const rating = Number(artisan.rating ?? 0);
            const jobs = Number(artisan.total_jobs ?? artisan.total_reviews ?? 0);
            const rate = artisan.rate ?? artisan.hourly_rate ?? null;
            const availability = artisan.available ? 'Available now' : 'Availability may vary';
            const artisanId = String(artisan.id ?? artisan.artisan_id ?? '');

            return (
              <View key={artisanId || name} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{name}</Text>
                    <Text style={styles.cardMeta}>{trade} · {artisan.location ?? selectedLocation.label}</Text>
                  </View>
                  <View style={styles.rateBadge}>
                    <Text style={styles.rateText}>{rate ? `R${rate}/hr` : 'Rate unknown'}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBlock}>
                    <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statValue}>{jobs}</Text>
                    <Text style={styles.statLabel}>Jobs</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statValue}>{availability}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(artisan)}>
                    <MessageCircle size={16} color={COLORS.primary} />
                    <Text style={styles.chatLabel}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => router.push({ pathname: '/artisan/[id]', params: { id: artisanId } })}
                  >
                    <Text style={styles.viewLabel}>View profile</Text>
                    <ChevronRight size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: COLORS.white, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef3ff', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  locationLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8, lineHeight: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchText: { color: COLORS.textSecondary, fontSize: 13 },
  list: { paddingHorizontal: 20, paddingVertical: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  cardMeta: { fontSize: 12, color: COLORS.textSecondary },
  rateBadge: { backgroundColor: '#e8edfb', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  rateText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBlock: { flex: 1, minWidth: 90 },
  statValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16, alignItems: 'center' },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f1f5ff', borderRadius: 14, paddingVertical: 12 },
  chatLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14 },
  viewLabel: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  emptyState: { marginTop: 40, paddingHorizontal: 20, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
