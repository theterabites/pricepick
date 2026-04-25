import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Dimensions, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

// ─── Accents ───────────────────────────────────────────────────────────────────
const ACCENTS = [
  { accent:"#C62828", bg:"#FFEBEE" }, // Dark Red (not 'wrong' red)
  { accent:"#FFB300", bg:"#FFF8E1" }, // Golden Yellow (balanced)
  { accent:"#FF007F", bg:"#FFF0F5" }, // Bright Hot Pink
  { accent:"#4CAF50", bg:"#E8F5E9" }, // Green
  { accent:"#FF9800", bg:"#FFF3E0" }, // Orange
  { accent:"#2196F3", bg:"#E3F2FD" }, // Blue
  { accent:"#9C27B0", bg:"#F3E5F5" }, // Purple
];
const LABELS = ["A","B","C","D","E","F","G"];

// ─── Design System ────────────────────────────────────────────────────────────
const LAYOUT = {
  rowHeight: 44,
  borderRadius: 12,
  borderWidth: 1.5,
  gap: 5,
  labelWidth: 30,
  fontSize: 18,
  headerFontSize: 10,
  
  // Shared Box Style
  getBoxStyle: (active, isBest, accent, T, activeField, dark) => {
    return {
      height: LAYOUT.rowHeight,
      flex: 1,
      borderRadius: LAYOUT.borderRadius,
      alignItems: "center",
      justifyContent: "flex-end", // Right aligned
      flexDirection: 'row',
      paddingHorizontal: 10,
      borderWidth: active ? LAYOUT.borderWidth : (isBest ? LAYOUT.borderWidth : 0.5),
      borderColor: active ? accent : (isBest ? accent : T.border),
      backgroundColor: active ? accent + "18" : (isBest ? accent + "18" : T.surface),
    };
  }
};

