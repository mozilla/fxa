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
| `border-deemphasized` | `--border-color-deemphasized` |
| `bg-deemphasized` (divider and track fills) | `--border-color-deemphasized` |
| `text-icon-critical`, `-information`, `-success`, `-warning` | `--icon-color-*` (status icons) |
| `text-link-hover` | `--link-color-hover` |
| `opacity-input-disabled` | `--input-opacity-disabled` |
| `focus-ring` (component class) | `--focus-outline`, `--focus-outline-offset`; add `outline-error` to recolor |

Under Nova, the progress bar fill, `.input-radio` borders and `focus-visible-default` use
the accent (`bg-accent-primary`, `--color-accent-primary`, `--border-color-selected`,
`--focus-outline-color`). `--border-color-deemphasized` mixes `currentColor`, so the
progress element sets `nova:text-default` to keep its track neutral.

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

- **Deemphasized text with other shades.** `text-grey-500 dark:text-grey-200`,
  `text-grey-600 dark:text-grey-200` and `text-grey-400 dark:text-grey-300` don't match
  `text-deemphasized` flag-off. Under Nova they collapse onto it (`nova:text-deemphasized`) in
  InputPassword, LocaleToggle, DarkModeToggle, GetDataTrio's close button, ResetPasswordWarning,
  IconListItem and OAuthDataError. Remaining: GetDataTrio's action buttons (their blue hover
  would be lost; design call with the gradients), Footer and AppErrorDialog (admin-panel).
- **Default text with another dark shade.** `text-grey-900 dark:text-grey-100`/`dark:text-white`
  and `text-black dark:text-grey-10` collapse onto `nova:text-default` in the InputText label,
  PromoQrMobile, DataBlock and DataBlockInline. Remaining: AppErrorDialog (admin-panel) and the
  promo banners.
- **No dark variant today.** A semantic token would change flag-off dark mode, so these use
  `nova:` only: PairUnsupportedHint (`border-default`, `bg-box`), RecoveryKeySetupDownload
  (`border-default`), InputPhoneNumber (`border-interactive`). Banner `text-grey-700` is covered
  by the status-text decision below.
- **Status text.** Nova has no success/warning/info text color. Decision: text on Nova status
  backgrounds uses `nova:text-default`; flag-off keeps the primitive (Banner `text-grey-700`,
  FormChoice `text-blue-900`).
- **Text on fills.** No token for `text-white` on fills (Tooltip on `bg-grey-500`/`bg-red-600`).
- **Interactive states and fills.** Under Nova, the LocaleToggle and DarkModeToggle containers
  (`bg-grey-10 dark:bg-grey-600`) use `bg-canvas`, and GetDataTrio's close button uses
  `bg-button-hover`/`-active`, as does the Banner close button now that the Nova banner body
  is neutral. Remaining: InputCheckboxBlue, the blue-to-purple gradients and dimmed fills
  (`bg-grey-10 dark:bg-grey-800`). Acorn's `tokens.css` has no `--background-color-dimmed*`.
- **`bg-accent-primary`.** Acorn's value is `--color-accent-primary`, a `--color-*` name we
  can't redefine for flag-off, so it exists only as a `nova:`-only utility. Flag-off use needs
  an FxA-side name.
- **ButtonBack.** Its `dark:text-grey-200` beats the `tablet:text-*` prop colors in dark mode;
  one semantic class would not.
- **Intentional.** QR code backgrounds stay white in both themes (QRCode, PromoQrMobile) so
  they scan. ThirdPartyAuth's `forced-colors:` fills are for Windows high contrast.
- **`bg-grey-20`** (remaining: AppErrorDialog) isn't in the palette, so it generates no
  CSS and the body color shows through.
- **Dark-mode tooltip colors:** designer is reworking these; Tooltip keeps
  `bg-red-600`/`bg-grey-500` for now.
- **Button radius:** CTAs and BoxButton use `--border-radius-circle` (design decision). Switch
  to a button-specific Acorn size (`xxlarge`) if Acorn adds one.
- **`grey-800`** is not in the palette; its uses are dead classes (remaining: InputText
  disabled dark bg, AppErrorDialog).
- **admin-panel components.** Footer, Header and AppErrorDialog stay on primitives (see above).

#### Auth pages (`fxa-settings/src/pages`, AppLayout, AlternativeAuthOptions, TermsPrivacyAgreement)

