/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const { resolve } = require('path');
const extractImportedComponents = require('fxa-react/extract-imported-components');
const config = require('fxa-react/configs/tailwind');

if (process.env.NODE_ENV === 'production') {
  const matches = extractImportedComponents(resolve(__dirname, 'app'));

  config.content.push(...matches);
} else {
  config.content.push('../../../packages/fxa-react/components/**/*.tsx');
}

if (process.env.STORYBOOK_BUILD === '1') {
  console.log('Including Storybook Design Guide paths...');
  // TODO for accounts-next
  // config.content.push('./.storybook/design-guide/**/*.tsx');
}

// TODO for accounts-next
// config.content.push('./src/components/images/**/*.svg');

config.theme.extend = {
  ...config.theme.extend,
  backgroundImage: {
    ...config.theme.extend.backgroundImage,
    /* TODO: move this to `fxa-react`, FXA-5745 */
    //
    // TODO for accounts-next
    // 'ff-logo': "url('../../../libs/shared/assets/src/images/ff-logo.svg')",
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
  },
};

module.exports = config;
