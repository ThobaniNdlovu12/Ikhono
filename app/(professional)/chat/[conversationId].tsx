import { ChatAttachment } from '../../../components/ChatAttachment'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Paperclip, Send } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../../services/supabase'
import { getMessages, sendMessage, markMessagesRead, uploadChatAttachment } from '../../../services/messaging'
import { useAuthStore } from '../../../store/authStore'
import { colors, font, radius, spacing } from '../../../constants/theme'

type Message = {
  id: string
  sender_id: string
  sender_type: string
  content: string
  read: boolean
  created_at: string
  attachment_url?: string | null
  attachment_type?: string | null
}

export default function ConversationScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ conversationId?: string; otherName?: string }>()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const insets = useSafeAreaInsets()

  const conversationId = params.conversationId ?? ''
  const otherName = params.otherName ?? 'Conversation'

  const isOwnMessage = useMemo(
    () => (message: Message) => message.sender_id === user?.id,
    [user?.id]
  )

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!conversationId) return
      setLoading(true)
      try {
        const data = await getMessages(conversationId)
        if (mounted) setMessages(data)
        if (user?.id) {
          await markMessagesRead(conversationId, user.id)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    if (conversationId) {
      subscriptionRef.current = supabase
        .channel(`messages:conversation:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
          const incoming = payload.new as Message
          setMessages((prev) => {
            const withoutTemp = prev.filter((message) => !(message.id.startsWith('temp-') && message.content === incoming.content && message.sender_id === incoming.sender_id))
            return [...withoutTemp, incoming]
          })
          if (user?.id) {
            markMessagesRead(conversationId, user.id)
          }
        })
        .subscribe()
    }

    return () => {
      mounted = false
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [conversationId, user?.id])

  async function handleAttach() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })

    if (result.canceled || !result.assets.length) return

    const asset = result.assets[0]
    if (!user?.id || !conversationId) return

    setUploading(true)
    try {
      const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`
      const attachmentPath = await uploadChatAttachment(conversationId, asset.uri, fileName, asset.mimeType)
      await sendMessage(conversationId, user.id, user.type, '', attachmentPath, 'image')
    } catch (err) {
      console.error('Attachment upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSend() {
    const content = text.trim()
    if (!content || !conversationId || !user?.id) return

    setText('')
    setSending(true)

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      sender_type: user.type,
      content,
      read: false,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])

    try {
      await sendMessage(conversationId, user.id, user.type, content)
    } catch (err) {
      console.error('Send message failed', err)
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id))
    } finally {
      setSending(false)
    }
  }

  function renderItem({ item }: { item: Message }) {
    const own = isOwnMessage(item)
    return (
      <View style={[styles.messageBubble, own ? styles.messageOwn : styles.messageOther]}>
        {item.attachment_url ? (
          <ChatAttachment path={item.attachment_url} style={styles.attachmentImage} />
        ) : null}
        {item.content ? (
          <Text style={[styles.messageText, own ? styles.messageTextOwn : styles.messageTextOther]}>{item.content}</Text>
        ) : null}
        <Text style={styles.messageTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(professional)/messages')} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{otherName}</Text>
          <Text style={styles.subtitle}>Realtime chat with your client</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom - 2, 6) }]}>
        <TouchableOpacity style={styles.attachButton} onPress={handleAttach} disabled={uploading}>
          {uploading ? <ActivityIndicator size="small" color={colors.primary} /> : <Paperclip size={20} color={colors.primary} />}
        </TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write a message..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !text.trim()}>
          <Send size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 14 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.extraBold, fontSize: 20, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  messagesList: { padding: 20, paddingBottom: 14 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 12 },
  messageOwn: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  messageOther: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  messageText: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  messageTextOwn: { color: colors.white },
  messageTextOther: { color: colors.text },
  messageTime: { marginTop: 6, fontFamily: font.regular, fontSize: 10, color: colors.textSecondary, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  attachButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: radius.button, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontFamily: font.regular, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  sendButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  attachmentImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
})
