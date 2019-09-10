/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = { scrypt: { maxPending: 5 } };
const log = {
  buffer: [],
  warn: function(obj) {
    log.buffer.push(obj);
  },
};

const scrypt = require('../../../lib/crypto/scrypt')(log, config);

describe('scrypt', () => {
  it('scrypt basic', async () => {
    const K1 = Buffer.from(
      'f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd',
      'hex'
    );
    const salt = Buffer.from('identity.mozilla.com/picl/v1/scrypt');
    const K2 = await scrypt.hash(K1, salt, 65536, 8, 1, 32);
    assert.equal(
      K2,
      '5b82f146a64126923e4167a0350bb181feba61f63cb1714012b19cb0be0119c5'
    );
  });

  it('scrypt enforces maximum number of pending requests', async () => {
    const K1 = Buffer.from(
      'f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd',
      'hex'
    );
    const salt = Buffer.from('identity.mozilla.com/picl/v1/scrypt');
    // Check the we're using the lower maxPending setting from config.
    assert.equal(
      scrypt.maxPending,
      5,
      'maxPending is correctly set from config'
    );
    // Send many concurrent requests.
    // Not yielding the event loop ensures they will pile up quickly.
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(scrypt.hash(K1, salt, 65536, 8, 1, 32));
    }
    try {
      await Promise.all(promises);
      assert(false, 'too many pending scrypt hashes were allowed');
    } catch (err) {
      assert.equal(err.message, 'too many pending scrypt hashes');
      assert.equal(scrypt.numPendingHWM, 6, 'HWM should be maxPending+1');
      assert.equal(log.buffer[0], 'scrypt.maxPendingExceeded');
    }
  });
});
