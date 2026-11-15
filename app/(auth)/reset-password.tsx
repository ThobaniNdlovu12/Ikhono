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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react-native';
import { colors, font, spacing, radius } from '../../constants/theme';
import api from '../../services/api';

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset_password.php', { token, password });
      setDone(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = () => {
    if (password.length === 0) return 'transparent';
    if (password.length < 6) return '#dc2626';
    if (password.length < 8) return '#f59e0b';
    return '#16a34a';
  };

  const strengthLabel = () => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 8) return 'Fair';
    return 'Strong';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      {done ? (
        <View style={styles.centred}>
          <View style={styles.iconCircle}>
            <KeyRound size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Password Reset!</Text>
          <Text style={styles.subtitle}>
            Your password has been updated successfully. You can now log in with your new password.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>Go to Log In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.iconCircle}>
            <KeyRound size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password below.</Text>

          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              {showPassword
                ? <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                : <Eye size={18} color="rgba(255,255,255,0.5)" />}
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, { backgroundColor: strengthColor() }]} />
              <Text style={[styles.strengthLabel, { color: strengthColor() }]}>{strengthLabel()}</Text>
            </View>
          )}

          <View style={[styles.passwordWrap, { marginTop: spacing.sm }]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm new password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
              {showConfirm
                ? <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                : <Eye size={18} color="rgba(255,255,255,0.5)" />}
            </TouchableOpacity>
          </View>

          {confirm.length > 0 && password !== confirm && (
            <Text style={styles.matchError}>Passwords do not match</Text>
          )}

          <TouchableOpacity
            style={[styles.btn, { marginTop: spacing.xl }]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.primary} />
              : <Text style={styles.btnText}>Reset Password</Text>}
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
  centred: { width: '100%', alignItems: 'center' },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  passwordWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 14,
  },
  eyeBtn: { paddingHorizontal: spacing.md },
  strengthRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: font.semiBold,
    fontSize: 11,
    width: 40,
    textAlign: 'right',
  },
  matchError: {
    width: '100%',
    fontFamily: font.regular,
    fontSize: 12,
    color: '#f87171',
    marginTop: 6,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
});