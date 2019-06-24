/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import util from 'lib/crypto/util';

const { base64urlToUint8Array } = util;

describe('lib/crypto/util/base64urlToUint8Array', () => {
  it('should decode base64url undefined as empty string', () => {
    const uint8array = base64urlToUint8Array();
    assert.equal(uint8array.constructor.name, 'Uint8Array', 'is a Uint8Array');
    assert.equal(
      new Int8Array(uint8array)[0],
      undefined,
      'is correct value for empty string'
    );
  });

  it('should decode base64url empty string', () => {
    const uint8array = base64urlToUint8Array('');
    assert.equal(uint8array.constructor.name, 'Uint8Array', 'is a Uint8Array');
    assert.equal(
      new Int8Array(uint8array)[0],
      undefined,
      'is correct value for empty string'
    );
  });

  it('should decode base64url test', () => {
    const uint8array = base64urlToUint8Array('dGVzdA==');
    assert.equal(uint8array.constructor.name, 'Uint8Array', 'is a Uint8Array');
    const int8Array = new Int8Array(uint8array);
    assert.equal(int8Array[0], 116);
    assert.equal(int8Array[1], 101);
    assert.equal(int8Array[2], 115);
    assert.equal(int8Array[3], 116);
  });
});
