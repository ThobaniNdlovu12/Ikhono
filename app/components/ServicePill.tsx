import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, font, radius, spacing } from '../../constants/theme'

export default function ServicePill({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: { backgroundColor: '#eef4ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  text: { color: colors.primary, fontFamily: font.semiBold, fontSize: 12 },
})
