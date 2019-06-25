/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const requestHelper = require('../../../lib/routes/utils/request_helper');

describe('requestHelper', () => {
  it('interface is correct', () => {
    assert.equal(
      typeof requestHelper,
      'object',
      'object type should be exported'
    );
    assert.equal(
      Object.keys(requestHelper).length,
      1,
      'object should have one properties'
    );
    assert.equal(
      typeof requestHelper.wantsKeys,
      'function',
      'wantsKeys should be function'
    );
  });

  it('wantsKeys', () => {
    assert.equal(
      !!requestHelper.wantsKeys({}),
      false,
      'should return falsey if request.query is not set'
    );
    assert.equal(
      requestHelper.wantsKeys({ query: {} }),
      false,
      'should return false if query.keys is not set'
    );
    assert.equal(
      requestHelper.wantsKeys({ query: { keys: false } }),
      false,
      'should return false if query.keys is false'
    );
    assert.equal(
      requestHelper.wantsKeys({ query: { keys: true } }),
      true,
      'should return true if keys is true'
    );
  });
});
