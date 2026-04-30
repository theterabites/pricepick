import React from 'react';
import { View, Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../context/AppContext';

export function initAds() {
  mobileAds().initialize().catch(() => {});
}

// Falls back to Google's test ID in dev or if env var is not set
const UNIT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || TestIds.BANNER,
  ios:     process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID     || TestIds.BANNER,
});

export const AD_BAR_HEIGHT = 50;

export function AdBanner() {
  const { isAdFree, T } = useApp();

  if (isAdFree) return null;

  return (
    <View style={{
      width: '100%',
      height: AD_BAR_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: T.border,
      backgroundColor: T.surface2,
    }}>
      <BannerAd
        unitId={UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
