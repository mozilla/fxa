/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const log = { trace() {} };

const timestamp = Date.now();

const PasswordForgotToken = require('../../../lib/tokens')(log)
  .PasswordForgotToken;

const ACCOUNT = {
  uid: 'xxx',
  email: Buffer.from('test@example.com').toString('hex'),
};

describe('PasswordForgotToken', () => {
  it('can re-create from tokenData', () => {
    let token = null;
    return PasswordForgotToken.create(ACCOUNT)
      .then((x) => {
        token = x;
      })
      .then(() => {
        return PasswordForgotToken.fromHex(token.data, ACCOUNT);
      })
      .then((token2) => {
        assert.deepEqual(token.data, token2.data);
        assert.deepEqual(token.id, token2.id);
        assert.deepEqual(token.authKey, token2.authKey);
        assert.deepEqual(token.bundleKey, token2.bundleKey);
        assert.deepEqual(token.uid, token2.uid);
        assert.deepEqual(token.email, token2.email);
      });
  });

  it('ttl "works"', () => {
    return PasswordForgotToken.create(ACCOUNT).then((token) => {
      token.createdAt = timestamp;
      assert.equal(token.ttl(timestamp), 900);
      assert.equal(token.ttl(timestamp + 1000), 899);
      assert.equal(token.ttl(timestamp + 2000), 898);
    });
  });

  it('failAttempt decrements `tries`', () => {
    return PasswordForgotToken.create(ACCOUNT).then((x) => {
      assert.equal(x.tries, 3);
      assert.equal(x.failAttempt(), false);
      assert.equal(x.tries, 2);
      assert.equal(x.failAttempt(), false);
      assert.equal(x.tries, 1);
      assert.equal(x.failAttempt(), true);
    });
  });
});
