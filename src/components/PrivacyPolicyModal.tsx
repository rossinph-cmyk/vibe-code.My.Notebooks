import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onAccept: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onAccept,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
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
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-blue-600 pt-16 pb-8 px-6">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
              <Ionicons name="shield-checkmark" size={48} color="#2563EB" />
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Privacy Policy
            </Text>
            <Text className="text-base text-blue-100 text-center">
              MoreStoneTechnologies Voice Notepad
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          <View className="py-6">
            <Text className="text-base text-gray-700 mb-6 leading-6">
              Welcome! Before you start using Voice Notepad, please take a moment to read and understand our Privacy Policy. Your privacy and security are our top priorities.
            </Text>

            {/* Effective Date */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">Effective Date</Text>
              <Text className="text-base text-gray-700 leading-6">
                December 11, 2025
              </Text>
            </View>

            {/* Company Information */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">About Us</Text>
              <Text className="text-base text-gray-700 leading-6 mb-2">
                Voice Notepad is developed and operated by MoreStoneTechnologies.
              </Text>
              <Text className="text-base text-gray-700 leading-6">
                Contact Email: Moorestonetechnologies@gmail.com
              </Text>
            </View>

            {/* Information We Collect */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">1.1 Information You Provide</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Voice Recordings: When you use the voice-to-text feature, your voice recordings are temporarily processed to transcribe them into text. These recordings are sent to OpenAI for transcription and are not stored on our servers.{"\n\n"}
                • Text Notes: All notes, notebooks, and text content you create are stored locally on your device.{"\n\n"}
                • Photos and Images: When you choose to add background images to notebooks or your home screen, these images are stored locally on your device. We request access to your photo library solely for this purpose.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">1.2 Automatically Collected Information</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Device Information: We may collect information about your device including device type, operating system version, and app version for troubleshooting and improvement purposes.{"\n\n"}
                • Usage Data: We collect anonymous usage statistics to understand how the app is used and improve user experience.
              </Text>
            </View>

            {/* How We Use Your Information */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Voice Transcription: Voice recordings are sent to OpenAI to convert speech to text. OpenAI processes these recordings according to their privacy policy.{"\n\n"}
                • Local Storage: All your notes, notebooks, settings, and images are stored locally on your device using secure storage mechanisms.{"\n\n"}
                • App Functionality: We use your preferences and settings to provide personalized features like dark mode, custom colors, and background images.{"\n\n"}
                • Service Improvement: Anonymous usage data helps us identify bugs, improve performance, and develop new features.
              </Text>
            </View>

            {/* Permissions We Request */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">3. Permissions We Request</Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">3.1 Microphone Access</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Required for the voice recording feature. We only access your microphone when you tap the record button, and recordings are immediately sent for transcription.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">3.2 Photo Library Access</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Required to select custom background images for notebooks and the home screen. We only access photos you specifically select.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">3.3 Storage Access</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Required to save your notes, notebooks, settings, and selected images locally on your device.
              </Text>
            </View>

            {/* Data Sharing and Third Parties */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">4. Data Sharing and Third Parties</Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">4.1 OpenAI</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Voice recordings are sent to OpenAI for transcription. OpenAI may temporarily store these recordings according to their data retention policy. Please review OpenAI privacy policy for more information.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">4.2 Future Advertising Partners (Not Currently Active)</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                We may integrate advertising services in future versions. If we do, we will update this policy and notify you. Advertising partners may collect anonymous usage data and device identifiers to show relevant ads.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">4.3 We Do Not Sell Your Data</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </Text>
            </View>

            {/* Future Features */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">5. Future Features and Updates</Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">5.1 Premium Subscription (Planned)</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                We plan to offer premium features through in-app purchases. Payment processing will be handled by Apple App Store. We will not store your payment information.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">5.2 Advertisements (Planned)</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Future versions may include advertisements. Ad providers may use cookies and similar technologies to show relevant ads based on anonymous usage patterns.
              </Text>

              <Text className="text-base font-semibold text-gray-800 mb-2">5.3 Cloud Sync (Planned)</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                We may offer cloud synchronization in the future. If implemented, your notes would be encrypted and stored on secure servers. This feature will be optional and require explicit consent.
              </Text>
            </View>

            {/* Data Security */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">6. Data Security</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Local Storage: Your notes and data are stored locally using industry-standard secure storage mechanisms provided by iOS.{"\n\n"}
                • Encryption: Data stored on your device is protected by iOS encryption.{"\n\n"}
                • No Account Required: The app does not require account creation, reducing the risk of data breaches.{"\n\n"}
                • Transmission Security: Voice recordings are transmitted to OpenAI using encrypted HTTPS connections.
              </Text>
            </View>

            {/* Data Retention */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">7. Data Retention</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Local Data: Your notes, notebooks, and settings remain on your device until you delete the app or manually delete the content.{"\n\n"}
                • Voice Recordings: Temporary voice recordings are immediately sent to OpenAI for transcription and are not stored by us. OpenAI may retain recordings according to their retention policy.{"\n\n"}
                • Deletion: You can delete individual notes, entire notebooks, or uninstall the app to remove all data from your device.
              </Text>
            </View>

            {/* Your Rights */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">8. Your Rights and Choices</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                • Access: All your data is stored locally and accessible to you at any time within the app.{"\n\n"}
                • Deletion: You can delete any notes, notebooks, or images at any time.{"\n\n"}
                • Permission Control: You can revoke microphone or photo library access through your device settings, though this may limit app functionality.{"\n\n"}
                • Data Export: You can share individual notes via messaging apps or email.{"\n\n"}
                • Opt-Out: Future advertising features will include opt-out options where legally required.
              </Text>
            </View>

            {/* Children Privacy */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">9. Children Privacy</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                Voice Notepad is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at Moorestonetechnologies@gmail.com.
              </Text>
            </View>

            {/* International Users */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">10. International Users</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                If you are using Voice Notepad from outside the United States, please note that your voice recordings will be transmitted to OpenAI servers, which may be located in different countries. By using the app, you consent to this data transfer.
              </Text>
            </View>

            {/* Changes to Privacy Policy */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">11. Changes to This Privacy Policy</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. When we make significant changes, we will notify you through the app and require you to review and accept the updated policy.{"\n\n"}
                The date at the top of this policy indicates when it was last updated.
              </Text>
            </View>

            {/* Contact Us */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">12. Contact Us</Text>
              <Text className="text-base text-gray-700 leading-6 mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:{"\n\n"}
                Email: Moorestonetechnologies@gmail.com{"\n"}
                Company: MoreStoneTechnologies
              </Text>
            </View>

            {/* Consent */}
            <View className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <Text className="text-base font-semibold text-gray-900 mb-2">Your Consent</Text>
              <Text className="text-base text-gray-700 leading-6">
                By tapping &ldquo;Accept and Continue&rdquo; below, you acknowledge that you have read, understood, and agree to this Privacy Policy and our data practices.
              </Text>
            </View>

            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <View className="items-center mb-6">
                <View className="flex-row items-center bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                  <Ionicons name="arrow-down" size={20} color="#D97706" />
                  <Text className="text-sm font-semibold text-amber-800 ml-2">
                    Please scroll to read the full policy
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer with Accept Button */}
        <View className="border-t border-gray-200 p-6 bg-white">
          <Pressable
            onPress={handleAccept}
            disabled={!hasScrolledToBottom}
            className="rounded-xl py-4 items-center active:opacity-70"
            style={{
              backgroundColor: hasScrolledToBottom ? "#2563EB" : "#9CA3AF",
              opacity: hasScrolledToBottom ? 1 : 0.5,
            }}
          >
            <Text className="text-white text-lg font-bold">
              Accept and Continue
            </Text>
          </Pressable>
          {!hasScrolledToBottom && (
            <Text className="text-sm text-gray-500 text-center mt-3">
              Please read the entire policy to continue
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
