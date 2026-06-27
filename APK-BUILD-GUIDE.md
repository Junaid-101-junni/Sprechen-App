# Juni Boli Talk — Build Android APK

This guide shows you how to build a real `.apk` file that installs like a native Android app.

## Prerequisites (install on YOUR computer)

### 1. Install Node.js 18+
Download from: https://nodejs.org
Verify: `node --version` (should show v18 or higher)

### 2. Install Android Studio
Download from: https://developer.android.com/studio
This includes:
- Android SDK
- Java JDK 17
- Gradle build system
- Android emulator (for testing)

### 3. Set up environment variables
After installing Android Studio, add these to your system PATH:

**Mac/Linux** (add to `~/.bashrc` or `~/.zshrc`):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

**Windows** (System Properties → Environment Variables):
```
ANDROID_HOME=C:\Users\YOUR_NAME\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

### 4. Install an Android SDK
1. Open Android Studio
2. Go to Settings → Appearance & Behavior → System Settings → Android SDK
3. Install "Android SDK Platform 34" (or latest)
4. Install "Android SDK Build-Tools" (latest)

---

## Build Steps

### Option A: One-Command Build (Recommended)
```bash
./scripts/build-apk.sh
```
This script does everything automatically.

### Option B: Manual Step-by-Step

#### Step 1: Install dependencies
```bash
npm install
# or: bun install
```

#### Step 2: Build the web app
```bash
npx next build
```
This creates a `/out` folder with static HTML/JS/CSS files.

#### Step 3: Add Android platform (first time only)
```bash
npx cap add android
```

#### Step 4: Sync web files to Android
```bash
npx cap sync android
```

#### Step 5: Build the APK
```bash
cd android
./gradlew assembleDebug    # Mac/Linux
# or
gradlew assembleDebug       # Windows
```

#### Step 6: Find your APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Install APK on Your Phone

### Method 1: USB Transfer
1. Connect your phone to your computer via USB
2. Copy `app-debug.apk` to your phone
3. On your phone, open the file manager
4. Tap the APK file
5. Allow "Install from unknown sources" if prompted
6. Tap "Install"

### Method 2: Google Drive / Email
1. Upload `app-debug.apk` to Google Drive
2. Open Google Drive on your phone
3. Download and tap the APK
4. Allow installation
5. Tap "Install"

### Method 3: Direct Download
1. Host the APK on a file sharing service
2. Download on your phone
3. Install

---

## Build a Release APK (for Play Store)

### Step 1: Generate a keystore
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### Step 2: Configure signing
Edit `android/app/build.gradle` and add:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.jks')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Build release APK
```bash
cd android
./gradlew assembleRelease
```

### Step 4: Find release APK
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Upload to Play Store
1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Create new app → "Juni Boli Talk"
4. Upload the release APK
5. Fill in store listing
6. Publish!

---

## Troubleshooting

### "gradlew: command not found"
Make sure you're in the `android` directory:
```bash
cd android
./gradlew assembleDebug
```

### "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/path/to/Android/Sdk
```

### Build fails with Java error
Make sure JDK 17 is installed:
```bash
java -version
# Should show: openjdk version "17"
```

### App shows blank screen
The web build might have failed. Rebuild:
```bash
npx next build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## App Info
- **Package ID**: com.junibolitalk.app
- **App Name**: Juni Boli Talk
- **Min Android Version**: Android 7.0 (API 24)
- **Target**: Android 14 (API 34)
