# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                                          # Install dependencies
npx expo start                                       # Dev server (Expo Go — no native modules)
eas build --platform android --profile preview       # Build APK for emulator/device testing
eas build --platform android --profile production    # Build signed AAB for Play Store
npm run lint                                         # Run ESLint via expo lint
```

**Expo Go cannot be used for testing** — `react-native-google-mobile-ads` and `react-native-purchases` are native modules and will crash in Expo Go. Always test with an EAS build installed on a device or emulator.

There is no test suite in this project.

## Architecture

PricePick is an Expo Router (file-based routing) React Native app for comparing unit prices across products.

### State and theming

All shared state lives in `context/AppContext.tsx` via a single `AppProvider` / `useApp()` hook. This context owns:
- `items` — the list of price comparison rows (id, colorIndex, price, quantity strings)
- `originalItems` — snapshot of pre-sort order; non-null means sort is active
- `currency` — the active currency object `{ code, symbol, name, noDecimal? }`
- `themeMode` — `"light" | "dark" | "system"`
- `dark` — resolved boolean used throughout for conditional styling
- `T` — the active theme token object (colors). **Always use `T.*` for colors, never hardcode.**
- `showPercentage` — whether to show the percentage badge on non-best items
- `isAdFree` — whether the user has purchased Remove Ads; hides the banner and the Remove Ads UI in settings
- Settings are persisted to `AsyncStorage` under `pricepick_*` keys and loaded on mount

`themes` (light/dark token objects) are defined in `AppContext.tsx`. `constants/theme.ts` is a legacy Expo starter file, not used by the app.

### Design system

`constants/DesignSystem.js` is the single source of truth for layout and color constants:
- `fonts.mono` — `Platform.select` picks Menlo (iOS) or monospace (Android); used on all numeric displays
- `accents` — 7 accent/background color pairs, indexed by `item.colorIndex % 7`
- `labels` — `["A","B","C","D","E","F","G"]` letter labels, indexed by `item.colorIndex % 7`
- `colors` — semantic color tokens: `colors.danger` (`#E53935`) and `colors.success` (`#00C896`). **Never hardcode these hex values — always import from DesignSystem.**
- `layout` — row height, border radius, gaps, screenPadding, label dimensions, and `getBoxStyle()` which computes the full style object for price/quantity cells

`getBoxStyle` is **not** used for unit cells — unit boxes use a two-row column layout (see below). Always update `layout` here rather than hardcoding style values in components.

### Business logic

`utils/logic.js` exports a `format` object with pure functions:
- `computeUnit(price, qty)` — returns price/qty or null
- `resolveDecimals(unitValues)` — picks 2 or 4 decimal places to break ties in unit price display. **Does not know about `noDecimal` — callers must apply `effectiveDecimals = currency.noDecimal ? 0 : decimals` before using.**
- `resolveQtyDecimals(items)` — max decimals used across quantity inputs
- `fmtDisplay(unit, sym, decimals)` — formats a unit price string with currency symbol
- `priceCellLen(item, currency)` — display length of the price cell (used for font sizing)
- `qtyCellLen(item, qtyDecimals)` — display length of the quantity cell (used for font sizing)
- `rowFontSize(len)` — maps a display length to a font size (18/15/12/10px tiers)
- `sortItems(items)` — returns a new array sorted by unit price ascending (nulls last)
- `applyOp` / `fmtNum` — support the in-app calculator

### Third-party services

All SDK integrations are isolated in `services/` — never import AdMob or RevenueCat directly in app or component code.

| File | Purpose |
|---|---|
| `services/ads.jsx` | `AdBanner` component + `AD_BAR_HEIGHT` constant. Reads unit ID from `EXPO_PUBLIC_ADMOB_*` env vars, falls back to Google test ID. Returns `null` when `isAdFree` is true. |
| `services/purchases.js` | RevenueCat wrapper: `initPurchases`, `getIsAdFree`, `purchaseRemoveAds`, `restorePurchases`. Reads API key from `EXPO_PUBLIC_REVENUECAT_*` env vars. Guards against empty key — never crashes if key is missing. |

### Environment variables

Sensitive IDs live in `.env` (gitignored — never committed). Copy `.env.example` to `.env` and fill in real values.

| Variable | Used in | Purpose |
|---|---|---|
| `ADMOB_ANDROID_APP_ID` | `app.config.js` (build time) | AdMob Android App ID |
| `ADMOB_IOS_APP_ID` | `app.config.js` (build time) | AdMob iOS App ID |
| `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID` | `services/ads.jsx` (runtime) | Android banner ad unit |
| `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID` | `services/ads.jsx` (runtime) | iOS banner ad unit |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | `services/purchases.js` (runtime) | RevenueCat Android SDK key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | `services/purchases.js` (runtime) | RevenueCat iOS SDK key |

For EAS cloud builds, secrets must be added in the Expo dashboard (`.env` is gitignored and not available to the build server).

