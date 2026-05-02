module.exports = {
  expo: {
    name: "PricePick",
    slug: "pricepick",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pricepick",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.theterabites.pricepick",
      supportsTablet: false,
    },
    android: {
      package: "com.theterabites.pricepick",
      permissions: ["com.google.android.gms.permission.AD_ID"],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F2F2F7",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-localization",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713",
          iosAppId:     process.env.ADMOB_IOS_APP_ID     || "ca-app-pub-3940256099942544~1458002511",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "faab14aa-d7a4-4897-ada2-0412b3d7b433",
      },
    },
  },
};
