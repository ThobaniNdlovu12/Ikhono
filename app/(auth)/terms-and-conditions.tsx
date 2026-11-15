import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, font, radius, spacing } from '../../constants/theme';

export default function TermsAndConditionsScreen() {
  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ikhono Terms and Conditions</Text>
        <Text style={styles.meta}>Effective Date: 30 June 2026</Text>
        <Text style={styles.body}>
          Welcome to Ikhono. These Terms and Conditions ("Terms") govern your use of the Ikhono mobile application, website, and related services (collectively referred to as the "Platform"). By creating an account or using the Platform, you agree to be bound by these Terms.
        </Text>

        <Text style={styles.sectionTitle}>1. About Ikhono</Text>
        <Text style={styles.body}>
          Ikhono is a digital platform that connects customers with independent artisans and service professionals, including but not limited to plumbers, electricians, builders, carpenters, painters, locksmiths, and other maintenance specialists. Ikhono acts solely as a marketplace and facilitator between customers and service providers.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.body}>
          To use Ikhono you must be at least 18 years old or have permission from a parent or legal guardian, provide accurate and complete information, maintain the security of your account credentials, and use the Platform only for lawful purposes.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.body}>
          Users are responsible for keeping login details confidential, updating personal information when it changes, and for all activity occurring under their account. Ikhono reserves the right to suspend or terminate accounts that contain false information or are used fraudulently.
        </Text>

        <Text style={styles.sectionTitle}>4. Services</Text>
        <Text style={styles.body}>
          Ikhono provides a platform through which customers may request services, compare available artisans, receive quotations where applicable, book appointments, track service providers, make payments through approved payment methods, and leave ratings and reviews. Ikhono does not perform the services itself.
        </Text>

        <Text style={styles.sectionTitle}>5. Service Providers</Text>
        <Text style={styles.body}>
          All artisans are independent contractors. Ikhono may verify documentation including identity, qualifications, trade certifications, business registration, insurance (where applicable), and criminal record checks (where available). Verification does not constitute a guarantee of workmanship or future performance.
        </Text>

        <Text style={styles.sectionTitle}>6. Customer Responsibilities</Text>
        <Text style={styles.body}>
          Customers agree to provide accurate job descriptions, provide safe access to the property, treat artisans respectfully, pay agreed fees promptly, and avoid making payments outside the Platform where Platform payments are available.
        </Text>

        <Text style={styles.sectionTitle}>7. Artisan Responsibilities</Text>
        <Text style={styles.body}>
          Service providers agree to perform work professionally, arrive on time whenever reasonably possible, communicate delays promptly, complete work according to agreed specifications, comply with all applicable laws and industry standards, and maintain required licences and certifications.
        </Text>

        <Text style={styles.sectionTitle}>8. Pricing</Text>
        <Text style={styles.body}>
          Prices are determined by the service provider unless otherwise stated. Ikhono may charge booking fees, platform service fees, cancellation fees, or transaction fees. All applicable charges will be disclosed before payment.
        </Text>

        <Text style={styles.sectionTitle}>9. Payments</Text>
        <Text style={styles.body}>
          Payments may be processed through approved third-party payment providers. Ikhono does not store banking information. Refunds will be considered according to Ikhono's Refund Policy.
        </Text>

        <Text style={styles.sectionTitle}>10. Cancellations</Text>
        <Text style={styles.body}>
          Customers may cancel bookings before work begins. Cancellation fees may apply depending on notice period, travel already undertaken, and time reserved. Artisans may also cancel due to emergencies or unsafe working conditions.
        </Text>

        <Text style={styles.sectionTitle}>11. Ratings and Reviews</Text>
        <Text style={styles.body}>
          Users may leave honest reviews. Reviews must not contain offensive language, false allegations, hate speech, defamatory content, or personal information. Ikhono reserves the right to remove inappropriate reviews.
        </Text>

        <Text style={styles.sectionTitle}>12. Intellectual Property</Text>
        <Text style={styles.body}>
          All content on the Platform, including logos, branding, software, graphics, text, and designs, remains the property of Ikhono unless otherwise stated. No content may be copied or reproduced without written permission.
        </Text>

        <Text style={styles.sectionTitle}>13. Prohibited Conduct</Text>
        <Text style={styles.body}>
          Users may not create fake accounts, misrepresent qualifications, circumvent Platform payments, harass other users, upload malicious software, attempt to hack or disrupt the Platform, or use the Platform for illegal activities.
        </Text>

        <Text style={styles.sectionTitle}>14. Safety</Text>
        <Text style={styles.body}>
          Customers should ensure safe access to the property, report unsafe behaviour immediately, and contact emergency services where necessary. Artisans may refuse work where conditions are unsafe.
        </Text>

        <Text style={styles.sectionTitle}>15. Limitation of Liability</Text>
        <Text style={styles.body}>
          Ikhono facilitates introductions between customers and independent service providers. To the maximum extent permitted by law, Ikhono is not responsible for the quality of work performed, delays, property damage, personal injury, financial losses, or disputes arising between customers and artisans. Nothing in these Terms excludes liability where such exclusion is prohibited by law.
        </Text>

        <Text style={styles.sectionTitle}>16. Dispute Resolution</Text>
        <Text style={styles.body}>
          Users should first attempt to resolve disputes directly. Where necessary, Ikhono may assist by reviewing job records, messages, photographs, and payment records. Ikhono's involvement does not constitute legal arbitration.
        </Text>

        <Text style={styles.sectionTitle}>17. Privacy</Text>
        <Text style={styles.body}>
          Personal information is processed in accordance with Ikhono's Privacy Policy and applicable South African data protection legislation, including the Protection of Personal Information Act (POPIA). Users consent to the collection, use, and processing of their information for the operation of the Platform.
        </Text>

        <Text style={styles.sectionTitle}>18. Suspension and Termination</Text>
        <Text style={styles.body}>
          Ikhono may suspend or terminate accounts where users breach these Terms, engage in fraudulent conduct, abuse the Platform, or endanger other users.
        </Text>

        <Text style={styles.sectionTitle}>19. Changes to These Terms</Text>
        <Text style={styles.body}>
          Ikhono may update these Terms from time to time. Continued use of the Platform after updates constitutes acceptance of the revised Terms.
        </Text>

        <Text style={styles.sectionTitle}>20. Governing Law</Text>
        <Text style={styles.body}>
          These Terms shall be governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts.
        </Text>

        <Text style={styles.sectionTitle}>21. Contact</Text>
        <Text style={styles.body}>
          If you have questions regarding these Terms, please contact Ikhono at support@ikhono.africa or visit www.ikhono.africa.
        </Text>

        <Text style={styles.footer}>
          By creating an account or using the Platform, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
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
