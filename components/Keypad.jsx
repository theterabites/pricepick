import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accents, labels, colors } from '../constants/DesignSystem';

const ROWS = [
  ["7","8","9","÷"],
  ["4","5","6","×"],
  ["1","2","3","−"],
  [".","0","⌫","+"],
  ["C","="],
];

export function Keypad({ onKey, T, activeOp, onMove, activeCell, items, onAdd, onRemove, currency, maxItems, clipboardStatus }) {
  const insets = useSafeAreaInsets();

  const activeIdx = items.findIndex(i => i.id === activeCell?.id);
  const currentLabel = activeIdx !== -1 ? labels[activeIdx] : "?";
  const activeColor = activeIdx !== -1 ? accents[activeIdx % accents.length]?.accent : T.sub;
  const fieldLabel = activeCell?.field === "price" ? `Price (${currency.code})` : "Quantity";

  return (
    <View style={{ backgroundColor: T.keypadBg, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16 + insets.bottom, marginTop: "auto", gap: 4 }}>

      {/* Nav bar: clipboard toast or cell navigation */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: T.keyBgOp,
        borderRadius: 10, marginBottom: 2, height: 44,
        opacity: (activeCell || clipboardStatus) ? 1 : 0,
      }}>
        {clipboardStatus ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: T.text, fontSize: 13, fontWeight: '700' }}>{clipboardStatus}</Text>
          </View>
        ) : activeCell ? (
          <>
            <TouchableOpacity onPress={onRemove} disabled={items.length <= 2}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: items.length <= 2 ? 0.3 : 1 }}>
              <Text style={{ color: colors.danger, fontSize: 24, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onMove(-1)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: T.text, fontSize: 20, fontWeight: '700' }}>‹</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
              <View style={{ backgroundColor: activeColor, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{currentLabel}</Text>
              </View>
              <Text style={{ color: T.text, fontSize: 14, fontWeight: '600' }}>{fieldLabel}</Text>
            </View>

            <TouchableOpacity onPress={() => onMove(1)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: T.text, fontSize: 20, fontWeight: '700' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onAdd} disabled={items.length >= maxItems}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: items.length >= maxItems ? 0.3 : 1 }}>
              <Text style={{ color: colors.success, fontSize: 24, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Key rows */}
      {ROWS.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 4 }}>
          {row.map((k, ki) => {
            const isOp = ["+","−","×","÷"].includes(k);
            const isEq = k === "=";
            const isDel = k === "⌫" || k === "C";
            const opKey = k === "−" ? "-" : k;
            const isAct = !!activeOp && activeOp === opKey;
            return (
              <TouchableOpacity
                key={k + ki}
                onPress={() => onKey(opKey)}
                disabled={!activeCell}
                style={{
                  flex: 1, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center",
                  backgroundColor: isEq ? (activeCell ? activeColor : T.keyBg) : isAct ? T.keyBgOp + "cc" : isOp || isDel ? T.keyBgOp : T.keyBg,
                  borderWidth: isAct ? 2 : 0, borderColor: activeColor,
                  opacity: activeCell ? 1 : 0.6,
                }}>
                <Text style={{
                  fontSize: isEq ? 20 : 21,
                  fontWeight: isOp || isEq ? "600" : "400",
                  color: isEq ? "#fff" : isDel ? colors.danger : isOp ? T.keyTextOp : T.keyText,
                }}>{k}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
