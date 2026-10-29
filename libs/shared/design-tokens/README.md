# @fxa/shared/design-tokens

Maps Firefox's **Nova** design tokens (the published `acorn-web-components` package)
onto FxA's Tailwind utilities, gated behind the `novaDesignSystem` flag.

Generates `generated/nova-tokens.css` (a build output, gitignored) with two scopes:

- `:root` — flag OFF, today's values (pixel-identical to current).
- `[data-theme="nova"]` — flag ON: Acorn's tokens (via `acorn-web-components/tokens`),
  `light-dark()` intact so light/dark follow `color-scheme`, plus our Protocol palette
  names aliased onto Acorn's ramp.

## Build

```
nx build shared-design-tokens          # reads acorn-web-components/tokens
# bootstrap before install, from the cloned repo:
ACORN_TOKENS=../acorn-web-components/src/generated/tokens.ts node src/generate.mjs
```

Consumers `@import` it via `fxa-react/styles/index.css` and declare
`dependsOn: ["shared-design-tokens:build"]` on their `build-css`.

## The hand-authored half (`src/token-map.mjs`)

Only two things can't come from Acorn: the **shade pairing** (our grey 10–900 /
hues 50–900 → Acorn's 0–110 ramp — `TODO(design)`) and the **flag-OFF values**
(today's palette, for pixel-identical off-state). Everything else is Acorn's map.

## Not vendored, not parsed

Unlike the first pass, there's no vendored mozilla-central CSS and no CSS parsing —
Acorn publishes the tokens, we consume the typed map. If Acorn ships a
selector-scoped token build, the re-emit in `generate.mjs` drops out and we import
their CSS directly.

> Scope: tokens only. We are **not** adopting Acorn's web/React components in phase 1.
