# @fxa/shared/design-tokens

Single source of truth for design values on the Mozilla Account surfaces (`fxa-settings`).
Vendors Firefox's **Nova** design system as CSS custom properties and generates
`generated/nova-tokens.css`, which the `fxa-react` Tailwind config reads from. Adopting a
future Nova version is a re-vendor + regenerate, not a repo-wide change.

> Part of epic FXA-14002. **SubPlat/payments is out of scope** — it uses its own config in
> `libs/shared/assets` and is handled separately (PAY project).

## Layout

```
src/
  vendor/            Vendored Nova dist CSS + SOURCE pin (see vendor/README.md)
  config/
    legacy-palette.mjs   FxA's CURRENT hex, mirrored from fxa-react/configs/tailwind.js
    token-map.mjs        Allowlist + FxA→Nova primitive mapping + legacy semantic seed
  generate.mjs       The generator
generated/
  nova-tokens.css    OUTPUT — generated at build time, gitignored, never committed
```

## Build

`nova-tokens.css` is a **build output**, not a committed artifact. Generation is the lib's
`build` target — Nx caches it and only re-runs when the vendored input or the generator
changes:

```
nx build shared-design-tokens
```

Consumers (fxa-settings, fxa-react styles, content-server, admin-panel, Storybook) must run
this before their Tailwind/CSS build so the `@import` of `generated/nova-tokens.css`
resolves — wire it as a task dependency, e.g. `"dependsOn": ["shared-design-tokens:build"]`
(CSS `@import`s don't create an Nx project-graph edge on their own, so declare it).

The committed input is `src/vendor/*.css` (see vendor/README.md); the output is gitignored.
CI needs only the repo — no `mozilla-central`/Firefox checkout. That checkout is used **only**
by a human re-vendoring, via the `NOVA_SRC` override:

```
# one-time bootstrap / re-sync from a local Firefox checkout:
NOVA_SRC=../../../../firefox/toolkit/themes/shared/design-system/dist node src/generate.mjs
```

## Output shape

Four blocks scoped by a `data-theme="nova"` attribute on `<html>`, so the refresh is a
runtime toggle and light/dark keeps working with our class-based dark mode:

```css
:root {
  /* legacy, light — seeded to TODAY's values */
}
.dark {
  /* legacy, dark  */
}
:root[data-theme='nova'] {
  /* Nova, light — light-dark() rewritten to class scope */
}
[data-theme='nova'].dark {
  /* Nova, dark  */
}
```

Flag **off** → `:root`/`.dark` win → identical to today. Flag **on** (`data-theme="nova"`)
→ Nova values win. The `featureFlags.novaDesignSystem` flag sets the attribute server-side.

## How it works

The generator reads Nova's **compiled** `tokens-shared.css` + `tokens-brand.css` (not the
Style-Dictionary JSON — avoids re-implementing the resolver), then:

1. Splits base decls from the `@media -moz-pref("browser.nova.enabled")` overrides
   (Nova value = override ?? base); drops `@layer`, `:host`, and prefers-contrast /
   forced-colors accessibility variants.
2. Rewrites `light-dark(a, b)` → `a` in the `:root[data-theme="nova"]` scope, `b` in the
   `[data-theme="nova"].dark` scope. `color-mix()` / `oklch()` are kept verbatim.
3. Emits Nova's color primitive ramps (so semantic references resolve), the
   FxA-named primitive aliases, and the allowlisted semantic/scale tokens.
4. Emits the **legacy** blocks from `config/` seeded to today's values.

## Why two hand-authored config inputs

They encode things that can't be auto-derived:

- FxA's palette is a Protocol-style **grey 10–900** scale; Nova's is **gray 0–110** — the
  shade pairing (`PRIMITIVE_ALIASES_NOVA`) is a design decision.
- The legacy value of a _semantic_ token ("what colour is `--background-color-box` today")
  is a mapping, not a lookup (`LEGACY_SEMANTICS`).

Both must stay defined while the flag exists. The "Remove Nova flag + legacy tokens" ticket
deletes the legacy blocks and this config.

## Open first-pass items

- `PRIMITIVE_ALIASES_NOVA` grey→gray pairing — **TODO(design)**.
- `LEGACY_SEMANTICS` — a representative subset is seeded; complete the remaining
  `--space-*` / `--box-shadow-level-*` / `--font-weight-*` from the current Tailwind scales.
- Accent = Nova violet per FXA-14255 (comes through `--color-accent-*`).
- Opacity/oklch: Tailwind alpha modifiers (`bg-x/50`) don't work on `oklch()`/`light-dark()`
  values — audited in the typography/opacity ticket (FXA-14256).
