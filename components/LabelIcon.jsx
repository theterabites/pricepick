import React from 'react';
import { View, Text } from 'react-native';
import { ACCENTS, LABELS, LAYOUT } from '../constants/DesignSystem';

export function LabelIcon({ colorIndex, dark, isDimmed }) {
  const col = ACCENTS[colorIndex % ACCENTS.length];
  const label = LABELS[colorIndex % LABELS.length];

  return (
    <View style={{ width: LAYOUT.labelWidth, alignItems: "center", justifyContent: "center", opacity: isDimmed ? 0.3 : 1 }}>
      <View style={{
        width: LAYOUT.labelIconSize,
        height: LAYOUT.labelIconSize,
        borderRadius: LAYOUT.labelBorderRadius,
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
