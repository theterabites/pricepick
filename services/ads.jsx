import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../context/AppContext';

// Falls back to Google's test ID in dev or if env var is not set
const UNIT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || TestIds.BANNER,
  ios:     process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID     || TestIds.BANNER,
});

export const AD_BAR_HEIGHT = 50;

export function AdBanner() {
  const { isAdFree, T, dark } = useApp();

  if (isAdFree) return null;

  return (
    <View style={{
      width: '100%',
      height: AD_BAR_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: T.border,
      backgroundColor: dark ? '#2C2C2E' : '#E5E5EA',
    }}>
      <BannerAd
        unitId={UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
