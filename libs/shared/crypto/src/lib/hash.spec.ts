/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hash, hex } from './hash';

describe('hash', () => {
  it('converts to hex', () => {
    expect(Buffer.isBuffer(hex('ff'))).toBe(true);
  });

  it('makes hash', () => {
    const val = hash('1234');

    expect(Buffer.isBuffer(val)).toBe(true);
    expect(val.toString('hex')).toBe(
      '3a103a4e5729ad68c02a678ae39accfbc0ae208096437401b7ceab63cca0622f'
    );
  });

  it('makes hash from buffer', () => {
    expect(Buffer.isBuffer(hash(hex('1234')))).toBe(true);
  });

  it('restricts type', () => {
    expect(() => hash({ foo: 'bar' })).toThrow();
  });
});
