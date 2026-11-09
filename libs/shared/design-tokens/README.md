# @fxa/shared/design-tokens

Maps Firefox's **Nova** tokens (the `acorn-web-components` package) onto FxA's Tailwind
utilities, gated behind the `novaDesignSystem` flag. **No build step** — Acorn's values
come from the package; we add two small static layers.

Imported once via `fxa-react/styles/index.css`:

- `acorn-web-components/dist/all-tokens.css` — Acorn's foundation and component tokens
  (`--button-*`, `--link-*`, …) at `:root`, in `@layer acorn.tokens`. The per-component
  files in `dist/tokens/` are scoped to `:host`, so they don't apply outside Acorn's
  components. The `dist/` path is used because postcss-import doesn't resolve the
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

## Semantic colors (fxa-settings only)

`fxa-settings/tailwind.config.js` adds utilities that point at Acorn's semantic tokens.
They aren't in the shared base config, so admin-panel and fxa-react components it renders
(`Footer`, `Header`, `AppErrorDialog`) can't use them. `legacy.css` gives each one the
light/dark pair it replaces, so flag-off rendering is unchanged once the `dark:` class is
deleted. Swap a class only when the element's current pair matches the table exactly;
otherwise record it under Gaps.

| Utility | Acorn token | Replaces (light / dark) |
|---|---|---|
| `bg-box` | `--background-color-box` | `bg-white` / `dark:bg-grey-700` |
| `bg-canvas` | `--background-color-canvas` | `bg-grey-10` / `dark:bg-grey-900` (body) |
| `bg-critical` | `--background-color-critical` | `bg-red-100` (no dark) |
| `bg-information` | `--background-color-information` | `bg-blue-50` (no dark) |
| `bg-success` | `--background-color-success` | `bg-green-200` (no dark) |
| `bg-warning` | `--background-color-warning` | `bg-orange-50` (no dark) |
| `text-default` | `--text-color` | `text-grey-900` / `dark:text-grey-10` (body) |
| `text-deemphasized` | `--text-color-deemphasized` | `text-grey-400` / `dark:text-grey-200` |
| `text-disabled` | `--text-color-disabled` | `text-grey-300` / `dark:text-grey-500` |
| `text-error` | `--text-color-error` | `text-red-600` (no dark) |
| `border-default` | `--border-color` | `border-grey-100` / `dark:border-grey-600` |
| `border-interactive` | `--border-color-interactive` | `border-grey-200` / `dark:border-grey-600` |
| `outline-focus` | `--focus-outline-color` | `outline-blue-500` (no dark) |

**`nova:`-only utilities.** These have no flag-off value by design: use them only with the
`nova:` prefix until the flag is removed.

| Utility | Acorn token |
|---|---|
| `bg-accent-primary`, `border-accent-primary` (`-hover`, `-active`) | `--color-accent-primary` (`-hover`, `-active`) |
| `bg-button-hover`, `bg-button-active` | `--button-background-color-hover`, `-active` |
| `border-button-hover`, `border-button-active` | `--button-border-color-hover`, `-active` |
| `border-error`, `outline-error` | `--border-color-error` |
| `text-input` | `--input-text-color` |
| `opacity-button-disabled` | `--button-opacity-disabled` |
| `border-input-disabled` | `--input-border-color-disabled` |
| `opacity-input-disabled` | `--input-opacity-disabled` |
| `focus-ring` (component class) | `--focus-outline`, `--focus-outline-offset`; add `outline-error` to recolor |

Where an Acorn component token aliases an existing utility, use that utility:
`--input-border-color` is `border-interactive`, `--input-border-radius` is `rounded-xl`,
`--button-border-radius` is `rounded-3xl`, `--focus-outline-color` is `accent-primary`.
BoxButton uses `rounded-full` (`--border-radius-circle`), a design decision.

`border` is Tailwind's width utility, so the default border color is `border-default`.
Don't use a `DEFAULT` key: preflight reads `borderColor.DEFAULT` for every element.

Watch for a swapped class competing with another class for the same property: Tailwind
orders utilities by name, so a semantic name can land before or after the class it used
to beat. A `dark:` class also outranks a responsive one (`tablet:text-white`); a single
semantic class doesn't.

**`nova:` variant.** `:root[data-theme="nova"] &` (`:root` so it outranks `dark:`, which
Tailwind emits later), for styling that differs only under the flag
(`w-6 nova:w-4`). For structural differences, branch on `config.featureFlags.novaDesignSystem`.

**`light-dark()` fallback.** Acorn's semantic tokens use `light-dark()`.
`@csstools/postcss-light-dark-function` in `fxa-settings/postcss.config.js` emits a plain
fallback for browsers without it, toggled by the `color-scheme` set in `nova-aliases.css`.

### Mapping cheat-sheet

Only the exact pairs below map; anything else is unmapped, so decide per case (see Gaps).

- Backgrounds: `bg-white dark:bg-grey-700` → `bg-box`; `bg-grey-10 dark:bg-grey-900` →
  `bg-canvas`; status fills `bg-red-100`/`bg-green-200`/`bg-orange-50`/`bg-blue-50` →
  `bg-critical`/`bg-success`/`bg-warning`/`bg-information`. Unmapped: `bg-grey-50`,
  `bg-grey-100`/`-200`/`-800` (dimmed, no token yet), scrims (`bg-overlay` not added yet).
- Text: `text-grey-900 dark:text-grey-10` → `text-default`; `text-grey-400 dark:text-grey-200`
  → `text-deemphasized`; disabled `text-grey-300 dark:text-grey-500` → `text-disabled`;
  `text-red-600` → `text-error`. Unmapped: other deemphasized pairs (`-500`/`-600` with
  `dark:text-grey-200`, `-400` with `dark:text-grey-300`), `text-red-700`.
