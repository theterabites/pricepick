import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

export default function SettingsScreen() {
  const { T, dark, themeMode, currency, showPercentage } = useApp();
  const router = useRouter();

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
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.border, backgroundColor:T.surface }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize:26, color:"#00C896", marginTop:-2 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:17, fontWeight:"700", color:T.text }}>Settings</Text>
      </View>
      <ScrollView style={{ flex:1 }}>
        <Text style={{ paddingHorizontal:20, paddingTop:14, paddingBottom:6, fontSize:11, fontWeight:"700", color:T.sub, textTransform:"uppercase" }}>
          Preferences
        </Text>
        <View style={{ backgroundColor:T.surface, borderRadius:14, marginHorizontal:12, overflow:"hidden", borderWidth:1, borderColor:T.border }}>
          <Row icon="💱" label="Currency" right={currency.code} onClick={() => router.push("/currency")} />
          <Row icon="📊" label="Show percentage" right={showPercentage ? "Show" : "Hide"} onClick={() => router.push("/percentage")} />
          <Row icon="🌓" label="Theme" right={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} onClick={() => router.push("/theme")} noBorder />
        </View>

        <Text style={{ paddingHorizontal:20, paddingTop:14, paddingBottom:6, fontSize:11, fontWeight:"700", color:T.sub, textTransform:"uppercase" }}>
          Support
        </Text>
        <View style={{ backgroundColor:T.surface, borderRadius:14, marginHorizontal:12, overflow:"hidden", borderWidth:1, borderColor:T.border }}>
          <Row icon="💬" label="Send Feedback" onClick={() => router.push("/feedback")} />
          <Row icon="☕" label="Buy me a coffee" onClick={() => router.push("/coffee")} noBorder />
        </View>
        
        <Text style={{ textAlign:"center", paddingVertical:28, color:T.sub, fontSize:11 }}>
          PricePick v1.0 · No ads, ever.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
