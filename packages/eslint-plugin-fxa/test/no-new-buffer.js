'use strict';

const RuleTester = require('eslint').RuleTester
const rule = require('../lib/rules/no-new-buffer')

const ruleTester = new RuleTester();

const allocError = {
  message: '`new Buffer()` is deprecated, use `Buffer.alloc()` instead.'
};

const fromError = {
  message: '`new Buffer()` is deprecated, use `Buffer.from()` instead.'
};

ruleTester.run('no-new-buffer', rule, {
  valid: [
    `buf = Buffer.from('buf')`,
    `buf = Buffer.from('7468697320697320612074c3a97374', 'hex')`,
    'buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])',
    'buf = Buffer.alloc(10)'
  ],
  invalid: [
    {
      code: 'buf = new Buffer()',
      errors: [fromError]
    },
    {
      code: `buf = new Buffer('buf')`,
      errors: [fromError]
    },
    {
      code: `buf = new Buffer('7468697320697320612074c3a97374', 'hex')`,
      errors: [fromError]
    },
    {
      code: 'buf = new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])',
      errors: [fromError]
    },
    {
      code: 'buf = new Buffer(10)',
      errors: [allocError]
    },
    {
      code: `
        ab = new ArrayBuffer(10);
        buf = new Buffer(ab, 0, 2);
      `,
      errors: [fromError]
    },
    {
      code: `
        buf1 = new Buffer('buf');
        buf2 = new Buffer(buf1);
      `,
      errors: [fromError, fromError]
    }
  ]
});
