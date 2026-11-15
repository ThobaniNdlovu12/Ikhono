import React, { useEffect, useRef } from 'react'
import { Modal, View, StyleSheet, TouchableOpacity, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { colors, radius } from '../../constants/theme'

export default function BottomSheet({ visible, onClose, children }: any) {
  const translateY = useRef(new Animated.Value(300)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 300,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}> 
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  container: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, borderColor: '#eee', borderWidth: 1 },
})
