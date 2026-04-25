import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useColorScheme } from "react-native";
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CURRENCIES = [
  { code:"THB", symbol:"฿",   name:"Thai Baht" },
  { code:"USD", symbol:"$",   name:"US Dollar" },
  { code:"EUR", symbol:"€",   name:"Euro" },
  { code:"GBP", symbol:"£",   name:"British Pound" },
  { code:"JPY", symbol:"¥",   name:"Japanese Yen" },
  { code:"CNY", symbol:"¥",   name:"Chinese Yuan" },
  { code:"KRW", symbol:"₩",   name:"Korean Won" },
  { code:"SGD", symbol:"S$",  name:"Singapore Dollar" },
  { code:"MYR", symbol:"RM",  name:"Malaysian Ringgit" },
  { code:"IDR", symbol:"Rp",  name:"Indonesian Rupiah" },
  { code:"VND", symbol:"₫",   name:"Vietnamese Dong" },
  { code:"INR", symbol:"₹",   name:"Indian Rupee" },
  { code:"AUD", symbol:"A$",  name:"Australian Dollar" },
  { code:"CAD", symbol:"C$",  name:"Canadian Dollar" },
  { code:"HKD", symbol:"HK$", name:"Hong Kong Dollar" },
  { code:"CHF", symbol:"Fr",  name:"Swiss Franc" },
  { code:"SEK", symbol:"kr",  name:"Swedish Krona" },
  { code:"NOK", symbol:"kr",  name:"Norwegian Krone" },
  { code:"BRL", symbol:"R$",  name:"Brazilian Real" },
  { code:"MXN", symbol:"$",   name:"Mexican Peso" },
  { code:"TRY", symbol:"₺",   name:"Turkish Lira" },
  { code:"SAR", symbol:"﷼",  name:"Saudi Riyal" },
  { code:"AED", symbol:"د.إ", name:"UAE Dirham" },
  { code:"PHP", symbol:"₱",   name:"Philippine Peso" },
  { code:"TWD", symbol:"NT$", name:"Taiwan Dollar" },
  { code:"PKR", symbol:"₨",   name:"Pakistani Rupee" },
  { code:"BDT", symbol:"৳",   name:"Bangladeshi Taka" },
  { code:"MMK", symbol:"K",   name:"Myanmar Kyat" },
  { code:"KHR", symbol:"៛",   name:"Cambodian Riel" },
  { code:"LAK", symbol:"₭",   name:"Lao Kip" },
];

const REGION_CURRENCY = {
  TH:"THB",US:"USD",GB:"GBP",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR",NL:"EUR",
  JP:"JPY",CN:"CNY",KR:"KRW",SG:"SGD",MY:"MYR",ID:"IDR",VN:"VND",IN:"INR",
  AU:"AUD",CA:"CAD",HK:"HKD",CH:"CHF",SE:"SEK",NO:"NOK",BR:"BRL",MX:"MXN",
  TR:"TRY",SA:"SAR",AE:"AED",PH:"PHP",TW:"TWD",PK:"PKR",BD:"BDT",MM:"MMK",
  KH:"KHR",LA:"LAK",
};

function guessInitialCurrency() {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const regionCode = locales[0].regionCode;
      const currencyCode = REGION_CURRENCY[regionCode];
      if (currencyCode) {
        return CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[1];
      }
    }
  } catch (e) {
    console.log("Guess currency error", e);
  }
  return CURRENCIES[1];
}

export const THEMES = {
  light: {
    bg:"#F2F2F7", surface:"#FFFFFF", surface2:"#EFEFEF",
    border:"#E5E5EA", text:"#1A1A2E", sub:"#8E8E93",
    keyBg:"#FFFFFF", keyBgOp:"#DADADF", keypadBg:"#C8C8CE",
    keyText:"#1A1A2E", keyTextOp:"#3A3A5C",
    ctrlBg:"#3A3A5C", shadow:"rgba(0,0,0,0.10)",
  },
  dark: {
    bg:"#0F0F13", surface:"#1C1C22", surface2:"#252530",
    border:"#2E2E3A", text:"#F0F0F5", sub:"#7A7A8A",
    keyBg:"#28283A", keyBgOp:"#1C1C2A", keypadBg:"#16161F",
    keyText:"#F0F0F5", keyTextOp:"#9090B0",
    ctrlBg:"#28283A", shadow:"rgba(0,0,0,0.5)",
  },
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("system");
  const [currency, setCurrency] = useState(CURRENCIES[1]);
  const [showPercentage, setShowPercentage] = useState(true);
  const [items, setItems] = useState([
    { id: 1, quantity: "", price: "" },
    { id: 2, quantity: "", price: "" },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  const nextId = useRef(3);
  const dark = themeMode === "dark" ? true : themeMode === "light" ? false : colorScheme === "dark";
  const T = THEMES[dark ? "dark" : "light"];

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const storedTheme = await AsyncStorage.getItem('pricepick_theme');
        const storedCurrencyCode = await AsyncStorage.getItem('pricepick_currency');
        const storedShowPercentage = await AsyncStorage.getItem('pricepick_percentage');

        if (storedTheme) setThemeMode(storedTheme);
        if (storedCurrencyCode) {
          const found = CURRENCIES.find(c => c.code === storedCurrencyCode);
          if (found) setCurrency(found);
        } else {
          setCurrency(guessInitialCurrency());
        }
        if (storedShowPercentage !== null) {
          setShowPercentage(storedShowPercentage === 'true');
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('pricepick_theme', themeMode);
  }, [themeMode, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('pricepick_currency', currency.code);
  }, [currency, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('pricepick_percentage', String(showPercentage));
  }, [showPercentage, isLoaded]);

  return (
    <AppContext.Provider value={{
      themeMode, setThemeMode, dark, T,
      currency, setCurrency,
      items, setItems, nextId,
      showPercentage, setShowPercentage,
      isLoaded
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