- **Collapsed under `nova:` only** (flag-off unchanged):
  - `text-deemphasized` for `text-grey-400`/`-500` with no dark variant (Index,
    ResetPassword, SigninBounced, SigninTokenCode, SigninPasswordlessCode,
    SigninPasskeyFallback, ConfirmSignupCode, Permissions, Pair/Index, Pair/Success), for
    `text-grey-400 dark:text-grey-300` (AppLayout footer) and for `text-grey-500
    dark:text-grey-200` (AlternativeAuthOptions "or").
  - `text-disabled` for `disabled:text-grey-500 dark:disabled:text-grey-300`
    (InlinePasswordlessSyncSetup).
  - `border-default text-default` for `border-grey-100 text-grey-900 dark:border-grey-500
    dark:text-grey-300` (Pair2 ApproveSignIn ×2, ConnectThisDevice).
  - `bg-warning` for `bg-orange-50 dark:bg-orange-900/30` (Pair/Unsupported).
  - `bg-box` for the split layout panel (`desktop:bg-white`, no working dark value).
  - AppLayout root goes transparent so the body's `bg-canvas` shows, except with
    `whiteBackground` or a CMS background.
- **Per Figma:** TermsPrivacyAgreement text is `text-default`. The AlternativeAuthOptions
  divider lines become a `border-deemphasized` top border and the "or" label is regular weight.
- **Message bar (Banner, ResetPasswordWarning):** under Nova the body is `bg-box` with a
  `border-deemphasized` 12px-radius border and the status tint moves to a start-edge strip
  (a `::before`, so the markup is unchanged); the icon sits in the strip and text is
  start-aligned. Status icons use `text-icon-*`. The fancy info variant is a plain info bar
  under Nova: no gradient, and its baked-in blue icon is swapped for the currentColor one.
  Remaining (icons are on hold): Banner's status icons are 24px against Figma's 16px, and
  ResetPasswordWarning's warning icon has a hardcoded fill, so it keeps its orange.
- **Choice cards (`.input-radio`):** resting 1px `border-interactive` on a transparent fill,
  hover `--button-background-color-hover` with the same border, checked
  `--button-background-color-selected` with a 2px `--border-color-selected` border (no
  gradient), 12px radius, Nova focus outline instead of the blue shadow. The input is an
  absolute overlay, so the width change doesn't shift layout. No check mark: design chose
  the border and fill alone as the selected cue.
- **Gradients:** Nova has none. DataBlock and DataBlockInline use `bg-information` under Nova;
  GetDataTrio's hover/active/focus fills use `bg-button-hover`/`-active`.
- **Card surface:** `.card` uses `bg-box` and `--box-shadow-level-2` from `mobileLandscape` up.
  Its `dark:bg-grey-700` maps to Acorn's near-black gray-100 under the flag, darker than the
  page; Figma's dark card (#252428) is `bg-box`.
- **Progress bar:** track `bg-deemphasized`, fill accent.
- **Weights:** headings that used `font-bold` use `font-heading` (semibold under Nova, bold
  off). Under Nova, `cta-xl` buttons are semibold (`--button-font-weight`) and BoxButton
  labels are `nova:font-semibold`. BoxButton's border is `nova:border-deemphasized` (Figma's
  lighter grey), with the accent hover/active border kept.
- **Spinners:** LoadingSpinner's blue SVG (baked-in fills) is recolored to the accent by a
  Nova rule on `.loading-spinner-blue`; BoxButton's loading arrow is `nova:text-accent-primary`.
- **Focus and links:** InputPhoneNumber's select uses InputText's Nova focus
  (`border-accent-primary`, `focus-ring`); BrandMessaging's and GetDataTrio's link-like hovers
  are `text-link-hover`. CmsButtonWithFallback's gradient buttons set a blue focus outline
  inline, so a Nova rule recolors it to `--focus-outline-color`.
- **Reduced motion:** under Nova, `prefers-reduced-motion` collapses transitions and animations,
  matching Acorn.
- **Transitions:** `transition-standard` is 200ms under Nova (150ms flag-off); our value, Acorn
  has no motion token.
- **RecoveryKeySetupDownload:** the key box is a 1px `border-deemphasized` with the 12px input
  radius under Nova.
- **ButtonBack:** `nova:rounded-full`, so its hover/focus shape is a circle. Follow-up: move
  the back arrow inside the card, as Figma shows.
