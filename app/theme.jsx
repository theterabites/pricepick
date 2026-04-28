import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";

export default function ThemeScreen() {
  const { T, dark, themeMode, setThemeMode } = useApp();
  const router = useRouter();

  const options = [
    { label: "System", value: "system", icon: "📱" },
    { label: "Light", value: "light", icon: "☀️" },
    { label: "Dark", value: "dark", icon: "🌙" },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
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
    </SafeAreaView>
  );
}
