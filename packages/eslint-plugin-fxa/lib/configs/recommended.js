/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    es6: true, // enable all ECMAScript 6 features except for modules
    node: true // Node.js global variables and Node.js-specific rules
  },
  rules: {
    'camelcase': 0,
    'comma-dangle': 0,
    'comma-style': [2, 'last'],
    'consistent-return': 0,
    'curly': [2, 'all'],
    'dot-notation': 0,
    'eol-last': 2,
    'eqeqeq': [2, 'allow-null'],
    'global-strict': 0,
    'handle-callback-err': 1,
    'indent': [2, 2, { 'SwitchCase': 1 }],
    'key-spacing': 0,
    'keyword-spacing': 2,
    'new-cap': 0,
    'no-cond-assign': [2, 'except-parens'],
    'no-debugger': 2,
    'no-empty': 0,
    'no-eval': 2,
    'fxa/no-exclusive-tests': 2,
    'no-irregular-whitespace': 2,
    'no-loop-func': 0,
    'no-multi-spaces': 0,
    'no-multiple-empty-lines': [2, {'max': 2}],
    'no-new': 2,
    'no-process-exit': 0,
    'no-script-url': 2,
    'no-sequences': 2,
    'no-shadow': 0,
    'no-spaced-func': 0,
    'no-trailing-spaces': 2,
    'no-undef': 2,
    'no-underscore-dangle': 0,
    'no-unused-vars': [2, {'vars': 'all', 'args': 'none'}],
    'no-use-before-define': [2, 'nofunc'],
    'no-with': 2,
    'prefer-const': [2, {'destructuring': 'any', 'ignoreReadBeforeAssign': false}],
    'quotes': [2, 'single', 'avoid-escape'],
    'semi': [2, 'always'],
    'space-unary-ops': [2, {'words': false, overrides : {'!': true, '!!': true}}],
    'strict': 0,
    'valid-typeof': 2,
    'wrap-iife': 0,
    'yoda': 0
  }
};
