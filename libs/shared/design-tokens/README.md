# @fxa/shared/design-tokens

Maps Firefox's **Nova** tokens (the `acorn-web-components` package) onto FxA's Tailwind
utilities, gated behind the `novaDesignSystem` flag. **No build step** — Acorn's values
come from the package; we add two small static layers.

Imported once via `fxa-react/styles/index.css`:

- `acorn-web-components/dist/tokens/tokens.css` — Acorn's tokens at `:root`, in `@layer
  acorn.tokens`. The `dist/` path is used because postcss-import doesn't resolve the
  package `exports` map.
- `legacy.css` — `:root:not([data-theme="nova"])`: today's values (flag off). Unlayered,
  so it beats Acorn's layer; the `:not()` stops matching under the flag, letting Acorn win.
- `nova-aliases.css` — `[data-theme="nova"]`: our Protocol palette names aliased onto
  Acorn's ramp, plus `color-scheme` synced to the app theme (`light` by default, `dark`
  under `.dark`). `black`/`white` are left to Acorn.

**Name collision:** Acorn also defines `--color-<hue>-50` and `-100`, but on its scale
those are a mid shade and a near-black, and its own semantic tokens reference them. Our
`50`/`100` are the lightest tints, so the Tailwind config points those two shades at
`--fxa-color-<hue>-50/-100` (today's hex in `legacy.css`, aliased to Acorn's `-0`/`-10`
in `nova-aliases.css`). Never redefine an `--color-*` name that Acorn already owns.

## Maintenance

Both files are hand-maintained and stable:

- `legacy.css` — today's palette values. Drops out when the flag is removed.
- `nova-aliases.css` — the grey→gray + hue shade pairing (**TODO(design): confirm**).
  Drops out when components adopt Acorn's own names (via a Tailwind preset).

Acorn's token values and their versioning come from the package — bump the
`acorn-web-components` dependency to pick up changes. There's no generator.

> Tokens only — we are **not** adopting Acorn's web/React components in phase 1.
