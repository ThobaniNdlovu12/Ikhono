import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, ImageIcon, Plus } from 'lucide-react-native'
import { colors, font, radius, spacing } from '../../constants/theme'

type PortfolioImage = {
  id: string
  uri: string
}

import { useAuthStore } from '../../store/authStore'

export default function ProfessionalPortfolio() {
  const user = useAuthStore((s) => s.user)
  const isAllowed = user?.plan !== 'free'
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpload() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      setMessage('Permission to access your photos is needed to upload work.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.85,
    })

    if (result.canceled) return

    const images = result.assets.map((asset) => ({
      id: `${asset.fileName ?? Date.now()}-${Math.random()}`,
      uri: asset.uri,
    }))

    setPortfolioImages((prev) => [...prev, ...images])
    setMessage(`${images.length} photo${images.length > 1 ? 's' : ''} added to your portfolio.`)
  }

  async function savePortfolio() {
    if (portfolioImages.length === 0) {
      setMessage('Add at least one photo to build your portfolio.')
      return
    }

    setUploading(true)
    setMessage('Portfolio ready to showcase from your device.')
    setUploading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Showcase your best work</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <ImageIcon size={28} color={colors.primary} />
          <Text style={styles.cardTitle}>{isAllowed ? 'Upload your recent work' : 'Portfolio is a Pro feature'}</Text>
          <Text style={styles.cardText}>
            {isAllowed
              ? 'Choose photos from your phone to create a portfolio that clients can view.'
              : 'Unlimited portfolio uploads are only available to Pro and Elite members. Upgrade to unlock this feature.'}
          </Text>

          {isAllowed ? (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleUpload}>
                <Plus size={16} color={colors.white} />
                <Text style={styles.primaryBtnText}>Upload from phone</Text>
              </TouchableOpacity>

              {message ? <Text style={styles.message}>{message}</Text> : null}

              {portfolioImages.length > 0 ? (
                <View style={styles.imageGrid}>
                  {portfolioImages.map((image) => (
                    <Image key={image.id} source={{ uri: image.uri }} style={styles.image} />
                  ))}
                </View>
              ) : null}

              <TouchableOpacity style={styles.secondaryBtn} onPress={savePortfolio} disabled={uploading}>
                {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.secondaryBtnText}>Save portfolio</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(professional)/upgrade')}>
              <Text style={styles.secondaryBtnText}>Upgrade now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  headerText: { marginLeft: spacing.sm },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text, marginTop: spacing.sm },
  cardText: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.button, flexDirection: 'row', alignItems: 'center', gap: 6 },
  primaryBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.white },
  message: { marginTop: spacing.sm, fontFamily: font.semiBold, fontSize: 12, color: colors.primary, textAlign: 'center' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md, width: '100%' },
  image: { width: '48%', height: 120, borderRadius: radius.card, marginBottom: 8 },
  secondaryBtn: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.button },
  secondaryBtnText: { fontFamily: font.bold, fontSize: 13, color: colors.primary },
})
