import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { colors, font, spacing, radius } from '../../constants/theme';

export default function VerifyEmail() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { loadUser, clearUser } = useAuthStore();
  const email = params.email ?? '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(120);
  const otpSentRef = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sendVerificationOtp = useCallback(async () => {
    if (!email) return;
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) throw otpError;
      setMessage(`A verification code has been sent to ${email}.`);
      setExpiryCountdown(120);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to send verification code.');
    }
  }, [email]);

  useEffect(() => {
    if (!email || otpSentRef.current) return;
    otpSentRef.current = true;
    sendVerificationOtp();
  }, [email, sendVerificationOtp]);

  useEffect(() => {
    if (expiryCountdown <= 0) return;
    const interval = setInterval(() => {
      setExpiryCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryCountdown]);

  const handleResend = async () => {
    if (resending || expiryCountdown > 0) return;
    setResending(true);
    setError('');
    await sendVerificationOtp();
    setResending(false);
  };

  const handleVerify = async () => {
    if (code.length !== 6 || !email) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      await loadUser();
      const currentUser = useAuthStore.getState().user;
      const destination = currentUser?.type === 'professional' ? '/(professional)/home' : '/(client)/home';
      router.replace(destination);
    } catch (err: any) {
      setError(err?.message ?? 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await clearUser();
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{''}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="rgba(255,255,255,0.5)"
          textAlign="center"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {expiryCountdown > 0 ? (
          <Text style={styles.message}>Code expires in {Math.floor(expiryCountdown / 60)}:{String(expiryCountdown % 60).padStart(2, '0')}</Text>
        ) : (
          <Text style={styles.error}>Code expired. Please resend to continue.</Text>
        )}

        <TouchableOpacity
          style={[styles.btn, (code.length !== 6 || expiryCountdown === 0) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6 || expiryCountdown === 0}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resend}
          onPress={handleResend}
          disabled={resending || expiryCountdown > 0}
        >
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : 'Resend code'}
          </Text>
        </TouchableOpacity>
        {expiryCountdown > 0 ? (
          <Text style={styles.resendMessage}>Resend available in {Math.floor(expiryCountdown / 60)}:{String(expiryCountdown % 60).padStart(2, '0')}</Text>
        ) : null}

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 26,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  email: {
    fontFamily: font.bold,
    color: colors.white,
  },
  input: {
    fontSize: 32,
    fontFamily: font.extraBold,
    letterSpacing: 12,
    borderBottomWidth: 2,
    borderColor: colors.white,
    color: colors.white,
    paddingVertical: 12,
    marginBottom: spacing.lg,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  btn: {
    backgroundColor: '#3451D1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontFamily: font.bold,
    fontSize: 15,
  },
  resend: {
    marginTop: 0,
    alignItems: 'center',
  },
  resendText: {
    color: '#3451D1',
    fontFamily: font.semiBold,
    fontSize: 13,
  },
  resendMessage: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: 13,
    textAlign: 'center',
  },
  signOut: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.white,
    fontFamily: font.semiBold,
    fontSize: 13,
  },
});