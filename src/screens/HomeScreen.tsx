import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Modal, TextInput, Keyboard, PanResponder, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNotebookStore } from "../state/notebookStore";
import { Ionicons } from "@expo/vector-icons";
import { NotebookModal } from "../components/NotebookModal";
import { OnboardingSlideshow } from "../components/OnboardingSlideshow";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const notebooks = useNotebookStore((s) => s.notebooks);
  const darkMode = useNotebookStore((s) => s.darkMode);
  const toggleDarkMode = useNotebookStore((s) => s.toggleDarkMode);
  const updateNotebook = useNotebookStore((s) => s.updateNotebook);
  const updateNotebookBackgroundImage = useNotebookStore((s) => s.updateNotebookBackgroundImage);
  const homeBackgroundImage = useNotebookStore((s) => s.homeBackgroundImage);
  const homeBackgroundImageOpacity = useNotebookStore((s) => s.homeBackgroundImageOpacity);
  const updateHomeBackgroundImage = useNotebookStore((s) => s.updateHomeBackgroundImage);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#E63946");
  const [originalColor, setOriginalColor] = useState("#E63946");
  const [sliderPosition, setSliderPosition] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.15);
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>(undefined);
  const [showHomeImagePicker, setShowHomeImagePicker] = useState(false);
  const [homeImageOpacity, setHomeImageOpacity] = useState(0.15);
  const [selectedHomeImageUri, setSelectedHomeImageUri] = useState<string | undefined>(undefined);
  const [showFeaturesSlideshow, setShowFeaturesSlideshow] = useState(false);
  const sliderWidth = 280;

  const handleResetApp = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert("App Reset", "Please reload the app to see the privacy policy and onboarding screens.");
    } catch (error) {
      Alert.alert("Error", "Failed to reset the app.");
    }
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const getColorFromPosition = (position: number): string => {
    const hue = position * 360;
    return hslToHex(hue, 100, 50);
  };

  const getPositionFromColor = (hexColor: string): number => {
    // Convert hex to RGB
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert RGB to HSL to get hue
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return h; // Return normalized position (0-1)
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setSliderPosition(newPosition);
        setSelectedColor(getColorFromPosition(newPosition));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setSliderPosition(newPosition);
        setSelectedColor(getColorFromPosition(newPosition));
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleNotebookPress = (notebookId: string) => {
    navigation.navigate("Notebook", { notebookId });
  };

  const handleAddNotebook = () => {
    setEditingNotebook(null);
    setModalVisible(true);
  };

  const handleEditNotebook = (notebookId: string) => {
    setEditingNotebook(notebookId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingNotebook(null);
  };

  const handleNamePress = (notebookId: string, currentName: string) => {
    setEditingNameId(notebookId);
    setEditingNameValue(currentName);
  };

  const handleNameSave = () => {
    if (editingNameId && editingNameValue.trim()) {
      updateNotebook(editingNameId, { name: editingNameValue.trim() });
    }
    setEditingNameId(null);
    setEditingNameValue("");
    Keyboard.dismiss();
  };

  const handleNameCancel = () => {
    setEditingNameId(null);
    setEditingNameValue("");
    Keyboard.dismiss();
  };

  const handleColorPress = (notebookId: string, currentColor: string) => {
    setEditingColorId(notebookId);
    setSelectedColor(currentColor);
    setOriginalColor(currentColor);
    const position = getPositionFromColor(currentColor);
    setSliderPosition(position);
    setShowColorPicker(true);
  };

  const handleResetColor = () => {
    setSelectedColor(originalColor);
    const position = getPositionFromColor(originalColor);
    setSliderPosition(position);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveColor = () => {
    if (editingColorId && selectedColor) {
      updateNotebook(editingColorId, { color: selectedColor });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowColorPicker(false);
    setEditingColorId(null);
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setEditingColorId(null);
  };

  const handleImagePress = async (notebookId: string) => {
    const notebook = notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    setEditingImageId(notebookId);
    setSelectedImageUri(notebook.backgroundImage);
    setImageOpacity(notebook.backgroundImageOpacity || 0.15);
    setShowImagePicker(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to select an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveImage = () => {
    if (editingImageId) {
      updateNotebookBackgroundImage(editingImageId, selectedImageUri, imageOpacity);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowImagePicker(false);
    setEditingImageId(null);
  };

  const handleCloseImagePicker = () => {
    setShowImagePicker(false);
    setEditingImageId(null);
  };

  const handleHomeImagePress = () => {
    setSelectedHomeImageUri(homeBackgroundImage);
    setHomeImageOpacity(homeBackgroundImageOpacity || 0.15);
    setShowHomeImagePicker(true);
  };

  const handlePickHomeImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to select an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedHomeImageUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveHomeImage = () => {
    setSelectedHomeImageUri(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveHomeImage = () => {
    updateHomeBackgroundImage(selectedHomeImageUri, homeImageOpacity);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowHomeImagePicker(false);
  };

  const handleCloseHomeImagePicker = () => {
    setShowHomeImagePicker(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FEF3C7" }}
      edges={["top", "bottom"]}
    >
      {/* Home Background Image */}
      {homeBackgroundImage && (
        <Image
          source={{ uri: homeBackgroundImage }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: homeBackgroundImageOpacity || 0.15 }}
          resizeMode="cover"
        />
      )}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        {/* Header with title and controls */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{ fontSize: 36, fontWeight: "bold", color: darkMode ? "#A855F7" : "#78350F" }}
            >
              My Notebooks
            </Text>
            <View style={{ marginLeft: 12, padding: 8, borderRadius: 20, backgroundColor: darkMode ? "#A855F7" : "#78350F" }}>
              <Ionicons
                name="mic"
                size={24}
                color={darkMode ? "#000000" : "#FFFFFF"}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Reset App",
                  "Reset app to first-time startup? This will show the privacy policy and onboarding screens again.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Reset", style: "destructive", onPress: handleResetApp }
                  ]
                );
              }}
              onLongPress={() => {
                Alert.alert(
                  "Reset App",
                  "Reset app to first-time startup? This will show the privacy policy and onboarding screens again.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Reset", style: "destructive", onPress: handleResetApp }
                  ]
                );
              }}
              style={{ padding: 8, borderRadius: 20, backgroundColor: darkMode ? "#1F1F1F" : "#FDE68A" }}
            >
              <Ionicons
                name="refresh"
                size={28}
                color={darkMode ? "#A855F7" : "#78350F"}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setShowFeaturesSlideshow(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{ padding: 8, borderRadius: 20, backgroundColor: darkMode ? "#1F1F1F" : "#FDE68A" }}
            >
              <Ionicons
                name="help-circle-outline"
                size={28}
                color={darkMode ? "#A855F7" : "#78350F"}
              />
            </Pressable>
            <Pressable
              onPress={handleHomeImagePress}
              style={{ padding: 8, borderRadius: 20, backgroundColor: darkMode ? "#1F1F1F" : "#FDE68A" }}
            >
              <Ionicons
                name="image-outline"
                size={28}
                color={darkMode ? "#A855F7" : "#78350F"}
              />
            </Pressable>
            <Pressable
              onPress={toggleDarkMode}
              style={{ padding: 8, borderRadius: 20, backgroundColor: darkMode ? "#1F1F1F" : "#FDE68A" }}
            >
              <Ionicons
                name={darkMode ? "sunny" : "moon"}
                size={28}
                color={darkMode ? "#A855F7" : "#78350F"}
              />
            </Pressable>
          </View>
        </View>
        <Text
          style={{ fontSize: 16, marginBottom: 32, color: darkMode ? "#A855F7" : "#92400E" }}
        >
          Tap to open or create a new notebook
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Two notebooks displayed horizontally */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32 }}>
            {notebooks.slice(0, 2).map((notebook) => (
              <Pressable
                key={notebook.id}
                onPress={() => handleNotebookPress(notebook.id)}
                onLongPress={() => handleEditNotebook(notebook.id)}
                style={{
                  width: "48%",
                  aspectRatio: 1 / 1.6,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: notebook.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                {/* Background Image */}
                {notebook.backgroundImage && (
                  <Image
                    source={{ uri: notebook.backgroundImage }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: notebook.backgroundImageOpacity || 0.15 }}
                    resizeMode="cover"
                  />
                )}
                <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Ionicons name="book-outline" size={36} color="#FFFFFF" />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleColorPress(notebook.id, notebook.color);
                        }}
                        style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 }}
                      >
                        <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" />
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleImagePress(notebook.id);
                        }}
                        style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 }}
                      >
                        <Ionicons name="image-outline" size={20} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleNamePress(notebook.id, notebook.name)}
                  >
                    <Text
                      style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF" }}
                      numberOfLines={2}
                    >
                      {notebook.name}
                    </Text>
                  </Pressable>
                  <Text style={{ fontSize: 18, color: "#FFFFFF", opacity: 0.8 }}>
                    {notebook.notes.length} {notebook.notes.length === 1 ? "note" : "notes"}
                  </Text>
                </View>

                {/* Ring binder effect */}
                <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 36, flexDirection: "column", justifyContent: "space-around", alignItems: "center", paddingVertical: 32 }}>
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#9CA3AF", borderWidth: 2, borderColor: "#D1D5DB", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 1, height: 1 } }}
                    />
                  ))}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Additional notebooks in grid layout */}
          {notebooks.length > 2 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {notebooks.slice(2).map((notebook, index) => (
                <Pressable
                  key={notebook.id}
                  onPress={() => handleNotebookPress(notebook.id)}
                  onLongPress={() => handleEditNotebook(notebook.id)}
                  style={{
                    width: "48%",
                    aspectRatio: 1 / 1.6,
                    marginBottom: 24,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: notebook.color,
                    marginRight: index % 2 === 0 ? "4%" : 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  {/* Background Image */}
                  {notebook.backgroundImage && (
                    <Image
                      source={{ uri: notebook.backgroundImage }}
                      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: notebook.backgroundImageOpacity || 0.15 }}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ flex: 1, padding: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <Ionicons name="book-outline" size={32} color="#FFFFFF" />
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleColorPress(notebook.id, notebook.color);
                          }}
                          style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 }}
                        >
                          <Ionicons name="color-palette-outline" size={18} color="#FFFFFF" />
                        </Pressable>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleImagePress(notebook.id);
                          }}
                          style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 }}
                        >
                          <Ionicons name="image-outline" size={18} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleNamePress(notebook.id, notebook.name)}
                    >
                      <Text
                        style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF" }}
                        numberOfLines={3}
                      >
                        {notebook.name}
                      </Text>
                    </Pressable>
                    <View style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                      <Text style={{ fontSize: 16, color: "#FFFFFF", opacity: 0.8 }}>
                        {notebook.notes.length} {notebook.notes.length === 1 ? "note" : "notes"}
                      </Text>
                    </View>
                  </View>

                  {/* Ring binder effect */}
                  <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 36, flexDirection: "column", justifyContent: "space-around", alignItems: "center", paddingVertical: 32 }}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#9CA3AF", borderWidth: 2, borderColor: "#D1D5DB", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 1, height: 1 } }}
                      />
                    ))}
                  </View>
                </Pressable>
              ))}

              {/* Add new notebook button in grid */}
              <Pressable
                onPress={handleAddNotebook}
                style={{
                  width: "48%",
                  aspectRatio: 1 / 1.6,
                  borderRadius: 16,
                  borderWidth: 4,
                  borderStyle: "dashed",
                  borderColor: "#FCD34D",
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: notebooks.slice(2).length % 2 === 0 ? "4%" : 0,
                }}
              >
                <Ionicons name="add" size={48} color="#D97706" />
                <Text style={{ fontSize: 20, fontWeight: "600", color: "#78350F", marginTop: 8 }}>New Notebook</Text>
              </Pressable>
            </View>
          )}

          {/* Add new notebook button for initial layout */}
          {notebooks.length <= 2 && notebooks.length % 2 === 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Pressable
                onPress={handleAddNotebook}
                style={{
                  width: "48%",
                  aspectRatio: 1 / 1.6,
                  borderRadius: 16,
                  borderWidth: 4,
                  borderStyle: "dashed",
                  borderColor: "#FCD34D",
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={48} color="#D97706" />
                <Text style={{ fontSize: 20, fontWeight: "600", color: "#78350F", marginTop: 8 }}>New Notebook</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>

      <NotebookModal
        visible={modalVisible}
        onClose={handleCloseModal}
        notebookId={editingNotebook}
      />

      {/* Name editing modal */}
      <Modal
        visible={editingNameId !== null}
        animationType="fade"
        transparent
        onRequestClose={handleNameCancel}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}
          onPress={handleNameCancel}
        >
          <Pressable
            style={{ width: "100%", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24 }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 16 }}>Edit Notebook Name</Text>
            <TextInput
              value={editingNameValue}
              onChangeText={setEditingNameValue}
              placeholder="Enter notebook name"
              style={{ backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: "#111827", marginBottom: 16 }}
              placeholderTextColor="#9CA3AF"
              autoFocus
              onSubmitEditing={handleNameSave}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={handleNameCancel}
                style={{ flex: 1, backgroundColor: "#E5E7EB", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleNameSave}
                disabled={!editingNameValue.trim()}
                style={{ flex: 1, backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 12, alignItems: "center", opacity: !editingNameValue.trim() ? 0.5 : 1 }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        transparent
        onRequestClose={handleCloseColorPicker}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>Color Change</Text>
              <Pressable onPress={handleCloseColorPicker}>
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 16 }}>
              Select Notebook Color
            </Text>

            {/* Original Color Option */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Original Color</Text>
              <Pressable
                onPress={() => {
                  setSelectedColor(originalColor);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  height: 64,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  backgroundColor: originalColor,
                  borderColor: selectedColor === originalColor ? "#3B82F6" : "#E5E7EB"
                }}
              >
                <Ionicons name="book-outline" size={32} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Rainbow Gradient Slider */}
            <View style={{ marginBottom: 24, alignItems: "center" }}>
              <View
                {...panResponder.panHandlers}
                style={{ width: sliderWidth, height: 60, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}
              >
                <LinearGradient
                  colors={["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
                {/* Slider indicator */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: sliderPosition * sliderWidth - 3,
                    width: 6,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 3,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Color Preview */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Preview</Text>
              <View
                style={{ height: 96, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: selectedColor }}
              >
                <Ionicons name="book-outline" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveColor}
              style={{ backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>Save Color</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        animationType="slide"
        transparent
        onRequestClose={handleCloseImagePicker}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>Notebook Background</Text>
              <Pressable onPress={handleCloseImagePicker}>
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 16 }}>
              Choose an image or color for your notebook
            </Text>

            {/* Image Preview */}
            {selectedImageUri ? (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Selected Image</Text>
                <View style={{ height: 192, borderRadius: 16, overflow: "hidden", borderWidth: 2, borderColor: "#E5E7EB", marginBottom: 16 }}>
                  <View style={{ flex: 1, backgroundColor: editingImageId ? notebooks.find((nb) => nb.id === editingImageId)?.color : "#E63946" }}>
                    <Image
                      source={{ uri: selectedImageUri }}
                      style={{ width: "100%", height: "100%", opacity: imageOpacity }}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Transparency Slider */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                    Transparency: {Math.round(imageOpacity * 100)}%
                  </Text>
                  <View style={{ backgroundColor: "#E5E7EB", height: 48, borderRadius: 12, justifyContent: "center", paddingHorizontal: 8 }}>
                    <View
                      {...PanResponder.create({
                        onStartShouldSetPanResponder: () => true,
                        onMoveShouldSetPanResponder: () => true,
                        onPanResponderGrant: (evt) => {
                          const x = evt.nativeEvent.locationX - 16;
                          const maxWidth = sliderWidth - 32;
                          const newOpacity = Math.max(0, Math.min(1, x / maxWidth));
                          setImageOpacity(newOpacity);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        },
                        onPanResponderMove: (evt) => {
                          const x = evt.nativeEvent.locationX - 16;
                          const maxWidth = sliderWidth - 32;
                          const newOpacity = Math.max(0, Math.min(1, x / maxWidth));
                          setImageOpacity(newOpacity);
                        },
                      }).panHandlers}
                      style={{ width: sliderWidth, height: 48, justifyContent: "center" }}
                    >
                      <View style={{ backgroundColor: "#D1D5DB", height: 8, borderRadius: 4 }} />
                      <View
                        style={{
                          position: "absolute",
                          left: imageOpacity * (sliderWidth - 48),
                          width: 24,
                          height: 24,
                          backgroundColor: "#3B82F6",
                          borderRadius: 12,
                          borderWidth: 3,
                          borderColor: "#FFFFFF",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Remove Image Button */}
                <Pressable
                  onPress={handleRemoveImage}
                  style={{ backgroundColor: "#FEE2E2", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 12 }}
                >
                  <Text style={{ color: "#DC2626", fontSize: 16, fontWeight: "600" }}>Remove Image</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }}>
                <Pressable
                  onPress={handlePickImage}
                  style={{ height: 192, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: "#D1D5DB", backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                  <Text style={{ color: "#4B5563", fontSize: 16, fontWeight: "600", marginTop: 16 }}>
                    Select an Image
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {selectedImageUri && (
                <Pressable
                  onPress={handlePickImage}
                  style={{ flex: 1, backgroundColor: "#E5E7EB", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>Change Image</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleSaveImage}
                style={{ flex: 1, backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Home Background Image Picker Modal */}
      <Modal
        visible={showHomeImagePicker}
        animationType="slide"
        transparent
        onRequestClose={handleCloseHomeImagePicker}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>Home Background</Text>
              <Pressable onPress={handleCloseHomeImagePicker}>
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 16 }}>
              Choose a background image for your home screen
            </Text>

            {/* Image Preview */}
            {selectedHomeImageUri ? (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Selected Image</Text>
                <View style={{ height: 192, borderRadius: 16, overflow: "hidden", borderWidth: 2, borderColor: "#E5E7EB", marginBottom: 16 }}>
                  <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FEF3C7" }}>
                    <Image
                      source={{ uri: selectedHomeImageUri }}
                      style={{ width: "100%", height: "100%", opacity: homeImageOpacity }}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Transparency Slider */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                    Transparency: {Math.round(homeImageOpacity * 100)}%
                  </Text>
                  <View style={{ backgroundColor: "#E5E7EB", height: 48, borderRadius: 12, justifyContent: "center", paddingHorizontal: 8 }}>
                    <View
                      {...PanResponder.create({
                        onStartShouldSetPanResponder: () => true,
                        onMoveShouldSetPanResponder: () => true,
                        onPanResponderGrant: (evt) => {
                          const x = evt.nativeEvent.locationX - 16;
                          const maxWidth = sliderWidth - 32;
                          const newOpacity = Math.max(0, Math.min(1, x / maxWidth));
                          setHomeImageOpacity(newOpacity);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        },
                        onPanResponderMove: (evt) => {
                          const x = evt.nativeEvent.locationX - 16;
                          const maxWidth = sliderWidth - 32;
                          const newOpacity = Math.max(0, Math.min(1, x / maxWidth));
                          setHomeImageOpacity(newOpacity);
                        },
                      }).panHandlers}
                      style={{ width: sliderWidth, height: 48, justifyContent: "center" }}
                    >
                      <View style={{ backgroundColor: "#D1D5DB", height: 8, borderRadius: 4 }} />
                      <View
                        style={{
                          position: "absolute",
                          left: homeImageOpacity * (sliderWidth - 48),
                          width: 24,
                          height: 24,
                          backgroundColor: "#3B82F6",
                          borderRadius: 12,
                          borderWidth: 3,
                          borderColor: "#FFFFFF",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Remove Image Button */}
                <Pressable
                  onPress={handleRemoveHomeImage}
                  style={{ backgroundColor: "#FEE2E2", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 12 }}
                >
                  <Text style={{ color: "#DC2626", fontSize: 16, fontWeight: "600" }}>Remove Image</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }}>
                <Pressable
                  onPress={handlePickHomeImage}
                  style={{ height: 192, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: "#D1D5DB", backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                  <Text style={{ color: "#4B5563", fontSize: 16, fontWeight: "600", marginTop: 16 }}>
                    Select an Image
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {selectedHomeImageUri && (
                <Pressable
                  onPress={handlePickHomeImage}
                  style={{ flex: 1, backgroundColor: "#E5E7EB", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>Change Image</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleSaveHomeImage}
                style={{ flex: 1, backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <OnboardingSlideshow
        visible={showFeaturesSlideshow}
        onComplete={() => setShowFeaturesSlideshow(false)}
      />
    </SafeAreaView>
  );
};
