import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp, currencies } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";

export default function CurrencyScreen() {
  const { T, dark, currency, setCurrency } = useApp();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <ScreenHeader title="Currency" T={T} />
      <ScrollView>
        {currencies.map(c => (
          <TouchableOpacity key={c.code} onPress={() => { setCurrency(c); router.back(); }} style={{
            flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:13,
            borderBottomWidth:1, borderBottomColor:T.border,
          }}>
            <Text style={{ fontSize:18, fontWeight:"700", width:38, color:T.text }}>{c.symbol}</Text>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:15, fontWeight:"600", color:T.text }}>{c.code}</Text>
              <Text style={{ fontSize:12, color:T.sub }}>{c.name}</Text>
            </View>
            {currency.code===c.code && <Text style={{ color:colors.success, fontSize:18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
