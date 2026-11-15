import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, LayoutGrid, ClipboardList, User, MessageCircle } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getUnreadMessageCount } from '../../services/messaging';
import { supabase } from '../../services/supabase';

const COLORS = {
  primary: '#1251c4',
  textSecondary: '#9aa3b5',
  white: '#ffffff',
  border: '#eef1f9',
};

export default function ClientLayout() {
  const user = useAuthStore((s) => s.user);
  const [messageBadgeCount, setMessageBadgeCount] = useState(0);

  useEffect(() => {
    const currentUser = user;
    if (!currentUser?.id || !currentUser?.type) {
      setMessageBadgeCount(0);
      return;
    }

    const userId = currentUser.id;
    const userType = currentUser.type;

    let mounted = true;
    let channel: any = null;

    async function loadUnreadCount() {
      try {
        const count = await getUnreadMessageCount(userId, userType);
        if (mounted) setMessageBadgeCount(count);
      } catch (err) {
        console.error('[CLIENT LAYOUT] unread count failed:', err);
      }
    }

    loadUnreadCount();

    channel = supabase
      .channel(`messages:unread:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadUnreadCount)
      .subscribe();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, user?.type]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 100,
          paddingBottom: 34,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <LayoutGrid size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: messageBadgeCount > 0 ? `${messageBadgeCount}` : undefined,
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen name="chat/[conversationId]" options={{ href: null }} />

      <Tabs.Screen name="post-job" options={{ href: null }} />
      <Tabs.Screen name="artisans" options={{ href: null }} />
      <Tabs.Screen name="jobs/[id]" options={{ href: null }} />
      <Tabs.Screen name="security" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}