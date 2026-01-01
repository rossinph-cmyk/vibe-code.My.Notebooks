# R8 Configuration & Google Play Compliance Guide

## Voice Notepad - Android Build Configuration

This document outlines the R8/ProGuard configuration and permission setup for Google Play compliance.

---

## Overview

Voice Notepad uses R8 (Android's default code shrinker) to:
- Remove unused code and resources
- Obfuscate class/method names
- Optimize the final APK/AAB size
- Ensure only necessary permissions are included

---

## Permissions Audit

### ALLOWED Permissions (Required for Core Functionality)

| Permission | Purpose | Justification |
|------------|---------|---------------|
| `android.permission.RECORD_AUDIO` | Voice note recording | Core feature - converts speech to text via OpenAI transcription |
| `android.permission.READ_MEDIA_IMAGES` | Photo library access | Allows users to select custom background images for notebooks |
| `android.permission.READ_EXTERNAL_STORAGE` | Legacy storage access | Required for older Android versions (pre-Android 13) to access photos |

### BLOCKED Permissions (Explicitly Removed)

These permissions are blocked in `app.json` under `android.blockedPermissions` to ensure Google Play compliance and user privacy:

| Permission | Reason for Blocking |
|------------|---------------------|
| `android.permission.CAMERA` | App does not use camera functionality |
| `android.permission.ACCESS_FINE_LOCATION` | No location features required |
| `android.permission.ACCESS_COARSE_LOCATION` | No location features required |
| `android.permission.ACCESS_BACKGROUND_LOCATION` | No background location tracking |
| `android.permission.READ_CONTACTS` | App does not access contacts |
| `android.permission.WRITE_CONTACTS` | App does not modify contacts |
| `android.permission.READ_CALENDAR` | No calendar integration |
| `android.permission.WRITE_CALENDAR` | No calendar integration |
| `android.permission.READ_CALL_LOG` | Not needed - would trigger Google Play policy review |
| `android.permission.WRITE_CALL_LOG` | Not needed - would trigger Google Play policy review |
| `android.permission.SEND_SMS` | App does not send SMS |
| `android.permission.RECEIVE_SMS` | App does not receive SMS |
| `android.permission.READ_SMS` | Not needed - would trigger Google Play policy review |
| `android.permission.BODY_SENSORS` | No health/fitness features |
| `android.permission.BLUETOOTH` | No Bluetooth functionality |
| `android.permission.BLUETOOTH_ADMIN` | No Bluetooth functionality |
| `android.permission.BLUETOOTH_CONNECT` | No Bluetooth functionality |
| `android.permission.BLUETOOTH_SCAN` | No Bluetooth functionality |
| `android.permission.READ_PHONE_STATE` | Not needed - would trigger Google Play policy review |
| `android.permission.CALL_PHONE` | App does not make phone calls |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Not needed for modern Android (uses scoped storage) |
| `android.permission.ACCESS_NETWORK_STATE` | Not required for core functionality |
| `android.permission.CHANGE_WIFI_STATE` | App does not manage WiFi |
| `android.permission.GET_ACCOUNTS` | Not needed - would trigger Google Play policy review |

---

## R8/ProGuard Build Configuration

### app.json Android Settings

```json
{
  "android": {
    "enableProguardInReleaseBuilds": true,
    "enableShrinkResourcesInReleaseBuilds": true,
    "proguardFiles": ["proguard-rules.pro"]
  }
}
```

### What These Settings Do

| Setting | Purpose |
|---------|---------|
| `enableProguardInReleaseBuilds` | Enables R8 code shrinking and obfuscation for release builds |
| `enableShrinkResourcesInReleaseBuilds` | Removes unused resources (images, layouts, etc.) from the APK |
| `proguardFiles` | Points to custom ProGuard rules for keeping necessary classes |

---

## ProGuard Rules Summary

The `proguard-rules.pro` file includes rules for:

1. **React Native Core** - Preserves necessary RN bridge classes
2. **Expo Modules** - Keeps expo-av, expo-media-library functionality
3. **Third-party Libraries** - OkHttp, Gson, Reanimated, Gesture Handler
4. **Hermes Engine** - JavaScript engine for React Native
5. **Crash Reporting** - Preserves line numbers for debugging

---

## Google Play Policy Compliance

### Sensitive Permissions Declaration

If you ever need to add back any blocked permissions, you may need to:

1. **Fill out the Permissions Declaration Form** in Google Play Console
2. **Provide a privacy policy** explaining data usage
3. **Submit a video demonstration** showing legitimate use

### Permissions That Trigger Extra Review

- `READ_SMS`, `RECEIVE_SMS`, `SEND_SMS`
- `READ_CALL_LOG`, `WRITE_CALL_LOG`
- `READ_PHONE_STATE`
- `GET_ACCOUNTS`
- `ACCESS_FINE_LOCATION` (if used in background)

**Voice Notepad blocks all of these to avoid unnecessary Google Play scrutiny.**

---

## Building for Release

When building with EAS:

```bash
eas build --platform android --profile production
```

R8 will automatically:
1. Read `proguard-rules.pro` for keep rules
2. Remove blocked permissions from AndroidManifest.xml
3. Shrink and obfuscate the codebase
4. Remove unused resources

---

## Verification Checklist

Before submitting to Google Play:

- [ ] Run `eas build` with production profile
- [ ] Verify APK/AAB size is reasonable (R8 shrinking working)
- [ ] Test all core features (voice recording, photo selection)
- [ ] Check AndroidManifest.xml in built APK for correct permissions
- [ ] Ensure no crashes due to ProGuard over-stripping

### How to Check Permissions in Built APK

```bash
# Extract and view AndroidManifest.xml
aapt dump permissions your-app.apk
```

---

## Troubleshooting

### If a feature breaks after enabling ProGuard:

1. Check logcat for `ClassNotFoundException` or `NoSuchMethodError`
2. Add appropriate `-keep` rules to `proguard-rules.pro`
3. Rebuild and test

### Common Issues:

| Issue | Solution |
|-------|----------|
| Reanimated crashes | Ensure Reanimated keep rules are present |
| Network requests fail | Check OkHttp rules |
| JSON parsing errors | Verify Gson keep rules |

---

## Last Updated

- **Date**: January 2026
- **Expo SDK**: 53
- **React Native**: 0.76.7

---

## References

- [Expo Android Build Configuration](https://docs.expo.dev/build-reference/android-builds/)
- [Android R8 Documentation](https://developer.android.com/studio/build/shrink-code)
- [Google Play Permission Policy](https://support.google.com/googleplay/android-developer/answer/9888170)
