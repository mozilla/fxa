/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('assert');
const butil = require('../../../lib/crypto/butil');

describe('butil', () => {
  describe('.buffersAreEqual', () => {
    it('returns false if lengths are different', () => {
      assert.equal(
        butil.buffersAreEqual(Buffer.alloc(2), Buffer.alloc(4)),
        false
      );
    });

    it('returns true if buffers have same bytes', () => {
      const b1 = Buffer.from('abcd', 'hex');
      const b2 = Buffer.from('abcd', 'hex');
      assert.equal(butil.buffersAreEqual(b1, b2), true);
    });
  });

  describe('.xorBuffers', () => {
    it('throws an Error if lengths are different', () => {
      assert.throws(() => {
        butil.xorBuffers(Buffer.alloc(2), Buffer.alloc(4));
      });
    });

    it('should return a Buffer with bits ORed', () => {
      const b1 = Buffer.from('e5', 'hex');
      const b2 = Buffer.from('5e', 'hex');
      assert.deepEqual(butil.xorBuffers(b1, b2), Buffer.from('bb', 'hex'));
    });
  });
});
