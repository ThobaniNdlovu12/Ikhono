import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../../constants/theme'

export default function Card({ children, style }: any) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
})
