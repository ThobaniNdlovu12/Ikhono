import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, font, spacing, radius } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const { loadUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      router.replace(
        `/(auth)/verify-email?email=${encodeURIComponent(email)}&mode=login`
      );
    } catch (err: any) {
      Alert.alert('Login Failed', err?.message ?? err?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/webfinal-01.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to your iKhono account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.4)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
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

      <TouchableOpacity
        style={styles.forgotWrap}
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.primary} />
          : <Text style={styles.btnText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
      </TouchableOpacity>
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
  logo: {
    width: 130,
    height: 42,
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  passwordWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
  },
  forgotWrap: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    fontFamily: font.semiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
  linkBold: {
    fontFamily: font.bold,
    color: colors.white,
  },
});