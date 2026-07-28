/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const plugin = require('tailwindcss/plugin');
const tailwindcssDir = require('tailwindcss-dir');

const screenSizes = {
  mobileLandscape: '480px',
  tablet: {
    raw: '(min-width: 768px) and (min-height: 481px)',
  },
  desktop: '1024px',
  desktopXl: '1441px',
};

// Colors resolve to CSS variables from the design-token layer
// (libs/shared/design-tokens → generated/nova-tokens.css, imported via
// fxa-react/styles/index.css). Values swap with the `novaDesignSystem` flag
// (data-theme="nova" on <html>) without touching this config.
//
// The function form keeps Tailwind opacity modifiers working on var() colors
// (e.g. `bg-blue-500/40`): without a modifier it emits a plain var(); with one
// it wraps in color-mix(). color-mix at 100% equals the color, so utilities
// without a modifier are visually identical to the previous hex values.
const cssVarColor =
  (varName) =>
  ({ opacityValue } = {}) => {
    // Plain var() for base utilities (and for Tailwind's --tw-*-opacity variable,
    // which the legacy `bg-opacity-*` syntax uses — unused in this repo) keeps the
    // widest browser support. Only an explicit opacity modifier (e.g. bg-blue-500/40)
    // needs color-mix, so the newer-CSS dependency is limited to those few sites.
    if (opacityValue === undefined || String(opacityValue).startsWith('var(--tw-')) {
      return `var(${varName})`;
    }
    return `color-mix(in srgb, var(${varName}) calc(${opacityValue} * 100%), transparent)`;
  };

const ramp = (hue, shades) =>
  Object.fromEntries(shades.map((s) => [s, cssVarColor(`--color-${hue}-${s}`)]));

const hueShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Primitive palette (names based on Mozilla Protocol, viewable at
// https://bit.ly/fxa-settings-colors). Kept as our existing scale — the Nova
// refresh repoints the underlying token values, not these class names.
const palette = {
  current: 'currentColor',
  transparent: 'transparent',
  black: cssVarColor('--color-black'),
  white: cssVarColor('--color-white'),
  grey: ramp('grey', [10, 50, 100, 200, 300, 400, 500, 600, 700, 900]),
  pink: ramp('pink', hueShades),
  red: ramp('red', hueShades),
  yellow: ramp('yellow', hueShades),
  orange: ramp('orange', hueShades),
  blue: ramp('blue', hueShades),
  green: ramp('green', hueShades),
  violet: ramp('violet', hueShades),
  purple: ramp('purple', hueShades),
};

module.exports = {
  // Enable class-based dark mode (toggle via 'dark' class on <html>)
  darkMode: 'class',
  // This targets a standard CRA setup, but can be overridden as needed
  content: ['./src/**/*.tsx', './public/index.html'],
  theme: {
    extend: {
      // Nova semantic color utilities (e.g. bg-box, text-deemphasized,
      // border-interactive). Added alongside the primitive palette; components
      // migrate onto these in the semantic-layer tickets.
      backgroundColor: {
        box: cssVarColor('--background-color-box'),
        canvas: cssVarColor('--background-color-canvas'),
        dimmed: cssVarColor('--background-color-dimmed'),
        'dimmed-further': cssVarColor('--background-color-dimmed-further'),
        overlay: cssVarColor('--background-color-overlay'),
        critical: cssVarColor('--background-color-critical'),
        information: cssVarColor('--background-color-information'),
        success: cssVarColor('--background-color-success'),
        warning: cssVarColor('--background-color-warning'),
      },
      textColor: {
        default: cssVarColor('--text-color'),
        deemphasized: cssVarColor('--text-color-deemphasized'),
        disabled: cssVarColor('--text-color-disabled'),
        error: cssVarColor('--text-color-error'),
      },
      borderColor: {
        default: cssVarColor('--border-color'),
        deemphasized: cssVarColor('--border-color-deemphasized'),
        interactive: cssVarColor('--border-color-interactive'),
        error: cssVarColor('--border-color-error'),
      },
      zIndex: {
        1000: '1000',
        9999: '9999',
      },
      padding: {
        18: '4.5rem',
        33: '8.5rem',
      },
      margin: {
        18: '4.5rem',
        19: '4.75rem',
      },
      flex: {
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        7: '7',
        '50%': '50%',
        '80px': '0 0 80px',
      },
      width: {
        18: '4.5rem',
        22: '5.5rem',
        120: '30rem',
        184: '46rem',
      },
      height: {
        22: '5.5rem',
      },
      minWidth: {
        sm: '27rem',
        12: '3rem',
        16: '4rem',
      },
      minHeight: {
        24: '6rem',
      },
      maxWidth: {
        mobileLandscape: '480px',
        tablet: '768px',
        desktop: '1024px',
        desktopXl: '1441px',
        32: '8rem',
        48: '12rem',
        64: '16rem',
        100: '25rem',
        120: '30rem',
      },
      inset: {
        50: '11.50rem',
        55: '13.75rem',
        ten: '10%',
      },
      boxShadow: {
        // Specific-use focus shadows for input elements
        'input-blue-focus': '0 0 0 1px #0090ED, 0 0 0 3px #C2D8F7',
        'input-grey-focus': '0 0 0 1px #6D6D6E, 0 0 0 3px #E7E7E7',
        'input-red-focus': '0 0 0 1px #C50042, 0 0 0 3px #FFBDC5',
        'tooltip-grey-drop': '0 0 4px rgba(32, 18, 58, 0.24)',
        'card-grey-drop': '0px 2px 14px rgba(58, 57, 68, 0.2)',
      },
      scale: {
        80: '0.8',
      },
      backgroundImage: {
        /* TODO: be able to reference images here, FXA-5745, this is a workaround/hack
         * This style lives `fxa-react` since it's used by content-server and Settings, but the
         * BG image is set in our package TW configs since image paths can't be shared. This will
         * always be overridden but other packages without this set that use fxa-react shared
         * styles can't build without this */
        'ff-logo': 'none',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0.01' },
          '100%': { opacity: '1' },
        },
        rotate: {
          '0%': { transform: 'rotate(0)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'delayed-fade-in': 'fade-in 1s linear 5s forwards',
        spin: 'rotate 0.8s linear infinite',
      },
      listStyleType: {
        circle: 'circle',
      },
      transitionDelay: {
        1200: '1200ms',
        1500: '1500ms',
      },
    },
    screens: screenSizes,
    // for the container-queries plugin
    // allows components to resize based on the size of their parent container
    // instead of the viewport
    containers: screenSizes,
    fontSize: {
      // These classes must be included here
      // To be picked up by fxa-settings' Typography design guide
      // Even if the settings are the same as Tailwind's defaults
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '22px',
      xxl: '28px',
      xxxl: '32px',
    },
    fontFamily: {
      body: [
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        '"Fira Sans"',
        '"Droid Sans"',
        '"Helvetica Neue"',
        'sans-serif',
      ],
      header: [
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        '"Fira Sans"',
        '"Droid Sans"',
        '"Helvetica Neue"',
        'sans-serif',
      ],
      mono: [
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    // Palette resolves to design-token CSS variables (see `palette` above).
    colors: palette,
  },
  plugins: [
    // this gives us the same classes as delay-* (for transition),
    // but for animation-delay-* instead
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('transitionDelay'),
        }
      );
    }),
    plugin(function ({ addUtilities }) {
      const customUtilities = {
        '.clip-auto': {
          clip: 'auto',
        },
      };

      addUtilities(customUtilities, ['responsive', 'hover', 'focus']);
    }),
    plugin(function ({ addComponents }) {
      const carets = {
        '.caret-top': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderBottom: '0.75rem solid #fff',
        },
        '.caret-top-default': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderBottom: '0.75rem solid #5e5e72',
        },
        '.caret-top-error': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderBottom: '0.75rem solid #E22850',
        },
        '.caret-bottom': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderBottom: '0.75rem solid #fff',
        },
        '.caret-bottom-default': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderTop: '0.75rem solid #5e5e72',
        },
        '.caret-bottom-error': {
          borderLeft: '0.75rem solid transparent',
          borderRight: '0.75rem solid transparent',
          borderTop: '0.75rem solid #E22850',
        },
      };
      addComponents(carets);
    }),
    tailwindcssDir(),
    require('@tailwindcss/container-queries'),
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.text-shadow-cms': {
          textShadow:
            '0px 0px 2px rgb(0 0 0 / .6), 0px 1px 2px rgb(0 0 0 / 0.3), 0px 3px 2px rgb(0 0 0 / 0.1)',
        },
      });
    }),
  ],
  // Workaround for TW's JIT engine, to provide access to all TW classes
  // for styling/debugging in browser DevTools (in dev mode only)
  ...(process.env.NODE_ENV === 'development' && {
    safelist: [{ pattern: /.*/ }],
  }),
};
