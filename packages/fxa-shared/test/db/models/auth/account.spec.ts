/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import { constantTimeHexEqual } from '../../../../db/models/auth/account';

describe('constantTimeHexEqual', () => {
  const hash = 'a'.repeat(64);

  it('returns true for identical hex strings', () => {
    assert.isTrue(constantTimeHexEqual(hash, hash));
  });

  it('returns false for different same-length hex strings', () => {
    assert.isFalse(constantTimeHexEqual(hash, 'b'.repeat(64)));
  });

  it('returns false without throwing for unequal-length hex strings', () => {
    assert.isFalse(constantTimeHexEqual(hash, 'ab'));
  });

  it('returns false for odd-length hex that would truncate to equal buffers', () => {
    // Before the input guard, Buffer.from('abc', 'hex') truncated to 'ab' for
    // both operands and this incorrectly returned true.
    assert.isFalse(constantTimeHexEqual('abc', 'abc'));
  });

  it('returns false for strings containing non-hex characters', () => {
    assert.isFalse(constantTimeHexEqual('z'.repeat(64), 'z'.repeat(64)));
    assert.isFalse(constantTimeHexEqual('a'.repeat(63) + 'z', hash));
  });

  it('returns false for an undefined operand without throwing', () => {
    assert.isFalse(constantTimeHexEqual(hash, undefined));
    assert.isFalse(constantTimeHexEqual(undefined, hash));
  });

  it('returns false for a null operand without throwing', () => {
    assert.isFalse(constantTimeHexEqual(hash, null as unknown as string));
  });
});
