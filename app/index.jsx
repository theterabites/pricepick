import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";

// ─── Accents ───────────────────────────────────────────────────────────────────
const ACCENTS = [
  { accent:"#00C896", bg:"#E6FBF4" },
  { accent:"#4A90E2", bg:"#EAF2FF" },
  { accent:"#F5A623", bg:"#FFF5E0" },
  { accent:"#9B59B6", bg:"#F5EEFF" },
  { accent:"#E74C3C", bg:"#FFEAEA" },
  { accent:"#1ABC9C", bg:"#E3FAF5" },
];
const LABELS = ["A","B","C","D","E","F"];

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
    if (items.length >= 6) return;
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
        <TouchableOpacity onPress={() => router.push("/settings")} style={{
          backgroundColor:T.surface2, borderWidth:1, borderColor:T.border,
          borderRadius:11, width:36, height:36, alignItems:"center", justifyContent:"center",
        }}>
          <Text style={{ fontSize:17 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={{ flex:1 }} 
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
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

                {/* Per Unit Box */}
                <View style={{ 
                  flex: 1, 
                  height:52, 
                  backgroundColor: isBest ? (dark ? col.accent+"18" : col.bg) : T.surface,
                  borderWidth: 2,
                  borderColor: isBest ? col.accent : T.border,
                  borderRadius: 12,
                  alignItems:"center", 
                  justifyContent:"center",
                  position: 'relative'
                }}>
                  <View style={{ flexDirection:"row", alignItems:"center", justifyContent: "center", gap:3 }}>
                    <Text style={{ fontSize:18, fontWeight:"600", color: unit === null ? T.sub+"55" : T.text, textAlign: "center" }}>
                      {unitDisplay}
                    </Text>
                    {isBest && <Text style={{ fontSize:14 }}>✅</Text>}
                  </View>
                  {!isBest && unit !== null && minU !== null && unit > minU && showPercentage && (
                    <View style={{ position: 'absolute', bottom: 2, right: 6 }}>
                      <Text style={{ fontSize:10, fontWeight:"700", color:"#E53935" }}>
                        +{Math.round((unit/minU - 1)*100)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          });
        })()}
      </View>

        <BestBar unitList={unitList} minU={minU} maxU={maxU} valid={valid} currency={currency} T={T} dark={dark} />

        <View style={{ flexDirection:"row", gap:7, paddingHorizontal:6, paddingVertical:4 }}>
          <CtrlBtn T={T} flex={3} disabled={items.length >= 6} onClick={addItem}>
            <Text style={{ color:"#fff", fontSize:13, fontWeight:"700" }}>Add item (+)</Text>
          </CtrlBtn>
          <CtrlBtn T={T} flex={3} disabled={items.length <= 2} onClick={removeItem}>
            <Text style={{ color:"#fff", fontSize:13, fontWeight:"700" }}>Remove item (−)</Text>
          </CtrlBtn>
          <CtrlBtn T={T} flex={1} color="#E53935" onClick={reset}>
            <Text style={{ color:"#fff", fontSize:13, fontWeight:"700" }}>Reset</Text>
          </CtrlBtn>
        </View>
      </ScrollView>

      {/* Fixed Keypad */}
      <Keypad onKey={handleKey} T={T} activeOp={pendingOp?.op ?? null} />
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
      flex, height:42, backgroundColor: color || T.ctrlBg,
      borderRadius:12, alignItems:"center", justifyContent:"center",
      opacity: disabled ? 0.3 : 1,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2
    }}>{children}</TouchableOpacity>
  );
}

function Keypad({ onKey, T, activeOp }) {
  const rows = [
    ["7","8","9","÷"],
    ["4","5","6","×"],
    ["1","2","3","−"],
    [".","0","⌫","+"],
    ["C","="],
  ];
  return (
    <View style={{ backgroundColor:T.keypadBg, paddingHorizontal:8, paddingTop:8, paddingBottom:22, marginTop:"auto", gap:6 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection:"row", gap:6 }}>
          {row.map((k, ki) => {
            const isOp = ["+","−","×","÷"].includes(k);
            const isEq = k === "=";
            const isDel = k === "⌫" || k === "C";
            const opKey = k === "−" ? "-" : k;
            const isAct = !!activeOp && activeOp === opKey;
            return (
              <TouchableOpacity key={k+ki} onPress={() => onKey(opKey)} style={{
                flex:1, height:52, borderRadius:11, alignItems:"center", justifyContent:"center",
                backgroundColor: isEq ? "#00C896" : isAct ? T.keyBgOp+"cc" : isOp || isDel ? T.keyBgOp : T.keyBg,
                borderWidth: isAct ? 2 : 0, borderColor: "#00C896"
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
