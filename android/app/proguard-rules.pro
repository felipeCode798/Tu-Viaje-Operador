# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html


# React Native básico
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Hermes
-keep class com.facebook.hermes.** { *; }

# Tu aplicación
-keep class com.tuviajeoperador.** { *; }

# Flipper (si usas)
-keep class com.facebook.flipper.** { *; }
-dontwarn com.facebook.flipper.**

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native DateTime Picker
-keep class com.reactcommunity.rndatetimepicker.** { *; }
-keep class com.facebook.react.turbomodule.core.interfaces.** { *; }

