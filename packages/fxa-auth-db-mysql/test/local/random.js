/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');

const base32 = require('../../lib/db/random');

describe('random', () => {
  it('should generate random code', () => {
    return base32(10).then(code => {
      assert.lengthOf(code, 10);
      assert.notInclude(code, 'i');
      assert.notInclude(code, 'l');
      assert.notInclude(code, 'o');
      assert.notInclude(code, 'u');
    });
  });
});
