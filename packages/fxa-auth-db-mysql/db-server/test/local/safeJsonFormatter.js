/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const safeJsonFormatter = require('../../lib/safeJsonFormatter');

describe('safeJsonFormatter module', () => {
  it('safeJsonFormatter function exported', () => {
    assert.isFunction(safeJsonFormatter);
  });

  it('escapes input', () => {
    const req = {};
    const res = {
      setHeader: () => {},
    };
    const body = { foo: '<script>&' };
    const expectedData = '{"foo":"\\u003cscript\\u003e\\u0026"}';
    const data = safeJsonFormatter(req, res, body);
    assert.equal(data, expectedData, 'script is escaped');
  });
});
