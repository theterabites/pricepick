import React from 'react';
import { View } from 'react-native';
import { LAYOUT } from '../constants/DesignSystem';

export function BestBar({ items }) {
  if (items.length < 2) return <View style={{ height: LAYOUT.rowHeight }} />;
  return (
    <View style={{ height: LAYOUT.rowHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: LAYOUT.gap }}>
      <View style={{ width: LAYOUT.labelWidth }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }} />
    </View>
  );
}
