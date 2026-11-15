import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Modal, FlatList, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowLeft, ChevronDown, ChevronRight, Check, X,
  Briefcase, MapPin, Banknote, Calendar, FileText, Tag, Camera,
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { postJob, uploadDocument, attachJobDocs } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const COLORS = {
  primary: '#1251c4',
  primaryDark: '#0a2d6b',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
  error: '#dc2626',
  errorBg: '#fef2f2',
  success: '#2e7d32',
}

const SERVICES = [
  'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Tiling', 'Waterproofing',
  'Roof & Gutters', 'General Maintenance', 'Ceilings', 'Drywalling',
  'Glazing / Aluminum Work', 'Welding & Steelwork', 'Bricklaying & Plastering',
  'Flooring', 'Landscaping & Garden', 'Paving', 'Built-in Cupboards',
  'Air Conditioning (HVAC)', 'CCTV & Security Systems', 'High-Pressure Cleaning',
  'Swimming Pool Installation & Repairs',
]

const PROVINCES: Record<string, string[]> = {
  Gauteng: [
    'Johannesburg', 'Sandton', 'Fourways', 'Randburg', 'Roodepoort', 'Soweto',
    'Midrand', 'Pretoria', 'Centurion', 'Hatfield', 'Menlyn', 'Lynnwood',
    'Waterkloof', 'Mamelodi', 'Soshanguve', 'Germiston', 'Boksburg', 'Benoni',
    'Tembisa', 'Kempton Park', 'Edenvale', 'Ekurhuleni',
  ],
  'Western Cape': [
    'Cape Town', 'Sea Point', 'Green Point', 'Camps Bay', 'Clifton', 'Woodstock',
    'Observatory', 'Rondebosch', 'Claremont', 'Kenilworth', 'Wynberg', 'Constantia',
    'Newlands', 'Bellville', 'Durbanville', 'Milnerton', 'Table View', 'Blouberg',
    'Century City', 'Stellenbosch', 'Franschhoek', 'Paarl', 'Somerset West',
    'Strand', 'Khayelitsha', "Mitchell's Plain", 'Gugulethu', 'Athlone',
    'George', 'Knysna', 'Mossel Bay', 'Hermanus', 'Hout Bay',
  ],
  'KwaZulu-Natal': [
    'Durban', 'Umhlanga', 'Ballito', 'La Lucia', 'Westville', 'Pinetown',
    'Hillcrest', 'Kloof', 'Amanzimtoti', 'Umlazi', 'KwaMashu', 'Phoenix',
    'Chatsworth', 'Pietermaritzburg', 'Richards Bay', 'Newcastle', 'Ladysmith',
  ],
  'Eastern Cape': [
    'Gqeberha (Port Elizabeth)', 'East London', 'Mthatha',
    'Grahamstown (Makhanda)', 'Queenstown', "King William's Town",
  ],
  'Free State': ['Bloemfontein', 'Welkom', 'Bethlehem', 'Phuthaditjhaba'],
  Mpumalanga: ['Mbombela (Nelspruit)', 'Witbank (eMalahleni)', 'Secunda', 'Middelburg'],
  Limpopo: ['Polokwane', 'Tzaneen', 'Lephalale', 'Mokopane', 'Thohoyandou'],
  'Northern Cape': ['Kimberley', 'Upington', 'Springbok'],
  'North West': ['Rustenburg', 'Mahikeng', 'Klerksdorp', 'Potchefstroom', 'Brits'],
}

type PickerMode = 'service' | 'province' | 'city' | null
type FormErrors = Partial<Record<'title' | 'description' | 'serviceType' | 'location' | 'budgetMin' | 'budgetMax', string>>
type UploadedImage = {
  uri: string
  name: string
  type: string
  documentId?: number
  uploading: boolean
  failed: boolean
}

