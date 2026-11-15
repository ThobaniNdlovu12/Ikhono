import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  Droplets,
  Zap,
  Paintbrush,
  Hammer,
  Trees,
  Wind,
  Wrench,
  Layers,
  Waves,
  Shield,
  Flame,
  Building,
  Camera,
  Scissors,
  ChevronDown,
  Check,
  X,
  MapPin,
} from 'lucide-react-native';

const COLORS = {
  primary: '#1251c4',
  primaryDark: '#0a2d6b',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

const SERVICES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets, bg: '#e8edfb', color: '#1251c4' },
  { id: 'electrical', label: 'Electrical', icon: Zap, bg: '#fff8e1', color: '#f59e0b' },
  { id: 'painting', label: 'Painting', icon: Paintbrush, bg: '#fce8e8', color: '#dc2626' },
  { id: 'carpentry', label: 'Carpentry', icon: Hammer, bg: '#f0e8fb', color: '#7c3aed' },
  { id: 'tiling', label: 'Tiling', icon: Layers, bg: '#f5f0ff', color: '#6d28d9' },
  { id: 'waterproofing', label: 'Waterproofing', icon: Waves, bg: '#e0f2fe', color: '#0284c7' },
  { id: 'roof-gutters', label: 'Roof & Gutters', icon: Building, bg: '#fef3c7', color: '#d97706' },
  { id: 'general-maintenance', label: 'General Maintenance', icon: Wrench, bg: '#fef9e7', color: '#b45309' },
  { id: 'ceilings', label: 'Ceilings', icon: Building, bg: '#f0fdf4', color: '#15803d' },
  { id: 'drywalling', label: 'Drywalling', icon: Layers, bg: '#fdf4ff', color: '#a21caf' },
  { id: 'glazing-aluminum', label: 'Glazing / Aluminium', icon: Shield, bg: '#ecfeff', color: '#0e7490' },
  { id: 'welding-steelwork', label: 'Welding & Steelwork', icon: Flame, bg: '#fff1f2', color: '#be123c' },
  { id: 'bricklaying-plastering', label: 'Bricklaying & Plastering', icon: Building, bg: '#fafaf0', color: '#78716c' },
  { id: 'flooring', label: 'Flooring', icon: Layers, bg: '#fff7ed', color: '#c2410c' },
  { id: 'landscaping-garden', label: 'Landscaping & Garden', icon: Trees, bg: '#e8f5e9', color: '#2e7d32' },
  { id: 'paving', label: 'Paving', icon: Layers, bg: '#f5f5f4', color: '#57534e' },
  { id: 'built-in-cupboards', label: 'Built-in Cupboards', icon: Scissors, bg: '#fff0f6', color: '#db2777' },
  { id: 'hvac', label: 'Air Conditioning', icon: Wind, bg: '#e0f2fe', color: '#0284c7' },
  { id: 'cctv-security', label: 'CCTV & Security', icon: Camera, bg: '#f0fdf4', color: '#16a34a' },
  { id: 'high-pressure-cleaning', label: 'High-Pressure Cleaning', icon: Droplets, bg: '#eff6ff', color: '#2563eb' },
  { id: 'swimming-pool', label: 'Swimming Pools', icon: Waves, bg: '#e0f2fe', color: '#0369a1' },
];

const LOCATIONS = [
  { id: '', label: 'All Locations' },
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

export default function ServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const filtered = SERVICES.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Services</Text>

        <View style={styles.filtersRow}>
          <View style={styles.searchBar}>
            <Search size={14} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search a trade..."
              placeholderTextColor={COLORS.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.locationBtn}
            onPress={() => setLocationModalVisible(true)}
          >
            <MapPin size={13} color={COLORS.primary} />
            <Text style={styles.locationBtnText} numberOfLines={1}>
              {selectedLocation.label === 'All Locations' ? 'Location' : selectedLocation.label}
            </Text>
            <ChevronDown size={13} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {selectedLocation.id !== '' && (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>Showing: {selectedLocation.label}</Text>
            <TouchableOpacity onPress={() => setSelectedLocation(LOCATIONS[0])}>
              <X size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {filtered.map((service) => {
          const Icon = service.icon;
          return (
            <TouchableOpacity
              key={service.id}
              style={styles.tile}
              onPress={() =>
                router.push({
                  pathname: '/(client)/artisans',
                  params: { service: service.id, location: selectedLocation.id },
                })
              }
            >
              <View style={[styles.iconWrap, { backgroundColor: service.bg }]}>
                <Icon size={22} color={service.color} />
              </View>
              <Text style={styles.tileName}>{service.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <X size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={LOCATIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedLocation.id;
                return (
                  <TouchableOpacity
                    style={styles.locationRow}
                    onPress={() => {
                      setSelectedLocation(item);
                      setLocationModalVisible(false);
                    }}
                  >
                    <Text style={[styles.locationLabel, isSelected && styles.locationLabelActive]}>
                      {item.label}
                    </Text>
                    {isSelected && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e8edfb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 130,
  },
  locationBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    flexShrink: 1,
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#e8edfb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  activeFilterText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  tile: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  locationLabelActive: { color: COLORS.primary, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },
});