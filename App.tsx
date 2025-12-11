import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootStackParamList } from "./src/navigation/RootNavigator";
import { HomeScreen } from "./src/screens/HomeScreen";
import { NotebookScreen } from "./src/screens/NotebookScreen";
import { PrivacyPolicyModal } from "./src/components/PrivacyPolicyModal";
import { OnboardingSlideshow } from "./src/components/OnboardingSlideshow";
import { useNotebookStore } from "./src/state/notebookStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const hasAcceptedPrivacyPolicy = useNotebookStore((s) => s.hasAcceptedPrivacyPolicy);
  const acceptPrivacyPolicy = useNotebookStore((s) => s.acceptPrivacyPolicy);
  const hasCompletedOnboarding = useNotebookStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useNotebookStore((s) => s.completeOnboarding);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: true,
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notebook"
              component={NotebookScreen}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
        <PrivacyPolicyModal
          visible={!hasAcceptedPrivacyPolicy}
          onAccept={acceptPrivacyPolicy}
        />
        <OnboardingSlideshow
          visible={hasAcceptedPrivacyPolicy && !hasCompletedOnboarding}
          onComplete={completeOnboarding}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
