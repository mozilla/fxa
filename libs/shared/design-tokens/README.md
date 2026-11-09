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

## Non-color tokens

`fxa-react/configs/tailwind.js` keeps Tailwind's scale names and points only the
steps that have an Acorn equal at Acorn's vars:

- Spacing: `0.5/1/2/3/4/6/8` → `--space-xxsmall…xxlarge`.
- Radius: `rounded`/`-lg`/`-xl`/`-2xl`/`-3xl`/`-full` → `--border-radius-xsmall…xlarge`, `circle`.
  `rounded-sm` and `rounded-md` have no Acorn equal and keep Tailwind's values.
- Font weight: `normal`/`semibold`/`bold` → `--font-weight`, `--font-weight-semibold`, `--font-weight-bold`.
  `font-heading` → `--font-weight-heading` (semibold under the flag, bold off), used by `.card-header`.
- Shadows: `shadow-sm`/`shadow`/`-md`/`-lg` → `--box-shadow-level-1…4`.
- Font family: `font-body`/`font-header` → `--font-family`. Acorn defines it in `base.css`, which
  we don't import because it also sets document-level styles, including the root font size, so
  `nova-aliases.css` copies the stack. `font-mono` is unchanged.

Under the flag, only shadows, heading weight and the font stack change; the other values match.
`legacy.css` defines all of these at today's values for flag-off, so admin-panel works without
loading Acorn's `tokens.css`. `fontSize` stays as it is.

Acorn's radii are in px, Tailwind's in rem. With the flag on, radii no longer scale with the
user's root font size.

## Opacity

- Palette color with alpha: use the Tailwind `/NN` modifier (`bg-blue-500/40`). In CSS, write
  `color-mix(in srgb, var(--color-blue-500) 40%, transparent)`. Don't hardcode `rgb()`.
- Raw `rgba()` is only for black/white overlays that don't depend on the theme.
- Add a token only when a color+alpha pair recurs as a semantic role.

Known case left for FXA-14255: `--cta-disabled` in `fxa-react/styles/ctas.css` hardcodes
Tailwind's stock blue-500 (`rgb(59 130 246 / 0.4)`), not the palette's.

## Maintenance

Both files are hand-maintained and stable:

- `legacy.css` — today's palette values. Drops out when the flag is removed.
- `nova-aliases.css` — the grey→gray + hue shade pairing (**TODO(design): confirm**).
  Drops out when components adopt Acorn's own names (via a Tailwind preset).

Acorn's token values and their versioning come from the package — bump the
`acorn-web-components` dependency to pick up changes. There's no generator.

> Tokens only — we are **not** adopting Acorn's web/React components in phase 1.
