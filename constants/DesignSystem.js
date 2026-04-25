export const ACCENTS = [
  { accent:"#C62828", bg:"#FFEBEE" }, // Dark Red
  { accent:"#FFB300", bg:"#FFF8E1" }, // Golden Yellow
  { accent:"#FF007F", bg:"#FFF0F5" }, // Bright Hot Pink
  { accent:"#4CAF50", bg:"#E8F5E9" }, // Green
  { accent:"#FF9800", bg:"#FFF3E0" }, // Orange
  { accent:"#2196F3", bg:"#E3F2FD" }, // Blue
  { accent:"#9C27B0", bg:"#F3E5F5" }, // Purple
];

export const LABELS = ["A","B","C","D","E","F","G"];

export const LAYOUT = {
  rowHeight: 44,
  borderRadius: 12,
  borderWidth: 1.5,
  gap: 5,
  labelWidth: 30,
  fontSize: 18,
  headerFontSize: 10,
  
  getBoxStyle: (active, isBest, accent, T, activeField, dark) => {
    return {
      height: 44, // Using literal to avoid circular refs if needed, but LAYOUT.rowHeight is better
      flex: 1,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: activeField === 'unit' ? "flex-end" : "center", 
      flexDirection: 'row',
      paddingHorizontal: 10,
      borderWidth: active ? 1.5 : (isBest ? 1.5 : 0.5),
      borderColor: active ? accent : (isBest ? accent : T.border),
      backgroundColor: active ? accent + "18" : (isBest ? accent + "18" : T.surface),
    };
  }
};
