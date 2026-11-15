import { supabase } from './supabase'

export async function getSupabaseProfessionalIdByLegacyId(legacyId: number | string) {
  const { data, error } = await supabase
    .rpc('find_linked_website_professional', { website_id: legacyId })

  if (error) throw error
  if (!data) throw new Error(`No Supabase professional found for legacy_id ${legacyId}`)
  return data
}

export async function getOrCreateConversation(
  clientId: string,
  professionalId: string,
  jobId?: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('client_id', clientId)
    .eq('professional_id', professionalId)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existing) return existing

  const { data, error } = await supabase
    .from('conversations')
    .insert({ client_id: clientId, professional_id: professionalId, job_id: jobId ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderType: 'client' | 'professional',
  content: string,
  attachmentUrl?: string,
  attachmentType?: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      content,
      attachment_url: attachmentUrl ?? null,
      attachment_type: attachmentType ?? null,
    })
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('conversations')
    .update({
      last_message: content || 'Sent an attachment',
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  return data
}

export async function uploadChatAttachment(
  conversationId: string,
  uri: string,
  fileName: string,
  contentType?: string | null
) {
  const extension = fileName.match(/\.([a-zA-Z0-9]{1,8})$/)?.[1].toLowerCase() ?? 'jpg'
  const suffix = Math.random().toString(36).slice(2)
  const path = `${conversationId}/${Date.now()}-${suffix}.${extension}`
  const response = await fetch(uri)
  if (!response.ok) throw new Error('Could not read attachment')

  const { error } = await supabase.storage.from('chat-attachments')
    .upload(path, await response.arrayBuffer(), {
      contentType: contentType ?? (extension === 'jpg' ? 'image/jpeg' : `image/${extension}`),
    })
  if (error) throw error

  return path
}

export async function getUnreadMessageCount(userId: string, userType: 'client' | 'professional') {
  const column = userType === 'client' ? 'client_id' : 'professional_id'

  const { data: conversationsData, error: conversationsError } = await supabase
    .from('conversations')
    .select('id')
    .eq(column, userId)

  if (conversationsError) throw conversationsError

  const conversationIds = (conversationsData ?? []).map((item: { id: string }) => item.id)
  if (!conversationIds.length) return 0

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .eq('read', false)
    .neq('sender_id', userId)

  if (error) throw error
  return count ?? 0
}

export async function getConversations(userId: string, userType: 'client' | 'professional') {
  const column = userType === 'client' ? 'client_id' : 'professional_id'

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      clients(id, full_name),
      professionals(id, full_name, primary_service)
    `)
    .eq(column, userId)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function markMessagesRead(conversationId: string, userId: string) {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
}
