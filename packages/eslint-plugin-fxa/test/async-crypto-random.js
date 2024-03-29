/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../lib/rules/async-crypto-random');

const ruleTester = new RuleTester();
ruleTester.run('async-crypto-random', rule, {
  valid: ['crypto.randomBytes(32, cb)'],
  invalid: [
    {
      code: 'crypto.randomBytes(32)',
      errors: [{ message: 'Pass a callback to crypto.randomBytes().' }],
    },
  ],
});
