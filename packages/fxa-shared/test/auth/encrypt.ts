/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';

import { hash, hex } from '../../auth';

describe('auth/encrypt', () => {
  it('converts to hex', () => {
    const val = hex('ff');

    assert.isTrue(Buffer.isBuffer(val));
  });

  it('makes hash', () => {
    const val = hash('123');

    assert.isTrue(Buffer.isBuffer(val));
  });

  it('makes hash from buffer', () => {
    const val = hash(hex('123'));

    assert.isTrue(Buffer.isBuffer(val));
  });

  it('restricts type', () => {
    assert.throws(() => {
      const val = hash({ foo: 'bar' });
    });
  });
});
