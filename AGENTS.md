# AGENTS.md

## Project Overview

- This repository is a Vite single-page React application using TypeScript, Tailwind CSS v4, and shadcn/ui.
- The current app is a starter shell: `src/main.tsx` mounts React in `StrictMode`, wraps the app in `ThemeProvider`, and renders `App`.
- UI components are source-owned in `src/components`. shadcn/ui components live under `src/components/ui`; the installed component list currently contains `button` only.
- The shadcn project configuration uses:
  - framework: Vite
  - TypeScript: enabled
  - React Server Components: disabled
  - Tailwind: v4 with global CSS at `src/index.css`
  - style: `base-lyra`
  - base primitive library: `base`
  - icon library: `remixicon`
  - import alias: `@` for `src`
- Styling is token-driven. Theme variables, fonts, Tailwind imports, and base CSS live in `src/index.css`.
- The theme system stores the selected theme in `localStorage` under the `theme` key, supports `dark`, `light`, and `system`, applies the resolved class to `<html>`, syncs across tabs, and toggles with the `d` key when focus is not in an editable element.

## Build & Commands

Use `pnpm` for project commands because this repo has `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

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
- No deployment command is defined in `package.json`; production output is the Vite `dist` directory produced by `pnpm build`.

## Code Style

- TypeScript is strict for app code. `tsconfig.app.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `erasableSyntaxOnly`.
- Use the `@/` alias for imports from `src`; it is configured in both Vite and TypeScript.
- Prettier settings:
  - LF line endings
  - no semicolons
  - double quotes
  - 2-space indentation
  - trailing commas where valid in ES5
  - 80-character print width
  - `prettier-plugin-tailwindcss` with Tailwind stylesheet `src/index.css`
  - Tailwind-aware class sorting for `cn` and `cva`
- ESLint applies recommended JavaScript, TypeScript, React Hooks, and Vite React Refresh rules to `*.ts` and `*.tsx`; `dist` is ignored.
- Use `cn()` from `src/lib/utils.ts` for class composition. It combines `clsx` with `tailwind-merge`.
- For shadcn/ui work:
  - Prefer existing components and variants before custom markup.
  - Add UI components through the shadcn CLI, then review generated files before using them.
  - Use semantic tokens such as `bg-background`, `text-muted-foreground`, `border-border`, and component variants instead of raw color utilities.
  - Use `flex` plus `gap-*`; avoid `space-x-*` and `space-y-*`.
  - Use `size-*` when width and height are equal.
  - Use `truncate` instead of manually combining overflow/text-ellipsis/whitespace classes.
  - Do not add manual dark-mode color overrides when semantic tokens can express the design.
  - Icons inside buttons should use `data-icon="inline-start"` or `data-icon="inline-end"`; component CSS handles sizing.
  - Because this project uses shadcn `base`, confirm Base UI APIs before assuming Radix-specific APIs.

## Testing

- No unit test, browser test, or E2E framework is currently configured.
- No `test` script exists in `package.json`.
- Current verification commands are:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

- If tests are added, also add the relevant package script and document the test command here.
- Keep tests close to the implementation or follow the convention introduced by the test framework chosen for this repo; there is no established in-repo test file pattern yet.

## Security

- This is currently a client-only Vite app. Do not place secrets, credentials, private API keys, or service tokens in source files or client-side configuration.
- No environment example file or runtime configuration file is present. Add one before introducing required environment variables, and keep secret values out of git.
- The existing `ThemeProvider` reads and writes only the theme preference in `localStorage`; avoid storing sensitive user or application data in browser storage.
- Treat anything rendered in React as user-visible client code. Validate and sanitize any future external data at the boundary where it enters the app.
- Keep dependencies and generated UI component code reviewable; shadcn components are copied into this repository and should be audited like local source.

## Configuration

- `vite.config.ts` enables React and Tailwind CSS plugins and maps `@` to `./src`.
- `components.json` defines shadcn/ui settings:
  - Tailwind CSS file: `src/index.css`
  - aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`
  - icon library: `remixicon`
  - RTL: disabled
  - registries: none beyond the default shadcn registry reported by the CLI
- `src/index.css` imports Tailwind, `tw-animate-css`, `shadcn/tailwind.css`, Inter, and DM Sans; it also defines light/dark CSS variables and Tailwind theme tokens.
- `tsconfig.json` uses project references for app and node configs and defines the shared `@/*` path mapping.
- `tsconfig.node.json` covers `vite.config.ts` and includes Node types.
- `pnpm-workspace.yaml` declares an empty workspace package list and `allowBuilds` entries for `esbuild: true` and `msw: false`.
- `.prettierignore` ignores dependencies, coverage, package-lock/yarn lock files, and the pnpm lockfile.
- There are no `.cursor/rules/`, `.github/copilot-instructions.md`, or `.trae/rules/` files to merge into this overview. The repository does contain local agent skills under `.trae/skills` and `.agents/skills`, including shadcn guidance reflected in the Code Style section.

## Entry Points & Key Files

- `index.html`: Vite HTML entry point with `#root` and `/src/main.tsx` script.
- `src/main.tsx`: React root setup and provider composition.
- `src/App.tsx`: current starter app content.
- `src/components/theme-provider.tsx`: theme context, localStorage persistence, system-theme detection, cross-tab sync, and keyboard toggle.
- `src/components/ui/button.tsx`: shadcn/Base UI button component and variants.
- `src/lib/utils.ts`: `cn()` class-name helper.
