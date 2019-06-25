/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Base32 from 'lib/crypto/base32';
import RecoveryKey from 'lib/crypto/recovery-keys';

describe('lib/crypto/base32', () => {
  describe('generate', () => {
    it('should generate base32 string', () => {
      return Base32.generate(100000).then(key => {
        assert.ok(/[0-9A-Z]+$/.test(key), 'no lowercase letters');
        assert.equal(key.indexOf('I'), -1, 'no I');
        assert.equal(key.indexOf('L'), -1, 'no L');
        assert.equal(key.indexOf('O'), -1, 'no O');
        assert.equal(key.indexOf('U'), -1, 'no U');
        assert.lengthOf(key, 100000, 'correct length');
      });
    });
  });

  describe('decode', () => {
    // These are some simple sanity checks for decoding Crockford base32 strings.
    // Since we are using third party libs, we *should* assume that
    // they are testing edge cases.
    it('should decode base32 string', () => {
      return Base32.decode('0123456789ABCDEFGHJKMNPQRSTVWXYZ').then(key => {
        const hexKey = Buffer.from(key).toString('hex');
        assert.equal(
          hexKey,
          '00443214c74254b635cf84653a56d7c675be77df',
          'correctly decoded base32 to hex'
        );
      });
    });

    it('should decode base32 recovery key', () => {
      return RecoveryKey.generateRecoveryKey(32).then(string => {
        return Base32.decode(string).then(key => {
          assert.ok(key, 'correctly decoded base32 recovery key');
        });
      });
    });
  });
});
