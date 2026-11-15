import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, font, radius, spacing } from '../../constants/theme'

export default function Badge({ children, color = colors.primary }: any) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={styles.text}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontFamily: font.semiBold, fontSize: 12 },
})
