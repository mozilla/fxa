/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../lib/rules/no-test-slow');

const ruleTester = new RuleTester();

const fromError = {
  message: 'Avoid using test.slow() in your test, change the default timeout.',
};

ruleTester.run('no-test-slow', rule, {
  valid: ["test.describe('test')"],
  invalid: [
    {
      code: `test.slow();`,
      errors: [fromError],
    },
    {
      code: `test.slow('condition', 'reason');`,
      errors: [fromError],
    },
  ],
});
