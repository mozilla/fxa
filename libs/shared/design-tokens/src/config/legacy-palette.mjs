/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * FxA's CURRENT color palette, mirrored from `packages/fxa-react/configs/tailwind.js`.
 *
 * This seeds the LEGACY (flag-off) block of nova-tokens.css so that, with the Nova
 * flag disabled, every `var(--color-*)` the Tailwind config now references resolves to
 * exactly today's hex — i.e. zero visual change.
 *
 * KEEP IN SYNC with the Tailwind palette until ticket "Remove Nova flag + legacy tokens"
 * deletes the legacy block. (Single-sourcing this back into the Tailwind config is a
 * possible follow-up, but keeping it explicit here keeps the generator self-contained.)
 */
export const LEGACY_PALETTE = {
  black: '#000',
  white: '#fff',
  grey: {
    10: '#FAFAFB',
    50: '#F0F0F4',
    100: '#E7E7E7',
    200: '#C2C2C2',
    300: '#9E9E9E',
    400: '#6D6D6E',
    500: '#5E5E72',
    600: '#32313C',
    700: '#15141A',
    900: '#0C0C0D',
  },
  red: {
    50: '#FFDFE7', 100: '#FFBDC5', 200: '#FF9AA2', 300: '#FF848B', 400: '#FF6A75',
    500: '#FF4F5E', 600: '#E22850', 700: '#C50042', 800: '#810220', 900: '#440306',
  },
  orange: {
    50: '#FFF4DE', 100: '#FFD5B2', 200: '#FFB587', 300: '#FFA266', 400: '#FF8A50',
    500: '#FF7139', 600: '#E25920', 700: '#CC3D00', 800: '#9E280B', 900: '#7C1504',
  },
  yellow: {
    50: '#FFFFCC', 100: '#FFFF98', 200: '#FFEA80', 300: '#FFD567', 400: '#FFBD4F',
    500: '#FFA436', 600: '#E27F2E', 700: '#C45A27', 800: '#A7341F', 900: '#960E18',
  },
  green: {
    50: '#E3FFF3', 100: '#D1FFEE', 200: '#B3FFE3', 300: '#88FFD1', 400: '#54FFBD',
    500: '#3FE1B0', 600: '#3AD5B3', 700: '#1CC5A0', 800: '#00A49A', 900: '#00736C',
  },
  blue: {
    50: '#AAF2FF', 100: '#80EBFF', 200: '#00DDFF', 300: '#00B3F4', 400: '#0090ED',
    500: '#0060DF', 600: '#0250BB', 700: '#054096', 800: '#073072', 900: '#09204D',
  },
  violet: {
    50: '#F7E2FF', 100: '#F6B8FF', 200: '#F68FFF', 300: '#F770FF', 400: '#D74CF0',
    500: '#B833E1', 600: '#952BB9', 700: '#722291', 800: '#4E1A69', 900: '#2B1141',
  },
  purple: {
    50: '#E7DFFF', 100: '#D9BFFF', 200: '#CB9EFF', 300: '#C689FF', 400: '#AB71FF',
    500: '#9059FF', 600: '#7542E5', 700: '#592ACB', 800: '#45278D', 900: '#321C64',
  },
  pink: {
    50: '#FFDEF0', 100: '#FFB4DB', 200: '#FF8AC5', 300: '#FF6BBA', 400: '#FF4AA2',
    500: '#FF298A', 600: '#E31587', 700: '#C60084', 800: '#7F145B', 900: '#50134B',
  },
};

/** Flatten to CSS var names: { '--color-grey-500': '#5E5E72', '--color-white': '#fff', ... } */
export function legacyPrimitiveVars() {
  const out = {};
  for (const [name, val] of Object.entries(LEGACY_PALETTE)) {
    if (typeof val === 'string') {
      out[`--color-${name}`] = val;
    } else {
      for (const [shade, hex] of Object.entries(val)) {
        out[`--color-${name}-${shade}`] = hex;
      }
    }
  }
  return out;
}
