# Assets Folder

This folder should contain the following image assets for your app:

## Required Assets:

1. **icon.png** (1024x1024px)
   - App icon for iOS and Android
   - Should be a square image with no transparency
   - Used as the main app icon

2. **splash.png** (1284x2778px recommended for iOS)
   - Splash screen image
   - Should match your app's design
   - Background color is set to #28A745 in app.json

3. **adaptive-icon.png** (1024x1024px)
   - Android adaptive icon foreground
   - Should be a square image
   - Background color is set to #28A745 in app.json

4. **favicon.png** (48x48px or larger)
   - Web favicon
   - Used when running the app in web browser

## How to Add Assets:

1. Create or download the required images
2. Place them in this `assets` folder
3. Update `app.json` to reference them:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#28A745"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#28A745"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Temporary Solution:

For now, the app will work without these assets, but you should add them before building for production.

## Quick Asset Generation:

You can use online tools like:
- [App Icon Generator](https://www.appicon.co/)
- [Expo Asset Generator](https://docs.expo.dev/guides/app-icons/)
- Or create simple colored squares as placeholders

