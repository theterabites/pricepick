import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

// ─── Accents ───────────────────────────────────────────────────────────────────
const ACCENTS = [
  { accent:"#C62828", bg:"#FFEBEE" }, // Dark Red (not 'wrong' red)
  { accent:"#FFD600", bg:"#FFFDE7" }, // Yellow
  { accent:"#FF007F", bg:"#FFF0F5" }, // Bright Hot Pink
  { accent:"#4CAF50", bg:"#E8F5E9" }, // Green
  { accent:"#FF9800", bg:"#FFF3E0" }, // Orange
  { accent:"#2196F3", bg:"#E3F2FD" }, // Blue
  { accent:"#9C27B0", bg:"#F3E5F5" }, // Purple
];
const LABELS = ["A","B","C","D","E","F","G"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const computeUnit = (price, quantity) => {
  const p = parseFloat(price), q = parseFloat(quantity);
  return (p > 0 && q > 0) ? p / q : null;
};

const applyOp = (a, op, b) =>
  op==="+" ? a+b : op==="-" ? a-b : op==="×" ? a*b : b!==0 ? a/b : 0;

const fmtNum = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return "";
  return n % 1 === 0 ? String(n) : parseFloat(n.toFixed(6)).toString();
};

const resolveDecimals = (unitValues) => {
  const validVals = unitValues.filter(v => v !== null);
  if (validVals.length < 2) return 2;

  // Check if any two distinct unit prices round to the same 2-decimal string
  const rounded2 = validVals.map(v => v.toFixed(2));
  const hasTie = validVals.some((v1, i) => 
    validVals.some((v2, j) => i !== j && v1 !== v2 && v1.toFixed(2) === v2.toFixed(2))
  );

  return hasTie ? 4 : 2;
};

const fmtDisplay = (unit, sym, decimals) => {
  if (unit === null) return `${sym}—`;
  return `${sym}${unit.toFixed(decimals)}`;
};

