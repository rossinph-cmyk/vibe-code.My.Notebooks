# ============================================
# Voice Notepad - ProGuard/R8 Configuration
# ============================================
# This file configures code shrinking, obfuscation, and optimization
# for the Android release build.

# ============================================
# GENERAL ANDROID RULES
# ============================================

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ============================================
# REACT NATIVE CORE RULES
# ============================================

# Keep React Native core classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep JSI bindings
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Don't warn about React Native internals
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# ============================================
# EXPO MODULES RULES
# ============================================

# Keep Expo modules
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# Expo AV (Audio/Video)
-keep class expo.modules.av.** { *; }

# Expo Media Library
-keep class expo.modules.medialibrary.** { *; }

# Expo Camera (even though we don't use camera, keep for module stability)
-keep class expo.modules.camera.** { *; }

# ============================================
# THIRD-PARTY LIBRARY RULES
# ============================================

# OkHttp (used for network requests)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Gson (JSON serialization)
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Navigation
-keep class com.reactnavigation.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ============================================
# JAVASCRIPT ENGINE RULES
# ============================================

# Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ============================================
# OPTIMIZATION SETTINGS
# ============================================

# Remove unused code aggressively
-allowaccessmodification
-repackageclasses ""

# Optimize more aggressively
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5

# ============================================
# DEBUG / TROUBLESHOOTING
# ============================================

# Keep line numbers for crash reports
-keepattributes SourceFile,LineNumberTable

# Rename source file attribute to "SourceFile" for obfuscation
-renamesourcefileattribute SourceFile

# ============================================
# PERMISSION-RELATED RULES
# ============================================
# Note: R8 handles permission removal via blockedPermissions in app.json
# This section documents what is NOT included in the build:
#
# BLOCKED PERMISSIONS (from app.json):
# - android.permission.CAMERA
# - android.permission.ACCESS_FINE_LOCATION
# - android.permission.ACCESS_COARSE_LOCATION
# - android.permission.ACCESS_BACKGROUND_LOCATION
# - android.permission.READ_CONTACTS
# - android.permission.WRITE_CONTACTS
# - android.permission.READ_CALENDAR
# - android.permission.WRITE_CALENDAR
# - android.permission.READ_CALL_LOG
# - android.permission.WRITE_CALL_LOG
# - android.permission.SEND_SMS
# - android.permission.RECEIVE_SMS
# - android.permission.READ_SMS
# - android.permission.BODY_SENSORS
# - android.permission.BLUETOOTH (all variants)
# - android.permission.READ_PHONE_STATE
# - android.permission.CALL_PHONE
# - android.permission.WRITE_EXTERNAL_STORAGE
# - android.permission.ACCESS_NETWORK_STATE
# - android.permission.CHANGE_WIFI_STATE
# - android.permission.GET_ACCOUNTS

# ============================================
# END OF CONFIGURATION
# ============================================
