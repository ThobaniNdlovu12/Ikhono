import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { colors, font, spacing, radius } from '../../constants/theme'
import { Star } from 'lucide-react-native'
import { useRouter } from 'expo-router'

export default function ArtisanCard({ artisan }: any) {
  const router = useRouter()
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/artisan/${artisan.id}`)}>
      <Image source={artisan.avatar ? { uri: artisan.avatar } : require('../../assets/webfinal-01.png')} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{artisan.name}</Text>
        <Text style={styles.service}>{artisan.service_type}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Star size={14} color={colors.warning} />
        <Text style={styles.rating}>{artisan.rating ?? '—'}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 8, marginRight: spacing.sm },
  name: { fontFamily: font.semiBold, color: colors.text },
  service: { fontFamily: font.regular, color: colors.textSecondary, fontSize: 12 },
  rating: { fontFamily: font.semiBold, color: colors.textSecondary, marginTop: 4 },
})
