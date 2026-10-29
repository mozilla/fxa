/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The hand-authored half of the Nova mapping. Everything else comes straight
 * from `acorn-web-components`'s published token map — see generate.mjs.
 *
 * Two things can't be auto-derived:
 *  1. Our Protocol-style palette (grey 10–900, hues 50–900) → Acorn's finer
 *     ramp (gray 0–110, hues 0–110). A shade-pairing decision. TODO(design).
 *  2. The flag-OFF value of each token, so the UI is pixel-identical to today
 *     until the flag flips. These mirror the current Tailwind palette.
 */

// Flag-OFF palette — mirrors packages/fxa-react/configs/tailwind.js (today).
export const LEGACY_PALETTE = {
  black: '#000',
  white: '#fff',
  grey: { 10: '#FAFAFB', 50: '#F0F0F4', 100: '#E7E7E7', 200: '#C2C2C2', 300: '#9E9E9E', 400: '#6D6D6E', 500: '#5E5E72', 600: '#32313C', 700: '#15141A', 900: '#0C0C0D' },
  pink: { 50: '#FFDEF0', 100: '#FFB4DB', 200: '#FF8AC5', 300: '#FF6BBA', 400: '#FF4AA2', 500: '#FF298A', 600: '#E31587', 700: '#C60084', 800: '#7F145B', 900: '#50134B' },
  red: { 50: '#FFDFE7', 100: '#FFBDC5', 200: '#FF9AA2', 300: '#FF848B', 400: '#FF6A75', 500: '#FF4F5E', 600: '#E22850', 700: '#C50042', 800: '#810220', 900: '#440306' },
  yellow: { 50: '#FFFFCC', 100: '#FFFF98', 200: '#FFEA80', 300: '#FFD567', 400: '#FFBD4F', 500: '#FFA436', 600: '#E27F2E', 700: '#C45A27', 800: '#A7341F', 900: '#960E18' },
  orange: { 50: '#FFF4DE', 100: '#FFD5B2', 200: '#FFB587', 300: '#FFA266', 400: '#FF8A50', 500: '#FF7139', 600: '#E25920', 700: '#CC3D00', 800: '#9E280B', 900: '#7C1504' },
  blue: { 50: '#AAF2FF', 100: '#80EBFF', 200: '#00DDFF', 300: '#00B3F4', 400: '#0090ED', 500: '#0060DF', 600: '#0250BB', 700: '#054096', 800: '#073072', 900: '#09204D' },
  green: { 50: '#E3FFF3', 100: '#D1FFEE', 200: '#B3FFE3', 300: '#88FFD1', 400: '#54FFBD', 500: '#3FE1B0', 600: '#3AD5B3', 700: '#1CC5A0', 800: '#00A49A', 900: '#00736C' },
  violet: { 50: '#F7E2FF', 100: '#F6B8FF', 200: '#F68FFF', 300: '#F770FF', 400: '#D74CF0', 500: '#B833E1', 600: '#952BB9', 700: '#722291', 800: '#4E1A69', 900: '#2B1141' },
  purple: { 50: '#E7DFFF', 100: '#D9BFFF', 200: '#CB9EFF', 300: '#C689FF', 400: '#AB71FF', 500: '#9059FF', 600: '#7542E5', 700: '#592ACB', 800: '#45278D', 900: '#321C64' },
};

// grey 10–900 → Acorn gray 0–110, by nearest lightness. TODO(design): confirm.
const GREY_TO_GRAY = { 10: '05', 50: '10', 100: '15', 200: '25', 300: '40', 400: '50', 500: '55', 600: '65', 700: '100', 900: '90' };
// hues 50–900 → Acorn same-hue 0–90, positional. TODO(design): confirm per hue.
const HUE_TO_ACORN = { 50: '0', 100: '10', 200: '20', 300: '30', 400: '40', 500: '50', 600: '60', 700: '70', 800: '80', 900: '90' };
const HUES = ['pink', 'red', 'yellow', 'orange', 'blue', 'green', 'violet', 'purple'];

/** Our palette var name → the Acorn var it aliases under the flag. */
export function primitiveAliases() {
  const out = {
    '--color-black': 'var(--color-black)',
    '--color-white': 'var(--color-white)',
  };
  for (const [ours, acorn] of Object.entries(GREY_TO_GRAY)) {
    out[`--color-grey-${ours}`] = `var(--color-gray-${acorn})`;
  }
  for (const hue of HUES) {
    for (const [ours, acorn] of Object.entries(HUE_TO_ACORN)) {
      out[`--color-${hue}-${ours}`] = `var(--color-${hue}-${acorn})`;
    }
  }
  return out;
}

// Flag-OFF values for the Nova semantic tokens we surface as utilities, so
// bg-box / text-deemphasized / … render today's look until the flag flips.
// (Acorn's own values apply when the flag is on — see generate.mjs.)
export const LEGACY_SEMANTICS = {
  '--background-color-box': '#fff',
  '--background-color-canvas': '#FAFAFB',
  '--background-color-critical': '#FFDFE7',
  '--background-color-information': '#AAF2FF',
  '--background-color-success': '#B3FFE3',
  '--background-color-warning': '#FFF4DE',
  '--text-color': '#0C0C0D',
  '--text-color-deemphasized': '#5E5E72',
  '--text-color-error': '#C50042',
  '--border-color': '#C2C2C2',
  '--border-color-interactive': '#0060DF',
  '--border-color-error': '#E22850',
  '--color-accent-primary': '#0060DF',
};
