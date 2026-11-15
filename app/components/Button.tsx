import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, font, radius, spacing } from '../../constants/theme'

export default function Button({ children, onPress, style, disabled }: any) {
  return (
    <TouchableOpacity style={[styles.btn, style, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center' },
  text: { color: '#fff', fontFamily: font.bold },
  disabled: { opacity: 0.6, backgroundColor: '#ddd' },
})
