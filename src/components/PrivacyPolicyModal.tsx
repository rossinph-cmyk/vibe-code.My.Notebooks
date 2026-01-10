import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onAccept: () => void;
}

const FOOTER_HEIGHT = 90;

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onAccept,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 10;
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={() => {}}
      statusBarTranslucent={false}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#2563EB" />
            </View>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>MoreStoneTechnologies Voice Notepad</Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.introText}>
            Welcome! Before you start using Voice Notepad, please take a moment to read and understand our Privacy Policy. Your privacy and security are our top priorities.
          </Text>

          {/* Effective Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Effective Date</Text>
            <Text style={styles.sectionText}>December 11, 2025</Text>
          </View>

          {/* Company Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.sectionText}>
              Voice Notepad is developed and operated by MoreStoneTechnologies.
            </Text>
            <Text style={styles.sectionText}>
              Contact Email: Moorestonetechnologies@gmail.com
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>

            <Text style={styles.subsectionTitle}>1.1 Information You Provide</Text>
            <Text style={styles.sectionText}>
              • Voice Recordings: When you use the voice-to-text feature, your voice recordings are temporarily processed to transcribe them into text. These recordings are sent to OpenAI for transcription and are not stored on our servers.{"\n\n"}
              • Text Notes: All notes, notebooks, and text content you create are stored locally on your device.{"\n\n"}
              • Photos and Images: When you choose to add background images to notebooks or your home screen, these images are stored locally on your device. We request access to your photo library solely for this purpose.
            </Text>

            <Text style={styles.subsectionTitle}>1.2 Automatically Collected Information</Text>
            <Text style={styles.sectionText}>
              • Device Information: We may collect information about your device including device type, operating system version, and app version for troubleshooting and improvement purposes.{"\n\n"}
              • Usage Data: We collect anonymous usage statistics to understand how the app is used and improve user experience.
            </Text>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              • Voice Transcription: Voice recordings are sent to OpenAI to convert speech to text. OpenAI processes these recordings according to their privacy policy.{"\n\n"}
              • Local Storage: All your notes, notebooks, settings, and images are stored locally on your device using secure storage mechanisms.{"\n\n"}
              • App Functionality: We use your preferences and settings to provide personalized features like dark mode, custom colors, and background images.{"\n\n"}
              • Service Improvement: Anonymous usage data helps us identify bugs, improve performance, and develop new features.
            </Text>
          </View>

          {/* Permissions We Request */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Permissions We Request</Text>

            <Text style={styles.subsectionTitle}>3.1 Microphone Access</Text>
            <Text style={styles.sectionText}>
              Required for the voice recording feature. We only access your microphone when you tap the record button, and recordings are immediately sent for transcription.
            </Text>

            <Text style={styles.subsectionTitle}>3.2 Photo Library Access</Text>
            <Text style={styles.sectionText}>
              Required to select custom background images for notebooks and the home screen. We only access photos you specifically select.
            </Text>

            <Text style={styles.subsectionTitle}>3.3 Storage Access</Text>
            <Text style={styles.sectionText}>
              Required to save your notes, notebooks, settings, and selected images locally on your device.
            </Text>
          </View>

          {/* Data Sharing and Third Parties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Sharing and Third Parties</Text>

            <Text style={styles.subsectionTitle}>4.1 OpenAI</Text>
            <Text style={styles.sectionText}>
              Voice recordings are sent to OpenAI for transcription. OpenAI may temporarily store these recordings according to their data retention policy. Please review OpenAI privacy policy for more information.
            </Text>

            <Text style={styles.subsectionTitle}>4.2 Future Advertising Partners (Not Currently Active)</Text>
            <Text style={styles.sectionText}>
              We may integrate advertising services in future versions. If we do, we will update this policy and notify you. Advertising partners may collect anonymous usage data and device identifiers to show relevant ads.
            </Text>

            <Text style={styles.subsectionTitle}>4.3 We Do Not Sell Your Data</Text>
            <Text style={styles.sectionText}>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </Text>
          </View>

          {/* Future Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Future Features and Updates</Text>

            <Text style={styles.subsectionTitle}>5.1 Premium Subscription (Planned)</Text>
            <Text style={styles.sectionText}>
              We plan to offer premium features through in-app purchases. Payment processing will be handled by Apple App Store. We will not store your payment information.
            </Text>

            <Text style={styles.subsectionTitle}>5.2 Advertisements (Planned)</Text>
            <Text style={styles.sectionText}>
              Future versions may include advertisements. Ad providers may use cookies and similar technologies to show relevant ads based on anonymous usage patterns.
            </Text>

            <Text style={styles.subsectionTitle}>5.3 Cloud Sync (Planned)</Text>
            <Text style={styles.sectionText}>
              We may offer cloud synchronization in the future. If implemented, your notes would be encrypted and stored on secure servers. This feature will be optional and require explicit consent.
            </Text>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data Security</Text>
            <Text style={styles.sectionText}>
              • Local Storage: Your notes and data are stored locally using industry-standard secure storage mechanisms provided by iOS.{"\n\n"}
              • Encryption: Data stored on your device is protected by iOS encryption.{"\n\n"}
              • No Account Required: The app does not require account creation, reducing the risk of data breaches.{"\n\n"}
              • Transmission Security: Voice recordings are transmitted to OpenAI using encrypted HTTPS connections.
            </Text>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Data Retention</Text>
            <Text style={styles.sectionText}>
              • Local Data: Your notes, notebooks, and settings remain on your device until you delete the app or manually delete the content.{"\n\n"}
              • Voice Recordings: Temporary voice recordings are immediately sent to OpenAI for transcription and are not stored by us. OpenAI may retain recordings according to their retention policy.{"\n\n"}
              • Deletion: You can delete individual notes, entire notebooks, or uninstall the app to remove all data from your device.
            </Text>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Your Rights and Choices</Text>
            <Text style={styles.sectionText}>
              • Access: All your data is stored locally and accessible to you at any time within the app.{"\n\n"}
              • Deletion: You can delete any notes, notebooks, or images at any time.{"\n\n"}
              • Permission Control: You can revoke microphone or photo library access through your device settings, though this may limit app functionality.{"\n\n"}
              • Data Export: You can share individual notes via messaging apps or email.{"\n\n"}
              • Opt-Out: Future advertising features will include opt-out options where legally required.
            </Text>
          </View>

          {/* Children Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Children Privacy</Text>
            <Text style={styles.sectionText}>
              Voice Notepad is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at Moorestonetechnologies@gmail.com.
            </Text>
          </View>

          {/* International Users */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. International Users</Text>
            <Text style={styles.sectionText}>
              If you are using Voice Notepad from outside the United States, please note that your voice recordings will be transmitted to OpenAI servers, which may be located in different countries. By using the app, you consent to this data transfer.
            </Text>
          </View>

          {/* Changes to Privacy Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. When we make significant changes, we will notify you through the app and require you to review and accept the updated policy.{"\n\n"}
              The date at the top of this policy indicates when it was last updated.
            </Text>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:{"\n\n"}
              Email: Moorestonetechnologies@gmail.com{"\n"}
              Company: MoreStoneTechnologies
            </Text>
          </View>

          {/* Consent */}
          <View style={styles.consentBox}>
            <Text style={styles.consentTitle}>Your Consent</Text>
            <Text style={styles.consentText}>
              By tapping &ldquo;Accept and Continue&rdquo; below, you acknowledge that you have read, understood, and agree to this Privacy Policy and our data practices.
            </Text>
          </View>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <View style={styles.scrollIndicator}>
              <View style={styles.scrollIndicatorBox}>
                <Ionicons name="arrow-down" size={20} color="#D97706" />
                <Text style={styles.scrollIndicatorText}>
                  Please scroll to read the full policy
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Footer with Accept Button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleAccept}
            disabled={!hasScrolledToBottom}
            style={[
              styles.acceptButton,
              { backgroundColor: hasScrolledToBottom ? "#2563EB" : "#9CA3AF" }
            ]}
          >
            <Text style={styles.acceptButtonText}>
              Accept and Continue
            </Text>
          </Pressable>
          {!hasScrolledToBottom && (
            <Text style={styles.footerHint}>
              Please read the entire policy to continue
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "white",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#BFDBFE",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    maxHeight: "60%",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: FOOTER_HEIGHT + 40,
  },
  introText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 12,
  },
  sectionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  consentBox: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  consentText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  scrollIndicator: {
    alignItems: "center",
    paddingVertical: 32,
    paddingBottom: 64,
  },
  scrollIndicatorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  scrollIndicatorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  acceptButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerHint: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
});
