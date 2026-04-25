import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

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
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.border, backgroundColor:T.surface }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize:26, color:"#00C896", marginTop:-2 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:17, fontWeight:"700", color:T.text }}>Theme</Text>
      </View>
      <ScrollView>
        {options.map(opt => (
          <TouchableOpacity key={opt.value} onPress={() => { setThemeMode(opt.value); router.back(); }} style={{
            flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:15,
            borderBottomWidth:1, borderBottomColor:T.border,
          }}>
            <Text style={{ fontSize:18, width:38, textAlign:"left" }}>{opt.icon}</Text>
            <Text style={{ flex:1, fontSize:15, fontWeight:"600", color:T.text }}>{opt.label}</Text>
            {themeMode === opt.value && <Text style={{ color:"#00C896", fontSize:18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
