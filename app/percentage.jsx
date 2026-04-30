import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";

export default function PercentageScreen() {
  const { T, dark, showPercentage, setShowPercentage } = useApp();
  const router = useRouter();

  const options = [
    { label: "On", value: true, icon: "📊" },
    { label: "Off", value: false, icon: "🚫" },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <ScreenHeader title="Show Percentage" T={T} />
      <ScrollView>
        {options.map(opt => (
          <TouchableOpacity key={String(opt.value)} onPress={() => { setShowPercentage(opt.value); router.back(); }} style={{
            flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:15,
            borderBottomWidth:1, borderBottomColor:T.border,
          }}>
            <Text style={{ fontSize:18, width:38, textAlign:"left" }}>{opt.icon}</Text>
            <Text style={{ flex:1, fontSize:15, fontWeight:"600", color:T.text }}>{opt.label}</Text>
            {showPercentage === opt.value && <Text style={{ color:colors.success, fontSize:18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
