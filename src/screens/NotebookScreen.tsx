import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Share, Modal, PanResponder, Linking, ActionSheetIOS, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNotebookStore } from "../state/notebookStore";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { transcribeAudio } from "../api/transcribe-audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";

type NotebookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Notebook">;
type NotebookScreenRouteProp = RouteProp<RootStackParamList, "Notebook">;

interface NotebookScreenProps {
  navigation: NotebookScreenNavigationProp;
  route: NotebookScreenRouteProp;
}

export const NotebookScreen: React.FC<NotebookScreenProps> = ({ navigation, route }) => {
  const { notebookId } = route.params;
  const notebook = useNotebookStore((s) => s.getNotebook(notebookId));
  const updateNotebook = useNotebookStore((s) => s.updateNotebook);
  const addNote = useNotebookStore((s) => s.addNote);
  const deleteNote = useNotebookStore((s) => s.deleteNote);
  const updateNoteColor = useNotebookStore((s) => s.updateNoteColor);
  const updateNoteTextColor = useNotebookStore((s) => s.updateNoteTextColor);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(notebook?.color || "#E63946");
  const [originalNotebookColor, setOriginalNotebookColor] = useState(notebook?.color || "#E63946");
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderWidth = 280;
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [showNoteColorPicker, setShowNoteColorPicker] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteColor, setSelectedNoteColor] = useState("#FFFFFF");
  const [originalNoteColor, setOriginalNoteColor] = useState("#FFFFFF");
  const [noteSliderPosition, setNoteSliderPosition] = useState(0);
  const [showNoteTextColorPicker, setShowNoteTextColorPicker] = useState(false);
  const [selectedNoteTextColor, setSelectedNoteTextColor] = useState("#000000");
  const [originalNoteTextColor, setOriginalNoteTextColor] = useState("#000000");
  const [noteTextSliderPosition, setNoteTextSliderPosition] = useState(0);

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

  const notePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setNoteSliderPosition(newPosition);
        setSelectedNoteColor(getColorFromPosition(newPosition));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setNoteSliderPosition(newPosition);
        setSelectedNoteColor(getColorFromPosition(newPosition));
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const noteTextPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setNoteTextSliderPosition(newPosition);
        setSelectedNoteTextColor(getColorFromPosition(newPosition));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(1, x / sliderWidth));
        setNoteTextSliderPosition(newPosition);
        setSelectedNoteTextColor(getColorFromPosition(newPosition));
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleSaveColor = () => {
    if (notebook) {
      updateNotebook(notebookId, { color: selectedColor });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowColorPicker(false);
  };

  const handleOpenNotebookColorPicker = () => {
    const currentColor = notebook?.color || "#E63946";
    setSelectedColor(currentColor);
    setOriginalNotebookColor(currentColor);
    const position = getPositionFromColor(currentColor);
    setSliderPosition(position);
    setShowColorPicker(true);
  };

  const handleResetNotebookColor = () => {
    setSelectedColor(originalNotebookColor);
    const position = getPositionFromColor(originalNotebookColor);
    setSliderPosition(position);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNoteColorPress = (noteId: string, currentColor?: string) => {
    const noteColor = currentColor || "#FFFFFF";
    setSelectedNoteId(noteId);
    setSelectedNoteColor(noteColor);
    setOriginalNoteColor(noteColor);
    const position = getPositionFromColor(noteColor);
    setNoteSliderPosition(position);
    setShowNoteColorPicker(true);
  };

  const handleResetNoteColor = () => {
    setSelectedNoteColor(originalNoteColor);
    // Reset the slider position to match the original color
    const position = getPositionFromColor(originalNoteColor);
    setNoteSliderPosition(position);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveNoteColor = () => {
    if (selectedNoteId) {
      updateNoteColor(notebookId, selectedNoteId, selectedNoteColor);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowNoteColorPicker(false);
    setSelectedNoteId(null);
  };

  const handleNoteTextColorPress = (noteId: string, currentTextColor?: string) => {
    const noteTextColor = currentTextColor || notebook?.textColor || "#000000";
    setSelectedNoteId(noteId);
    setSelectedNoteTextColor(noteTextColor);
    setOriginalNoteTextColor(noteTextColor);
    const position = getPositionFromColor(noteTextColor);
    setNoteTextSliderPosition(position);
    setShowNoteTextColorPicker(true);
  };

  const handleSaveNoteTextColor = () => {
    if (selectedNoteId) {
      updateNoteTextColor(notebookId, selectedNoteId, selectedNoteTextColor);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowNoteTextColorPicker(false);
    setSelectedNoteId(null);
  };

  const handleEditNote = (noteId: string, noteText: string) => {
    setEditingNoteId(noteId);
    setEditingNoteText(noteText);
  };

  const handleSaveNote = () => {
    if (editingNoteId && editingNoteText.trim() && notebook) {
      const updateNote = useNotebookStore.getState().updateNote;
      updateNote(notebookId, editingNoteId, editingNoteText.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  // Layout effect for header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: notebook?.name || "Notebook",
      headerStyle: {
        backgroundColor: notebook?.color || "#ED0A3F",
      },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerRight: () => (
        <Pressable
          onPress={handleOpenNotebookColorPicker}
          className="mr-4 active:opacity-70"
        >
          <Ionicons name="color-palette-outline" size={24} color="#FFFFFF" />
        </Pressable>
      ),
    });
  }, [navigation, notebook]);

  if (!notebook) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Notebook not found</Text>
      </SafeAreaView>
    );
  }

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Please grant microphone permission to record audio.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (!uri) {
        Alert.alert("Error", "Failed to get recording URI.");
        return;
      }

      setIsTranscribing(true);
      try {
        const transcribedText = await transcribeAudio(uri);
        addNote(notebookId, transcribedText);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Transcription error:", error);
        Alert.alert("Error", "Failed to transcribe audio. Please try again.");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsTranscribing(false);
      }

      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const handleShare = async (noteText: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Try to open WhatsApp directly with the message
      // Skip canOpenURL check as it requires Info.plist configuration
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(noteText)}`;

      // Try opening WhatsApp directly - this will work if WhatsApp is installed
      const opened = await Linking.openURL(whatsappUrl).then(() => true).catch(() => false);

      if (opened) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // WhatsApp not available, use native share
        const result = await Share.share({ message: noteText });
        if (result.action === Share.sharedAction) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      // Fallback to native share sheet
      try {
        const result = await Share.share({ message: noteText });
        if (result.action === Share.sharedAction) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);
        Alert.alert("Share Error", "Failed to share the note. Please try again.");
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNote(notebookId, noteId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const backgroundColorWithOpacity = notebook.backgroundColor + "E6";

  return (
    <View className="flex-1" style={{ backgroundColor: notebook.color }}>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {notebook.notes.length === 0 && !isTranscribing && (
            <View className="items-center justify-center py-20">
              <Ionicons name="mic-outline" size={64} color={notebook.textColor} style={{ opacity: 0.3 }} />
              <Text className="text-lg text-center mt-4" style={{ color: notebook.textColor, opacity: 0.5 }}>
                Tap the microphone to record your first note
              </Text>
            </View>
          )}

          {isTranscribing && (
            <View
              className="rounded-2xl p-6 mb-4 items-center"
              style={{ backgroundColor: backgroundColorWithOpacity }}
            >
              <Ionicons name="hourglass-outline" size={32} color={notebook.textColor} />
              <Text className="text-base mt-2" style={{ color: notebook.textColor }}>
                Transcribing your note...
              </Text>
            </View>
          )}

          {notebook.notes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const noteBackgroundColor = note.backgroundColor || notebook.backgroundColor;
            const noteTextColor = note.textColor || notebook.textColor;

            return (
              <View
                key={note.id}
                className="rounded-2xl p-6 mb-4 relative overflow-hidden"
                style={{ backgroundColor: noteBackgroundColor }}
              >
                {/* Lined paper effect */}
                <View className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      className="absolute left-0 right-0 border-b"
                      style={{
                        borderColor: noteTextColor,
                        opacity: 0.1,
                        top: 30 + i * 24,
                      }}
                    />
                  ))}
                </View>

                {isEditing ? (
                  <View>
                    <TextInput
                      value={editingNoteText}
                      onChangeText={setEditingNoteText}
                      multiline
                      autoFocus
                      className="text-base leading-6 mb-4"
                      style={{
                        color: noteTextColor,
                        lineHeight: 24,
                        paddingTop: 6,
                        minHeight: 100,
                      }}
                    />
                    <View className="flex-row gap-3 mb-4">
                      <Pressable
                        onPress={handleCancelEdit}
                        className="flex-1 bg-gray-500/50 rounded-lg py-2 items-center active:opacity-70"
                      >
                        <Text className="text-white text-sm font-semibold">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSaveNote}
                        disabled={!editingNoteText.trim()}
                        className="flex-1 bg-blue-600 rounded-lg py-2 items-center active:opacity-70"
                        style={{ opacity: !editingNoteText.trim() ? 0.5 : 1 }}
                      >
                        <Text className="text-white text-sm font-semibold">Save</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable onPress={() => handleEditNote(note.id, note.text)}>
                    <Text
                      className="text-base leading-6 mb-4"
                      style={{
                        color: noteTextColor,
                        lineHeight: 24,
                        paddingTop: 6,
                      }}
                    >
                      {note.text}
                    </Text>
                  </Pressable>
                )}

                <View className="flex-row items-center justify-between border-t pt-3" style={{ borderColor: noteTextColor, opacity: 0.2 }}>
                  <Text className="text-xs" style={{ color: noteTextColor, opacity: 0.6 }}>
                    {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                  </Text>
                  {!isEditing && (
                    <View className="flex-row gap-3">
                      <Pressable onPress={() => handleNoteColorPress(note.id, note.backgroundColor)} className="active:opacity-70">
                        <Ionicons name="color-palette-outline" size={20} color={noteTextColor} />
                      </Pressable>
                      <Pressable onPress={() => handleNoteTextColorPress(note.id, note.textColor)} className="active:opacity-70">
                        <Ionicons name="text-outline" size={20} color={noteTextColor} />
                      </Pressable>
                      <Pressable onPress={() => handleShare(note.text)} className="active:opacity-70">
                        <Ionicons name="share-outline" size={20} color={noteTextColor} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteNote(note.id)} className="active:opacity-70">
                        <Ionicons name="trash-outline" size={20} color={noteTextColor} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Recording Button */}
        <View className="items-center pb-8">
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className="items-center justify-center rounded-full shadow-2xl active:opacity-80"
            style={{
              width: 80,
              height: 80,
              backgroundColor: isRecording ? "#EF4444" : "#FFFFFF",
              opacity: isTranscribing ? 0.5 : 1,
            }}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={40}
              color={isRecording ? "#FFFFFF" : notebook.color}
            />
          </Pressable>
          <Text className="text-sm font-medium mt-3 text-white">
            {isRecording ? "Tap to Stop" : isTranscribing ? "Processing..." : "Tap to Record"}
          </Text>
        </View>
      </SafeAreaView>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">Color Change</Text>
              <Pressable
                onPress={() => setShowColorPicker(false)}
                className="active:opacity-70"
              >
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-4">
              Select Notebook Color
            </Text>

            {/* Default and Original Color Options */}
            <View className="mb-4 flex-row gap-3">
              {/* Default Color */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Default</Text>
                <Pressable
                  onPress={() => {
                    const defaultColor = "#E63946";
                    setSelectedColor(defaultColor);
                    const position = getPositionFromColor(defaultColor);
                    setSliderPosition(position);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="h-16 rounded-2xl items-center justify-center border-2"
                  style={{
                    backgroundColor: "#E63946",
                    borderColor: selectedColor === "#E63946" ? "#3B82F6" : "#E5E7EB"
                  }}
                >
                  <Ionicons name="book-outline" size={32} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Original Color (only if different from default) */}
              {originalNotebookColor !== "#E63946" && (
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Current</Text>
                  <Pressable
                    onPress={() => {
                      setSelectedColor(originalNotebookColor);
                      const position = getPositionFromColor(originalNotebookColor);
                      setSliderPosition(position);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="h-16 rounded-2xl items-center justify-center border-2"
                    style={{
                      backgroundColor: originalNotebookColor,
                      borderColor: selectedColor === originalNotebookColor ? "#3B82F6" : "#E5E7EB"
                    }}
                  >
                    <Ionicons name="book-outline" size={32} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
            </View>

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

            {/* Save Button */}
            <Pressable
              onPress={handleSaveColor}
              className="bg-blue-600 rounded-xl py-4 items-center active:opacity-70"
            >
              <Text className="text-white text-lg font-bold">Save Color</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Note Color Picker Modal */}
      <Modal
        visible={showNoteColorPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNoteColorPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">Note Background Color</Text>
              <Pressable
                onPress={() => setShowNoteColorPicker(false)}
                className="active:opacity-70"
              >
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-4">
              Select Note Background Color
            </Text>

            {/* Default and Original Color Options */}
            <View className="mb-4 flex-row gap-3">
              {/* Default Notebook Background */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Default</Text>
                <Pressable
                  onPress={() => {
                    setSelectedNoteColor(notebook?.backgroundColor || "#FFFFFF");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="h-16 rounded-2xl p-3 border-2"
                  style={{
                    backgroundColor: notebook?.backgroundColor || "#FFFFFF",
                    borderColor: selectedNoteColor === (notebook?.backgroundColor || "#FFFFFF") ? "#3B82F6" : "#E5E7EB"
                  }}
                >
                  <Text className="text-gray-800 text-xs">Notebook color</Text>
                </Pressable>
              </View>

              {/* Original Note Color (if different from default) */}
              {originalNoteColor !== (notebook?.backgroundColor || "#FFFFFF") && (
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Current</Text>
                  <Pressable
                    onPress={() => {
                      setSelectedNoteColor(originalNoteColor);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="h-16 rounded-2xl p-3 border-2"
                    style={{
                      backgroundColor: originalNoteColor,
                      borderColor: selectedNoteColor === originalNoteColor ? "#3B82F6" : "#E5E7EB"
                    }}
                  >
                    <Text className="text-gray-800 text-xs">Current color</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Rainbow Gradient Slider */}
            <View className="mb-6 items-center">
              <View
                {...notePanResponder.panHandlers}
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
                    left: noteSliderPosition * sliderWidth - 3,
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
                className="h-32 rounded-2xl p-4"
                style={{ backgroundColor: selectedNoteColor }}
              >
                <Text className="text-gray-800 text-base">Sample note text</Text>
                <View className="absolute inset-0 p-4">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className="absolute left-4 right-4 border-b"
                      style={{
                        borderColor: "#000000",
                        opacity: 0.1,
                        top: 24 + i * 24,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveNoteColor}
              className="bg-blue-600 rounded-xl py-4 items-center active:opacity-70"
            >
              <Text className="text-white text-lg font-bold">Save Color</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Note Text Color Picker Modal */}
      <Modal
        visible={showNoteTextColorPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNoteTextColorPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">Note Text Color</Text>
              <Pressable
                onPress={() => setShowNoteTextColorPicker(false)}
                className="active:opacity-70"
              >
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-4">
              Select Note Text Color
            </Text>

            {/* Default and Original Color Options */}
            <View className="mb-4 flex-row gap-3">
              {/* Default Notebook Text Color */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Default</Text>
                <Pressable
                  onPress={() => {
                    setSelectedNoteTextColor(notebook?.textColor || "#000000");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="h-16 rounded-2xl p-3 border-2"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: selectedNoteTextColor === (notebook?.textColor || "#000000") ? "#3B82F6" : "#E5E7EB"
                  }}
                >
                  <Text style={{ color: notebook?.textColor || "#000000", fontSize: 12 }}>Notebook color</Text>
                </Pressable>
              </View>

              {/* Original Note Text Color (if different from default) */}
              {originalNoteTextColor !== (notebook?.textColor || "#000000") && (
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Current</Text>
                  <Pressable
                    onPress={() => {
                      setSelectedNoteTextColor(originalNoteTextColor);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="h-16 rounded-2xl p-3 border-2"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: selectedNoteTextColor === originalNoteTextColor ? "#3B82F6" : "#E5E7EB"
                    }}
                  >
                    <Text style={{ color: originalNoteTextColor, fontSize: 12 }}>Current color</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Rainbow Gradient Slider */}
            <View className="mb-6 items-center">
              <View
                {...noteTextPanResponder.panHandlers}
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
                    left: noteTextSliderPosition * sliderWidth - 3,
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
                className="h-32 rounded-2xl p-4"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <Text style={{ color: selectedNoteTextColor, fontSize: 16 }}>Sample note text</Text>
                <View className="absolute inset-0 p-4">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className="absolute left-4 right-4 border-b"
                      style={{
                        borderColor: selectedNoteTextColor,
                        opacity: 0.1,
                        top: 24 + i * 24,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveNoteTextColor}
              className="bg-blue-600 rounded-xl py-4 items-center active:opacity-70"
            >
              <Text className="text-white text-lg font-bold">Save Color</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