### Build configuration

- `app.config.js` — replaces `app.json`; reads AdMob App IDs from `process.env` at build time, falls back to Google test IDs
- `eas.json` — three build profiles: `development` (dev client), `preview` (APK for emulator testing), `production` (signed AAB for Play Store)
- Android package: `com.theterabites.pricepick` — permanent, cannot change after first publish
- iOS bundle ID: `com.theterabites.pricepick` — set for future use, not yet published

### Screens (expo-router)

| File | Route | Purpose |
|---|---|---|
| `app/index.jsx` | `/` | Main price comparison screen |
| `app/settings.jsx` | `/settings` | Settings hub (includes Remove Ads if not ad-free) |
| `app/currency.jsx` | `/currency` | Currency picker |
| `app/theme.jsx` | `/theme` | Theme picker |
| `app/percentage.jsx` | `/percentage` | Toggle percentage display |
| `app/feedback.jsx` | `/feedback` | Feedback (hidden in settings UI) |
| `app/coffee.jsx` | `/coffee` | Buy me a coffee (hidden in settings UI) |

All settings screens use the shared `ScreenHeader` component (`components/ScreenHeader.jsx`) for the back nav bar — do not re-inline the header.

`app/_layout.tsx` wraps everything in `AppProvider` and sets up the `Stack` navigator with `headerShown: false` on all screens.

### Key patterns in the main screen (`app/index.jsx`)

**Item identity — `colorIndex` not `id`:**
Items have both `id` (monotonically increasing, used for React keys and state lookups) and `colorIndex` (lowest unused 0–6, stable across sort/remove). Always use `colorIndex` to look up `accents` and `labels`, never `id` or array position.

**Sort toggle:**
`originalItems` in context stores the pre-sort snapshot. `addItem` and `removeItem` both sync `originalItems` when a sort is active, so new/removed rows survive unsort correctly.

**Dynamic item limit:**
`reservedHeight` accounts for the ad bar height (`AD_BAR_HEIGHT`) when `isAdFree` is false, so ad-free users can fit one more row. Capped at 7 (matches `accents`/`labels` length).

**Calculator state:**
`pendingOp` stores `{ id, field, value, op }` for deferred arithmetic; cleared on cell switch.

**Blank area tap — do nothing:**
There is no `TouchableWithoutFeedback` wrapper on the list. Tapping blank space keeps the active cell selected so the nav bar, arrows, and add/remove buttons stay functional. Do not re-add a dismiss-on-tap behaviour.

**Input rules (mobile banking style):**
- Max 9 integer digits; max 2 decimal places for price, 4 for quantity
- Leading zeros are stripped as you type (`005` → `5`, `0.05` preserved)
- Pressing `.` on an empty field inserts `0.` automatically
- Backspace and clear work normally; limits do not apply to operator results

**Unit price box layout (two-row column):**
The per-unit cell uses a column layout (spreads `getBoxStyle` then overrides `flexDirection/alignItems/justifyContent`):
- Row 1: ✅ icon (fontSize 10, cheapest only) + unit price text (flex: 1, right-aligned)
- Row 2: percentage badge (fontSize 8, right-aligned) — only shown when relevant

**Adaptive font size:**
Each cell computes its own font size independently — a long price does not shrink the quantity or unit cells. `format.priceCellLen`, `format.qtyCellLen`, and `unitDisplay.length` are each passed to `format.rowFontSize` separately:
```
len > 11 → 10px | len > 9 → 12px | len > 7 → 15px | default → 18px
```

**No-decimal currencies (JPY, KRW, IDR, VND):**
These have `noDecimal: true` on the currency object. Apply this at every display site:
- Price box (`EditCell`): `toFixed(noDecimal ? 0 : 2)`
- Unit price display: `effectiveDecimals = currency.noDecimal ? 0 : decimals` — pass this to `fmtDisplay` and to the copy `onPress`
- `resolveDecimals` is unaware of `noDecimal` — always override at the call site

**Copy to clipboard:**
Tapping any filled unit cell copies the number (no currency symbol) to clipboard. Feedback: instant `TouchableOpacity` press animation. Nav bar shows "Copied!" toast for 2s. ✅ is a permanent static label on the cheapest cell only — do not re-introduce a timed flash state.

**Sort button:**
Intentionally disabled (removed from UI). `sortItems` and `originalItems` logic remain in code for future use.

**Percentage badge compact notation:**
`pct > 999` → shows `×N` instead of `+72480%` to prevent overflow.

**`adjustsFontSizeToFit` is not used** — unreliable with `flex: 1` text. Font size is computed manually.

**`app/old_tabs_backup/`**: ignored leftover from initial Expo tab template — do not restore or reference.

## Currencies with no decimal places

`noDecimal: true` is set on: JPY, KRW, IDR, VND. When adding new no-decimal currencies, set this flag in `AppContext.tsx` AND verify all three display sites above handle it correctly.
