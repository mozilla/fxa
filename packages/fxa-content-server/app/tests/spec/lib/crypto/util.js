/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import {assert} from 'chai';
import {base64urlToArrayBuffer} from 'lib/crypto/util';

describe('lib/crypto/util/base64urlToArrayBuffer', () => {
  it('should decode base64url undefined as empty string', () => {
    const arrayBuffer = base64urlToArrayBuffer();
    assert.equal(arrayBuffer.constructor.name, 'ArrayBuffer', 'is an array buffer');
    assert.equal(new Int8Array(arrayBuffer)[0], undefined, 'is correct value for empty string');
  });

  it('should decode base64url empty string', () => {
    const arrayBuffer = base64urlToArrayBuffer('');
    assert.equal(arrayBuffer.constructor.name, 'ArrayBuffer', 'is an array buffer');
    assert.equal(new Int8Array(arrayBuffer)[0], undefined, 'is correct value for empty string');
  });

  it('should decode base64url test', () => {
    const arrayBuffer = base64urlToArrayBuffer('dGVzdA==');
    assert.equal(arrayBuffer.constructor.name, 'ArrayBuffer', 'is an array buffer');
    const int8Array = new Int8Array(arrayBuffer);
    assert.equal(int8Array[0], 116);
    assert.equal(int8Array[1], 101);
    assert.equal(int8Array[2], 115);
    assert.equal(int8Array[3], 116);
  });
});
