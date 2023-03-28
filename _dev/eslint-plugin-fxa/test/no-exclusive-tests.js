/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../lib/rules/no-exclusive-tests');

const ruleTester = new RuleTester();

const fromError = {
  message: 'Unexpected exclusive mocha test.',
};

ruleTester.run('no-exclusive-tests', rule, {
  valid: [`it('test', function() { });`],
  invalid: [
    {
      code: `it.only('test', function() { });`,
      errors: [fromError],
    },
  ],
});
