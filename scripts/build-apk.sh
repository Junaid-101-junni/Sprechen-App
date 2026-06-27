#!/bin/bash
# ============================================================
# Juni Boli Talk — Build Android APK Script
# ============================================================
# Prerequisites (install on your computer):
#   1. Node.js 18+    → https://nodejs.org
#   2. Android Studio → https://developer.android.com/studio
#   3. Java JDK 17    → comes with Android Studio
#
# Then run this script:
#   chmod +x scripts/build-apk.sh
#   ./scripts/build-apk.sh
# ============================================================

set -e

echo "🚀 Building Juni Boli Talk APK..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/6: Installing dependencies..."
bun install 2>/dev/null || npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Build Next.js static export
echo "🏗️  Step 2/6: Building web app (static export)..."
rm -rf out
bun run build 2>/dev/null || npx next build
echo "✅ Web app built to /out"
echo ""

# Step 3: Copy web assets to Android
echo "📱 Step 3/6: Syncing to Android..."
npx cap sync android
echo "✅ Assets synced"
echo ""

# Step 4: Check if Android platform exists
if [ ! -d "android" ]; then
  echo "🆕 Step 4/6: Adding Android platform..."
  npx cap add android
  echo "✅ Android platform added"
else
  echo "✅ Step 4/6: Android platform already exists"
fi
echo ""

# Step 5: Build APK
echo "🔨 Step 5/6: Building APK..."
cd android
./gradlew assembleDebug 2>/dev/null || gradlew assembleDebug
echo "✅ APK built"
echo ""

# Step 6: Show result
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
cd ..
echo "============================================================"
echo "🎉 SUCCESS! Your APK is ready!"
echo ""
echo "📁 APK Location:"
echo "   android/${APK_PATH}"
echo ""
echo "📲 To install on your phone:"
echo "   1. Copy the APK file to your Android phone"
echo "   2. Open it on your phone (enable 'Install from unknown sources')"
echo "   3. Install and enjoy!"
echo ""
echo "🏪 To publish on Play Store:"
echo "   Run: cd android && ./gradlew assembleRelease"
echo "   Upload to: https://play.google.com/console"
echo "============================================================"