- Borders: `border-grey-100 dark:border-grey-600` → `border-default`;
  `border-grey-200 dark:border-grey-600` → `border-interactive`. Unmapped: `border-grey-300`.
  Focus borders (`border-blue-400`/`-500`) aren't `border-interactive`: under Nova use
  `nova:border-accent-primary` / `nova:focus-ring` (as InputText does), and `outline-focus`
  for focus outlines.

### Gaps

Kept on primitives until design decides, unless noted.

- **Deemphasized text with other shades.** `text-grey-500 dark:text-grey-200` (InputPassword,
  LocaleToggle, DarkModeToggle, AlternativeAuthOptions, GetDataTrio, TermsPrivacyAgreement,
  ResetPasswordWarning, AppErrorDialog), `text-grey-600 dark:text-grey-200` (IconListItem
  variants, GetDataTrio) and `text-grey-400 dark:text-grey-300` (Footer, AppLayout,
  OAuthDataError, AppErrorDialog). `text-deemphasized` takes the most common pair repo-wide;
  collapsing the others onto it shifts their color.
- **Default text with another dark shade.** `text-grey-900 dark:text-grey-100` (InputText
  label, PromoQrMobile, AppErrorDialog), `text-grey-900 dark:text-white` (PromoQrMobile),
  `text-black dark:text-grey-10`/`-100` (DataBlock, DataBlockInline, promo banners).
- **No dark variant today.** Neutral colors without a `dark:` pair (Banner `text-grey-700`,
  PairUnsupportedHint, RecoveryKeySetupDownload, InputPhoneNumber borders, AlternativeAuthOptions
  dividers). A semantic token would change dark mode.
- **Status text.** Nova has no success/warning/info text color. Decision: text on Nova status
  backgrounds uses `nova:text-default`; flag-off keeps the primitive (Banner `text-grey-700`,
  FormChoice `text-blue-900`).
- **Text on fills.** No token for `text-white` on fills (Tooltip on `bg-grey-500`/`bg-red-600`).
- **Interactive states and fills.** Hover/active/disabled fills and borders (BoxButton,
  Banner close button, GetDataTrio, InputCheckboxBlue), toggle containers
  (`bg-grey-10 dark:bg-grey-600`), the blue-to-purple gradients and dimmed fills
  (`bg-grey-10 dark:bg-grey-800`). Acorn's `tokens.css` has no `--background-color-dimmed*`.
- **`bg-accent-primary`.** Acorn's value is `--color-accent-primary`, a `--color-*` name we
  can't redefine for flag-off, so it exists only as a `nova:`-only utility. Flag-off use needs
  an FxA-side name.
- **`bg-overlay`, `border-deemphasized`.** Acorn has the tokens; add each with the first usage,
  which sets its flag-off value.
- **InputText border.** `border-grey-200 dark:border-grey-600` matches `border-interactive`,
  but stays on primitives next to the error and focus borders, which have no flag-off token.
- **ButtonBack.** Its `dark:text-grey-200` beats the `tablet:text-*` prop colors in dark mode;
  one semantic class would not.
- **Intentional.** QR code backgrounds stay white in both themes (QRCode, PromoQrMobile) so
  they scan. ThirdPartyAuth's `forced-colors:` fills are for Windows high contrast.
- **`bg-grey-20`** (AppErrorDialog, LoadingSpinner) isn't in the palette, so it generates no
  CSS and the body color shows through.
- **Dark-mode tooltip and banner colors:** designer is reworking these; Tooltip keeps
  `bg-red-600`/`bg-grey-500` for now.
- **Primary CTA radius:** designer wants `--border-radius-circle` like BoxButton; apply in
  `ctas.css` together with the button height/padding follow-up where it becomes visible.
- **`grey-800`** is not in the palette; the 6 `bg/text-grey-800` uses are dead classes (InputText
  disabled dark bg among them), clean up in the surface tickets.
- **admin-panel components.** Footer, Header and AppErrorDialog stay on primitives (see above).

## Opacity

- Palette color with alpha: use the Tailwind `/NN` modifier (`bg-blue-500/40`). In CSS, write
  `color-mix(in srgb, var(--color-blue-500) 40%, transparent)`. Don't hardcode `rgb()`.
- Raw `rgba()` is only for black/white overlays that don't depend on the theme.
- Add a token only when a color+alpha pair recurs as a semantic role.

Known case: flag-off `--cta-disabled` in `fxa-react/styles/ctas.css` hardcodes Tailwind's
stock blue-500 (`rgb(59 130 246 / 0.4)`), not the palette's. Under the flag it uses
Acorn's disabled button token.

## Buttons and links

`fxa-react/styles/ctas.css` and `links.css` restyle the shared `cta-*` and `link-*`
classes under `[data-theme="nova"]` with Acorn's `--button-*` and `--link-*` tokens:
`cta-primary` → primary, `cta-caution` → destructive, `cta-neutral` → the default
(accent outline) button, `link-blue` and `link-grey` → `--link-color`. `link-dark-grey`
and `link-white` are unchanged. These files load only in Settings, so `legacy.css` needs
no values for them.

## Maintenance

Both files are hand-maintained and stable:

- `legacy.css` — today's palette values. Drops out when the flag is removed.
- `nova-aliases.css` — the grey→gray + hue shade pairing (**TODO(design): confirm**).
  Drops out when components adopt Acorn's own names (via a Tailwind preset).

Acorn's token values and their versioning come from the package — bump the
`acorn-web-components` dependency to pick up changes. There's no generator.

> Tokens only — we are **not** adopting Acorn's web/React components in phase 1.
