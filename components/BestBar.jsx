import React from 'react';
import { View } from 'react-native';
import { layout } from '../constants/DesignSystem';

export function BestBar({ items }) {
  if (items.length < 2) return <View style={{ height: layout.rowHeight }} />;
  return (
    <View style={{ height: layout.rowHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: layout.gap }}>
      <View style={{ width: layout.labelWidth }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }} />
    </View>
  );
}
