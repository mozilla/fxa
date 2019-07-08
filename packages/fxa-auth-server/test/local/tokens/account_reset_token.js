/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const log = { trace() {} };
const tokens = require('../../../lib/tokens/index')(log);
const AccountResetToken = tokens.AccountResetToken;

const ACCOUNT = {
  uid: 'xxx',
};

describe('account reset tokens', () => {
  it('should re-create from tokenData', () => {
    let token = null;
    return AccountResetToken.create(ACCOUNT)
      .then(x => {
        token = x;
      })
      .then(() => AccountResetToken.fromHex(token.data, ACCOUNT))
      .then(token2 => {
        assert.deepEqual(token.data, token2.data);
        assert.deepEqual(token.id, token2.id);
        assert.deepEqual(token.authKey, token2.authKey);
        assert.deepEqual(token.bundleKey, token2.bundleKey);
        assert.deepEqual(token.uid, token2.uid);
      });
  });

  it('should have test-vector compliant key derivations', () => {
    let token = null;
    const tokenData =
      'c0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedf';
    return AccountResetToken.fromHex(tokenData, ACCOUNT).then(x => {
      token = x;
      assert.equal(token.data.toString('hex'), tokenData);
      assert.equal(
        token.id,
        '46ec557e56e531a058620e9344ca9c75afac0d0bcbdd6f8c3c2f36055d9540cf'
      );
      assert.equal(
        token.authKey.toString('hex'),
        '716ebc28f5122ef48670a48209190a1605263c3188dfe45256265929d1c45e48'
      );
      assert.equal(
        token.bundleKey.toString('hex'),
        'aa5906d2318c6e54ecebfa52f10df4c036165c230cc78ee859f546c66ea3c126'
      );
    });
  });
});
