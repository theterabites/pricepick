import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useApp } from '../context/AppContext';

// ─── Replace these with your real AdMob unit IDs from admob.google.com ──────
const UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'YOUR_ANDROID_BANNER_UNIT_ID',
      ios:     'YOUR_IOS_BANNER_UNIT_ID',
    });
// ─────────────────────────────────────────────────────────────────────────────

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
