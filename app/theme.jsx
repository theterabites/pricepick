import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";
import { AdBanner } from "../services/ads";

export default function ThemeScreen() {
  const { T, themeMode, setThemeMode } = useApp();
  const router = useRouter();

  const options = [
    { label: "System", value: "system", icon: "📱" },
    { label: "Light", value: "light", icon: "☀️" },
    { label: "Dark", value: "dark", icon: "🌙" },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <ScreenHeader title="Theme" T={T} />
      <ScrollView>
        {options.map(opt => (
          <TouchableOpacity key={opt.value} onPress={() => { setThemeMode(opt.value); router.back(); }} style={{
            flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:15,
            borderBottomWidth:1, borderBottomColor:T.border,
          }}>
            <Text style={{ fontSize:18, width:38, textAlign:"left" }}>{opt.icon}</Text>
            <Text style={{ flex:1, fontSize:15, fontWeight:"600", color:T.text }}>{opt.label}</Text>
            {themeMode === opt.value && <Text style={{ color:colors.success, fontSize:18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}
