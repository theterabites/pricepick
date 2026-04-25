# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start dev server (choose iOS/Android/web from terminal)
npx expo start --ios     # Open directly in iOS simulator
npx expo start --android # Open directly in Android emulator
npm run lint         # Run ESLint via expo lint
```

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
- Settings are persisted to `AsyncStorage` under `pricepick_*` keys and loaded on mount

`THEMES` (light/dark token objects) are defined in `AppContext.tsx`. `constants/theme.ts` is a legacy Expo starter file, not used by the app.

### Design system

`constants/DesignSystem.js` is the single source of truth for layout constants:
- `FONTS.mono` — `Platform.select` picks Menlo (iOS) or monospace (Android); used on all numeric displays
- `ACCENTS` — 7 accent/background color pairs, indexed by `item.colorIndex % 7`
- `LABELS` — `["A","B","C","D","E","F","G"]` letter labels, indexed by `item.colorIndex % 7`
- `LAYOUT` — row height, border radius, gaps, font sizes, label dimensions, and `getBoxStyle()` which computes the full style object for price/quantity cells

`getBoxStyle` is **not** used for unit cells — unit boxes use a two-row column layout (see below). Always update `LAYOUT` here rather than hardcoding style values in components.

### Business logic

`utils/logic.js` exports a `FORMAT` object with pure functions:
- `computeUnit(price, qty)` — returns price/qty or null
- `resolveDecimals(unitValues)` — picks 2 or 4 decimal places to break ties in unit price display. **Does not know about `noDecimal` — callers must apply `effectiveDecimals = currency.noDecimal ? 0 : decimals` before using.**
- `resolveQtyDecimals(items)` — max decimals used across quantity inputs
- `fmtDisplay(unit, sym, decimals)` — formats a unit price string with currency symbol
- `sortItems(items)` — returns a new array sorted by unit price ascending (nulls last)
- `applyOp` / `fmtNum` — support the in-app calculator

### Screens (expo-router)

| File | Route | Purpose |
|---|---|---|
| `app/index.jsx` | `/` | Main price comparison screen |
| `app/settings.jsx` | `/settings` | Settings hub |
| `app/currency.jsx` | `/currency` | Currency picker |
| `app/theme.jsx` | `/theme` | Theme picker |
| `app/percentage.jsx` | `/percentage` | Toggle percentage display |
| `app/feedback.jsx` | `/feedback` | Feedback (currently hidden in settings UI) |
| `app/coffee.jsx` | `/coffee` | Buy me a coffee (currently hidden in settings UI) |

`app/_layout.tsx` wraps everything in `AppProvider` and sets up the `Stack` navigator with `headerShown: false` on all screens.

### Key patterns in the main screen (`app/index.jsx`)

**Item identity — `colorIndex` not `id`:**
Items have both `id` (monotonically increasing, used for React keys and state lookups) and `colorIndex` (lowest unused 0–6, stable across sort/remove). Always use `colorIndex` to look up `ACCENTS` and `LABELS`, never `id` or array position.

**Sort toggle:**
`originalItems` in context stores the pre-sort snapshot. `addItem` and `removeItem` both sync `originalItems` when a sort is active, so new/removed rows survive unsort correctly.

**Dynamic item limit:**
Computed from `SCREEN_HEIGHT` minus reserved space, capped at 7 (matches `ACCENTS`/`LABELS` length).

**Calculator state:**
`pendingOp` stores `{ id, field, value, op }` for deferred arithmetic; cleared on cell switch.

**Unit price box layout (two-row column):**
The per-unit cell uses a column layout (spreads `getBoxStyle` then overrides `flexDirection/alignItems/justifyContent`) to avoid horizontal crowding:
- Row 1: ✅ icon (fontSize 10, cheapest only) + unit price text (flex: 1, right-aligned)
- Row 2: percentage badge (fontSize 8, right-aligned) — only shown when relevant

This separates the elements so the unit price always gets the full row width.

**Adaptive font size (`rowFontSize`):**
Computed per item from `allLen = max(pLen, qLen, uLen)` where each length reflects the actual displayed string. All three boxes (price, qty, unit) use the same `rowFontSize` so they scale together:
```
allLen > 11 → 10px | allLen > 9 → 12px | allLen > 7 → 15px | default → 18px
```

**No-decimal currencies (JPY, KRW, IDR, VND):**
These have `noDecimal: true` on the currency object. Apply this at every display site:
- Price box (`EditCell`): `toFixed(noDecimal ? 0 : 2)`
- Unit price display: `effectiveDecimals = currency.noDecimal ? 0 : decimals` — pass this to `fmtDisplay`, and also use it in the copy `onPress`
- `resolveDecimals` is unaware of `noDecimal` — always override at the call site

**Copy to clipboard:**
Tapping any filled unit cell copies the number (no currency symbol) to clipboard. Feedback: instant `TouchableOpacity` press animation (same feel on all cells). Nav bar shows "Copied!" toast for 2s (visible even when no input cell is active). ✅ is a permanent static label on the cheapest cell only — it does NOT change on tap for other cells. Do not re-introduce a timed flash state (`copiedItemId` was removed — the press animation is sufficient).

**Sort button:**
The sort button is intentionally disabled (removed from UI). The `sortItems` function and `originalItems` logic remain intact in the code for future use.

**Percentage badge compact notation:**
`pct > 999` → shows `×N` (e.g. "×726") instead of `+72480%` to prevent overflow for extreme value differences.

**`adjustsFontSizeToFit` is not used** — it is unreliable with `flex: 1` text (no fixed width at layout time). Font size is computed manually from string length.

**`app/old_tabs_backup/`**: ignored leftover from initial Expo tab template — do not restore or reference.

## Currencies with no decimal places

`noDecimal: true` is set on: JPY, KRW, IDR, VND. When adding new no-decimal currencies, set this flag in `AppContext.tsx` AND verify all three display sites above handle it correctly.
