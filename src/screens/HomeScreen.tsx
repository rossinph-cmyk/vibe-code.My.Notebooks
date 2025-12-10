import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Modal, TextInput, Keyboard, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNotebookStore } from "../state/notebookStore";
import { Ionicons } from "@expo/vector-icons";
import { NotebookModal } from "../components/NotebookModal";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const notebooks = useNotebookStore((s) => s.notebooks);
  const darkMode = useNotebookStore((s) => s.darkMode);
  const toggleDarkMode = useNotebookStore((s) => s.toggleDarkMode);
  const updateNotebook = useNotebookStore((s) => s.updateNotebook);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#E63946");
  const [originalColor, setOriginalColor] = useState("#E63946");
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderWidth = 280;

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
    setShowColorPicker(true);
  };

  const handleResetColor = () => {
    setSelectedColor(originalColor);
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

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{ backgroundColor: darkMode ? "#000000" : "#FEF3C7" }}
    >
      <View className="flex-1 px-6 pt-8">
        {/* Header with title and dark mode toggle */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text
              className="text-4xl font-bold"
              style={{ color: darkMode ? "#A855F7" : "#78350F" }}
            >
              My Notebooks
            </Text>
          </View>
          <Pressable
            onPress={toggleDarkMode}
            className="p-2 rounded-full active:opacity-70"
            style={{ backgroundColor: darkMode ? "#1F1F1F" : "#FDE68A" }}
          >
            <Ionicons
              name={darkMode ? "sunny" : "moon"}
              size={28}
              color={darkMode ? "#A855F7" : "#78350F"}
            />
          </Pressable>
        </View>
        <Text
          className="text-base mb-8"
          style={{ color: darkMode ? "#A855F7" : "#92400E" }}
        >
          Tap to open or create a new notebook
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Two notebooks displayed horizontally */}
          <View className="flex-row justify-between mb-8">
            {notebooks.map((notebook) => (
              <Pressable
                key={notebook.id}
                onPress={() => handleNotebookPress(notebook.id)}
                onLongPress={() => handleEditNotebook(notebook.id)}
                className="w-[48%] aspect-[1/1.6] rounded-2xl shadow-lg overflow-hidden active:opacity-70"
                style={{
                  backgroundColor: notebook.color,
                }}
              >
                <View className="flex-1 p-6 justify-between">
                  <View className="flex-row items-center justify-between">
                    <Ionicons name="book-outline" size={36} color="#FFFFFF" />
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleColorPress(notebook.id, notebook.color);
                      }}
                      className="bg-white/20 p-2 rounded-full active:opacity-70"
                    >
                      <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => handleNamePress(notebook.id, notebook.name)}
                    className="active:opacity-70"
                  >
                    <Text
                      className="text-xl font-bold text-white"
                      numberOfLines={2}
                    >
                      {notebook.name}
                    </Text>
                  </Pressable>
                  <Text className="text-lg text-white opacity-80">
                    {notebook.notes.length} {notebook.notes.length === 1 ? "note" : "notes"}
                  </Text>
                </View>

                {/* Ring binder effect */}
                <View className="absolute left-0 top-0 bottom-0 w-9 flex-col justify-around items-center py-8">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className="w-5 h-5 rounded-full bg-gray-400 border-2 border-gray-300"
                      style={{ shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 1, height: 1 } }}
                    />
                  ))}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Additional notebooks in grid layout */}
          {notebooks.length > 2 && (
            <View className="flex-row flex-wrap">
              {notebooks.slice(2).map((notebook, index) => (
                <Pressable
                  key={notebook.id}
                  onPress={() => handleNotebookPress(notebook.id)}
                  onLongPress={() => handleEditNotebook(notebook.id)}
                  className="w-[48%] aspect-[1/1.6] mb-6 rounded-2xl shadow-lg overflow-hidden active:opacity-70"
                  style={{
                    backgroundColor: notebook.color,
                    marginRight: index % 2 === 0 ? "4%" : 0,
                  }}
                >
                  <View className="flex-1 p-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <Ionicons name="book-outline" size={32} color="#FFFFFF" />
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleColorPress(notebook.id, notebook.color);
                        }}
                        className="bg-white/20 p-2 rounded-full active:opacity-70"
                      >
                        <Ionicons name="color-palette-outline" size={18} color="#FFFFFF" />
                      </Pressable>
                    </View>
                    <Pressable
                      onPress={() => handleNamePress(notebook.id, notebook.name)}
                      className="active:opacity-70"
                    >
                      <Text
                        className="text-xl font-bold text-white"
                        numberOfLines={3}
                      >
                        {notebook.name}
                      </Text>
                    </Pressable>
                    <View className="absolute bottom-6 left-6 right-6">
                      <Text className="text-base text-white opacity-80">
                        {notebook.notes.length} {notebook.notes.length === 1 ? "note" : "notes"}
                      </Text>
                    </View>
                  </View>

                  {/* Ring binder effect */}
                  <View className="absolute left-0 top-0 bottom-0 w-9 flex-col justify-around items-center py-8">
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        className="w-5 h-5 rounded-full bg-gray-400 border-2 border-gray-300"
                        style={{ shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 1, height: 1 } }}
                      />
                    ))}
                  </View>
                </Pressable>
              ))}

              {/* Add new notebook button in grid */}
              <Pressable
                onPress={handleAddNotebook}
                className="w-[48%] aspect-[1/1.6] rounded-2xl border-4 border-dashed border-amber-300 bg-amber-100 items-center justify-center active:opacity-70"
                style={{
                  marginRight: notebooks.slice(2).length % 2 === 0 ? "4%" : 0,
                }}
              >
                <Ionicons name="add" size={48} color="#D97706" />
                <Text className="text-xl font-semibold text-amber-900 mt-2">New Notebook</Text>
              </Pressable>
            </View>
          )}

          {/* Add new notebook button for initial layout */}
          {notebooks.length <= 2 && notebooks.length % 2 === 0 && (
            <View className="flex-row justify-between">
              <Pressable
                onPress={handleAddNotebook}
                className="w-[48%] aspect-[1/1.6] rounded-2xl border-4 border-dashed border-amber-300 bg-amber-100 items-center justify-center active:opacity-70"
              >
                <Ionicons name="add" size={48} color="#D97706" />
                <Text className="text-xl font-semibold text-amber-900 mt-2">New Notebook</Text>
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
          className="flex-1 bg-black/50 justify-center items-center px-8"
          onPress={handleNameCancel}
        >
          <Pressable
            className="w-full bg-white rounded-2xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold text-gray-900 mb-4">Edit Notebook Name</Text>
            <TextInput
              value={editingNameValue}
              onChangeText={setEditingNameValue}
              placeholder="Enter notebook name"
              className="bg-gray-100 rounded-xl px-4 py-4 text-base text-gray-900 mb-4"
              placeholderTextColor="#9CA3AF"
              autoFocus
              onSubmitEditing={handleNameSave}
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleNameCancel}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center active:opacity-70"
              >
                <Text className="text-gray-900 text-base font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleNameSave}
                disabled={!editingNameValue.trim()}
                className="flex-1 bg-blue-600 rounded-xl py-3 items-center active:opacity-70"
                style={{ opacity: !editingNameValue.trim() ? 0.5 : 1 }}
              >
                <Text className="text-white text-base font-semibold">Save</Text>
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">Color Change</Text>
              <Pressable
                onPress={handleCloseColorPicker}
                className="active:opacity-70"
              >
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-4">
              Select Notebook Color
            </Text>

            {/* Rainbow Gradient Slider */}
            <View className="mb-6 items-center">
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
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Preview</Text>
              <View
                className="h-24 rounded-2xl items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                <Ionicons name="book-outline" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleResetColor}
                className="flex-1 bg-gray-500 rounded-xl py-4 items-center active:opacity-70"
              >
                <Text className="text-white text-lg font-bold">Reset</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveColor}
                className="flex-1 bg-blue-600 rounded-xl py-4 items-center active:opacity-70"
              >
                <Text className="text-white text-lg font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
