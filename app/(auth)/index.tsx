import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { colors, font, radius, spacing } from '../../constants/theme';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <Image
        source={require('../../assets/webfinal-01.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.subtitle}>
        Connecting You To Skilled{'\n'}Artisans You Can Trust
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Find an Artisan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push('/(auth)/signup?type=professional')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Join as an Artisan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tagline}>ikhono.africa</Text>
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
  circleTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circleBottomLeft: {
    position: 'absolute', bottom: -50, left: -50,
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 32,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  btnPrimary: {
    backgroundColor: colors.white,
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
  btnOutline: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnOutlineText: {
    fontFamily: font.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  tagline: {
    fontFamily: font.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: spacing.xl,
  },
});