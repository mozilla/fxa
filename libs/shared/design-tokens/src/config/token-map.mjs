/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Hand-authored inputs the generator can't derive automatically.
 *
 * FIRST PASS — the primitive mapping and the legacy semantic seed encode design
 * decisions (which Nova gray equals our grey-500, what "box background" means today).
 * Values marked `TODO(design)` need a designer's sign-off. The accent is Nova violet
 * per decision on FXA-14255.
 */

/**
 * Nova semantic tokens we surface as Tailwind utilities (see FXA-14254 config block).
 * The generator resolves each from the vendored Nova CSS (nova-override ?? base) and
 * emits it in the Nova block. Anything not found in the source is logged, not emitted.
 */
export const SEMANTIC_ALLOWLIST = [
  // background-color-* (→ bg-box, bg-canvas, …)
  '--background-color-box',
  '--background-color-canvas',
  '--background-color-dimmed',
  '--background-color-dimmed-further',
  '--background-color-overlay',
  '--background-color-critical',
  '--background-color-information',
  '--background-color-success',
  '--background-color-warning',
  // text-color-* (→ text-default via DEFAULT, text-deemphasized, …)
  '--text-color',
  '--text-color-deemphasized',
  '--text-color-disabled',
  '--text-color-error',
  // border-color-* (→ border, border-interactive, …)
  '--border-color',
  '--border-color-deemphasized',
  '--border-color-interactive',
  '--border-color-error',
  // accent (→ bg-accent-primary / text-accent-primary)
  '--color-accent-primary',
  '--color-accent-primary-hover',
  '--color-accent-primary-active',
  '--color-accent-attention',
  // non-color scales — Tailwind keeps its native scale NAMES; only values repoint
  '--border-radius-xsmall',
  '--border-radius-small',
  '--border-radius-medium',
  '--border-radius-large',
  '--border-radius-circle',
  '--space-xxsmall',
  '--space-xsmall',
  '--space-small',
  '--space-medium',
  '--space-large',
  '--space-xlarge',
  '--space-xxlarge',
  '--box-shadow-level-1',
  '--box-shadow-level-2',
  '--box-shadow-level-3',
  '--box-shadow-level-4',
  '--font-weight',
  '--font-weight-semibold',
  '--font-weight-bold',
  '--font-weight-heading',
];

/**
 * Under the Nova flag, FxA's Protocol-scale primitives (grey 10–900, used by existing
 * `bg-grey-500` etc.) alias onto Nova's gray 0–110 ramp so legacy utilities pick up Nova
 * neutrals without touching components. TODO(design): confirm the shade pairing.
 * Non-neutral ramps (blue/red/green/…) are intentionally NOT remapped yet — accent flows
 * through the semantic `--color-accent-*` tokens; per-hue mapping is a follow-up.
 */
export const PRIMITIVE_ALIASES_NOVA = {
  '--color-grey-10': 'var(--color-gray-05)',
  '--color-grey-50': 'var(--color-gray-10)',
  '--color-grey-100': 'var(--color-gray-20)',
  '--color-grey-200': 'var(--color-gray-30)',
  '--color-grey-300': 'var(--color-gray-50)',
  '--color-grey-400': 'var(--color-gray-60)',
  '--color-grey-500': 'var(--color-gray-70)',
  '--color-grey-600': 'var(--color-gray-80)',
  '--color-grey-700': 'var(--color-gray-90)',
  '--color-grey-900': 'var(--color-gray-100)',
};

/**
 * LEGACY (flag-off) values for the semantic tokens, chosen to reproduce today's look.
 * `dark` is optional; omit it when the value is the same in light and dark.
 * Values reference the legacy primitives seeded from LEGACY_PALETTE.
 * FIRST PASS — representative; complete the remaining allowlist entries with design.
 */
export const LEGACY_SEMANTICS = {
  // backgrounds
  '--background-color-box': { light: 'var(--color-white)', dark: 'var(--color-grey-700)' },
  '--background-color-canvas': { light: 'var(--color-grey-10)', dark: 'var(--color-grey-900)' },
  '--background-color-dimmed': { light: 'var(--color-grey-100)', dark: 'var(--color-grey-600)' },
  '--background-color-dimmed-further': { light: 'var(--color-grey-200)', dark: 'var(--color-grey-500)' },
  '--background-color-overlay': { light: 'rgba(0,0,0,0.5)' },
  '--background-color-critical': { light: 'var(--color-red-50)', dark: 'var(--color-red-900)' },
  '--background-color-information': { light: 'var(--color-blue-50)', dark: 'var(--color-blue-900)' },
  '--background-color-success': { light: 'var(--color-green-200)', dark: 'var(--color-green-900)' },
  '--background-color-warning': { light: 'var(--color-orange-50)', dark: 'var(--color-orange-900)' },
  // text
  '--text-color': { light: 'var(--color-grey-900)', dark: 'var(--color-grey-10)' },
  '--text-color-deemphasized': { light: 'var(--color-grey-500)', dark: 'var(--color-grey-200)' },
  '--text-color-disabled': { light: 'var(--color-grey-300)' },
  '--text-color-error': { light: 'var(--color-red-700)', dark: 'var(--color-red-400)' },
  // borders
  '--border-color': { light: 'var(--color-grey-200)', dark: 'var(--color-grey-600)' },
  '--border-color-deemphasized': { light: 'var(--color-grey-100)', dark: 'var(--color-grey-600)' },
  '--border-color-interactive': { light: 'var(--color-blue-500)', dark: 'var(--color-blue-400)' },
  '--border-color-error': { light: 'var(--color-red-600)', dark: 'var(--color-red-400)' },
  // accent (today = Firefox blue; Nova flips this to violet)
  '--color-accent-primary': { light: 'var(--color-blue-500)', dark: 'var(--color-blue-400)' },
  '--color-accent-primary-hover': { light: 'var(--color-blue-600)', dark: 'var(--color-blue-300)' },
  '--color-accent-primary-active': { light: 'var(--color-blue-700)', dark: 'var(--color-blue-200)' },
  '--color-accent-attention': { light: 'var(--color-green-500)', dark: 'var(--color-green-400)' },
  // radius (current Tailwind borderRadius values)
  '--border-radius-xsmall': { light: '2px' },
  '--border-radius-small': { light: '0.125rem' },
  '--border-radius-medium': { light: '0.375rem' },
  '--border-radius-large': { light: '0.5rem' },
  '--border-radius-circle': { light: '9999px' },
  // TODO(design): seed remaining --space-*, --box-shadow-level-*, --font-weight-* legacy
  // values from the current Tailwind spacing/boxShadow/fontWeight scales.
};
