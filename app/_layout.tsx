import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const { user, isLoading, loadUser } = useAuthStore();
  const segments = useSegments();

  const isInAuthRoute = segments?.[0] === '(auth)';

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;
    if (user) {
      if (user.verified !== true) {
        if (!isInAuthRoute) {
          router.replace('/(auth)/verify-email');
        }
      } else {
        router.replace(
          user.type === 'professional'
            ? '/(professional)/home'
            : '/(client)/home'
        );
      }
    } else if (!isInAuthRoute) {
      router.replace('/(auth)');
    }
  }, [user, isLoading, fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryDark }}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(professional)" />
      </Stack>
    </SafeAreaProvider>
  );
}