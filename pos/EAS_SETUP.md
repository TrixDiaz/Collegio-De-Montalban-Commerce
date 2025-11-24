# EAS CLI Setup for POS Mobile Builds

## Overview
EAS CLI has been configured for building Android APK files. However, note that the current POS app is a **Tauri desktop application** using React web components. To build mobile APKs with EAS, you'll need to convert the app to use **Expo/React Native**.

## Current Status
- ✅ EAS CLI installed
- ✅ `eas.json` configuration file created
- ✅ `app.json` Expo configuration created
- ✅ Build scripts added to `package.json`

## Next Steps

### 1. Initialize EAS Project
```bash
cd pos
pnpm eas init
```
This will create a project ID and link it to your Expo account.

### 2. Update app.json
After running `eas init`, update the `projectId` in `app.json`:
```json
"eas": {
  "projectId": "your-project-id-here"
}
```

### 3. Important: App Conversion Required
The current POS app uses:
- React web components (React DOM)
- Vite build system
- Tauri for desktop

To build mobile APKs, you'll need to:
- Convert React components to React Native components
- Replace web-specific libraries with React Native equivalents
- Use Expo Router or React Navigation for mobile navigation
- Adapt UI components for mobile (use React Native components instead of Radix UI)

### 4. Build Commands

Once converted to Expo/React Native:

**Development Build:**
```bash
pnpm eas:build --profile development --platform android
```

**Preview Build (APK):**
```bash
pnpm eas:build:preview
```

**Production Build (APK):**
```bash
pnpm eas:build:production
```

## Alternative Approach
If you want to keep the desktop Tauri app and also have a mobile version, consider:
1. Creating a separate mobile app directory (similar to your existing `mobile` directory)
2. Sharing business logic/services between both apps
3. Using the existing `mobile` directory as a reference for the mobile POS app structure

## Configuration Files

### eas.json
- Configured for APK builds (not AAB)
- Uses Node 22.0.0 and pnpm 10.21.0
- Three build profiles: development, preview, and production

### app.json
- App name: "Tile Depot POS"
- Package: com.trix.pos
- Configured for Android APK builds

## Notes
- The app.json references asset files that may not exist yet (icon.png, adaptive-icon.png, etc.)
- You'll need to create these assets or update the paths in app.json
- Make sure you have an Expo account before running `eas init`

