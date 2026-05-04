import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { layout, colors } from "../constants/DesignSystem";
import { format } from "../utils/logic";
import { ColHeader } from "../components/ColHeader";
import { LabelIcon } from "../components/LabelIcon";
import { EditCell } from "../components/EditCell";
import { UnitCell } from "../components/UnitCell";
import { BestBar } from "../components/BestBar";
import { Keypad } from "../components/Keypad";
import { AdBanner, AD_BAR_HEIGHT } from "../services/ads";

export default function App() {
  const { T, dark, currency, items, setItems, nextId, showPercentage, originalItems, setOriginalItems, isAdFree } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  // 56 = header row, 326 = keypad (excl. insets.bottom), 22 = col-header row, layout.rowHeight = BestBar
  const reservedHeight = (isAdFree ? 0 : AD_BAR_HEIGHT) + 56 + 326 + 22 + layout.rowHeight + insets.top + insets.bottom;
  const maxItems = Math.min(7, Math.max(2, Math.floor((SCREEN_HEIGHT - reservedHeight) / (layout.rowHeight + layout.gap))));

  const [activeCell, setActiveCell] = useState({ id: 1, field: "price" });
  const [pendingOp, setPendingOp] = useState(null);
  const [clipboardStatus, setClipboardStatus] = useState(null);

  useEffect(() => {
    if (clipboardStatus) {
      const timer = setTimeout(() => setClipboardStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [clipboardStatus]);

  // ─── Derived unit data ───────────────────────────────────────────────────────
  const allUnits = items.map(item => format.computeUnit(item.price, item.quantity));
  const decimals = format.resolveDecimals(allUnits);
  const qtyDecimals = format.resolveQtyDecimals(items);
  const valid = allUnits.filter(u => u !== null);
  const minU = valid.length ? Math.min(...valid) : null;
  const maxU = valid.length ? Math.max(...valid) : null;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const getF = (id, f) => (items.find(i => i.id === id) || {})[f] ?? "";
  const setF = (id, f, v) => setItems(prev => prev.map(i => i.id === id ? { ...i, [f]: v } : i));

  const copyToClipboard = async (value) => {
    await Clipboard.setStringAsync(String(value));
    setClipboardStatus("Copied!");
  };

  const tapCell = (id, field) => {
    if (activeCell?.id !== id || activeCell?.field !== field) setPendingOp(null);
    setActiveCell({ id, field });
  };

  const moveCell = (dir) => {
    const idx = items.findIndex(i => i.id === activeCell?.id);
    if (idx === -1) return;
    if (activeCell.field === "price") {
      setActiveCell(dir === 1
        ? { id: activeCell.id, field: "quantity" }
        : { id: items[(idx - 1 + items.length) % items.length].id, field: "quantity" });
    } else {
      setActiveCell(dir === 1
        ? { id: items[(idx + 1) % items.length].id, field: "price" }
        : { id: activeCell.id, field: "price" });
    }
    setPendingOp(null);
  };

  const handleKey = key => {
    if (!activeCell) return;
    const { id, field } = activeCell;
    const cur = getF(id, field);
    const myOp = (pendingOp?.id === id && pendingOp?.field === field) ? pendingOp : null;

    if (key === "⌫") { setF(id, field, cur.slice(0, -1)); return; }
    if (key === "C") { setF(id, field, ""); setPendingOp(null); return; }
    if (["+", "-", "×", "÷"].includes(key)) {
      const n = parseFloat(cur);
      if (!isNaN(n)) { setPendingOp({ id, field, value: n, op: key }); setF(id, field, ""); }
      return;
    }
    if (key === "=") {
      if (myOp) {
        const n = parseFloat(cur);
        if (!isNaN(n)) { setF(id, field, format.fmtNum(format.applyOp(myOp.value, myOp.op, n))); setPendingOp(null); }
      }
      return;
    }
    if (key === ".") { if (!cur.includes(".")) setF(id, field, (cur || "0") + "."); return; }
    // Digit limit: max 7 integer digits (9,999,999), max 2 decimal places for price / 4 for quantity
    const parts = cur.split(".");
    const inDecimal = parts.length > 1;
    if (!inDecimal && parts[0].length >= 7) return;
    const maxDec = field === "price" ? 2 : 4;
    if (inDecimal && parts[1].length >= maxDec) return;
    let next = cur + key;
    const nextParts = next.split(".");
    if (nextParts[0].length > 1) nextParts[0] = nextParts[0].replace(/^0+/, "") || "0";
    setF(id, field, nextParts.join("."));
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    const used = new Set(items.map(i => i.colorIndex));
    let colorIndex = 0;
    while (used.has(colorIndex)) colorIndex++;
    const newItem = { id: nextId.current++, colorIndex, quantity: "", price: "" };
    setItems(p => [...p, newItem]);
    if (originalItems) setOriginalItems(p => [...p, newItem]);
  };

  const removeItem = () => {
    if (items.length <= 2) return;
    const last = items[items.length - 1];
    setItems(p => p.slice(0, -1));
    if (originalItems) setOriginalItems(p => p.filter(i => i.id !== last.id));
    if (activeCell?.id === last.id) setActiveCell({ id: items[items.length - 2].id, field: "price" });
  };

  const reset = () => {
    setItems([
      { id: 1, colorIndex: 0, quantity: "", price: "" },
      { id: 2, colorIndex: 1, quantity: "", price: "" },
    ]);
    setOriginalItems(null);
    nextId.current = 3;
    setActiveCell({ id: 1, field: "price" });
    setPendingOp(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>

      <AdBanner />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 }}>
        <View style={{ width: 100 }}>
          <TouchableOpacity onPress={reset} style={{ backgroundColor: colors.danger, borderRadius: 11, paddingHorizontal: 10, height: 36, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start' }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>🔄 RESET</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: T.text, flex: 1, textAlign: 'center' }}>PricePick</Text>
        <View style={{ width: 100, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => router.push("/settings")} style={{ backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 11, paddingHorizontal: 10, height: 36, flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Text style={{ fontSize: 15 }}>⚙️</Text>
            <Text style={{ color: T.text, fontSize: 13, fontWeight: '600' }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Item list */}
      <View style={{ flex: 1, paddingBottom: 20 }}>

        {/* Column headers */}
        <View style={{ flexDirection: "row", gap: layout.gap, paddingHorizontal: layout.screenPadding, paddingVertical: 5, alignItems: "center" }}>
          <View style={{ width: layout.labelWidth }} />
          <ColHeader label="price" T={T} />
          <ColHeader label="quantity" T={T} />
          <ColHeader label="per unit" T={T} muted />
        </View>

        {/* Rows */}
        <View style={{ paddingHorizontal: layout.screenPadding, gap: layout.gap }}>
          {items.map((item) => {
            const unit = format.computeUnit(item.price, item.quantity);
            const isBest = unit !== null && unit === minU && valid.length > 1 && minU !== maxU;
            const isDimmed = valid.length > 1 && minU !== maxU && !isBest;
            const effectiveDecimals = currency.noDecimal ? 0 : decimals;
            const unitDisplay = format.fmtDisplay(unit, currency.symbol, effectiveDecimals, !!currency.indianComma);
            const priceFontSize = format.rowFontSize(format.priceCellLen(item, currency));
            const qtyFontSize = format.rowFontSize(format.qtyCellLen(item, qtyDecimals, !!currency.indianComma));
            const unitFontSize = format.rowFontSize(unitDisplay.length);

            return (
              <View key={item.id} style={{
                flexDirection: "row", gap: layout.gap, alignItems: "center",
                borderWidth: 2,
                borderColor: isBest ? colors.success : 'transparent',
                borderRadius: layout.borderRadius + 4,
                padding: 3,
              }}>
                <LabelIcon colorIndex={item.colorIndex} dark={dark} isDimmed={isDimmed} />

                <EditCell
                  value={item.price} active={activeCell?.id === item.id && activeCell.field === "price"}
                  isBest={isBest} field="price" colorIndex={item.colorIndex} T={T} dark={dark}
                  currencySymbol={currency.symbol} noDecimal={!!currency.noDecimal} indianComma={!!currency.indianComma}
                  fontSize={priceFontSize} myOp={pendingOp?.id === item.id && pendingOp?.field === "price" ? pendingOp : null}
                  onTap={() => tapCell(item.id, "price")}
                />

                <EditCell
                  value={item.quantity} active={activeCell?.id === item.id && activeCell.field === "quantity"}
                  isBest={isBest} field="quantity" colorIndex={item.colorIndex} T={T} dark={dark}
                  fontSize={qtyFontSize} qtyDecimals={qtyDecimals} indianComma={!!currency.indianComma}
                  myOp={pendingOp?.id === item.id && pendingOp?.field === "quantity" ? pendingOp : null}
                  onTap={() => tapCell(item.id, "quantity")}
                />

                <UnitCell
                  unit={unit} isBest={isBest} colorIndex={item.colorIndex} T={T} dark={dark}
                  unitDisplay={unitDisplay} effectiveDecimals={effectiveDecimals}
                  minU={minU} showPercentage={showPercentage}
                  rowFontSize={unitFontSize} onCopy={copyToClipboard} indianComma={!!currency.indianComma}
                />
              </View>
            );
          })}
        </View>

        <BestBar items={items} />
      </View>

      <Keypad
        onKey={handleKey} T={T} activeOp={pendingOp?.op ?? null} onMove={moveCell}
        activeCell={activeCell} items={items} onAdd={addItem} onRemove={removeItem}
        currency={currency} maxItems={maxItems} clipboardStatus={clipboardStatus}
      />
    </SafeAreaView>
  );
}
