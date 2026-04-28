import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp, currencies } from "../context/AppContext";

export default function CurrencyScreen() {
  const { T, dark, currency, setCurrency } = useApp();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.border, backgroundColor:T.surface }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize:26, color:"#00C896", marginTop:-2 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:17, fontWeight:"700", color:T.text }}>Currency</Text>
      </View>
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
            {currency.code===c.code && <Text style={{ color:"#00C896", fontSize:18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
