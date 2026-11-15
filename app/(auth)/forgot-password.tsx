import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { colors, font, spacing, radius } from '../../constants/theme';
import { requestPasswordReset } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequest = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      {sent ? (
        <View style={styles.successWrap}>
          <View style={styles.iconCircle}>
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.hint}>
            Didn't receive it? Check your spam folder or try again.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => setSent(false)}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.link}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.iconCircle}>
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.btn} onPress={handleRequest} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.primary} />
              : <Text style={styles.btnText}>Send Reset Link</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Back to Log In</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successWrap: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 26,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: font.bold,
    color: colors.white,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 14,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btn: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
  link: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.lg,
  },
});