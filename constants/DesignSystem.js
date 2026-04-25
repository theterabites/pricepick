import { Platform } from 'react-native';

export const FONTS = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

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
  labelIconSize: 26,
  labelBorderRadius: 7,
  fontSize: 18,
  headerFontSize: 10,
  
  getBoxStyle: (active, isBest, accent, T, activeField, dark) => {
    const isUnit = activeField === 'unit';
    return {
      height: LAYOUT.rowHeight,
      flex: 1,
      minWidth: 0,
      borderRadius: LAYOUT.borderRadius,
      alignItems: "center",
      justifyContent: "flex-end", // Uniform right alignment for all
      flexDirection: 'row',
      paddingHorizontal: 8, // Standard padding for all boxes
      borderWidth: LAYOUT.borderWidth,
      borderColor: active ? accent : (isBest ? accent : T.border),
      backgroundColor: active ? accent + "18" : (isBest ? accent + "18" : (isUnit ? T.surface2 : T.surface)),
    };
  }
};
