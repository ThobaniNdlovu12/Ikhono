import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { useAuthStore, User } from '../../store/authStore';

const COLORS = {
  primary: '#1251c4',
  surface: '#f5f7fc',
  white: '#ffffff',
  border: '#eef1f9',
  textPrimary: '#1a2340',
  textSecondary: '#9aa3b5',
};

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.avatar_uri ?? '');

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email);
      setPhone(user.phone);
      setLocation(user.location);
      setAvatarUri(user.avatar_uri ?? '');
    }
  }, [user]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      full_name: name,
      email,
      phone,
      location,
      avatar_uri: avatarUri,
    };
    await setUser(updatedUser);
    Alert.alert('Profile saved', 'Your profile information has been updated.');
    router.replace('/(client)/profile');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(client)/profile')}>
          <ArrowLeft size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera size={24} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.changeText}>Change photo</Text>
        </TouchableOpacity>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput style={styles.fieldInput} value={name} onChangeText={setName} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput style={styles.fieldInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput style={styles.fieldInput} value={location} onChangeText={setLocation} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Check size={16} color="#fff" />
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginLeft: 12 },
  content: { padding: 16 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 24, marginBottom: 12 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 24, backgroundColor: '#e8edfb', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  changeText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  fieldInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.textPrimary },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, marginTop: 12 },
  saveButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});