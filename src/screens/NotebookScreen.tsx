import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNotebookStore } from "../state/notebookStore";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { transcribeAudio } from "../api/transcribe-audio";
import * as Haptics from "expo-haptics";

type NotebookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Notebook">;
type NotebookScreenRouteProp = RouteProp<RootStackParamList, "Notebook">;

interface NotebookScreenProps {
  navigation: NotebookScreenNavigationProp;
  route: NotebookScreenRouteProp;
}

export const NotebookScreen: React.FC<NotebookScreenProps> = ({ navigation, route }) => {
  const { notebookId } = route.params;
  const notebook = useNotebookStore((s) => s.getNotebook(notebookId));
  const addNote = useNotebookStore((s) => s.addNote);
  const deleteNote = useNotebookStore((s) => s.deleteNote);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

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

          {notebook.notes.map((note) => (
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

              <View className="flex-row items-center justify-between border-t pt-3" style={{ borderColor: notebook.textColor, opacity: 0.2 }}>
                <Text className="text-xs" style={{ color: notebook.textColor, opacity: 0.6 }}>
                  {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                </Text>
                <View className="flex-row gap-3">
                  <Pressable onPress={() => handleShare(note.text)} className="active:opacity-70">
                    <Ionicons name="share-outline" size={20} color={notebook.textColor} />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteNote(note.id)} className="active:opacity-70">
                    <Ionicons name="trash-outline" size={20} color={notebook.textColor} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
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
    </View>
  );
};
