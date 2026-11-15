import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing } from '../../constants/theme'

export default function JobStatusBar({ steps = ['Booked', 'Matched', 'In Progress', 'Completed'], current = 0 }: any) {
  return (
    <View style={styles.row}>
      {steps.map((s: string, i: number) => {
        const active = i <= current
        return (
          <React.Fragment key={s}>
            <View style={styles.step}>
              <View style={[styles.dot, active ? styles.dotActive : styles.dotInactive]} />
              <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.connector, i < current ? styles.connectorActive : null]} />
            )}
          </React.Fragment>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  step: { alignItems: 'center', width: 80 },
  dot: { width: 14, height: 14, borderRadius: 10, marginBottom: 6 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.border },
  label: { fontFamily: font.semiBold, fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  labelActive: { color: colors.text },
  connector: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 6 },
  connectorActive: { backgroundColor: colors.primary },
})
