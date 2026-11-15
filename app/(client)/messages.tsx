import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { getConversations } from '../../services/messaging';
import { useAuthStore } from '../../store/authStore';
import { colors, font, spacing } from '../../constants/theme';
import { supabase } from '../../services/supabase';

type Conversation = {
  id: string;
  last_message: string | null;
  last_message_at: string;
  clients?: { id: string; full_name: string };
  professionals?: { id: string; full_name: string; primary_service: string };
};

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      let channel: any = null;

      async function loadConversations() {
        if (!user?.id) return;
        setLoading(true);
        try {
          const data = await getConversations(user.id, user.type);
          if (mounted) setConversations(data);
        } finally {
          if (mounted) setLoading(false);
        }
      }

      loadConversations();

      if (user?.id) {
        const channelName = `conversations:${user.type}:${user.id}`;
        const existing = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
        if (existing) {
          supabase.removeChannel(existing);
        }

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'conversations',
              filter: `${user.type === 'client' ? 'client_id' : 'professional_id'}=eq.${user.id}`,
            },
            loadConversations
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'conversations',
              filter: `${user.type === 'client' ? 'client_id' : 'professional_id'}=eq.${user.id}`,
            },
            loadConversations
          )
          .subscribe();
      }

      return () => {
        mounted = false;
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }, [user?.id, user?.type])
  );

  function getOtherName(conv: Conversation) {
    return user?.type === 'client'
      ? conv.professionals?.full_name
      : conv.clients?.full_name;
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(client)')} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <MessageCircle size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>
            Start a conversation by browsing artisans and tapping Chat.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convItem}
              onPress={() =>
                router.push({
                  pathname: '/(client)/chat/[conversationId]',
                  params: {
                    conversationId: item.id,
                    otherName: getOtherName(item),
                  },
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getOtherName(item)?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={styles.convBody}>
                <View style={styles.convTop}>
                  <Text style={styles.convName}>{getOtherName(item)}</Text>
                  <Text style={styles.convTime}>{formatTime(item.last_message_at)}</Text>
                </View>
                <Text style={styles.convLast} numberOfLines={1}>
                  {item.last_message ?? 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.extraBold, fontSize: 24, color: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: font.bold, fontSize: 18, color: '#1a2340', marginTop: 16, marginBottom: 8 },
  emptySub: { fontFamily: font.regular, fontSize: 14, color: '#9aa3b5', textAlign: 'center', lineHeight: 22 },
  convItem: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f9',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e8edfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.bold, fontSize: 18, color: colors.primary },
  convBody: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontFamily: font.bold, fontSize: 14, color: '#1a2340' },
  convTime: { fontFamily: font.regular, fontSize: 11, color: '#9aa3b5' },
  convLast: { fontFamily: font.regular, fontSize: 13, color: '#9aa3b5' },
});