import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";
import { purchaseRemoveAds, restorePurchases } from "../services/purchases";

export default function SettingsScreen() {
  const { T, dark, themeMode, currency, showPercentage, isAdFree, setIsAdFree } = useApp();
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(false);

  const handleRemoveAds = async () => {
    setPurchasing(true);
    try {
      const success = await purchaseRemoveAds();
      if (success) setIsAdFree(true);
    } catch (e) {
      Alert.alert("Purchase failed", e.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const success = await restorePurchases();
      if (success) setIsAdFree(true);
      else Alert.alert("Nothing to restore", "No previous purchase found.");
    } catch (e) {
      Alert.alert("Restore failed", e.message);
    } finally {
      setPurchasing(false);
    }
  };

  const Row = ({ icon, label, right, onClick, noBorder }) => (
    <TouchableOpacity onPress={onClick} style={{
      flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:15,
      borderBottomWidth: noBorder ? 0 : 1, borderBottomColor:T.border,
    }}>
      <Text style={{ fontSize:18, width:28, textAlign:"center" }}>{icon}</Text>
      <Text style={{ flex:1, fontSize:15, fontWeight:"500", color:T.text }}>{label}</Text>
      {right && <Text style={{ fontSize:14, color:T.sub, marginRight:4 }}>{right}</Text>}
      <Text style={{ color:T.sub, fontSize:18 }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <ScreenHeader title="Settings" T={T} />
      <ScrollView style={{ flex:1 }}>
        <Text style={{ paddingHorizontal:20, paddingTop:14, paddingBottom:6, fontSize:11, fontWeight:"700", color:T.sub, textTransform:"uppercase" }}>
          Preferences
        </Text>
        <View style={{ backgroundColor:T.surface, borderRadius:14, marginHorizontal:12, overflow:"hidden", borderWidth:1, borderColor:T.border }}>
          <Row icon="💱" label="Currency" right={currency.code} onClick={() => router.push("/currency")} />
          <Row icon="📊" label="Show percentage" right={showPercentage ? "On" : "Off"} onClick={() => router.push("/percentage")} />
          <Row icon="🌓" label="Theme" right={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} onClick={() => router.push("/theme")} noBorder />
        </View>

        {!isAdFree && (
          <>
            <Text style={{ paddingHorizontal:20, paddingTop:14, paddingBottom:6, fontSize:11, fontWeight:"700", color:T.sub, textTransform:"uppercase" }}>
              Remove Ads
            </Text>
            <View style={{ backgroundColor:T.surface, borderRadius:14, marginHorizontal:12, overflow:"hidden", borderWidth:1, borderColor:T.border }}>
              <TouchableOpacity onPress={handleRemoveAds} disabled={purchasing} style={{
                flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:15,
                borderBottomWidth:1, borderBottomColor:T.border,
                opacity: purchasing ? 0.5 : 1,
              }}>
                <Text style={{ fontSize:18, width:28, textAlign:"center" }}>🚫</Text>
                <Text style={{ flex:1, fontSize:15, fontWeight:"600", color: colors.success }}>Remove Ads</Text>
                <Text style={{ fontSize:14, color:T.sub, marginRight:4 }}>$0.99</Text>
                <Text style={{ color:T.sub, fontSize:18 }}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRestore} disabled={purchasing} style={{
                flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:15,
                opacity: purchasing ? 0.5 : 1,
              }}>
                <Text style={{ fontSize:18, width:28, textAlign:"center" }}>🔄</Text>
                <Text style={{ flex:1, fontSize:15, fontWeight:"500", color:T.text }}>Restore Purchase</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={{ textAlign:"center", paddingVertical:28, color:T.sub, fontSize:11 }}>
          PricePick v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
