import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import api from '../../services/api'
import { colors, font, spacing, radius } from '../../constants/theme'
import BookingSlot from '../components/BookingSlot'

export default function BookingFlow() {
  const params = useLocalSearchParams<{ id?: string }>()
  const artisanId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [artisan, setArtisan] = useState<any | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!artisanId) return setLoading(false)
      try {
        const res = await api.get('/dashboard.php', { params: { action: 'artisan_profile', artisan_id: artisanId } })
        if (mounted && res.data?.success) setArtisan(res.data.artisan)
        // load available slots (mocked here or from API)
        if (mounted) setSlots(['09:00', '10:30', '13:00', '15:30'])
      } catch (err) {
        console.warn('booking load', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [artisanId])

  async function confirmBooking() {
    if (!selectedSlot) return Alert.alert('Select a slot', 'Please choose a time slot')
    try {
      setLoading(true)
      const res = await api.post('/bookings.php', { artisan_id: artisanId, slot: selectedSlot })
      if (res.data?.success) {
        Alert.alert('Booked', 'Your booking is confirmed', [{ text: 'OK', onPress: () => router.replace('/(professional)/home') }])
      } else {
        Alert.alert('Unable to book', res.data?.message ?? 'Try again')
      }
    } catch (err) {
      console.warn('booking confirm', err)
      Alert.alert('Error', 'Unable to create booking right now')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book {artisan?.name ?? 'Artisan'}</Text>
      <Text style={styles.subtitle}>Select an available time slot</Text>

      <View style={{ marginTop: spacing.lg }}>
        {slots.map(s => (
          <BookingSlot key={s} label={s} selected={selectedSlot === s} onPress={() => setSelectedSlot(s)} />
        ))}
      </View>

      <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.warning }]} onPress={confirmBooking}>
        <Text style={styles.confirmText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.surface, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  confirmBtn: { marginTop: spacing.lg, padding: 14, borderRadius: radius.button, alignItems: 'center' },
  confirmText: { color: '#fff', fontFamily: font.bold },
})
