export const FORMAT = {
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
  },

  sortItems: (items) => {
    return [...items].sort((a, b) => {
      const unitA = FORMAT.computeUnit(a.price, a.quantity);
      const unitB = FORMAT.computeUnit(b.price, b.quantity);
      if (unitA === null) return 1;
      if (unitB === null) return -1;
      return unitA - unitB;
    });
  }
};
