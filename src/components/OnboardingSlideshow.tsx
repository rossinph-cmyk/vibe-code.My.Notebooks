import React, { useState, useRef } from "react";
import { View, Text, Modal, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlideshowProps {
  visible: boolean;
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 1,
    color: "#7C3AED",
    title: "Welcome to Voice Notepad!",
    image: require("../../assets/WhatsApp Image 2025-12-11 at 23.06.15_99233046-1765465638984.jpeg"),
    features: [
      {
        icon: "mic",
        title: "Voice-to-Text",
        description: "Tap the microphone button to record your voice and instantly convert it to text"
      },
      {
        icon: "create-outline",
        title: "Edit Text Anytime",
        description: "Click on any note text to manually edit it with your keyboard"
      },
      {
        icon: "color-palette",
        title: "Customize Colors",
        description: "Change notebook cover colors using the rainbow gradient color picker"
      },
      {
        icon: "image-outline",
        title: "Add Background Images",
        description: "Personalize each notebook with custom photos and adjust transparency"
      }
    ]
  },
  {
    id: 2,
    color: "#EC4899",
    title: "Organize Your Notes",
    image: require("../../assets/WhatsApp Image 2025-12-11 at 23.06.16_f6d1bd59-1765465654331.jpeg"),
    features: [
      {
        icon: "book",
        title: "Multiple Notebooks",
        description: "Create unlimited notebooks to organize different topics or projects"
      },
      {
        icon: "color-fill",
        title: "Individual Note Colors",
        description: "Customize background and text colors for each individual note"
      },
      {
        icon: "layers-outline",
        title: "Transparency Control",
        description: "Adjust image transparency with a slider for perfect visibility (0-100%)"
      },
      {
        icon: "share-social",
        title: "Share Your Notes",
        description: "Easily share notes via WhatsApp, messaging apps, or email"
      }
    ]
  },
  {
    id: 3,
    color: "#D4A574",
    title: "Personalize Everything",
    image: require("../../assets/WhatsApp Image 2025-12-11 at 23.06.16_c178f76d-1765465681684.jpeg"),
    features: [
      {
        icon: "image",
        title: "Notebook Background Images",
        description: "Add custom photos to individual notebook covers with ghosted transparency"
      },
      {
        icon: "images-outline",
        title: "Home Screen Background",
        description: "Set a background image for your entire home screen"
      },
      {
        icon: "contrast",
        title: "Dark Mode",
        description: "Toggle between light and dark themes for comfortable viewing"
      },
      {
        icon: "pencil",
        title: "Rename Notebooks",
        description: "Tap on notebook names to quickly rename and organize your collection"
      }
    ]
  },
  {
    id: 4,
    color: "#0891B2",
    title: "Advanced Features",
    image: require("../../assets/WhatsApp Image 2025-12-11 at 23.06.16_6e23342c-1765465698275.jpeg"),
    features: [
      {
        icon: "trash-outline",
        title: "Delete Notes & Notebooks",
        description: "Long-press notebooks or swipe notes to delete unwanted items"
      },
      {
        icon: "eye-outline",
        title: "Lined Paper View",
        description: "Notes display on realistic lined paper for a familiar writing experience"
      },
      {
        icon: "save-outline",
        title: "Auto-Save",
        description: "All your notes are automatically saved locally on your device"
      },
      {
        icon: "finger-print",
        title: "No Account Required",
        description: "Privacy-focused: no login needed, all data stays on your device"
      }
    ]
  }
];

export const OnboardingSlideshow: React.FC<OnboardingSlideshowProps> = ({
  visible,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
    setCurrentSlide(0);
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleComplete}
    >
      <View style={{ flex: 1, backgroundColor: "#111827" }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={{ width: SCREEN_WIDTH, flex: 1 }}
            >
              <View style={{ flex: 1 }}>
                {/* Background Image Layer */}
                <Image
                  source={slide.image}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: 0.25 }}
                  resizeMode="cover"
                />

                {/* Gradient Overlay */}
                <LinearGradient
                  colors={[slide.color + "CC", slide.color + "66", "#000000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                >
                  {/* Title Section */}
                  <View style={{ height: 256, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 24, padding: 24 }}>
                      <Text style={{ fontSize: 36, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" }}>
                        {slide.title}
                      </Text>
                    </View>
                  </View>

                {/* Features List */}
                <ScrollView
                  style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}
                  showsVerticalScrollIndicator={false}
                >
                  {slide.features.map((feature, idx) => (
                    <View
                      key={idx}
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: "row" }}
                    >
                      <View style={{ marginRight: 16 }}>
                        <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>
                          {feature.title}
                        </Text>
                        <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 24 }}>
                          {feature.description}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View style={{ height: 128 }} />
                </ScrollView>
              </LinearGradient>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.3)", padding: 24 }}>
          {/* Pagination Dots */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={{
                  marginHorizontal: 8,
                  borderRadius: 4,
                  width: currentSlide === index ? 32 : 8,
                  height: 8,
                  backgroundColor: currentSlide === index ? "#FFFFFF" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {currentSlide < SLIDES.length - 1 ? (
              <>
                <Pressable
                  onPress={handleSkip}
                  style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Skip</Text>
                </Pressable>
                <Pressable
                  onPress={handleNext}
                  style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#111827", fontSize: 16, fontWeight: "bold" }}>Next</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={handleComplete}
                style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ color: "#111827", fontSize: 16, fontWeight: "bold" }}>Get Started</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
