import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

export default function CoffeeScreen() {
  const { T, dark } = useApp();
  const router = useRouter();
  const [coffeeAmt, setCoffeeAmt] = useState(1);
  const [coffeeDone, setCoffeeDone] = useState(false);

  const customValid = coffeeAmt >= 1 && coffeeAmt <= 10;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.border, backgroundColor:T.surface }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize:26, color:"#00C896", marginTop:-2 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:17, fontWeight:"700", color:T.text }}>Buy me a coffee</Text>
      </View>
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:24, gap:22 }}>
        <Text style={{ fontSize:64 }}>☕</Text>
        <Text style={{ fontSize:24, fontWeight:"800", color:T.text, textAlign:"center" }}>Enjoying PricePick?</Text>
        <Text style={{ fontSize:14, color:T.sub, textAlign:"center", maxWidth:270, lineHeight:20 }}>
          This app is completely free and ad-free forever. If it saves you money, consider buying me a coffee!
        </Text>

        {!coffeeDone ? (
          <>
            <TouchableOpacity onPress={() => { setCoffeeAmt(1); setCoffeeDone(true); }} style={{
              width:"100%", maxWidth:300, backgroundColor:"#F5A623", borderRadius:16,
              paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8,
              shadowColor: "#F5A623", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 5
            }}>
              <Text style={{ fontSize:17, fontWeight:"700", color:"#fff" }}>☕ Buy me a coffee — $1</Text>
            </TouchableOpacity>

            <View style={{ flexDirection:"row", alignItems:"center", gap:10, width:"100%", maxWidth:300 }}>
              <View style={{ flex:1, height:1, backgroundColor:T.border }} />
              <Text style={{ fontSize:12, color:T.sub }}>or choose amount</Text>
              <View style={{ flex:1, height:1, backgroundColor:T.border }} />
            </View>

            <View style={{ width:"100%", maxWidth:300, gap:10 }}>
              <View style={{ flexDirection:"row", alignItems:"center", backgroundColor:T.surface, borderWidth:1.5, borderColor: customValid && coffeeAmt !== 1 ? "#F5A623" : T.border, borderRadius:14, overflow:"hidden" }}>
                <Text style={{ paddingHorizontal:14, fontSize:18, fontWeight:"600", color:T.sub }}>$</Text>
                <TextInput
                  keyboardType="numeric"
                  value={coffeeAmt === 1 ? "" : String(coffeeAmt)}
                  placeholder="1 – 10"
                  placeholderTextColor={T.sub}
                  onChangeText={v => {
                    const n = parseFloat(v);
                    if (isNaN(n)) { setCoffeeAmt(1); return; }
                    setCoffeeAmt(Math.min(10, Math.max(1, Math.round(n))));
                  }}
                  style={{ flex:1, fontSize:18, fontWeight:"600", color:T.text, paddingVertical:14 }}
                />
                <Text style={{ paddingHorizontal:14, fontSize:13, color:T.sub }}>max $10</Text>
              </View>
              <TouchableOpacity
                onPress={() => { if (customValid) setCoffeeDone(true); }}
                style={{
                  backgroundColor: customValid ? "#F5A623" : T.border,
                  borderRadius:14, paddingVertical:14, alignItems: 'center'
                }}
              >
                <Text style={{ fontSize:16, fontWeight:"700", color: customValid ? "#fff" : T.sub }}>
                  Support with ${coffeeAmt > 1 ? coffeeAmt : "…"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ alignItems:"center", gap:8 }}>
            <Text style={{ fontSize:52 }}>🎉</Text>
            <Text style={{ fontSize:20, fontWeight:"800", color:T.text }}>You're amazing!</Text>
            <Text style={{ fontSize:14, color:T.sub }}>Thank you for your ${coffeeAmt} support ✨</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
