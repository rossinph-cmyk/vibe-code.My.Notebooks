# Voice Notepad App

A beautiful, minimal notepad app with voice-to-text functionality. Create notebooks with customizable colors and record notes using your voice.

## First Time Setup

When you first open the app, you'll be guided through two important steps:

### 1. Privacy Policy
You'll be presented with a comprehensive privacy policy explaining:
- How your voice recordings are processed
- Photo library and storage permissions
- Data security and privacy practices
- Your rights and choices

You must read and accept the privacy policy to continue.

### 2. Features Walkthrough
After accepting the privacy policy, an interactive slideshow will guide you through all the app features:
- Voice-to-text transcription
- Manual text editing
- Color customization for notebooks and notes
- Background image personalization with transparency control
- Dark mode and theme options
- Sharing and organization features

**Access Anytime**: Tap the **Features button** (help icon) in the top-right corner of the home screen to replay the walkthrough at any time.

## Features

- **Create Notebooks**: Organize your notes in colorful notebooks with custom names
- **Voice Recording**: Tap to record, tap to stop - voice is automatically transcribed to text
- **Customizable Design**: Choose from 64 crayon colors for notebook covers, text, and backgrounds
- **Text Highlighting**: Highlight important text with customizable colors - choose from preset colors or create your own
- **Lined Paper Effect**: Notes display on realistic lined paper for a familiar writing experience
- **Share Notes**: Easily share your notes via messaging apps or email
- **No Backend Required**: All data stored locally on your device
- **Ring Binder Design**: Beautiful notebook covers with ring binder effect

## How to Use

### Creating a Notebook

1. On the home screen, tap the **+ New Notebook** button
2. Enter a name for your notebook
3. Select a cover color from 64 options
4. Choose your text color
5. Pick a background color (white, cream, yellow, or any of the 64 colors with transparency)
6. Tap **Create Notebook**

### Recording Notes

1. Tap on a notebook to open it
2. Tap the microphone button at the bottom
3. Speak your note
4. Tap the stop button when finished
5. Wait a moment while the app transcribes your voice to text
6. Your note appears automatically with lined paper styling

### Managing Notes

- **Edit Text**: Tap on any note to edit its text content
- **Change Background Color**: Tap the palette icon to select a custom background color for individual notes
- **Change Text Color**: Tap the text icon to customize the text color for individual notes
- **Highlight Text**: Tap the highlighter icon to open the highlighter modal. You can:
  - Choose from 5 preset highlighter colors (Yellow, Green, Pink, Orange, Blue)
  - Use the rainbow gradient slider to select any custom color
  - Long press on text and drag to select the portion you want to highlight
  - A blue box will appear showing your selection
  - Tap the "Highlight" button to apply the highlight with your chosen color
  - See a preview of all highlights above the selection area
  - Add multiple highlights in different colors
  - Tap Save to apply all highlights to your note
  - Clear all highlights by tapping the remove icon (visible when highlights exist)
- **Share**: Tap the share icon on any note to open WhatsApp directly with the message pre-populated. You can then select any contact or group in WhatsApp to send the message. If WhatsApp is not installed, you'll have options to copy to clipboard or share via other apps.
- **Delete**: Tap the trash icon to delete a note

### Color Customization

Each note can have its own unique colors:
- **Background Color**: Choose from a rainbow gradient slider, or reset to the notebook's default background
- **Text Color**: Select any color from the gradient slider, or reset to the notebook's default text color
- **Notebook Color**: Change the notebook cover color from the top-right palette icon
- **Background Image**: Tap the image icon in the top-right to add a ghosted background image from your photo gallery. The image will appear subtly behind your notes (15% opacity). Tap the icon again to remove the image, or long-press to change it.

All color pickers include:
- A "Default" option to use the notebook's default color
- A "Current" option (if different from default) to restore the note's current color
- A smooth rainbow gradient slider for selecting any color

### Editing Notebooks

1. Long-press any notebook on the home screen
2. Update the name, colors, or background
3. Tap **Save Changes**
4. Or tap **Delete Notebook** to remove it entirely

### Customizing Notebook Appearance

On the home screen, each notebook has two icons in the top-right corner:
- **Color Palette Icon**: Tap to change the notebook cover color using a rainbow gradient slider
- **Image Icon**: Tap to set a custom background image with adjustable transparency

#### Setting a Background Image:
1. Tap the image icon on any notebook
2. Select an image from your photo gallery
3. Use the transparency slider to adjust how visible the image is (0-100%)
4. Tap **Save** to apply the image
5. The image will appear subtly behind the notebook color
6. To remove the image, open the image picker and tap **Remove Image**

The background image will be visible on the home screen notebook cards, allowing you to personalize each notebook with photos while maintaining the colorful notebook aesthetic.

### Customizing Home Screen Background

In the header next to the dark/light mode toggle, there is an image icon that lets you set a custom background for the entire home screen:

1. Tap the image icon in the top-right corner (next to the sun/moon icon)
2. Select an image from your photo gallery
3. Use the transparency slider to adjust the visibility (0-100%)
4. Tap **Save** to apply the background
5. The image will appear behind all your notebooks with the transparency you set
6. To remove it, tap the image icon again and select **Remove Image**

This allows you to personalize your home screen with photos, patterns, or artwork while keeping your notebooks clearly visible.

## Technical Details

- Built with Expo SDK 53 and React Native 0.76.7
- Uses OpenAI's gpt-4o-transcribe for voice-to-text
- State management with Zustand + AsyncStorage for persistence
- Native iOS design following Apple Human Interface Guidelines
- Haptic feedback for enhanced user experience

## Android Build Configuration

The app is configured with R8/ProGuard optimization for release builds:

- **R8 Code Shrinking**: Enabled to remove unused code and reduce APK size
- **Resource Shrinking**: Removes unused resources from the final build
- **ProGuard Rules**: Custom rules in `proguard-rules.pro` to preserve necessary classes

See `R8_CONFIGURATION_GUIDE.md` for full documentation on:
- Permission audit and Google Play compliance
- Blocked permissions list
- ProGuard troubleshooting

## App Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx          # Notebook grid landing page
│   └── NotebookScreen.tsx      # Individual notebook with voice recording
├── components/
│   └── NotebookModal.tsx       # Create/edit notebook modal
├── state/
│   └── notebookStore.ts        # Zustand store for notebooks and notes
├── types/
│   └── notebook.ts             # TypeScript types and color definitions
└── api/
    └── transcribe-audio.ts     # Voice transcription service
```

## Color Palette

The app includes 64 standard crayon colors matching a classic Crayola box, including:
- Primary colors (Red, Blue, Yellow, Green)
- Secondary colors (Orange, Violet, Brown)
- Special colors (Periwinkle, Cerulean, Magenta, etc.)

Background options include White, Cream, and Yellow, plus any of the 64 colors with transparency.
