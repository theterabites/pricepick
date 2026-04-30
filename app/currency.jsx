import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp, currencies } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../constants/DesignSystem";
import { AdBanner } from "../services/ads";

export default function CurrencyScreen() {
  const { T, currency, setCurrency } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? currencies.filter(c =>
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : currencies;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <ScreenHeader title="Currency" T={T} />
      <AdBanner />
      <View style={{ paddingHorizontal:14, paddingVertical:10, borderBottomWidth:1, borderBottomColor:T.border }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search currency..."
          placeholderTextColor={T.sub}
          autoCorrect={false}
          style={{
            backgroundColor:T.surface2, borderRadius:10, paddingHorizontal:12,
            paddingVertical:9, fontSize:15, color:T.text,
          }}
        />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        {filtered.map(c => (
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
