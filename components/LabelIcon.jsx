import React from 'react';
import { View, Text } from 'react-native';
import { accents, labels, layout } from '../constants/DesignSystem';

export function LabelIcon({ colorIndex, dark, isDimmed }) {
  const col = accents[colorIndex % accents.length];
  const label = labels[colorIndex % labels.length];

  return (
    <View style={{ width: layout.labelWidth, alignItems: "center", justifyContent: "center", opacity: isDimmed ? 0.3 : 1 }}>
      <View style={{
        width: layout.labelIconSize,
        height: layout.labelIconSize,
        borderRadius: layout.labelBorderRadius,
        backgroundColor: dark ? col.accent + "28" : col.bg,
        borderWidth: 2,
        borderColor: col.accent + "55",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{ fontWeight: "800", fontSize: 12, color: col.accent }}>{label}</Text>
      </View>
    </View>
  );
}