export default function App() {
  const { T, dark, currency, items, setItems, nextId, showPercentage } = useApp();
  const router = useRouter();

  const [activeCell, setActiveCell] = useState({ id:1, field:"price" });
  const [pendingOp, setPendingOp] = useState(null);

  const getF = (id, f) => (items.find(i => i.id===id)||{})[f] ?? "";
  const setF = (id, f, v) =>
    setItems(prev => prev.map(i => i.id===id ? { ...i, [f]:v } : i));

  const unitList = items.map(item => ({
    id: item.id,
    unit: computeUnit(item.price, item.quantity),
  }));
  const valid = unitList.filter(u => u.unit !== null);
  const minU = valid.length ? Math.min(...valid.map(u => u.unit)) : null;
  const maxU = valid.length ? Math.max(...valid.map(u => u.unit)) : null;

  const tapCell = (id, field) => {
    if (activeCell?.id !== id || activeCell?.field !== field) setPendingOp(null);
    setActiveCell({ id, field });
  };

  const moveCell = (dir) => {
    const currentIndex = items.findIndex(i => i.id === activeCell.id);
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
          setF(id, field, fmtNum(applyOp(myOp.value, myOp.op, n)));
          setPendingOp(null);
        }
      }
      return;
    }
    if (key === ".") { if (!cur.includes(".")) setF(id, field, cur+"."); return; }
    setF(id, field, cur + key);
  };

  const addItem = () => {
    if (items.length >= 7) return;
    setItems(p => [...p, { id:nextId.current++, quantity:"", price:"" }]);
  };
  const removeItem = () => {
    if (items.length <= 2) return;
    const last = items[items.length-1];
    setItems(p => p.slice(0,-1));
    if (activeCell?.id === last.id)
      setActiveCell({ id:items[items.length-2].id, field:"price" });
  };
  const reset = () => {
    setItems([
      { id:1, quantity:"", price:"" },
      { id:2, quantity:"", price:"" },
    ]);
    nextId.current = 3;
    setActiveCell({ id:1, field:"price" });
    setPendingOp(null);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      
      {/* Fixed Header */}
      <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:14, paddingTop:14, paddingBottom:6 }}>
        <Text style={{ fontSize:28, fontWeight:"800", color:T.text }}>PricePick</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={reset} style={{
            backgroundColor:'#E53935', 
            borderRadius:11, paddingHorizontal: 12, height:36, alignItems:"center", justifyContent:"center",
          }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")} style={{
            backgroundColor:T.surface2, borderWidth:1, borderColor:T.border,
            borderRadius:11, width:36, height:36, alignItems:"center", justifyContent:"center",
          }}>
            <Text style={{ fontSize:17 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={{ flex:1 }} 
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
      {/* Header Row */}
      <View style={{ flexDirection:"row", gap:5, paddingHorizontal:6, paddingVertical:5, alignItems:"center" }}>
        <View style={{ width:30 }} />
        <ColHeader label="price" T={T} />
        <ColHeader label="quantity" T={T} />
        <ColHeader label="per unit" T={T} muted />
      </View>

      {/* Item Rows */}
      <View style={{ paddingHorizontal:6, gap:5 }}>
        {(() => {
          const allUnits = items.map(item => computeUnit(item.price, item.quantity));
          const decimals = resolveDecimals(allUnits);

          return items.map((item, idx) => {
            const col = ACCENTS[idx % ACCENTS.length];
            const label = LABELS[idx];
            const unit = allUnits[idx];
            const isBest = unit !== null && unit === minU && valid.length > 1 && minU !== maxU;
            const myPriceOp = pendingOp?.id===item.id && pendingOp?.field==="price" ? pendingOp : null;
            const myQtyOp = pendingOp?.id===item.id && pendingOp?.field==="quantity" ? pendingOp : null;
            const unitDisplay = fmtDisplay(unit, currency.symbol, decimals);

            return (
              <View key={item.id} style={{ flexDirection:"row", gap:5, alignItems:"center" }}>
                {/* Letter Label */}
                <View style={{ width:30, alignItems:"center", justifyContent:"center" }}>
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
                  accent={col.accent} T={T}
                  currencySymbol={currency.symbol}
                  myOp={myPriceOp}
                  onTap={() => tapCell(item.id, "price")}
                />

                {/* Quantity Box */}
                <EditCell
                  value={item.quantity}
                  active={activeCell?.id===item.id && activeCell.field==="quantity"}
                  accent={col.accent} T={T}
                  myOp={myQtyOp}
                  onTap={() => tapCell(item.id, "quantity")}
                />

                {/* Per Unit (Plain Text, No Box) */}
                <View style={{ 
                  flex: 1, 
                  height:52, 
                  alignItems:"center", 
                  justifyContent:"center"
                }}>
                  <View style={{ flexDirection:"row", alignItems:"center", justifyContent: "center", gap:4 }}>
                    <Text style={{ fontSize:18, fontWeight:"600", color: unit === null ? T.sub+"55" : T.text }}>
                      {unitDisplay}
                    </Text>
                    {isBest && <Text style={{ fontSize:14 }}>✅</Text>}
                    {!isBest && unit !== null && minU !== null && unit > minU && showPercentage && (
                      <Text style={{ fontSize:11, fontWeight:"700", color:"#E53935" }}>
                        +{Math.round((unit/minU - 1)*100)}%
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          });
        })()}
      </View>

        <BestBar unitList={unitList} minU={minU} maxU={maxU} valid={valid} currency={currency} T={T} dark={dark} />
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

function EditCell({ value, active, accent, T, currencySymbol, onTap, myOp }) {
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
    if (!currencySymbol) return value;
    if (value.endsWith(".")) return value;
    const n = parseFloat(value);
    if (isNaN(n)) return value;
    return n.toFixed(2);
  })();

  return (
    <TouchableOpacity onPress={onTap} style={{
      height:52, flex:1, backgroundColor: active ? accent+"18" : T.surface,
      borderWidth:2, borderColor: active ? accent : T.border, borderRadius:12,
      alignItems:"center", justifyContent:"center"
    }}>
      {myOp && (
        <View style={{ position:"absolute", top:2, left:4, backgroundColor:accent+"22", borderRadius:3, paddingHorizontal:3, paddingVertical:1 }}>
          <Text style={{ fontSize:8, fontWeight:"800", color:accent }}>{myOp.value} {myOp.op}</Text>
        </View>
      )}
      <View style={{ flexDirection:"row", alignItems:"center", justifyContent: "center", width: "100%" }}>
        {currencySymbol && (
          <Text style={{ fontSize:18, fontWeight:"600", color: empty ? T.sub+"55" : T.text }}>{currencySymbol}</Text>
        )}
        <Text style={{ fontSize:18, fontWeight:"600", color: empty ? T.sub+"55" : T.text, textAlign: "center" }}>
          {empty ? (active ? "" : "0.00") : displayValue}
        </Text>
        {active && (
          <View style={{ 
            width: 2, 
            height: 20, 
            backgroundColor: accent, 
            opacity: blink ? 1 : 0, 
            marginLeft: 2 
          }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function BestBar({ unitList, minU, maxU, valid, currency, T, dark }) {
  if (valid.length < 2 || minU === maxU) {
    return (
      <View style={{ height:44, justifyContent:"center", paddingHorizontal:14 }}>
        <Text style={{ color:T.sub, fontSize:13, fontStyle:"italic" }}>
          {valid.length >= 2 ? (valid.length > 1 && minU === maxU ? "All items equal" : "") : "Enter price and quantity to compare"}
        </Text>
      </View>
    );
  }
  return <View style={{ height: 20 }} />;
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

function Keypad({ onKey, T, activeOp, onMove, activeCell, items, onAdd, onRemove }) {
  const rows = [
    ["7","8","9","÷"],
    ["4","5","6","×"],
    ["1","2","3","−"],
    [".","0","⌫","+"],
    ["C","="],
  ];

  const activeIdx = items.findIndex(i => i.id === activeCell.id);
  const currentLabel = LABELS[activeIdx];
  const activeColor = ACCENTS[activeIdx % ACCENTS.length].accent;

  return (
    <View style={{ backgroundColor:T.keypadBg, paddingHorizontal:24, paddingTop:4, paddingBottom:16, marginTop:"auto", gap:4 }}>
      
      {/* Navigation Slider Bar with Add/Remove */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.keyBgOp, borderRadius: 10, marginBottom: 2, height: 44 }}>
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
          <Text style={{ color: activeColor, fontSize: 20, fontWeight: '700' }}>‹</Text>
        </TouchableOpacity>
        
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
          <View style={{ backgroundColor: activeColor, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{currentLabel}</Text>
          </View>
          <Text style={{ color: T.text, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' }}>
            {activeCell.field}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => onMove(1)}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: activeColor, fontSize: 20, fontWeight: '700' }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onAdd}
          disabled={items.length >= 7}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: items.length >= 7 ? 0.3 : 1 }}
        >
          <Text style={{ color: '#00C896', fontSize: 24, fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
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
              <TouchableOpacity key={k+ki} onPress={() => onKey(opKey)} style={{
                flex:1, height:48, borderRadius:10, alignItems:"center", justifyContent:"center",
                backgroundColor: isEq ? activeColor : isAct ? T.keyBgOp+"cc" : isOp || isDel ? T.keyBgOp : T.keyBg,
                borderWidth: isAct ? 2 : 0, borderColor: activeColor
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