- **Dead classes removed:** LoadingSpinner `bg-grey-20`, AppLayout `desktop:dark:bg-grey-800`.
  Flag-off dark mode shows the split layout panel white, as before; that pre-existing bug is
  out of scope here.
- **Left on primitives:**
  - Design input: AccountRecoveryConfirmKey hint box (`bg-grey-50` in both themes; no
    dimmed token, and deemphasized text on it would fail contrast in dark), the
    `whiteBackground` AppLayout root (white light / grey-900 dark has no token), Pair2
    ScanQR link (`hover:text-grey-700`, no dark), FirefoxWordmark `text-black
    dark:text-white` (illustration, on hold).
  - `link-*` classes and `dark:invert` on the Mozilla logo are unchanged.
- **No Figma frame:** every page except Index, Signin, Signup, SigninRecoveryChoice,
  ResetPassword and ConfirmResetPassword. Those got the mechanical swap only.
#### Settings

Covers `components/Settings` and the Settings-only `styles/{switch,unit-row,drop-down-menu}.css`.
Figma: Settings above the fold (light `3119:3089`, dark `3121:2191`), Navigation (Nova)
`3310:3111`, AlertBar `2421:71` and the component map (`3107:30`). Sections already sit
as rounded cards with `shadow` (Acorn level 2 under the flag) and inset dividers.

New `nova:`-only utilities: `text-accent-primary` (Checkbox check), `bg-overlay`
(`--background-color-overlay`, Modal scrim; Acorn's 50% black replaces today's 75%),
`bg-nav-hover`/`-active`/`-selected` and `text-nav-selected` (`--page-nav-button-*`),
`border-deemphasized` (`--border-color-deemphasized`), `border-divider` (currentColor at 12%, no
Acorn token; see below), `text-icon-warning`/`-success`/`-critical`/
`-information` and `bg-icon-success`/`-critical` (`--icon-color-*`), `bg-hover-tint` (currentColor at
8%; tints toward the text color on hover, no Acorn token).

