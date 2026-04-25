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
- `items` — the list of price comparison rows (id, price, quantity strings)
- `currency` — the active currency object `{ code, symbol, name }`
- `themeMode` — `"light" | "dark" | "system"`
- `dark` — resolved boolean used throughout for conditional styling
- `T` — the active theme token object (colors). **Always use `T.*` for colors, never hardcode.**
- `showPercentage` — whether to show the `+X%` label on non-best items
- Settings are persisted to `AsyncStorage` under `pricepick_*` keys and loaded on mount

`THEMES` (light/dark token objects) are defined in `AppContext.tsx`. `constants/theme.ts` is a legacy Expo starter file, not used by the app.

### Design system

`constants/DesignSystem.js` is the single source of truth for layout constants:
- `ACCENTS` — 7 accent/background color pairs, indexed by item position (cycles with `%`)
- `LABELS` — `["A","B","C","D","E","F","G"]` letter labels per item
- `LAYOUT` — row height, border radius, gaps, font sizes, label dimensions, and `getBoxStyle()` which computes the full style object for price/quantity/unit cells

Always update `LAYOUT` here rather than hardcoding style values in components.

### Business logic

`utils/logic.js` exports a `FORMAT` object with pure functions:
- `computeUnit(price, qty)` — returns price/qty or null
- `resolveDecimals(unitValues)` — picks 2 or 4 decimal places to break ties in unit price display
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

### Key patterns in the main screen

- **Dynamic item limit**: computed from `SCREEN_HEIGHT` minus reserved space, capped at 7 (matches the 7 `ACCENTS`/`LABELS` entries)
- **Calculator state**: `pendingOp` stores `{ id, field, value, op }` for deferred arithmetic; cleared on cell switch
- **Sort toggle**: `originalItems` in context stores pre-sort order; pressing Sort again restores it
- **`app/old_tabs_backup/`**: ignored leftover from initial Expo tab template — do not restore or reference
