/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as butil from './butil';

describe('butil', () => {
  describe('.buffersAreEqual', () => {
    it('returns false if lengths are different', () => {
      expect(butil.buffersAreEqual(Buffer.alloc(2), Buffer.alloc(4))).toBe(
        false
      );
    });

    it('returns true if buffers have same bytes', () => {
      const b1 = Buffer.from('abcd', 'hex');
      const b2 = Buffer.from('abcd', 'hex');
      expect(butil.buffersAreEqual(b1, b2)).toBe(true);
    });
  });

  describe('.xorBuffers', () => {
    it('throws an Error if lengths are different', () => {
      expect(() => {
        butil.xorBuffers(Buffer.alloc(2), Buffer.alloc(4));
      }).toThrow();
    });

    it('should return a Buffer with bits ORed', () => {
      const b1 = Buffer.from('e5', 'hex');
      const b2 = Buffer.from('5e', 'hex');
      expect(butil.xorBuffers(b1, b2)).toEqual(Buffer.from('bb', 'hex'));
    });
  });
});
