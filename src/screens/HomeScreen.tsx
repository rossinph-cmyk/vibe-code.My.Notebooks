import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNotebookStore } from "../state/notebookStore";
import { Ionicons } from "@expo/vector-icons";
import { NotebookModal } from "../components/NotebookModal";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const notebooks = useNotebookStore((s) => s.notebooks);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-amber-50" edges={["top", "bottom"]}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-4xl font-bold text-amber-900 mb-2">My Notebooks</Text>
        <Text className="text-base text-amber-700 mb-8">Tap to open or create a new notebook</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="flex-row flex-wrap">
            {notebooks.map((notebook, index) => (
              <Pressable
                key={notebook.id}
                onPress={() => handleNotebookPress(notebook.id)}
                onLongPress={() => handleEditNotebook(notebook.id)}
                className="w-[45%] aspect-[3/4] mr-[3%] mb-6 rounded-2xl shadow-lg overflow-hidden active:opacity-70"
                style={{
                  backgroundColor: notebook.color,
                  marginRight: index % 2 === 0 ? "3%" : 0,
                }}
              >
                <View className="flex-1 p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                  </View>
                  <Text
                    className="text-lg font-bold text-white"
                    numberOfLines={3}
                  >
                    {notebook.name}
                  </Text>
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-xs text-white opacity-80">
                      {notebook.notes.length} {notebook.notes.length === 1 ? "note" : "notes"}
                    </Text>
                  </View>
                </View>

                {/* Ring binder effect */}
                <View className="absolute left-0 top-0 bottom-0 w-8 flex-col justify-around items-center py-6">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-300"
                      style={{ shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 1, height: 1 } }}
                    />
                  ))}
                </View>
              </Pressable>
            ))}

            {/* Add new notebook button */}
            <Pressable
              onPress={handleAddNotebook}
              className="w-[45%] aspect-[3/4] rounded-2xl border-4 border-dashed border-amber-300 bg-amber-100 items-center justify-center active:opacity-70"
              style={{
                marginRight: notebooks.length % 2 === 0 ? "3%" : 0,
              }}
            >
              <Ionicons name="add" size={64} color="#D97706" />
              <Text className="text-lg font-semibold text-amber-900 mt-2">New Notebook</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <NotebookModal
        visible={modalVisible}
        onClose={handleCloseModal}
        notebookId={editingNotebook}
      />
    </SafeAreaView>
  );
};