// ─── Logic & Formatting ───────────────────────────────────────────────────────
const FORMAT = {
  computeUnit: (price, quantity) => {
    const p = parseFloat(price), q = parseFloat(quantity);
    return (p > 0 && q > 0) ? p / q : null;
  },

  applyOp: (a, op, b) =>
    op==="+" ? a+b : op==="-" ? a-b : op==="×" ? a*b : b!==0 ? a/b : 0,

  fmtNum: v => {
    const n = parseFloat(v);
    if (isNaN(n)) return "";
    return n % 1 === 0 ? String(n) : parseFloat(n.toFixed(6)).toString();
  },

  resolveDecimals: (unitValues) => {
    const validVals = unitValues.filter(v => v !== null);
    if (validVals.length < 2) return 2;
    const rounded2 = validVals.map(v => v.toFixed(2));
    const hasTie = validVals.some((v1, i) => 
      validVals.some((v2, j) => i !== j && v1 !== v2 && v1.toFixed(2) === v2.toFixed(2))
    );
    return hasTie ? 4 : 2;
  },

  resolveQtyDecimals: (items) => {
    let maxD = 0;
    items.forEach(item => {
      if (item.quantity && item.quantity.includes('.')) {
        const decimals = item.quantity.split('.')[1].length;
        if (decimals > maxD) maxD = decimals;
      }
    });
    return Math.min(4, maxD);
  },

  fmtDisplay: (unit, sym, decimals) => {
    if (unit === null) return `${sym}—`;
    const formatted = unit.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sym}${formatted}`;
  }
};

export default function App() {
  const { T, dark, currency, items, setItems, nextId, showPercentage, originalItems, setOriginalItems } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  // Dynamic Item Limit Calculation
  const reservedHeight = 60 + 40 + 260 + insets.top + insets.bottom;
  const availableHeight = SCREEN_HEIGHT - reservedHeight;
  const maxItemsPossible = Math.floor(availableHeight / (LAYOUT.rowHeight + LAYOUT.gap));
  const maxItems = Math.min(7, Math.max(2, maxItemsPossible));

  const [activeCell, setActiveCell] = useState({ id:1, field:"price" });
  const [pendingOp, setPendingOp] = useState(null);
  const [clipboardStatus, setClipboardStatus] = useState(null);

  useEffect(() => {
    if (clipboardStatus) {
      const timer = setTimeout(() => setClipboardStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [clipboardStatus]);

  const copyToClipboard = async (value) => {
    await Clipboard.setStringAsync(String(value));
    setClipboardStatus("Copied to clipboard!");
  };

  const getF = (id, f) => (items.find(i => i.id===id)||{})[f] ?? "";
  const setF = (id, f, v) =>
    setItems(prev => prev.map(i => i.id===id ? { ...i, [f]:v } : i));

  const unitList = items.map(item => ({
    id: item.id,
    unit: FORMAT.computeUnit(item.price, item.quantity),
  }));
  const valid = unitList.filter(u => u.unit !== null);
  const minU = valid.length ? Math.min(...valid.map(u => u.unit)) : null;
  const maxU = valid.length ? Math.max(...valid.map(u => u.unit)) : null;

  const tapCell = (id, field) => {
    if (activeCell?.id !== id || activeCell?.field !== field) setPendingOp(null);
    setActiveCell({ id, field });
  };

  const moveCell = (dir) => {
    const currentIndex = items.findIndex(i => i.id === activeCell?.id);
    if (currentIndex === -1) return;
    
    if (activeCell.field === "price") {
      if (dir === 1) {
        setActiveCell({ id: activeCell.id, field: "quantity" });
      } else {
        const prevIdx = (currentIndex - 1 + items.length) % items.length;
        setActiveCell({ id: items[prevIdx].id, field: "quantity" });
      }
    } else {
      if (dir === 1) {
        const nextIdx = (currentIndex + 1) % items.length;
        setActiveCell({ id: items[nextIdx].id, field: "price" });
      } else {
        setActiveCell({ id: activeCell.id, field: "price" });
      }
    }
    setPendingOp(null);
  };

  const handleKey = key => {
    if (!activeCell) return;
    const { id, field } = activeCell;
    const cur = getF(id, field);
    const myOp = (pendingOp?.id===id && pendingOp?.field===field) ? pendingOp : null;

    if (key === "⌫") { setF(id, field, cur.slice(0,-1)); return; }
    if (key === "C") { setF(id, field, ""); setPendingOp(null); return; }

    if (["+","-","×","÷"].includes(key)) {
      const n = parseFloat(cur);
      if (!isNaN(n)) { setPendingOp({ id, field, value:n, op:key }); setF(id, field, ""); }
      return;
    }
    if (key === "=") {
      if (myOp) {
        const n = parseFloat(cur);
        if (!isNaN(n)) {
          setF(id, field, FORMAT.fmtNum(FORMAT.applyOp(myOp.value, myOp.op, n)));
          setPendingOp(null);
        }
      }
      return;
    }
    if (key === ".") { if (!cur.includes(".")) setF(id, field, cur+"."); return; }
    setF(id, field, cur + key);
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    setItems(p => [...p, { id:nextId.current++, quantity:"", price:"" }]);
  };
  const removeItem = () => {
    if (items.length <= 2) return;
    const last = items[items.length-1];
    setItems(p => p.slice(0,-1));
    if (activeCell?.id === last.id)
      setActiveCell({ id:items[items.length-2].id, field:"price" });
  };

  const sortItems = () => {
    if (originalItems) {
      setItems(originalItems);
      setOriginalItems(null);
    } else {
      setOriginalItems([...items]);
      const sorted = [...items].sort((a, b) => {
        const unitA = FORMAT.computeUnit(a.price, a.quantity);
        const unitB = FORMAT.computeUnit(b.price, b.quantity);
        if (unitA === null) return 1;
        if (unitB === null) return -1;
        return unitA - unitB;
      });
      setItems(sorted);
    }
  };

  const reset = () => {
    setItems([
      { id:1, quantity:"", price:"" },
      { id:2, quantity:"", price:"" },
    ]);
    setOriginalItems(null);
    nextId.current = 3;
    setActiveCell({ id:1, field:"price" });
    setPendingOp(null);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      
      {/* Ad Placeholder Area (Top) */}
      <View style={{ 
        width: '100%', 
        height: 50, 
        backgroundColor: dark ? '#2C2C2E' : '#E5E5EA', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: T.border
      }}>
        <Text style={{ color: T.sub, fontSize: 10, fontWeight: '600' }}>ADVERTISEMENT</Text>
      </View>

      {/* Fixed Header */}
      <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:14, paddingTop:14, paddingBottom:6 }}>
        <View style={{ width: 100 }}>
          <TouchableOpacity onPress={reset} style={{
            backgroundColor:'#E53935', 
            borderRadius:11, paddingHorizontal: 10, height:36, alignItems:"center", justifyContent:"center",
            alignSelf: 'flex-start'
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>RESET</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize:22, fontWeight:"800", color:T.text, flex: 1, textAlign: 'center' }}>PricePick</Text>

        <View style={{ width: 100, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => router.push("/settings")} style={{
            backgroundColor:T.surface2, borderWidth:1, borderColor:T.border,
            borderRadius:11, paddingHorizontal: 10, height:36, flexDirection: 'row', alignItems:"center", justifyContent:"center", gap: 4
          }}>
            <Text style={{ fontSize:15 }}>⚙️</Text>
            <Text style={{ color: T.text, fontSize: 13, fontWeight: '600' }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={{ flex:1 }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <TouchableWithoutFeedback onPress={() => setActiveCell(null)}>
          <View style={{ flex: 1 }}>
            {/* Header Row */}
            <View style={{ flexDirection:"row", gap: LAYOUT.gap, paddingHorizontal:8, paddingVertical:5, alignItems:"center" }}>
              <View style={{ width: LAYOUT.labelWidth }} />
              <ColHeader label="price" T={T} />
              <ColHeader label="quantity" T={T} />
              <ColHeader label="per unit" T={T} muted />
            </View>

            {/* Item Rows */}
            <View style={{ paddingHorizontal:8, gap: LAYOUT.gap }}>
              {(() => {
                const allUnits = items.map(item => FORMAT.computeUnit(item.price, item.quantity));
                const decimals = FORMAT.resolveDecimals(allUnits);
                const qtyDecimals = FORMAT.resolveQtyDecimals(items);

                return items.map((item) => {
                  const originalIndex = item.id - 1; 
                  const col = ACCENTS[originalIndex % ACCENTS.length];
                  const label = LABELS[originalIndex % LABELS.length];
                  const unit = FORMAT.computeUnit(item.price, item.quantity);
                  const isBest = unit !== null && unit === minU && valid.length > 1 && minU !== maxU;
                  const hasWinner = valid.length > 1 && minU !== maxU;
                  const isDimmed = hasWinner && !isBest;
                  const myPriceOp = pendingOp?.id===item.id && pendingOp?.field==="price" ? pendingOp : null;
                  const myQtyOp = pendingOp?.id===item.id && pendingOp?.field==="quantity" ? pendingOp : null;
                  const unitDisplay = FORMAT.fmtDisplay(unit, currency.symbol, decimals);

                  return (
                    <View key={item.id} style={{ flexDirection:"row", gap: LAYOUT.gap, alignItems:"center" }}>
                      {/* Letter Label */}
                      <View style={{ width: LAYOUT.labelWidth, alignItems:"center", justifyContent:"center", opacity: isDimmed ? 0.3 : 1 }}>
                        <View style={{
                          width:26, height:26, borderRadius:7,
                          backgroundColor: dark ? col.accent+"28" : col.bg,
                          borderWidth:2, borderColor:col.accent+"55",
                          alignItems:"center", justifyContent:"center"
                        }}>
                          <Text style={{ fontWeight:"800", fontSize:12, color:col.accent }}>{label}</Text>
                        </View>
                      </View>

                      {/* Price Box */}
                      <EditCell
                        value={item.price}
                        active={activeCell?.id===item.id && activeCell.field==="price"}
                        isBest={isBest}
                        field="price"
                        accent={col.accent} T={T} dark={dark}
                        currencySymbol={currency.symbol}
                        myOp={myPriceOp}
                        onTap={() => tapCell(item.id, "price")}
                      />

                      {/* Quantity Box */}
                      <EditCell
                        value={item.quantity}
                        active={activeCell?.id===item.id && activeCell.field==="quantity"}
                        isBest={isBest}
                        field="quantity"
                        accent={col.accent} T={T} dark={dark}
                        myOp={myQtyOp}
                        onTap={() => tapCell(item.id, "quantity")}
                        qtyDecimals={qtyDecimals}
                      />

                {/* Per Unit Box */}
                <TouchableOpacity 
                  disabled={!isBest}
                  onPress={() => isBest && copyToClipboard(unitDisplay)}
                  style={{ 
                    flex: 1, 
                    height: LAYOUT.rowHeight, 
                    alignItems:"center", 
                    justifyContent:"center",
                  }}
                >
                  <View style={{
                    ...LAYOUT.getBoxStyle(false, isBest, col.accent, T, 'unit', dark),
                    borderWidth: isBest ? LAYOUT.borderWidth : 0,
                    borderColor: isBest ? col.accent : 'transparent',
                    backgroundColor: isBest ? col.accent+"18" : 'transparent',
                    paddingHorizontal: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4
                  }}>
                    {isBest && <Text style={{ fontSize:14 }}>✅</Text>}
                    <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
                      <Text style={{ 
                        fontSize: LAYOUT.fontSize, 
                        fontWeight:"600", 
                        color: unit === null ? T.sub+"55" : T.text,
                        textAlign: 'right'
                      }}>
                        {unitDisplay}
                      </Text>
                    </View>
                    {!isBest && unit !== null && minU !== null && unit > minU && showPercentage && (
                      <View style={{ minWidth: 45, alignItems: 'flex-start' }}>
                        <Text style={{ fontSize:10, fontWeight:"700", color:"#E53935" }}>
                          +{Math.round((unit/minU - 1)*100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                    </View>
                  );
                });
              })()}
            </View>

            <BestBar unitList={unitList} minU={minU} maxU={maxU} valid={valid} currency={currency} T={T} dark={dark} onSort={sortItems} isSorted={!!originalItems} items={items} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Fixed Keypad */}
      <Keypad 
        onKey={handleKey} 
        T={T} 
        activeOp={pendingOp?.op ?? null} 
        onMove={moveCell}
        activeCell={activeCell}
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        currency={currency}
        maxItems={maxItems}
        clipboardStatus={clipboardStatus}
      />
    </SafeAreaView>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function ColHeader({ label, T, muted }) {
  return (
    <View style={{ flex:1, alignItems:"center" }}>
      <Text style={{ fontSize:10, fontWeight:"700", color: muted ? T.sub+"88" : T.sub, textTransform:"uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

function EditCell({ value, active, isBest, field, accent, T, dark, currencySymbol, onTap, myOp, qtyDecimals }) {
  const empty = !value;
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (!active) {
      setBlink(true);
      return;
    }
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  const displayValue = (() => {
    if (empty) return null;
    
    if (currencySymbol) {
      // Price Logic
      if (active) {
        const parts = value.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      } else {
        const n = parseFloat(value);
        if (isNaN(n)) return value;
        return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    } else {
      // Quantity Logic
      if (active) {
        return value;
      } else {
        const n = parseFloat(value);
        if (isNaN(n)) return value;
        return qtyDecimals > 0 ? n.toFixed(qtyDecimals) : String(n);
      }
    }
  })();

  return (
    <TouchableOpacity onPress={onTap} style={LAYOUT.getBoxStyle(active, isBest, accent, T, field, dark)}>
      {myOp && (
        <View style={{ position:"absolute", top:2, left:4, backgroundColor:accent+"22", borderRadius:3, paddingHorizontal:3, paddingVertical:1 }}>
          <Text style={{ fontSize:8, fontWeight:"800", color:accent }}>{myOp.value} {myOp.op}</Text>
        </View>
      )}
      {currencySymbol && (
        <Text style={{ fontSize: LAYOUT.fontSize, fontWeight:"600", color: empty ? T.sub+"55" : T.text }}>{currencySymbol}</Text>
      )}
      <Text style={{ fontSize: LAYOUT.fontSize, fontWeight:"600", color: empty ? T.sub+"55" : T.text, textAlign: "right" }}>
        {empty ? (active ? "" : "0.00") : displayValue}
      </Text>
      {active && (
        <View style={{ 
          width: 2, 
          height: LAYOUT.fontSize + 2, 
          backgroundColor: accent, 
          opacity: blink ? 1 : 0, 
          marginLeft: 2 
        }} />
      )}
    </TouchableOpacity>
  );
}

function BestBar({ unitList, minU, maxU, valid, currency, T, dark, onSort, isSorted, items }) {
  if (items.length < 2) {
    return <View style={{ height: LAYOUT.rowHeight }} />;
  }
  
  return (
    <View style={{ height: LAYOUT.rowHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: LAYOUT.gap }}>
      <View style={{ width: LAYOUT.labelWidth }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onSort} style={{
          backgroundColor: isSorted ? '#007AFF' : '#00C896',
          borderRadius: 6,
          height: LAYOUT.rowHeight / 2,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
            {isSorted ? 'UNSORT' : 'SORT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CtrlBtn({ T, children, onClick, disabled, flex=1, color }) {
  return (
    <TouchableOpacity onPress={onClick} disabled={disabled} style={{
      flex, height:50, backgroundColor: color || T.ctrlBg,
      borderRadius:12, alignItems:"center", justifyContent:"center",
      opacity: disabled ? 0.3 : 1,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2
    }}>{children}</TouchableOpacity>
  );
}

function Keypad({ onKey, T, activeOp, onMove, activeCell, items, onAdd, onRemove, currency, maxItems, clipboardStatus }) {
  const insets = useSafeAreaInsets();
  const rows = [
    ["7","8","9","÷"],
    ["4","5","6","×"],
    ["1","2","3","−"],
    [".","0","⌫","+"],
    ["C","="],
  ];

  const activeIdx = items.findIndex(i => i.id === activeCell?.id);
  const currentLabel = activeIdx !== -1 ? LABELS[activeIdx] : "?";
  const activeColor = activeIdx !== -1 ? ACCENTS[activeIdx % ACCENTS.length]?.accent : T.sub;

  const fieldLabel = activeCell?.field === "price" 
    ? `Price (${currency.code})` 
    : "Quantity";

  return (
    <View style={{ 
      backgroundColor:T.keypadBg, 
      paddingHorizontal:24, 
      paddingTop:4, 
      paddingBottom: 16 + insets.bottom, 
      marginTop:"auto", 
      gap:4 
    }}>
      
      {/* Navigation Slider Bar with Add/Remove */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: T.keyBgOp, 
        borderRadius: 10, 
        marginBottom: 2, 
        height: 44,
        opacity: activeCell ? 1 : 0 // Hide nav bar but keep space
      }}>
        {activeCell && (
          <>
            <TouchableOpacity 
              onPress={onRemove}
              disabled={items.length <= 2}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: items.length <= 2 ? 0.3 : 1 }}
            >
              <Text style={{ color: '#E53935', fontSize: 24, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onMove(-1)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: T.text, fontSize: 20, fontWeight: '700' }}>‹</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
              {clipboardStatus ? (
                <Text style={{ color: T.text, fontSize: 13, fontWeight: '700' }}>{clipboardStatus}</Text>
              ) : (
                <>
                  <View style={{ backgroundColor: activeColor, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{currentLabel}</Text>
                  </View>
                  <Text style={{ color: T.text, fontSize: 14, fontWeight: '600' }}>
                    {fieldLabel}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity 
              onPress={() => onMove(1)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: T.text, fontSize: 20, fontWeight: '700' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onAdd}
              disabled={items.length >= maxItems}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: items.length >= maxItems ? 0.3 : 1 }}
            >
              <Text style={{ color: '#00C896', fontSize: 24, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection:"row", gap:4 }}>
          {row.map((k, ki) => {
            const isOp = ["+","−","×","÷"].includes(k);
            const isEq = k === "=";
            const isDel = k === "⌫" || k === "C";
            const opKey = k === "−" ? "-" : k;
            const isAct = !!activeOp && activeOp === opKey;
            return (
              <TouchableOpacity 
                key={k+ki} 
                onPress={() => onKey(opKey)}
                disabled={!activeCell}
                style={{
                  flex:1, height:48, borderRadius:10, alignItems:"center", justifyContent:"center",
                  backgroundColor: isEq ? (activeCell ? activeColor : T.keyBg) : isAct ? T.keyBgOp+"cc" : isOp || isDel ? T.keyBgOp : T.keyBg,
                  borderWidth: isAct ? 2 : 0, borderColor: activeColor,
                  opacity: activeCell ? 1 : 0.6
                }}>
                <Text style={{
                  fontSize: isEq ? 20 : 21, fontWeight: isOp || isEq ? "600" : "400",
                  color: isEq ? "#fff" : isDel ? "#E53935" : isOp ? T.keyTextOp : T.keyText
                }}>{k}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
