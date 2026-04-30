import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../context/AppContext';

// Always use Google's test ID in dev builds; use real unit IDs in production
const UNIT_ID = __DEV__ ? TestIds.BANNER : Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
  ios:     process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
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
        onAdLoaded={__DEV__ ? () => console.log('[AdMob] Banner loaded') : undefined}
        onAdFailedToLoad={__DEV__ ? (e) => console.error('[AdMob] Banner failed:', e) : undefined}
      />
    </View>
  );
}
