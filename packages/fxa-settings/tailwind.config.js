/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const { resolve } = require('path');
const extractImportedComponents = require('fxa-react/extract-imported-components');
const config = require('fxa-react/configs/tailwind');

if (process.env.NODE_ENV === 'production') {
  const matches = extractImportedComponents(
    resolve(__dirname, 'src', 'components')
  );

  config.content.push(...matches);
} else {
  config.content.push('../fxa-react/components/**/*.tsx');
}

if (process.env.STORYBOOK_BUILD === '1') {
  console.log('Including Storybook Design Guide paths...');
  config.content.push('./.storybook/design-guide/**/*.tsx');
}

config.content.push('./src/components/images/**/*.svg');

config.theme.extend = {
  ...config.theme.extend,
  backgroundImage: {
    ...config.theme.extend.backgroundImage,
    /* TODO: move this to `fxa-react`, FXA-5745 */
    'ff-logo': "url('../../libs/shared/assets/src/images/ff-logo.svg')",
    // Flag images are displayed as background-images in the country selection inputs.
    // This prevents the image from interfering with "type to search/select"
    'flag-usa': "inline('../components/Icons/icon_flag_usa.min.svg')",
    'flag-canada': "inline('../components/Icons/icon_flag_canada.min.svg')",
  },
  keyframes: {
    ...config.theme.extend.keyframes,
    sparkle: { '0%': { opacity: 0 }, '50%': { opacity: 1 } },
    'sparkle-lag-beginning': {
      '0%': { opacity: 1 },
      '30%': { opacity: 0.5 },
      '70%': { opacity: 0 },
    },
    'sparkle-lag-end': {
      '0%': { opacity: 1 },
      '40%': { opacity: 0.5 },
      '70%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
    'pulse-up': {
      '0%': { transform: 'translateY(0)' },
      '80%': { transform: 'translateY(0)' },
      '90%': { transform: 'translateY(-3%)' },
    },
    beat: {
      '0%': { transform: 'scale(1)' },
      '60%': { transform: 'scale(.8)' },
      '90%': { transform: 'scale(.9)' },
    },
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-.25rem)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(.25rem)' },
    },
    twinkle: {
      '0%, 100%': { transform: 'scale(0.9)', opacity: 0.2 },
      '50%': { transform: 'scale(1.1)', opacity: 1 },
    },
    'glide-right': {
      '0%': { transform: 'translateX(-70px)' },
      '100%': { transform: 'translateX(0px)' },
    },
    'appear-first': {
      '0%, 10%': { opacity: 0 },
      '20%, 90%': { opacity: 1 },
    },
    'appear-second': {
      '0%, 20%': { opacity: 0 },
      '30%, 100%': { opacity: 1 },
    },
    'appear-third': {
      '0%, 30%': { opacity: 0 },
      '40%, 100%': { opacity: 1 },
    },
    'appear-fourth': {
      '0%, 40%': { opacity: 0 },
      '50%, 100%': { opacity: 1 },
    },
    'draw-stroke': {
      '0%, 50%': { strokeDashoffset: 100, strokeDasharray: 100 },
      '60%, 100%': { strokeDashoffset: 0 },
    },
    'draw-stroke-and-fade-out': {
      '0%': {
        strokeDasharray: 100,
        strokeDashoffset: 100,
        opacity: 0,
      },
      '10%': {
        opacity: 1,
      },
      '50%': {
        strokeDasharray: 100,
        strokeDashoffset: 100,
      },
      '60%': {
        strokeDashoffset: 0,
      },
      '80%': {
        opacity: 1,
      },
      '100%': {
        opacity: 0,
        strokeDashoffset: 0,
      },
    },
    'pulse-stroke': {
      '0%, 100%': { 'stroke-dashoffset': 6, 'stroke-dasharray': 10 },
      '50%': { 'stroke-dashoffset': 0, 'stroke-dasharray': 10 },
    },
    'wait-and-appear': {
      '0%, 40%': { transform: 'scale(0)' },
      '60%, 100%': { transform: 'scale(1)' },
    },
    'wait-and-rotate': {
      '0%, 70%': { transform: 'rotate(0deg)' },
      '80%, 100%': { transform: 'rotate(360deg)' },
    },
    'fade-in': {
      '0%, 10%': {
        opacity: 0,
        transform: 'scale(0)',
      },
      '24%': {
        transform: 'scale(0.95)',
      },
      '25%': {
        opacity: 0.25,
      },
      '30%, 100%': {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
    },
    'spin-xl': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(720deg)',
      },
    },
    'fade-out-in': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.2,
      },
    },
    grow: {
      '0%': {
        transform: 'scale(.3)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
    'subtle-move': {
      '0%': {
        transform: 'translate(0px, 0px)',
      },
      '25%': {
        transform: 'translate(2px, -1px)',
      },
      '50%': {
        transform: 'translate(-2px, 1px)',
      },
      '75%': {
        transform: 'translate(2px, 1px)',
      },
      '100%': {
        transform: 'translate(0px, 0px)',
      },
    },
  },

  animation: {
    ...config.theme.extend.animation,
    sparkle: 'sparkle 2s ease-in-out infinite',
    'sparkle-delay': 'sparkle 2s ease-in-out .5s infinite',
    'sparkle-long-loop': 'sparkle 3s ease-in-out .3s infinite',
    'sparkle-lag-beginning': 'sparkle-lag-beginning 2.5s ease-in-out infinite',
    'sparkle-lag-end': 'sparkle-lag-end 1.5s ease-in-out infinite',
    'pulse-up': 'pulse-up 5s ease-in-out infinite',
    heart: 'beat 1.5s infinite',
    shake: 'shake 1s',
    'pulse-first': 'twinkle 2.5s infinite ease-in-out alternate',
    'pulse-second': 'twinkle 3s infinite ease-in-out alternate',
    'pulse-third': 'twinkle 3.5s infinite ease-in-out alternate',
    'draw-stroke': 'draw-stroke 5s ease-in forwards',
    'draw-stroke-repeat': 'draw-stroke-and-fade-out 5s ease-in infinite',
    'wait-and-appear': 'wait-and-appear 2s ease-out 1',
    'glide-right': 'glide-right 3s 1 ease-in-out',
    'appear-first': 'appear-first 3s ease-in-out ',
    'appear-second': 'appear-second 3s ease-in-out ',
    'appear-third': 'appear-third 3s ease-in-out ',
    'type-first-repeat': 'appear-first 5s ease-in-out infinite',
    'type-second-repeat': 'appear-second 5s ease-in-out infinite',
    'type-third-repeat': 'appear-third 5s ease-in-out infinite',
    'type-fourth-repeat': 'appear-fourth 5s ease-in-out infinite',
    'pulse-stroke': 'pulse-stroke 2s linear infinite',
    'wait-and-rotate': 'wait-and-rotate 5s infinite ease-out',
    'fade-in': 'fade-in 1s 1 ease-in',
    'spin-xl': 'spin-xl 1s forwards ease-in-out',
    'fade-out-in': 'fade-out-in 2s forwards',
    'grow-and-stay': 'grow 1s ease-in-out forwards',
    'pulse-twinkle-first':
      'sparkle 2s ease-in-out infinite, twinkle 2s infinite ease-in-out',
    'pulse-twinkle-second':
      'sparkle 1s ease-in-out infinite, twinkle 2.5s infinite ease-in-out',
    'pulse-twinkle-third':
      'sparkle 3s ease-in-out infinite, twinkle 3s infinite ease-in-out',
    'subtle-move': 'subtle-move ease-in-out infinite 5s',
  },
};

module.exports = config;
