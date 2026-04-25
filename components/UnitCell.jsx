import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ACCENTS, LAYOUT, FONTS } from '../constants/DesignSystem';
import { FORMAT } from '../utils/logic';

export function UnitCell({ unit, isBest, colorIndex, T, dark, unitDisplay, effectiveDecimals, minU, showPercentage, rowFontSize, onCopy }) {
  const col = ACCENTS[colorIndex % ACCENTS.length];
  const showPct = !isBest && unit !== null && minU !== null && unit > minU && showPercentage;
  const pctLabel = showPct ? FORMAT.pctLabel(unit, minU) : null;

  return (
    <TouchableOpacity
      disabled={unit === null}
      onPress={() => unit !== null && onCopy(unit.toFixed(effectiveDecimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
      style={{
        ...LAYOUT.getBoxStyle(false, isBest, col.accent, T, 'unit', dark),
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingVertical: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {unit !== null && isBest && (
          <Text style={{ fontSize: 10, marginRight: 2 }}>✅</Text>
        )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: rowFontSize,
            fontWeight: "600",
            color: unit === null ? T.sub + "55" : T.text,
            textAlign: 'right',
            fontFamily: FONTS.mono,
          }}
        >
          {unitDisplay}
        </Text>
      </View>
      {showPct && (
        <Text style={{ fontSize: 8, fontWeight: "700", color: "#E53935", textAlign: 'right' }}>
          {pctLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
}
