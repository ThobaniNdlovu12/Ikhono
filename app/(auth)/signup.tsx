import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, font, spacing, radius } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export default function Signup() {
  const params = useLocalSearchParams<{ type?: string }>();
  const [type, setType] = useState<'client' | 'professional'>(params.type === 'professional' ? 'professional' : 'client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro' | 'elite'>('free');
  const [nationality, setNationality] = useState<'sa' | 'non-sa'>('sa');
  const [docType, setDocType] = useState<'' | 'passport' | 'work-permit' | 'asylum' | 'refugee'>('');
  const [idNumber, setIdNumber] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [idDocument, setIdDocument] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [certDocument, setCertDocument] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientAccepted, setClientAccepted] = useState(false);
  const [proAccepted, setProAccepted] = useState(false);

  useEffect(() => {
    if (params.type === 'professional' || params.type === 'client') {
      setType(params.type === 'professional' ? 'professional' : 'client');
    }
  }, [params.type]);

  const handleSelectType = (nextType: 'client' | 'professional') => {
    setType(nextType);
  };

  const handleTogglePolicies = () => {
    if (type === 'client') {
      setClientAccepted((value) => !value);
    } else {
      setProAccepted((value) => !value);
    }
  };

  const handleDocumentPick = async (setter: React.Dispatch<React.SetStateAction<{ uri: string; name: string; type: string } | null>>) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const name = asset.fileName ?? uri.split('/').pop() ?? `document-${Date.now()}`;
      const type = asset.type ? `${asset.type}/${name.split('.').pop()}` : 'application/octet-stream';
      setter({ uri, name, type });
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (type === 'client' && !idNumber) {
      Alert.alert('Error', 'Please enter your ID number');
      return;
    }
    const accepted = type === 'client' ? clientAccepted : proAccepted;
    if (!accepted) {
      Alert.alert('Consent Required', 'Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    if (type === 'professional') {
      if (!service || !experience || !bio) {
        Alert.alert('Error', 'Please fill in all professional fields');
        return;
      }
      if (!idDocument) {
        Alert.alert('Error', 'Please upload your ID or passport document');
        return;
      }
      if (!proofOfAddress) {
        Alert.alert('Error', 'Please upload proof of address');
        return;
      }
      if (nationality === 'sa' && !idNumber) {
        Alert.alert('Error', 'Please enter your South African ID number');
        return;
      }
      if (nationality !== 'sa') {
        if (!docType) {
          Alert.alert('Error', 'Please select a document type or click the active option again to clear your selection.');
          return;
        }
        if (!docNumber) {
          Alert.alert('Error', 'Please enter your document number for the selected document type');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const metadata = type === 'client'
        ? { type: 'client', full_name: name, phone, location, id_number: idNumber }
        : {
            type: 'professional',
            full_name: name,
            phone,
            location,
            primary_service: service,
            experience_years: experience,
            bio,
            plan,
          };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Unable to create account.');

      const userId = authData.user.id;

      if (type === 'professional' && idDocument && proofOfAddress) {
        try {
          const idExt = idDocument.name.split('.').pop() ?? 'bin';
          const idBlob = await (await fetch(idDocument.uri)).blob();
          await supabase.storage.from('verification-docs')
            .upload(`${userId}/id_document.${idExt}`, idBlob);

          const addrExt = proofOfAddress.name.split('.').pop() ?? 'bin';
          const addrBlob = await (await fetch(proofOfAddress.uri)).blob();
          await supabase.storage.from('verification-docs')
            .upload(`${userId}/proof_of_address.${addrExt}`, addrBlob);

          if (certDocument) {
            const certExt = certDocument.name.split('.').pop() ?? 'bin';
            const certBlob = await (await fetch(certDocument.uri)).blob();
            await supabase.storage.from('verification-docs')
              .upload(`${userId}/certificate.${certExt}`, certBlob);
          }
        } catch (uploadErr) {
          console.warn('Document upload failed, continuing:', uploadErr);
        }
      }

      router.replace(`/(auth)/verify-email?email=${encodeURIComponent(email)}&mode=signup`);
    } catch (err: any) {
      Alert.alert('Signup Failed', err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentAccepted = type === 'client' ? clientAccepted : proAccepted;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>W E L C O M E T O I K H O N O</Text>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join iKhono today</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'client' && styles.typeBtnActive]}
          onPress={() => handleSelectType('client')}
          hitSlop={8}
        >
          <Text style={[styles.typeBtnText, type === 'client' && styles.typeBtnTextActive]}>Find an Artisan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'professional' && styles.typeBtnActive]}
          onPress={() => handleSelectType('professional')}
          hitSlop={8}
        >
          <Text style={[styles.typeBtnText, type === 'professional' && styles.typeBtnTextActive]}>Join as an Artisan</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="rgba(255,255,255,0.4)" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email *" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Phone *" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      {type === 'client' ? (
        <TextInput
          style={styles.input}
          placeholder="ID Number *"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={idNumber}
          onChangeText={setIdNumber}
        />
      ) : null}
      <TextInput style={styles.input} placeholder="Location *" placeholderTextColor="rgba(255,255,255,0.4)" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Password *" placeholderTextColor="rgba(255,255,255,0.4)" secureTextEntry value={password} onChangeText={setPassword} />

      {type === 'professional' && (
        <>
          <TextInput style={styles.input} placeholder="Primary Service (e.g. Plumber) *" placeholderTextColor="rgba(255,255,255,0.4)" value={service} onChangeText={setService} />
          <TextInput style={styles.input} placeholder="Years of Experience *" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="numeric" value={experience} onChangeText={setExperience} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Short Bio *" placeholderTextColor="rgba(255,255,255,0.4)" multiline numberOfLines={3} value={bio} onChangeText={setBio} />

          <View style={styles.planRow}>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'free' && styles.planBtnActive]}
              onPress={() => setPlan('free')}
            >
              <Text style={[styles.planBtnText, plan === 'free' && styles.planBtnTextActive]}>Basic</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'pro' && styles.planBtnActive]}
              onPress={() => setPlan('pro')}
            >
              <Text style={[styles.planBtnText, plan === 'pro' && styles.planBtnTextActive]}>Pro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'elite' && styles.planBtnActive]}
              onPress={() => setPlan('elite')}
            >
              <Text style={[styles.planBtnText, plan === 'elite' && styles.planBtnTextActive]}>Elite</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nationality *</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionBtn, nationality === 'sa' && styles.optionBtnActive]}
                onPress={() => setNationality('sa')}
              >
                <Text style={[styles.optionText, nationality === 'sa' && styles.optionTextActive]}>South African</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, nationality === 'non-sa' && styles.optionBtnActive]}
                onPress={() => setNationality('non-sa')}
              >
                <Text style={[styles.optionText, nationality === 'non-sa' && styles.optionTextActive]}>Non-South African</Text>
              </TouchableOpacity>
            </View>
          </View>

          {nationality === 'sa' ? (
            <TextInput
              style={styles.input}
              placeholder="SA ID Number *"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              value={idNumber}
              onChangeText={setIdNumber}
              maxLength={13}
            />
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Document Type *</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[styles.optionBtn, docType === 'passport' && styles.optionBtnActive]}
                    onPress={() => setDocType((current) => (current === 'passport' ? '' : 'passport'))}
                  >
                    <Text style={[styles.optionText, docType === 'passport' && styles.optionTextActive]}>Passport</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionBtn, docType === 'work-permit' && styles.optionBtnActive]}
                    onPress={() => setDocType((current) => (current === 'work-permit' ? '' : 'work-permit'))}
                  >
                    <Text style={[styles.optionText, docType === 'work-permit' && styles.optionTextActive]}>Work Permit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[styles.optionBtn, docType === 'asylum' && styles.optionBtnActive]}
                    onPress={() => setDocType((current) => (current === 'asylum' ? '' : 'asylum'))}
                  >
                    <Text style={[styles.optionText, docType === 'asylum' && styles.optionTextActive]}>Asylum Seeker Permit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionBtn, docType === 'refugee' && styles.optionBtnActive]}
                    onPress={() => setDocType((current) => (current === 'refugee' ? '' : 'refugee'))}
                  >
                    <Text style={[styles.optionText, docType === 'refugee' && styles.optionTextActive]}>Refugee ID</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Document Number *"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={docNumber}
                onChangeText={setDocNumber}
              />
            </>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Upload ID Document *</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleDocumentPick(setIdDocument)}>
              <Text style={styles.uploadBtnText}>{idDocument ? `Selected: ${idDocument.name}` : 'Choose ID document'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Proof of Address *</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleDocumentPick(setProofOfAddress)}>
              <Text style={styles.uploadBtnText}>{proofOfAddress ? `Selected: ${proofOfAddress.name}` : 'Choose proof of address'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Qualification Document (Optional)</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleDocumentPick(setCertDocument)}>
              <Text style={styles.uploadBtnText}>{certDocument ? `Selected: ${certDocument.name}` : 'Choose certificate or qualification document'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.primary} />
          : <Text style={styles.btnText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.consentContainer}>
        <View style={styles.consentRow}>
          <TouchableOpacity onPress={handleTogglePolicies} activeOpacity={1} style={styles.checkboxButton}>
            <View style={[styles.checkbox, currentAccepted && styles.checkboxChecked]}>
              {currentAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </TouchableOpacity>
          <View style={styles.consentTextWrap}>
            <Text style={styles.consentText}>I agree to the </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/terms-and-conditions')}>
              <Text style={styles.linkText}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.consentText}> and </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/privacy-policy')}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.consentText}> *</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
  },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    marginBottom: spacing.lg,
    padding: 4,
    width: '100%',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.button - 2,
  },
  planRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  planBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontFamily: font.semiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionBtn: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  optionBtnActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  optionText: {
    fontFamily: font.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  optionTextActive: {
    color: colors.primary,
  },
  uploadBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  uploadBtnText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  planBtnActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  planBtnText: {
    fontFamily: font.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  planBtnTextActive: {
    color: colors.primary,
  },
  typeBtnActive: {
    backgroundColor: colors.white,
  },
  typeBtnText: {
    fontFamily: font.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  typeBtnTextActive: {
    color: colors.primary,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.button,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  btn: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
  consentContainer: {
    width: '100%',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkboxButton: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: font.bold,
    lineHeight: 14,
  },
  consentTextWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  consentText: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  linkText: {
    fontFamily: font.semiBold,
    color: colors.white,
    textDecorationLine: 'underline',
  },
  link: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.lg,
  },
  linkBold: {
    fontFamily: font.bold,
    color: colors.white,
    textDecorationLine: 'underline',
  },
});