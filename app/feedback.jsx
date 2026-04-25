import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

export default function FeedbackScreen() {
  const { T, dark } = useApp();
  const router = useRouter();
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:13, borderBottomWidth:1, borderBottomColor:T.border, backgroundColor:T.surface }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize:26, color:"#00C896", marginTop:-2 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:17, fontWeight:"700", color:T.text }}>Send Feedback</Text>
      </View>
      <View style={{ padding:24, gap:16 }}>
        <Text style={{ color:T.sub, fontSize:14, lineHeight:22 }}>
          Found a bug or have a suggestion? I read every message.
        </Text>
        {!feedbackSent ? (
          <>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Your feedback…"
              placeholderTextColor={T.sub}
              multiline
              numberOfLines={6}
              style={{
                backgroundColor:T.surface2, borderWidth:1.5, borderColor:T.border,
                borderRadius:14, padding:14, fontSize:15, color:T.text, height:150,
                textAlignVertical: 'top'
              }}
            />
            <TouchableOpacity
              onPress={() => { if (feedbackText.trim()) setFeedbackSent(true); }}
              style={{
                backgroundColor: feedbackText.trim() ? "#00C896" : T.border,
                borderRadius:14, paddingVertical:14, alignItems: 'center'
              }}
            >
              <Text style={{ fontSize:16, fontWeight:"700", color:"#fff" }}>Send Feedback</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems:"center", paddingTop:40, gap:12 }}>
            <Text style={{ fontSize:60 }}>🙏</Text>
            <Text style={{ fontSize:22, fontWeight:"800", color:T.text }}>Thank you!</Text>
            <Text style={{ fontSize:14, color:T.sub }}>Your feedback means a lot.</Text>
            <TouchableOpacity onPress={() => router.back()}
              style={{ marginTop:12, backgroundColor:T.surface2, borderWidth:1.5, borderColor:T.border, borderRadius:12, paddingHorizontal:28, paddingVertical:10 }}>
              <Text style={{ fontSize:14, fontWeight:"600", color:T.text }}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
