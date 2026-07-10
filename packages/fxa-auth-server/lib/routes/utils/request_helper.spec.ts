/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const requestHelper = require('./request_helper');

describe('requestHelper', () => {
  it('interface is correct', () => {
    expect(typeof requestHelper).toBe('object');
    expect(Object.keys(requestHelper).length).toBe(2);
    expect(typeof requestHelper.wantsKeys).toBe('function');
  });

  it('wantsKeys', () => {
    expect(!!requestHelper.wantsKeys({})).toBe(false);
    expect(requestHelper.wantsKeys({ query: {} })).toBe(false);
    expect(requestHelper.wantsKeys({ query: { keys: false } })).toBe(false);
    expect(requestHelper.wantsKeys({ query: { keys: true } })).toBe(true);
  });
});
