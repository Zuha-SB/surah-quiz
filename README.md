# Surah Quiz - React Native Expo App

A React Native quiz app that tests your knowledge of Quranic verses (Ayahs) by filling in missing words.

## Features

- Select from all 114 Surahs (chapters) of the Quran
- Quiz format: Fill in the missing word from Arabic verses
- Multiple choice answers (4 options)
- Score tracking
- Beautiful dark theme with cyan accent colors
- RTL (Right-to-Left) support for Arabic text

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (will be installed automatically)

## Installation

1. Install dependencies:
```bash
npm install
```

or

```bash
yarn install
```

## Running the App

### Start the Expo development server:
```bash
npm start
```

or

```bash
yarn start
```

### Run on specific platform:

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Web Browser**: Press `w` in the terminal or run `npm run web`

### Using Expo Go App

1. Install Expo Go on your iOS or Android device
2. Scan the QR code displayed in the terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
surah-quiz/
├── App.js          # Main React Native component
├── app.json        # Expo configuration
├── package.json    # Dependencies and scripts
├── babel.config.js # Babel configuration
└── README.md       # This file
```

## How It Works

1. **Surah Selection**: Choose a Surah from the list
2. **Quiz Mode**: Each verse (Ayah) is displayed with one word missing
3. **Answer Selection**: Choose the correct word from 4 options
4. **Feedback**: Immediate visual feedback (green for correct, red for wrong)
5. **Progress**: Track your score as you progress through all verses
6. **Final Score**: View your final score at the end

## API

This app uses the [Al-Quran Cloud API](https://alquran.cloud/api) to fetch:
- Surah metadata
- Ayah (verse) text in Arabic

## Troubleshooting

### "TurbomoduleRegistry getEnforcing PlatformConstants could not be found" Error

If you encounter this error, follow these steps:

1. **Clear cache and reinstall dependencies:**
   ```bash
   # Delete node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   # On Windows, use:
   # rmdir /s node_modules
   # del package-lock.json

   # Clear Expo cache
   npx expo start -c

   # Reinstall dependencies
   npm install
   ```

2. **Use Expo CLI to install compatible versions:**
   ```bash
   npx expo install --fix
   ```

3. **Clear Metro bundler cache:**
   ```bash
   npx expo start --clear
   ```

4. **If the issue persists, try:**
   ```bash
   # Clear watchman (if installed)
   watchman watch-del-all

   # Reset Metro bundler
   npm start -- --reset-cache
   ```

### Other Common Issues

- **"Module not found" errors**: Run `npm install` again
- **Build errors**: Make sure you're using Node.js v14 or higher
- **Expo Go connection issues**: Ensure your phone and computer are on the same WiFi network

## Notes

- Requires internet connection to fetch Quranic data
- Arabic text rendering depends on device font support
- The app automatically removes "Bismillah" from the first Ayah if it appears separately

## License

This project is open source and available for personal use.

