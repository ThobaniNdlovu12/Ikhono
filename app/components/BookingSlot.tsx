import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, font, radius } from '../../constants/theme'

export default function BookingSlot({ label, selected, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.slot, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  slot: { padding: 12, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef2fb', marginBottom: 8 },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontFamily: font.semiBold, textAlign: 'center' },
  textSelected: { color: '#fff' },
})
