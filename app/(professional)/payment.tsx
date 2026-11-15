import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { processPayment } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { colors, font, spacing, radius } from '../../constants/theme'

const PLAN_DATA = {
  pro: {
    label: 'Pro',
    price: 200,
    description: 'Upgrade to Pro for bids, portfolio uploads and better visibility.',
  },
  elite: {
    label: 'Elite',
    price: 500,
    description: 'Upgrade to Elite for priority matching, leads and premium support.',
  },
}

export default function ProfessionalPayment() {
  const params = useLocalSearchParams<{ plan?: 'pro' | 'elite' }>()
  const planKey = params.plan ?? 'pro'
  const plan = PLAN_DATA[planKey] ?? PLAN_DATA.pro
  const planColor = planKey === 'elite' ? colors.warning : colors.purple
  const { user, setUser } = useAuthStore()
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState(user?.full_name ?? '')
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)

  const cardMasked = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, '')
    return digits.length > 4 ? `**** **** **** ${digits.slice(-4)}` : cardNumber
  }, [cardNumber])

  useEffect(() => {
    if (!params.plan) {
      router.replace('/(professional)/upgrade')
    }
  }, [params.plan])

  const handleSubmit = async () => {
    const sanitizedCardNumber = cardNumber.replace(/\D/g, '')

    if (!sanitizedCardNumber || !cardName || !fullName || !email) {
      Alert.alert('Validation', 'Please fill in all required fields')
      return
    }

    if (sanitizedCardNumber.length !== 16) {
      Alert.alert('Validation', 'Please enter a valid 16-digit card number')
      return
    }

    console.log('User:', JSON.stringify(user))
    console.log('User ID:', user?.id)

    const userId = user?.legacy_id ? String(user.legacy_id) : user?.id

    setLoading(true)
    try {
      const response = await processPayment({
        plan: planKey,
        amount: plan.price,
        cardNumber: sanitizedCardNumber,
        cardName,
        fullName,
        email,
        user_id: userId,
      })

      if (response.data?.success) {
        if (user) {
          await setUser({
            ...user,
            plan: planKey,
          })
        }
        Alert.alert(
          'Upgrade Successful',
          `You are now on the ${plan.label} plan!`,
          [{ text: 'Go to Dashboard', onPress: () => router.replace('/(professional)/home') }]
        )
      } else {
        Alert.alert('Payment Failed', response.data?.message ?? 'Unable to process payment')
      }
    } catch (err: any) {
      console.error('Payment error', err)
      console.error('Server response:', JSON.stringify(err?.response?.data))
      const message = err?.response?.data?.message ?? err?.message ?? 'Something went wrong'
      Alert.alert('Payment Error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backHeader} onPress={() => router.replace('/(professional)/upgrade')}>
        <ArrowLeft size={18} color={planColor} />
        <Text style={[styles.backHeaderText, { color: planColor }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: planColor }]}>Upgrade to {plan.label}</Text>
      <Text style={[styles.subtitle, { color: planColor === colors.warning ? 'rgba(0,0,0,0.75)' : 'rgba(26,35,64,0.75)' }]}>{plan.description}</Text>

      <View style={[styles.summaryCard, { borderLeftColor: planColor }] }>
        <Text style={styles.summaryLabel}>Total amount</Text>
        <Text style={[styles.summaryAmount, { color: planColor }]}>R{plan.price} / month</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Card Number *</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(text) => setCardNumber(text.replace(/\D/g, ''))}
          placeholder="•••• •••• •••• ••••"
          keyboardType="number-pad"
          textContentType="creditCardNumber"
          autoComplete="cc-number"
          secureTextEntry
          maxLength={16}
        />
        {cardMasked ? <Text style={styles.cardHint}>Entered: {cardMasked}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Cardholder Name *</Text>
        <TextInput style={styles.input} value={cardName} onChangeText={setCardName} placeholder="Full name" />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email address" />
      </View>

      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: planColor }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Complete Payment</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.cancelBtn, { borderColor: planColor }]} onPress={() => router.replace('/(professional)/upgrade')}>
        <Text style={[styles.cancelBtnText, { color: planColor }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.surface },
  title: { fontFamily: font.bold, fontSize: 24, color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontFamily: font.regular, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  summaryCard: { padding: spacing.lg, borderRadius: radius.card, backgroundColor: '#F0F9FF', borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: spacing.lg },
  summaryLabel: { fontFamily: font.semiBold, fontSize: 12, color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  summaryAmount: { fontFamily: font.bold, fontSize: 24, color: colors.primary },
  fieldGroup: { marginBottom: spacing.md },
  label: { fontFamily: font.semiBold, fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: 12, fontFamily: font.regular, fontSize: 14, color: colors.text },
  cardHint: { marginTop: 6, fontFamily: font.regular, fontSize: 12, color: colors.textSecondary },
  submitBtn: { marginTop: spacing.xl, backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { fontFamily: font.bold, fontSize: 15, color: colors.white },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
  backHeaderText: { fontFamily: font.semiBold, fontSize: 14 },
  cancelBtn: { marginTop: spacing.sm, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.semiBold, fontSize: 13, color: colors.primary },
})
