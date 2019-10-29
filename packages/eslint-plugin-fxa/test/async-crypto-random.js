'use strict';

const RuleTester = require('eslint').RuleTester
const rule = require('../lib/rules/async-crypto-random')

const ruleTester = new RuleTester();
ruleTester.run('async-crypto-random', rule, {
  valid: [
    'crypto.randomBytes(32, cb)',
  ],
  invalid: [
    {
      code: 'crypto.randomBytes(32)',
      errors: [ { message: 'Pass a callback to crypto.randomBytes().' } ]
    }
  ]
});
