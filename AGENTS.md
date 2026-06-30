# AGENTS.md

## Project Overview

- This repository is a Vite single-page React application using TypeScript,
  Tailwind CSS v4, and shadcn/ui.
- The product is a local-first iCost Excel analyzer. Users upload `.xlsx` or
  `.xls` exports in the browser, then inspect spending metrics, linked charts,
  summaries, filters, exchange rates, and paginated transaction details.
- This is an open-source, third-party companion project for iCost exports. Do
  not imply official iCost affiliation in product copy, documentation, package
  metadata, or repository materials unless the user explicitly provides that
  relationship.
- There is no backend service in this repo. Workbook parsing happens in the
  browser through a lazy `xlsx` import, and the app should not upload personal
  finance data to any remote service.
- `src/main.tsx` mounts React in `StrictMode`, wraps the app in
  `ThemeProvider`, and renders `App`.
- `src/App.tsx` lazy-loads `FinanceDashboard` from
  `src/features/finance-dashboard/finance-dashboard.tsx`.
- The theme system stores the selected theme in `localStorage` under the
  `theme` key, supports `dark`, `light`, and `system`, applies the resolved
  class to `<html>`, syncs across tabs, and toggles with the `d` key when focus
  is not in an editable element.

## Open Source & Documentation

- `README.md` is the public entry point for the project. Keep it friendly to
  non-internal users and update it whenever product behavior, supported iCost
  export fields, commands, privacy boundaries, or contribution expectations
  change.
- Treat the README as user documentation first, not an implementation tour.
  Lead with what the project does, how to use it, privacy expectations, and
  supported iCost export fields before local development details.
- Public-facing documentation should default to Simplified Chinese unless the
  user asks for another language. Technical agent guidance in `AGENTS.md` may
  remain in English for tool compatibility and precision.
- Public copy should consistently describe the project as open source,
  third-party, unofficial, and local-first. Avoid internal company context,
  private deployment assumptions, or wording that implies an official iCost
  partnership.
- Treat this project as local-first by default. Do not introduce remote upload,
  telemetry, cloud parsing, live exchange-rate fetching, or account features
  without an explicit product decision and matching README/UI disclosure.
- If a product change affects parsing rules, analytics semantics, exchange-rate
  behavior, persistence, browser storage, supported commands, or expected user
  workflow, update README.md in the same change.
- Use fictional, anonymized, or generated examples only. Never add real finance
  exports, private screenshots, personal categories, or sensitive sample data to
  docs, fixtures, or commits.
- If a license file is added later, update the README license section in the
  same change. Do not change `package.json` publication settings only because
  the repository is open source.

## Product Behavior

- The upload flow accepts `.xlsx` and `.xls` files via full-page drag-and-drop
  or a hidden file input.
- Uploaded workbook data lives only in React state during the current page
  session. Do not persist transaction data to localStorage, sessionStorage,
  IndexedDB, cookies, or remote services without an explicit product decision
  and matching README/UI disclosure.
- `workbook-parser.ts` reads the first worksheet and maps supported column
  aliases into `Transaction` records.
- Required data is date plus amount. Rows with invalid dates or non-numeric
  amounts are skipped.
- Missing transaction type falls back to `支出` for negative amounts and `收入`
  for non-negative amounts.
- Missing currency falls back to `CNY`; missing categories fall back to
  `未分类`.
- Tags are split from comma-like separators, semicolons, pipes, whitespace, and
  `#tag` style strings.
- `CNY` is the base currency and is fixed at exchange rate `1`.
- Default exchange rates in `model/constants.ts` are static application values,
  not live market data.
- Empty, invalid, or non-positive non-base exchange rate inputs do not overwrite
  the active calculation rate.
- Analytics treat transactions as expense, income, and reimbursement according
  to the helpers in `model/analytics.ts`; keep those domain rules centralized.

## Feature Architecture

- `src/features/finance-dashboard/finance-dashboard.tsx`: page-level state,
  derived analytics, filter/rate coordination, chart option creation, and
  dashboard composition.
- `src/features/finance-dashboard/model`: pure data helpers for types,
  constants, collections, dates, money conversion, filtering, and analytics.
