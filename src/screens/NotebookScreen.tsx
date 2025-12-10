import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Share, Modal, PanResponder } from "react-native";
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

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(notebook?.color || "#E63946");
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderWidth = 280;
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

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

  const handleSaveColor = () => {
    if (notebook) {
      updateNotebook(notebookId, { color: selectedColor });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowColorPicker(false);
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
          onPress={() => setShowColorPicker(true)}
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
      await Share.share({
        message: noteText,
      });
    } catch (error) {
      console.error("Error sharing:", error);
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

            return (
              <View
                key={note.id}
                className="rounded-2xl p-6 mb-4 relative overflow-hidden"
                style={{ backgroundColor: backgroundColorWithOpacity }}
              >
                {/* Lined paper effect */}
                <View className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      className="absolute left-0 right-0 border-b"
                      style={{
                        borderColor: notebook.textColor,
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
                        color: notebook.textColor,
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
                        color: notebook.textColor,
                        lineHeight: 24,
                        paddingTop: 6,
                      }}
                    >
                      {note.text}
                    </Text>
                  </Pressable>
                )}

                <View className="flex-row items-center justify-between border-t pt-3" style={{ borderColor: notebook.textColor, opacity: 0.2 }}>
                  <Text className="text-xs" style={{ color: notebook.textColor, opacity: 0.6 }}>
                    {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                  </Text>
                  {!isEditing && (
                    <View className="flex-row gap-3">
                      <Pressable onPress={() => handleShare(note.text)} className="active:opacity-70">
                        <Ionicons name="share-outline" size={20} color={notebook.textColor} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteNote(note.id)} className="active:opacity-70">
                        <Ionicons name="trash-outline" size={20} color={notebook.textColor} />
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
    </View>
  );
};
