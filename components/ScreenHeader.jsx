import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/DesignSystem';

export function ScreenHeader({ title, T }) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: T.surface }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: 26, color: colors.success, marginTop: -2 }}>‹</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 17, fontWeight: "700", color: T.text }}>{title}</Text>
    </View>
  );
}
