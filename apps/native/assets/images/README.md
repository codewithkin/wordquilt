# WordQuilt — image assets (Expo SDK 57)

Unzip into your project so the files land at `assets/images/`.
`store/` is listing art for App Store Connect and Play Console — it is not
bundled into the app and can be moved or deleted.

## app.json

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "ios": {
      "icon": {
        "light": "./assets/images/icon-ios.png",
        "dark": "./assets/images/icon-ios-dark.png",
        "tinted": "./assets/images/icon-ios-tinted.png"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-foreground.png",
        "monochromeImage": "./assets/images/adaptive-monochrome.png",
        "backgroundColor": "#C25A34"
      }
    },
    "web": { "favicon": "./assets/images/favicon.png" },
    "plugins": [
      ["expo-splash-screen", {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#C25A34",
        "dark": {
          "image": "./assets/images/splash-icon-dark.png",
          "backgroundColor": "#8A3E27"
        }
      }]
    ]
  }
}
```

`adaptive-background.png` is included if you prefer an image layer, but
`backgroundColor` is the better choice — it fills any mask shape with no seam.

## Files

| File | Size | Alpha |
| --- | --- | --- |
| icon.png | 1024 × 1024 | none, opaque |
| icon-ios.png | 1024 × 1024 | none, opaque |
| icon-ios-dark.png | 1024 × 1024 | none, opaque |
| icon-ios-tinted.png | 1024 × 1024 | none, greyscale |
| adaptive-foreground.png | 1024 × 1024 | required |
| adaptive-background.png | 1024 × 1024 | none, opaque |
| adaptive-monochrome.png | 1024 × 1024 | required, flat white shape |
| splash-icon.png | 512 × 512 | required |
| splash-icon-dark.png | 512 × 512 | required |
| favicon.png | 48 × 48 | required |
| store/appstore-1024.png | 1024 × 1024 | none |
| store/play-icon-512.png | 512 × 512 | kept |
| store/play-feature-1024x500.png | 1024 × 500 | none |

## Notes

Expo generates every smaller size at prebuild, so these sources are the only
files to keep. Do not add alpha to the iOS icons — App Store Connect rejects
them and Expo will not strip it for you.

The adaptive foreground keeps the mark inside the centre 72dp safe circle, so
no launcher mask clips it. The monochrome layer is only the four trace squares:
at themed-icon sizes the full grid turns to mush.

Colours: terracotta `#C25A34`, dark field `#8A3E27`, cream `#FFF6E8`,
sewn `#F0C982`.