- `src/features/finance-dashboard/components/hero`: landing copy, workbook
  upload, drag-and-drop handling, parsing state, parser, and loaded-workbook
  hero.
- `src/features/finance-dashboard/components/filters`: time, date, type,
  currency, category, tag, and keyword filtering controls.
- `src/features/finance-dashboard/components/rates`: editable exchange-rate
  inputs and reset behavior.
- `src/features/finance-dashboard/components/charts`: ECharts wrapper, chart
  theme helpers, chart option builders, and chart panels.
- `src/features/finance-dashboard/components/summaries`: category and tag
  summary tables.
- `src/features/finance-dashboard/components/transactions`: transaction table,
  rows, controls, sorting, and pagination.
- `src/features/finance-dashboard/components/shared`: reusable dashboard panel
  and metric card primitives.
- `src/features/finance-dashboard/components/feedback`: alert and empty-state
  surfaces.

## Build & Commands

Use `pnpm` for project commands because this repo has `pnpm-lock.yaml` and
`pnpm-workspace.yaml`.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm preview
```

- `pnpm dev`: start the Vite dev server.
- `pnpm build`: run `tsc -b` and then `vite build`.
- `pnpm lint`: run ESLint across the repository.
- `pnpm typecheck`: run `tsc --noEmit`.
- `pnpm format`: run Prettier over `**/*.{ts,tsx}`.
- `pnpm preview`: preview the production build locally.
- No deployment command is defined in `package.json`; production output is the
  Vite `dist` directory produced by `pnpm build`.
- `package.json` currently has `private: true` to prevent accidental npm
  publication. Do not change that unless the user asks.

## Code Style

- TypeScript is strict for app code. `tsconfig.app.json` enables `strict`,
  `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and
  `erasableSyntaxOnly`.
- Use the `@/` alias for imports from `src`; it is configured in both Vite and
  TypeScript.
- Prettier settings:
  - LF line endings
  - no semicolons
  - double quotes
  - 2-space indentation
  - trailing commas where valid in ES5
  - 80-character print width
  - `prettier-plugin-tailwindcss` with Tailwind stylesheet `src/index.css`
  - Tailwind-aware class sorting for `cn` and `cva`
- ESLint applies recommended JavaScript, TypeScript, React Hooks, and Vite React
  Refresh rules to `*.ts` and `*.tsx`; `dist` is ignored.
- `src/components/ui/**/*.{ts,tsx}` disables the React Refresh
  only-export-components rule because shadcn/ui files often export variants and
  components together.
- Use `cn()` from `src/lib/utils.ts` for class composition. It combines `clsx`
  with `tailwind-merge`.
- Keep business/data logic in `model` files where possible. Components should
  mostly coordinate state and rendering.
- Preserve the lazy import of `xlsx` unless there is a clear reason to increase
  the initial bundle.
- The ECharts wrapper registers only the chart/component modules this app uses.
  Add ECharts imports deliberately when introducing a new chart type or ECharts
  component.

## shadcn/ui & Styling

- shadcn project configuration:
  - framework: Vite
  - TypeScript: enabled
  - React Server Components: disabled
  - Tailwind: v4 with global CSS at `src/index.css`
  - style: `base-lyra`
  - base primitive library: `base`
  - icon library: `remixicon`
  - import alias: `@` for `src`
- Current shadcn-owned UI components live under `src/components/ui`:
  `alert`, `badge`, `button`, `calendar`, `card`, `empty`, `input`, `popover`,
  `select`, `separator`, and `table`.
- Prefer existing components and variants before custom markup.
- Add UI components through the shadcn CLI with the project package runner,
  then review generated files before using them.
- Because this project uses shadcn `base`, confirm Base UI APIs before assuming
  Radix-specific APIs.
- Use semantic tokens such as `bg-background`, `text-muted-foreground`,
  `border-border`, and component variants instead of raw color utilities.
- Use `flex` plus `gap-*`; avoid `space-x-*` and `space-y-*`.
- Use `size-*` when width and height are equal.
- Use `truncate` instead of manually combining overflow/text-ellipsis/whitespace
  classes.
- Do not add manual dark-mode color overrides when semantic tokens can express
  the design.
- Icons inside buttons should use `data-icon="inline-start"` or
  `data-icon="inline-end"`; component CSS handles sizing.
- Theme variables, fonts, Tailwind imports, custom shadows, animations, and base
  CSS live in `src/index.css`. Do not create a second global stylesheet for
  theme tokens.

## Testing

- No unit test, browser test, or E2E framework is currently configured.
- No `test` script exists in `package.json`.
- Current verification commands are:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

- If tests are added, also add the relevant package script and document the
  test command here.
- Keep tests close to the implementation or follow the convention introduced by
  the test framework chosen for this repo; there is no established in-repo test
  file pattern yet.
- For parser or analytics changes, prefer small deterministic tests around
  `model` helpers and workbook parsing once a test framework exists.

## Security & Privacy

- This is currently a client-only Vite app. Do not place secrets, credentials,
  private API keys, or service tokens in source files or client-side
  configuration.
- No environment example file or runtime configuration file is present. Add one
  before introducing required environment variables, and keep secret values out
  of git.
- Do not add network upload, telemetry, or remote parsing for workbook data
  without an explicit product decision and visible user-facing disclosure.
- The existing `ThemeProvider` reads and writes only the theme preference in
  `localStorage`; avoid storing sensitive user or application data in browser
  storage.
- Treat anything rendered in React as user-visible client code. Validate and
  sanitize any future external data at the boundary where it enters the app.
- Keep dependencies and generated UI component code reviewable; shadcn
  components are copied into this repository and should be audited like local
  source.
- Do not commit real finance exports, private sample workbooks, `demo.html`, or
  generated `dist` output. These are ignored by `.gitignore`.

## Configuration

- `vite.config.ts` enables React and Tailwind CSS plugins, maps `@` to `./src`,
  and splits React, ECharts, XLSX, and other vendor code into manual chunks.
- `components.json` defines shadcn/ui settings:
  - Tailwind CSS file: `src/index.css`
  - aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`,
    `@/hooks`
  - icon library: `remixicon`
  - RTL: disabled
  - registries: none beyond the default shadcn registry reported by the CLI