function FieldLabel({ icon, label, required }: { icon: React.ReactNode; label: string; required?: boolean }) {
  return (
    <View style={styles.fieldLabel}>
      {icon}
      <Text style={styles.fieldLabelText}>
        {label}
        {required && <Text style={{ color: COLORS.error }}> *</Text>}
      </Text>
    </View>
  )
}

function SelectPill({ placeholder, value, onPress, icon, error }: {
  placeholder: string; value: string; onPress: () => void; icon?: React.ReactNode; error?: boolean
}) {
  return (
    <TouchableOpacity style={[styles.selectPill, error && styles.inputError]} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={[styles.selectPillText, !value && { color: COLORS.textSecondary }]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <ChevronDown size={15} color={COLORS.textSecondary} />
    </TouchableOpacity>
  )
}

export default function PostJobScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [deadline, setDeadline] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [pickerMode, setPickerMode] = useState<PickerMode>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const locationDisplay = city ? `${city}, ${province}` : ''
  const cities = province ? PROVINCES[province] ?? [] : []

  function clearError(key: keyof FormErrors) {
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!title.trim()) e.title = 'Job title is required'
    if (!description.trim()) e.description = 'Description is required'
    if (!serviceType) e.serviceType = 'Please select a service type'
    if (!city) e.location = 'Please select a city'
    if (!budgetMin) e.budgetMin = 'Minimum budget is required'
    if (!budgetMax) e.budgetMax = 'Maximum budget is required'
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      e.budgetMax = 'Max budget must be ≥ min budget'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function uploadImage(img: UploadedImage) {
    try {
      const formData = new FormData()
      formData.append('action', 'upload')
      formData.append('client_id', String(user?.legacy_id ?? user?.id ?? ''))
      formData.append('description', `Job photo - ${title || 'Untitled'}`)
      formData.append('file', {
        uri: img.uri,
        name: img.name,
        type: img.type,
      } as any)

      const res = await uploadDocument(formData)
      const docId = res?.data?.document_id
      setImages(prev => prev.map(p => p.uri === img.uri ? { ...p, uploading: false, documentId: docId } : p))
    } catch {
      setImages(prev => prev.map(p => p.uri === img.uri ? { ...p, uploading: false, failed: true } : p))
    }
  }

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6 - images.length, // only allow up to remaining slots
    })

    if (result.canceled) return

    const newImages: UploadedImage[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName ?? `image_${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      uploading: true,
      failed: false,
    }))
    setImages(prev => [...prev, ...newImages])
    newImages.forEach(uploadImage)
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.8,
    })

    if (result.canceled) return

    const asset = result.assets[0]
    const newImage: UploadedImage = {
      uri: asset.uri,
      name: asset.fileName ?? `photo_${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      uploading: true,
      failed: false,
    }
    setImages(prev => [...prev, newImage])
    uploadImage(newImage)
  }

  function removeImage(uri: string) {
    setImages(prev => prev.filter(p => p.uri !== uri))
  }

  function showImageOptions() {
    Alert.alert('Add Photos', 'Choose how to add photos', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImages },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  async function handleSubmit() {
    if (!validate()) return
    const stillUploading = images.some(i => i.uploading)
    if (stillUploading) {
      Alert.alert('Please Wait', 'Images are still uploading.')
      return
    }

    setSubmitting(true)
    try {
      const jobRes = await postJob({
        title: title.trim(),
        description: description.trim(),
        service_type: serviceType,
        location: `${city}, ${province}`,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        deadline: deadline || null,
      })

      if (!jobRes?.data?.success) {
        Alert.alert('Error', jobRes?.data?.message ?? 'Something went wrong.')
        return
      }

      const jobId = jobRes.data.job_id
      const docIds = images.filter(i => i.documentId).map(i => i.documentId!)
      if (docIds.length > 0) await attachJobDocs({ job_id: jobId, doc_ids: docIds })

      Alert.alert('Job Posted! 🎉', 'Artisans in your area will start bidding shortly.', [
        { text: 'View Jobs', onPress: () => router.replace('/(client)/jobs') },
      ])
    } catch {
      Alert.alert('Error', 'Could not post job. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  function onSelectService(s: string) { setServiceType(s); clearError('serviceType'); setPickerMode(null) }
  function onSelectProvince(p: string) { setProvince(p); setCity(''); setPickerMode('city') }
  function onSelectCity(c: string) { setCity(c); clearError('location'); setPickerMode(null) }

  const modalTitle = pickerMode === 'service' ? 'Select Service'
    : pickerMode === 'province' ? 'Select Province'
    : `Cities in ${province}`

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a2d6b', '#1251c4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(client)/jobs')}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Post a Job</Text>
          <Text style={styles.headerSub}>Get quotes from verified artisans</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            <FieldLabel icon={<Briefcase size={14} color={COLORS.primary} />} label="Job Title" required />
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g. Fix leaking bathroom tap"
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={v => { setTitle(v); clearError('title') }}
              returnKeyType="next"
            />
            {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <FieldLabel icon={<FileText size={14} color={COLORS.primary} />} label="Description" required />
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe the job in detail..."
              placeholderTextColor={COLORS.textSecondary}
              value={description}
              onChangeText={v => { setDescription(v); clearError('description') }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {!!errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Type</Text>
            <FieldLabel icon={<Tag size={14} color={COLORS.primary} />} label="What service do you need?" required />
            <SelectPill placeholder="Select a service..." value={serviceType} onPress={() => setPickerMode('service')} error={!!errors.serviceType} />
            {!!errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <FieldLabel icon={<MapPin size={14} color={COLORS.primary} />} label="Where is the job?" required />
            <SelectPill
              placeholder="Select province & city..."
              value={locationDisplay}
              onPress={() => setPickerMode('province')}
              icon={<MapPin size={13} color={COLORS.primary} style={{ marginRight: 4 }} />}
              error={!!errors.location}
            />
            {!!errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget (ZAR)</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetField}>
                <FieldLabel icon={<Banknote size={14} color={COLORS.primary} />} label="Min (R)" required />
                <TextInput
                  style={[styles.input, errors.budgetMin && styles.inputError]}
                  placeholder="500"
                  placeholderTextColor={COLORS.textSecondary}
                  value={budgetMin}
                  onChangeText={v => { setBudgetMin(v.replace(/[^0-9]/g, '')); clearError('budgetMin') }}
                  keyboardType="numeric"
                />
                {!!errors.budgetMin && <Text style={styles.errorText}>{errors.budgetMin}</Text>}
              </View>
              <View style={styles.budgetSep}><Text style={styles.budgetSepText}>—</Text></View>
              <View style={styles.budgetField}>
                <FieldLabel icon={<Banknote size={14} color={COLORS.primary} />} label="Max (R)" required />
                <TextInput
                  style={[styles.input, errors.budgetMax && styles.inputError]}
                  placeholder="2000"
                  placeholderTextColor={COLORS.textSecondary}
                  value={budgetMax}
                  onChangeText={v => { setBudgetMax(v.replace(/[^0-9]/g, '')); clearError('budgetMax') }}
                  keyboardType="numeric"
                />
                {!!errors.budgetMax && <Text style={styles.errorText}>{errors.budgetMax}</Text>}
              </View>
            </View>
            {budgetMin && budgetMax && Number(budgetMin) <= Number(budgetMax) && (
              <View style={styles.budgetHint}>
                <Text style={styles.budgetHintText}>
                  Budget range: R{Number(budgetMin).toLocaleString()} – R{Number(budgetMax).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Photos <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <Text style={styles.hintText}>Add photos so artisans can better understand the job.</Text>
            <View style={styles.imageGrid}>
              {images.map((img) => (
                <View key={img.uri} style={styles.imageTile}>
                  <Image source={{ uri: img.uri }} style={styles.imageTileImg} />
                  {img.uploading && (
                    <View style={styles.imageOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  {img.failed && (
                    <View style={[styles.imageOverlay, { backgroundColor: 'rgba(220,38,38,0.6)' }]}>
                      <Text style={styles.imageFailedText}>Failed</Text>
                    </View>
                  )}
                  {!img.uploading && (
                    <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => removeImage(img.uri)}>
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {images.length < 6 && (
                <TouchableOpacity style={styles.imageAddTile} onPress={showImageOptions}>
                  <Camera size={22} color={COLORS.primary} />
                  <Text style={styles.imageAddText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
            {images.length > 0 && (
              <Text style={styles.imageCountText}>
                {images.filter(i => i.documentId).length} of {images.length} uploaded
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deadline <Text style={styles.optionalLabel}>(optional)</Text></Text>
            <FieldLabel icon={<Calendar size={14} color={COLORS.primary} />} label="Preferred completion date" />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD e.g. 2026-06-30"
              placeholderTextColor={COLORS.textSecondary}
              value={deadline}
              onChangeText={setDeadline}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              returnKeyType="done"
            />
            <Text style={styles.hintText}>Leave blank if flexible on timing</Text>
          </View>

          <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Post Job</Text>}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerMode !== null} animationType="slide" transparent onRequestClose={() => setPickerMode(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              {pickerMode === 'city'
                ? <TouchableOpacity onPress={() => setPickerMode('province')} style={styles.modalBackBtn}><ArrowLeft size={18} color={COLORS.textPrimary} /></TouchableOpacity>
                : <View style={{ width: 32 }} />
              }
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setPickerMode(null)}><X size={20} color={COLORS.textPrimary} /></TouchableOpacity>
            </View>

            {pickerMode === 'service' && (
              <FlatList
                data={SERVICES}
                keyExtractor={item => item}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalRow} onPress={() => onSelectService(item)}>
                    <Text style={[styles.modalRowText, item === serviceType && styles.modalRowTextActive]}>{item}</Text>
                    {item === serviceType && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
              />
            )}

            {pickerMode === 'province' && (
              <FlatList
                data={Object.keys(PROVINCES)}
                keyExtractor={item => item}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalRow} onPress={() => onSelectProvince(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalRowText, item === province && styles.modalRowTextActive]}>{item}</Text>
                      <Text style={styles.modalRowSub}>{PROVINCES[item].length} cities</Text>
                    </View>
                    <ChevronRight size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              />
            )}

            {pickerMode === 'city' && (
              <FlatList
                data={cities}
                keyExtractor={item => item}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalRow} onPress={() => onSelectCity(item)}>
                    <Text style={[styles.modalRowText, item === city && styles.modalRowTextActive]}>{item}</Text>
                    {item === city && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  scroll: { padding: 16 },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  optionalLabel: { fontSize: 11, fontWeight: '400', color: COLORS.textSecondary },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabelText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 12 },
  textArea: { height: 100, paddingTop: 12 },
  inputError: { borderColor: COLORS.error, backgroundColor: COLORS.errorBg },
  errorText: { fontSize: 11, color: COLORS.error, marginTop: -8, marginBottom: 10, marginLeft: 4 },
  hintText: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 12 },
  selectPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, gap: 6 },
  selectPillText: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  budgetRow: { flexDirection: 'row', alignItems: 'flex-start' },
  budgetField: { flex: 1 },
  budgetSep: { paddingTop: 36, paddingHorizontal: 10, alignItems: 'center' },
  budgetSepText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '300' },
  budgetHint: { backgroundColor: '#e8f5e9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: -4 },
  budgetHintText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4, marginBottom: 8 },
  imageTile: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageTileImg: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  imageFailedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  imageRemoveBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  imageAddTile: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f0f4ff' },
  imageAddText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  imageCountText: { fontSize: 11, color: COLORS.textSecondary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 36, maxHeight: '82%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalBackBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  modalRowText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '400' },
  modalRowTextActive: { fontWeight: '700', color: COLORS.primary },
  modalRowSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },
})