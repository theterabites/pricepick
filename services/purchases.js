import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// ─── Replace these with your real RevenueCat API keys from app.revenuecat.com ─
const API_KEY = Platform.select({
  android: 'YOUR_REVENUECAT_ANDROID_KEY',
  ios:     'YOUR_REVENUECAT_IOS_KEY',
});

const ENTITLEMENT_ID = 'remove_ads';
// ─────────────────────────────────────────────────────────────────────────────

export function initPurchases() {
  Purchases.configure({ apiKey: API_KEY });
}

export async function getIsAdFree() {
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}

export async function purchaseRemoveAds() {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('No package available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}

export async function restorePurchases() {
  const info = await Purchases.restorePurchases();
  return !!info.entitlements.active[ENTITLEMENT_ID];
}
