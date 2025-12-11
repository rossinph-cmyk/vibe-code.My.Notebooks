// This script clears AsyncStorage to reset the app to first-time startup state
const AsyncStorage = require("@react-native-async-storage/async-storage").default;

async function resetApp() {
  try {
    console.log("Clearing AsyncStorage...");
    await AsyncStorage.clear();
    console.log("App reset successfully! The app will now show privacy policy and onboarding on next launch.");
  } catch (error) {
    console.error("Error resetting app:", error);
  }
}

resetApp();
