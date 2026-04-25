import React from 'react';
import { View, Text } from 'react-native';

export function ColHeader({ label, T, muted }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: muted ? T.sub + "88" : T.sub, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}
