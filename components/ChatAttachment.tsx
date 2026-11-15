import { useEffect, useState } from 'react';
import { Image, Text, type ImageStyle, type StyleProp } from 'react-native';
import { supabase } from '../services/supabase';

const signedUrlLifetime = 300;
const refreshInterval = 240_000;

export function ChatAttachment({ path, style }: { path: string; style: StyleProp<ImageStyle> }) {
  const [attachment, setAttachment] = useState<{ path: string; url: string | null }>();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(path, signedUrlLifetime);
        if (active) setAttachment({ path, url: error ? null : data.signedUrl });
      } catch {
        if (active) setAttachment({ path, url: null });
      }
    }

    void load();
    const interval = setInterval(() => void load(), refreshInterval);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [path]);

  if (attachment?.path !== path) return null;
  if (!attachment.url) return <Text>Attachment unavailable</Text>;
  return <Image source={{ uri: attachment.url }} style={style} resizeMode="cover" />;
}
