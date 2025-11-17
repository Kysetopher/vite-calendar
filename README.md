## Mobile Deployment Guide
Follow these steps to deploy the web app to a native iOS or Android emulator/device.

### Prerequisites
- **Android Studio** (for Android) and/or **Xcode** (for iOS) is installed
- At least one **emulator** is created and ready

### Building for Android
- **Install Android Studio** and set up at least one emulator
- Build the project and sync with Capacitor:
```bash
npm run build
npx cap sync
```

- Open the Android project in Android Studio and **wait for Gradle to finish building**:
```bash
npx cap open android
```

- Run the app on the emulator or connected device from Android Studio.
```bash
npx cap run android
```

### Building for iOS (not tested)
- Install Xcode (macOS only) and set up an iOS simulator
- Run the following in your terminal:
```bash
npm run build
npx cap add ios
npx cap sync
npx cap run ios
```

#### For more advance debugging, open via Android Studio or Xcode
```bash
npx cap open android
npx cap open ios
```