- `src/index.css` imports Tailwind, `tw-animate-css`, `shadcn/tailwind.css`,
  Inter, and DM Sans; it also defines light/dark CSS variables and Tailwind
  theme tokens.
- `tsconfig.json` uses project references for app and node configs and defines
  the shared `@/*` path mapping.
- `tsconfig.node.json` covers `vite.config.ts` and includes Node types.
- `pnpm-workspace.yaml` declares an empty workspace package list and
  `allowBuilds` entries for `esbuild: true` and `msw: false`.
- `.prettierignore` ignores dependencies, coverage, package-lock/yarn lock
  files, and the pnpm lockfile.
- There are no `.cursor/rules/`, `.github/copilot-instructions.md`, or
  `.trae/rules/` files to merge into this overview. The repository does contain
  local agent skills under `.trae/skills` and `.agents/skills`, including
  shadcn guidance reflected in the Code Style section.

## Entry Points & Key Files

- `index.html`: Vite HTML entry point with `#root` and `/src/main.tsx` script.
- `src/main.tsx`: React root setup and provider composition.
- `src/App.tsx`: lazy application entry that renders `FinanceDashboard`.
- `src/components/theme-provider.tsx`: theme context, localStorage persistence,
  system-theme detection, cross-tab sync, and keyboard toggle.
- `src/features/finance-dashboard/finance-dashboard.tsx`: dashboard container
  and derived application state.
- `src/features/finance-dashboard/components/hero/workbook-parser.ts`: workbook
  parser and column alias mapping.
- `src/features/finance-dashboard/model/analytics.ts`: metric, summary, trend,
  week, and heatmap calculations.
- `src/features/finance-dashboard/model/filtering.ts`: filter application.
- `src/features/finance-dashboard/model/constants.ts`: base currency, default
  rates, and empty filter state.
- `src/features/finance-dashboard/components/charts/e-chart.tsx`: ECharts
  lifecycle wrapper.
- `src/components/ui`: shadcn/Base UI components currently available to the app.
- `src/lib/utils.ts`: `cn()` class-name helper.