- **Nav:** under `nova:`, items are full-width page-nav pills (12px padding, 4px gaps) and the
  selected item (`.nav-active`) is a filled accent pill, semibold. Acorn's selected tokens are
  the solid accent with white text (dark: light violet, dark text), matching Figma; the tinted
  values apply only in forced-colors mode. The primary/secondary separator is a
  `border-deemphasized` rule (Acorn's `--page-nav-hr-background-color`). Secondary items drop
  to regular weight; their external-link icon keeps today's size and place, 8px after the label.
- **Headings** use `font-heading` (700 flag-off, semibold under the flag); bold emphasis in body
  text stays `font-bold`.
- **Delete account** keeps `py-2` at `mobileLandscape` under the flag (about 38px tall); its weight
  comes from `--button-font-weight` (semibold).
- **Dividers** (`unit-row-hr`, Connected Services rule, ProductPromo, Service scope rows, SubRow) use
  `nova:border-divider`, currentColor at 12%. Both `--border-color` and
  `--border-color-deemphasized` (24%) are darker than Figma's divider (`#e7e7e7`). The Nav
  separator and avatar menu rule keep `border-deemphasized`.
- **Device and linked-account rows:** 1px `border-deemphasized` box, 12px radius, 16px padding,
  transparent fill, 8px between rows; a 40px `bg-canvas` icon tile, then name, meta and a 32px
  `cta-neutral` pill, 16px apart.
- **Cards** (sections, FlowContainer, PagePasskeyAdd, promos and banners) use `--card-border-radius`
  (`rounded-2xl`) and `--card-box-shadow` (`shadow`) at every width; sub-rows inside them use
  `rounded-xl`. Below `tablet` they get 16px side margins, as in Figma mobile; flow cards re-center once they fit. Full-width UnitRow CTAs are about 40px tall below the row's `mobileLandscape` width.
- **UnitRow** content keeps 16px from the actions column (Switch rows).
- **Promos:** the sidebar ProductPromo and the FirefoxPromo/Promotion banners use `bg-box` with no
  border instead of the gradient (the violet promo tint failed AA for links).
  Figma's promo text block uses canvas; on the Settings page that equals the page color, so
  promos use box. Banner close buttons get a circular `bg-hover-tint` hover and the Nova focus ring.
- **Hover fills** on ButtonIcon, HeaderLockup, BentoMenu and PageAvatar edit buttons use
  `bg-hover-tint`; hover/focus color changes carry `transition-colors`.
- **AlertBar:** status-tinted pill: 12px radius, `shadow` (level 2), 40px min height, centered
  semibold `text-default`, 32px circular close button with a 16px icon and a `bg-hover-tint` hover/focus fill.
- **ButtonIcon** hover/focus fill is a circle (`nova:rounded-full`).
- **Status/brand colors:** UnitRowSecondaryEmail "unconfirmed" → `text-icon-warning`, SecurityEvent
  dot → `bg-icon-success`, PageAvatar capture button → `bg-icon-critical` (its hover/active
  borders no longer change under Nova).
- **Gradients removed:** SubRow info message → `bg-information`; DropDownAvatarMenu rule →
  `border-deemphasized`.

`nova:` collapses of non-table pairs (flag-off unchanged):

- `text-deemphasized`: `text-grey-500 dark:text-grey-200` (ButtonIcon, ModalMfaProtected,
  PageAvatar buttons), `text-grey-600 dark:text-grey-200` (ConnectedServices/Service),
  `text-grey-500` (Switch off label).
- `text-default`: `text-violet-900 dark:text-grey-100` (HeaderLockup, BentoMenu icons),
  `text-black dark:text-grey-100` (BentoMenu, drop-down-menu), `text-grey-700 dark:text-grey-100`
  (Service icon), `text-grey-600 dark:text-grey-300` (ProductPromo body, which is default-colored
  in Figma), `text-black dark:text-white` (ProductPromo logo), `text-grey-700` (AlertBar).
- `border-interactive`: `border-grey-200 dark:border-grey-500` (Switch off),
  `border-grey-400 dark:border-grey-200` (Checkbox unchecked).
- Accent: Switch on fill, Checkbox checked, PageAvatar zoom slider thumb (`bg-blue-500`).
- `focus-ring`: Checkbox `shadow-input-blue-focus`/`-grey-focus`.
- Light-only neutrals: `bg-grey-10` → `bg-canvas` (FlowSetup2faComplete), `text-grey-300` →
  `text-disabled` (PageSecondaryEmailVerify, ButtonIcon disabled), `bg-white` → `bg-box` (ContentSkip), `text-grey-500` → `text-deemphasized`
  (SubRow chevron, hover `text-default`).
- Mobile Sidebar panel `bg-white dark:bg-grey-900` → `bg-canvas`: best match pending design.

Asks for Acorn:

- A divider token lighter than `--border-color-deemphasized`.
- An `xxlarge` button radius.
- A semantic promo tint.
- A hover-darkening token.

Left on primitives:

- Dimmed fills: Switch off track (`bg-grey-50 dark:bg-grey-600`), SubRow borderless
  (`bg-grey-10 dark:bg-grey-700`). Service scope rows go transparent under the flag.
- ProgressBar track `bg-grey-100` (no dark today): dimmed fill, no token.
- Brand colors with no Nova token: DropDownAvatarMenu purple hover border, SubRow
  `text-purple-600` passkey icon, FlowSetup2faApp QR frame.
- Text on fills: Switch on label `text-grey-50`, PageAvatar `text-white`.
- `progress` (`src/styles/tailwind.css`) and `focus-visible-default` are handled with the auth
  pages; Nav's selected state is styled in the Nav component. Inline `outline-blue-500` in Settings uses `outline-focus`.
- Avatar `bg-white` is intentional (no Nova equal).
- Dead classes removed: ButtonIcon `active:/focus:text-grey-800`, PageAvatar `bg-grey-20`.

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
and `link-white` are unchanged. CTAs use the circle radius. `cta-xl` takes
`--space-large` block padding (58px tall, near Figma's 56px; Acorn's large button is 40px).
`cta-base-p` takes `--button-padding-block-large` (42px tall with `text-base` against
Figma's 40px; there is no 7px token). These files load only in Settings, so `legacy.css` needs
no values for them.

## Maintenance

Both files are hand-maintained and stable:

- `legacy.css` — today's palette values. Drops out when the flag is removed.
- `nova-aliases.css` — the grey→gray + hue shade pairing (**TODO(design): confirm**).
  Drops out when components adopt Acorn's own names (via a Tailwind preset).

Acorn's token values and their versioning come from the package — bump the
`acorn-web-components` dependency to pick up changes. There's no generator.

> Tokens only — we are **not** adopting Acorn's web/React components in phase 1.
