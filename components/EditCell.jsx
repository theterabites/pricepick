import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { accents, layout, fonts } from '../constants/DesignSystem';
import { format } from '../utils/logic';

export function EditCell({ value, active, isBest, field, colorIndex, T, dark, currencySymbol, noDecimal, indianComma, fontSize, onTap, myOp, qtyDecimals }) {
  const accent = accents[colorIndex % accents.length].accent;
  const empty = !value;
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (!active) { setBlink(true); return; }
    const interval = setInterval(() => setBlink(prev => !prev), 500);
    return () => clearInterval(interval);
  }, [active]);

  const displayValue = (() => {
    if (empty) return null;
    if (currencySymbol) {
      if (active) {
        const parts = value.split(".");
        parts[0] = indianComma ? format.fmtIndian(parts[0]) : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      }
      const n = parseFloat(value);
      if (isNaN(n)) return value;
      return format.fmtComma(n.toFixed(noDecimal ? 0 : 2), indianComma);
    }
    if (active) {
      const parts = value.split(".");
      parts[0] = indianComma ? format.fmtIndian(parts[0]) : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    const n = parseFloat(value);
    if (isNaN(n)) return value;
    const fixed = qtyDecimals > 0 ? n.toFixed(qtyDecimals) : String(n);
    return format.fmtComma(fixed, !!indianComma);
  })();

  return (
    <TouchableOpacity onPress={onTap} style={layout.getBoxStyle(active, isBest, accent, T, field, dark)}>
      {myOp && (
        <View style={{ position: "absolute", top: 2, left: 4, backgroundColor: accent + "22", borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1 }}>
          <Text style={{ fontSize: 8, fontWeight: "800", color: accent }}>{myOp.value} {myOp.op}</Text>
        </View>
      )}
      {currencySymbol && (
        <Text style={{ fontSize, fontWeight: "600", color: empty ? T.sub + "55" : T.text, fontFamily: fonts.mono }}>
          {currencySymbol}
        </Text>
      )}
      <Text style={{ fontSize, fontWeight: "600", color: empty ? T.sub + "55" : T.text, textAlign: "right", fontFamily: fonts.mono }}>
        {empty ? (active ? "" : (noDecimal ? "0" : "0.00")) : displayValue}
      </Text>
      {active && (
        <View style={{ width: 2, height: fontSize + 2, backgroundColor: accent, opacity: blink ? 1 : 0, marginLeft: 2 }} />
      )}
    </TouchableOpacity>
  );
}
