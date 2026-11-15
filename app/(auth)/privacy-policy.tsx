import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, font, spacing } from '../../constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ikhono Privacy Policy</Text>
        <Text style={styles.meta}>Effective Date: 30 June 2026</Text>
        <Text style={styles.body}>
          At Ikhono, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, store, and protect your information when you use the Ikhono mobile application, website, and related services (collectively referred to as the "Platform"). By using Ikhono, you acknowledge that you have read and understood this Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>1. Who We Are</Text>
        <Text style={styles.body}>
          Ikhono is a digital platform that connects customers with independent artisans and service professionals for maintenance, repair, construction, and related services. For the purposes of applicable privacy legislation, including the Protection of Personal Information Act, 2013 (POPIA), Ikhono is responsible for processing your personal information in accordance with this Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.body}>
          Depending on how you use the Platform, we may collect personal information such as your full name, identity or passport number where required, date of birth where required, gender, email address, mobile phone number, physical address, profile photograph, username, password, user preferences, account settings, and information about your location with your permission. We may also collect service information such as booking requests, quotations, completed jobs, cancellations, reviews, ratings, messages, and uploaded photographs and documents. Device information including device type, operating system, browser details, IP address, identifiers, crash reports, and app performance data may also be collected.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.body}>
          We use your information to create and manage your account, verify your identity, match customers with artisans, process bookings, process payments, communicate with users, provide customer support, improve our services, prevent fraud, ensure platform safety, comply with legal obligations, and send important service notifications. Where you have provided consent, we may also send promotional communications. You can opt out of marketing messages at any time.
        </Text>

        <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
        <Text style={styles.body}>
          We only share personal information where necessary. Your information may be shared with service providers fulfilling your booking, customers who request your services (if you are an artisan), payment processors, identity verification providers, cloud hosting providers, customer support providers, and legal authorities where required by law. We do not sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>5. Artisan Verification</Text>
        <Text style={styles.body}>
          To help maintain trust and safety on the Platform, artisans may be required to provide identity documents, professional licences or trade certificates, business registration documents, proof of address, insurance documentation, and banking details for payments. This information is processed solely for verification, compliance, and payment purposes.
        </Text>

        <Text style={styles.sectionTitle}>6. Cookies and Similar Technologies</Text>
        <Text style={styles.body}>
          Our website and Platform may use cookies and similar technologies to remember your preferences, improve functionality, analyse Platform usage, enhance security, and personalise your experience. You may adjust your browser settings to disable cookies, although doing so may affect certain features.
        </Text>

        <Text style={styles.sectionTitle}>7. Data Security</Text>
        <Text style={styles.body}>
          We implement reasonable technical and organisational measures to protect your information from unauthorised access, loss, misuse, alteration, disclosure, and destruction. These measures include encryption of sensitive information, secure servers, access controls, authentication measures, and regular security monitoring. While we take reasonable precautions, no online system can be guaranteed to be completely secure.
        </Text>

        <Text style={styles.sectionTitle}>8. Data Retention</Text>
        <Text style={styles.body}>
          We retain personal information only for as long as necessary to provide our services, meet legal obligations, resolve disputes, prevent fraud, and enforce our agreements. When information is no longer required, it will be securely deleted or anonymised.
        </Text>

        <Text style={styles.sectionTitle}>9. Your Rights</Text>
        <Text style={styles.body}>
          Subject to applicable law, you may have the right to access your personal information, correct inaccurate information, update your information, request deletion of your information where legally permissible, object to certain processing activities, withdraw consent where processing is based on consent, and request a copy of your personal information. Requests may be subject to identity verification.
        </Text>

        <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
        <Text style={styles.body}>
          Ikhono is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that such information has been collected, we will take reasonable steps to remove it.
        </Text>

        <Text style={styles.sectionTitle}>11. International Transfers</Text>
        <Text style={styles.body}>
          Where necessary, your information may be stored or processed on servers located outside South Africa. Where cross-border transfers occur, Ikhono will take reasonable steps to ensure that your personal information receives an appropriate level of protection in accordance with applicable law.
        </Text>

        <Text style={styles.sectionTitle}>12. Third-Party Links</Text>
        <Text style={styles.body}>
          The Platform may contain links to third-party websites or services. Ikhono is not responsible for the privacy practices of those third parties. Users should review the applicable privacy policies before providing personal information.
        </Text>

        <Text style={styles.sectionTitle}>13. Changes to This Privacy Policy</Text>
        <Text style={styles.body}>
          We may update this Privacy Policy from time to time. Any significant changes will be communicated through the Platform or by other appropriate means. Continued use of the Platform after changes take effect constitutes acceptance of the updated Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.body}>
          If you have any questions about this Privacy Policy or how your personal information is handled, please contact Ikhono at privacy@ikhono.africa or visit www.ikhono.africa.
        </Text>

        <Text style={styles.sectionTitle}>15. POPIA Compliance</Text>
        <Text style={styles.body}>
          Ikhono is committed to complying with the Protection of Personal Information Act, 2013 (POPIA), and other applicable South African privacy laws. Where required by law, users may also lodge complaints with the Information Regulator (South Africa) if they believe their personal information has been processed unlawfully.
        </Text>

        <Text style={styles.footer}>
          By creating an account or using the Platform, you acknowledge that you have read, understood, and agree to this Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backText: {
    fontFamily: font.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  title: {
    fontFamily: font.extraBold,
    fontSize: 24,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    fontFamily: font.semiBold,
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.lg,
    lineHeight: 22,
  },
});
