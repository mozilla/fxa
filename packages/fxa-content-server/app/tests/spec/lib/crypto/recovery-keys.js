/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import RecoveryKeys from 'lib/crypto/recovery-keys';

const uid = 'aaaaabbbbbcccccdddddeeeeefffff00';
const recoveryKey = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const recoveryData = {
  kB: '000000111111222222333333444444555555666666777777888888999999ABCD',
};
const expectedRecoveryKeyId = '6aa248931704886f54ac64b81b111bc0';
const expectedBundle =
  'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIiwia2lkIjoiNmFhMjQ4OTMxNzA0ODg2ZjU0YWM2NGI4MWIxMTFiYzAifQ..' +
  '7t3Mu6qZiHdmVUQz.qoXWfU77FBV67Pyy_GXAkoSuAbksIqAXZd2tkq48iD3u_qWEEAeYx-M3m2G373zes3OXsSZdJIGRFmd8bC9s4ZvN3kF3A6vK5g.' +
  'yT7bkdF8AYC6ecwsvRCI7A';
const encryptionOptions = {
  unsafeExplicitIV: 'eeddccbbaa99887766554433',
};

describe('lib/crypto/recovery-keys', () => {
  describe('getRecoveryKeyVersion', () => {
    it('should get current recovery key version', () => {
      const version = RecoveryKeys.getCurrentRecoveryKeyVersion();
      assert.equal(version, 'A', 'current version matches');
    });
  });

  describe('generateRecoveryKey', () => {
    it('should generate base32 string', () => {
      return RecoveryKeys.generateRecoveryKey(1000).then(key => {
        assert.ok(/[0-9A-Z]+$/.test(key), 'no lowercase letters');
        assert.equal(key.indexOf('I'), -1, 'no I');
        assert.equal(key.indexOf('L'), -1, 'no L');
        assert.equal(key.indexOf('O'), -1, 'no O');
        assert.equal(key.indexOf('U'), -1, 'no U');
      });
    });

    it('should prepend version', () => {
      return RecoveryKeys.generateRecoveryKey(1000).then(key =>
        assert.equal(key.charAt(0), RecoveryKeys.getCurrentRecoveryKeyVersion())
      );
    });

    it('should have correct length', () => {
      return RecoveryKeys.generateRecoveryKey(1000).then(key =>
        assert.lengthOf(key, 1000)
      );
    });

    it('should fail for length less than 27', () => {
      return RecoveryKeys.generateRecoveryKey(26).then(assert.fail, err => {
        assert.equal(err.message, 'Recovery key length must be at least 27');
      });
    });
  });

  describe('getRecoveryJwk', () => {
    it('throws if no uid', () => {
      return RecoveryKeys.getRecoveryJwk(undefined, recoveryKey).then(
        assert.fail,
        err => {
          assert.equal(err.message, 'uid is required');
        }
      );
    });

    it('throws if no recoveryKey', () => {
      return RecoveryKeys.getRecoveryJwk(uid, undefined).then(
        assert.fail,
        err => {
          assert.equal(err.message, 'recoveryKey is required');
        }
      );
    });

    it('should create recoveryJwk', () => {
      return RecoveryKeys.getRecoveryJwk(uid, recoveryKey).then(jwk => {
        assert.ok(jwk, 'jwk returned');
        assert.equal(jwk.alg, 'A256GCM', 'correct algorithm');
        assert.equal(jwk.kty, 'oct', 'correct kty');
        assert.equal(jwk.kid, expectedRecoveryKeyId, 'correct kid');
        assert.equal(jwk.length, 256, 'correct length');
      });
    });
  });

  describe('bundleRecoveryData', () => {
    let recoveryJwk;

    beforeEach(() => {
      return RecoveryKeys.getRecoveryJwk(uid, recoveryKey).then(result => {
        recoveryJwk = result;
      });
    });

    it('throws if no recoveryJwk', () => {
      return RecoveryKeys.bundleRecoveryData(undefined, recoveryData).then(
        assert.fail,
        err => {
          assert.equal(err.message, 'recoveryJwk is required');
        }
      );
    });

    it('should create recovery bundle', () => {
      return RecoveryKeys.bundleRecoveryData(
        recoveryJwk,
        recoveryData,
        encryptionOptions
      ).then(bundle => {
        assert.ok(bundle, 'bundle exists');
        assert.equal(bundle, expectedBundle, 'bundle are equal');
      });
    });
  });

  describe('unbundleRecoveryData', () => {
    let recoveryJwk, recoveryBundle;

    beforeEach(() => {
      return RecoveryKeys.getRecoveryJwk(uid, recoveryKey)
        .then(result => {
          recoveryJwk = result;
          return RecoveryKeys.bundleRecoveryData(recoveryJwk, recoveryData);
        })
        .then(res => (recoveryBundle = res));
    });

    it('throws if no recoveryJwk', () => {
      return RecoveryKeys.unbundleRecoveryData(undefined, recoveryBundle).then(
        assert.fail,
        err => {
          assert.equal(err.message, 'recoveryJwk is required');
        }
      );
    });

    it('throws if no recoveryBundle', () => {
      return RecoveryKeys.unbundleRecoveryData(recoveryJwk, undefined).then(
        assert.fail,
        err => {
          assert.equal(err.message, 'recoveryBundle is required');
        }
      );
    });

    it('should unbundle recovery data', () => {
      return RecoveryKeys.unbundleRecoveryData(
        recoveryJwk,
        recoveryBundle
      ).then(bundle => {
        assert.equal(
          bundle.kB,
          recoveryData.kB,
          'decrypted bundle contains kB'
        );
      });
    });

    it('should fail to unbundle with incorrect recovery key', () => {
      const recoveryKey = '00000000000000000000000000';
      return RecoveryKeys.getRecoveryJwk(uid, recoveryKey)
        .then(recoveryJwk => {
          return RecoveryKeys.unbundleRecoveryData(recoveryJwk, recoveryBundle);
        })
        .then(assert.fail, err => {
          assert.equal(
            err.message,
            'Failed to unbundle recovery data',
            'correct error message'
          );
        });
    });
  });

  describe('recovery key `round trip` sanity check', () => {
    it('performs round trip check', () => {
      let recoveryKey, recoveryJwk;
      return RecoveryKeys.generateRecoveryKey(32)
        .then(result => {
          recoveryKey = result;
          return RecoveryKeys.getRecoveryJwk(uid, recoveryKey);
        })
        .then(result => {
          recoveryJwk = result;
          assert.ok(recoveryJwk, 'jwk returned');
          assert.ok(recoveryJwk.alg, 'A256GCM', 'correct algorithm');
          assert.ok(recoveryJwk.kty, 'oct', 'correct kty');
          assert.ok(recoveryJwk.kid);
          return RecoveryKeys.bundleRecoveryData(recoveryJwk, recoveryData);
        })
        .then(recoveryBundle => {
          assert.ok(recoveryBundle, 'recoveryBundle returned');
          return RecoveryKeys.unbundleRecoveryData(recoveryJwk, recoveryBundle);
        })
        .then(unbundledData => {
          assert.equal(unbundledData.kB, recoveryData.kB, 'data is unbundled');
        });
    });
  });
});
