'use strict';

const RuleTester = require('eslint').RuleTester
const rule = require('../lib/rules/no-exclusive-tests')

const ruleTester = new RuleTester();


const fromError = {
  message: 'Unexpected exclusive mocha test.'
};

ruleTester.run('no-exclusive-tests', rule, {
  valid: [
    `it('test', function() { });`,
  ],
  invalid: [
    {
      code: `it.only('test', function() { });`,
      errors: [fromError]
    }
  ]
});
