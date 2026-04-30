export const format = {
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

  // Indian lakh/crore: last 3 digits, then groups of 2 from the right
  fmtIndian: (intStr) => {
    if (intStr.length <= 3) return intStr;
    const lastThree = intStr.slice(-3);
    const remaining = intStr.slice(0, -3);
    return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  },

  fmtComma: (fixed, indianComma) => {
    const [intPart, decPart] = fixed.split('.');
    const formatted = indianComma
      ? format.fmtIndian(intPart)
      : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? formatted + '.' + decPart : formatted;
  },

  fmtDisplay: (unit, sym, decimals, indianComma) => {
    if (unit === null) return `${sym}—`;
    return `${sym}${format.fmtComma(unit.toFixed(decimals), indianComma)}`;
  },

  sortItems: (items) => {
    return [...items].sort((a, b) => {
      const unitA = format.computeUnit(a.price, a.quantity);
      const unitB = format.computeUnit(b.price, b.quantity);
      if (unitA === null) return 1;
      if (unitB === null) return -1;
      return unitA - unitB;
    });
  },

  // Returns the compact percentage label for non-best unit cells
  pctLabel: (unit, minU) => {
    const pct = Math.round((unit / minU - 1) * 100);
    return pct > 999 ? `×${Math.round(unit / minU)}` : `+${pct}%`;
  },

  priceCellLen: (item, currency) => {
    const symLen = currency.symbol.length;
    return symLen + (item.price
      ? (() => { const n = parseFloat(item.price); return isNaN(n) ? item.price.length : format.fmtComma(n.toFixed(currency.noDecimal ? 0 : 2), !!currency.indianComma).length; })()
      : (currency.noDecimal ? 1 : 4));
  },

  qtyCellLen: (item, qtyDecimals) => {
    return item.quantity
      ? (() => { const n = parseFloat(item.quantity); return isNaN(n) ? item.quantity.length : (qtyDecimals > 0 ? n.toFixed(qtyDecimals) : String(n)).length; })()
      : 1;
  },

  // Maps a display length to a font size
  rowFontSize: (len) => len > 11 ? 10 : len > 9 ? 12 : len > 7 ? 15 : 18,
};
