import React from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { colors, font, radius } from '../../constants/theme'

export default function Input(props: any) {
  return <TextInput placeholderTextColor={colors.textSecondary} style={[styles.input, props.style]} {...props} />
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.white, borderRadius: radius.input, borderWidth: 1, borderColor: '#eef2fb', paddingHorizontal: 12, paddingVertical: 10, fontFamily: font.regular, color: colors.text },
})
