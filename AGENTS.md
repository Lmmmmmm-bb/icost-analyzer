# Agent Guidelines

Keep this file focused on instructions for future changes. Read source files,
tests, and configuration for implementation details; do not duplicate file maps,
feature inventories, configuration values, or completed-work records here.

## Documentation & Product Scope

- Keep `README.md` user-facing and in Simplified Chinese. Explain usage,
  supported inputs, calculation caveats, and privacy. Put engineering setup and
  architecture guidance in dedicated contributor docs when needed.
- Update the README in the same change when parsing, analytics, exchange rates,
  storage, privacy, or user workflows change. Keep user-facing explanations in
  sync with the UI; do not add implementation walkthroughs or test-run records.
- Describe the project as open source, third-party, unofficial, and local-first.
  Do not imply an official iCost relationship or introduce internal company
  context into public materials.
- Do not introduce remote upload, cloud parsing, telemetry, live exchange-rate
  fetching, account features, or ledger persistence without an explicit product
  decision and matching README/UI disclosure.
- Do not change package publication settings unless requested. If adding a
  license, update the README license statement in the same change.

## Privacy & Agent Access

- Keep ledger data in the current page session. Do not write it to browser
  storage, cookies, logs, or remote services. Never persist Agent authorization.
- Require fresh manual, in-page opt-in for each workbook and after refresh.
  Revoke authorization synchronously when an upload starts, even if parsing
  later fails. Browser-level tool permission is not a substitute for this check.
- Validate every WebMCP call's input, authorization, parsing state, and latest
  context ID. Keep tools read-only and limited to aggregates and query context;
  do not expose transaction lists or page mutations.
- Preserve the public WebMCP contract during internal refactors. Keep page and
  Agent calculations on the same domain rules and analysis clock.
- Keep the UI and README disclosure that tool results, filters (including
  keywords), and group names enter the user's chosen Agent session. Do not claim
  client compatibility without an actual tool discovery and call test.
- Use fictional, generated, or fully anonymized examples and fixtures. Never
  commit real finance exports, private screenshots, secrets, `demo.html`, or
  generated `dist` output. Report invalid-row counts without logging row contents.
- Validate external data at its entry boundary. Keep credentials out of client
  code and configuration; document required environment variables without secrets.

## Implementation Boundaries

- Keep domain rules and calculations in pure model helpers, workbook mapping in
  the parser, and upload coordination separate from rendering. Reuse centralized
  transaction, filtering, date, and money rules instead of duplicating them in UI
  components or Agent queries.
- Keep query-core code independent of React, ECharts, and browser APIs. Use
  explicit aggregate result types rather than exposing internal transaction data.
- Route shared view changes through semantic actions. Give child components
  narrow value/action contracts instead of the complete dashboard controller or
  unrestricted state setters.
- Keep analytics independent of pagination, sorting, and chart drilldown. Select
  transaction details on demand; pass only current-page rows to detail tables and
  keep raw transactions out of monthly/daily summaries.
- Keep rate drafts and active rates consistent: invalid drafts must preserve
  active calculations and Agent context. Preserve date boundaries and month-end
  and leap-day behavior when refactoring time filters; labels are presentation,
  not domain values.
- Preserve lazy workbook parsing dependencies. Add ECharts modules deliberately
  and review the bundle impact of new imports.

## UI & Code Style

- Follow repository formatter, linter, and TypeScript configuration rather than
  restating or overriding their rules. Use `@/` for imports from `src` and `cn()`
  for class composition.
- Reuse existing UI components and variants. Add new shadcn components through
  the CLI with `pnpm`, review generated code, and confirm Base UI APIs before
  assuming Radix-specific behavior.
- Use semantic theme tokens and component variants. Keep global theme styles in
  `src/index.css`; avoid a second token stylesheet and manual dark-mode overrides
  when tokens suffice.
- Prefer `flex` with `gap-*`, `size-*` for equal dimensions, and `truncate` for
  truncated text. Avoid `space-x-*` and `space-y-*`.
- Mark button icons with `data-icon="inline-start"` or `data-icon="inline-end"`
  and let the button component handle sizing.

## Verification

- Use `pnpm` for project commands; consult `package.json` for available scripts.
- For application changes, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and
  `pnpm build`. For documentation-only changes, check formatting, references, and
  consistency with the implementation.
- Maintain deterministic unit tests beside affected code as `*.test.ts`, focused
  on core parsing, calculations, filtering, state transitions, and authorization.
  Do not add E2E, browser automation, screenshot, or performance test suites.
- Isolate platform dependencies in unit tests. Cover meaningful boundaries and
  failure modes rather than duplicating cases or asserting incidental details
  such as batch sizes, display copy, or internal call counts.
- Mocked WebMCP unit tests do not establish browser client compatibility.
