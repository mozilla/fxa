/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import a256gcm from 'lib/crypto/a256gcm';
import UAParser from 'ua-parser-js';

const hexKey =
  'aaaaabbbbbcccccdddddeeeeefffff00aaaaabbbbbcccccdddddeeeeefffff00';
const incorrectHexKey =
  'aaaaabbbbbcccccdddddeeeeefffff00aaaaabbbbbcccccdddddeeeeefffff01';
const kid = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const plaintext = 'this is some plaintext';

const encryptionOptions = {
  unsafeExplicitIV: 'eeddccbbaa99887766554433',
};

function createJwkForHexKey(hexKey, kid) {
  const keyBuffer = Buffer.from(hexKey, 'hex');
  return a256gcm.createJwkFromKey(keyBuffer, kid);
}

describe('lib/crypto/a256gcm', () => {
  describe('createJwkFromKey', () => {
    it('throws if no key', () => {
      return a256gcm.createJwkFromKey().then(assert.fail, err => {
        assert.equal(err.message, 'key is required');
      });
    });

    it('should create jwk', () => {
      return createJwkForHexKey(hexKey, kid).then(jwk => {
        assert.ok(jwk, 'jwk returned');
        assert.equal(jwk.alg, 'A256GCM', 'correct algorithm');
        assert.equal(jwk.kty, 'oct', 'correct kty');
        assert.equal(jwk.kid, kid, 'correct kid');
        assert.equal(jwk.length, 256, 'correct length');
      });
    });
  });

  describe('encrypt', () => {
    let jwk;
    before(() => {
      return createJwkForHexKey(hexKey).then(result => (jwk = result));
    });

    it('throws if no plaintext', () => {
      return a256gcm.encrypt(undefined, jwk).then(assert.fail, err => {
        assert.equal(err.message, 'plaintext is required');
      });
    });

    it('throws if no keysJwk', () => {
      return a256gcm.encrypt(plaintext).then(assert.fail, err => {
        assert.equal(err.message, 'keysJwk is required');
      });
    });

    it('should encrypt', () => {
      return a256gcm
        .encrypt(plaintext, jwk, encryptionOptions)
        .then(ciphertext => {
          assert.ok(ciphertext, 'ciphertext exists');
        });
    });
  });

  describe('decrypt', () => {
    let ciphertext;
    let jwk;

    before(() => {
      return createJwkForHexKey(hexKey)
        .then(result => {
          jwk = result;
          return a256gcm.encrypt(plaintext, jwk, encryptionOptions);
        })
        .then(result => (ciphertext = result));
    });

    it('throws if no keysJwk', () => {
      return a256gcm.decrypt(ciphertext, undefined).then(assert.fail, err => {
        assert.equal(err.message, 'keysJwk is required');
      });
    });

    it('throws if no ciphertext', () => {
      return a256gcm.decrypt(undefined, jwk).then(assert.fail, err => {
        assert.equal(err.message, 'ciphertext is required');
      });
    });

    it('should decrypt data', () => {
      return a256gcm.decrypt(ciphertext, jwk).then(result => {
        assert.equal(
          result,
          plaintext,
          'result is the same as original plaintext'
        );
      });
    });

    it('should fail to unbundle with incorrect recovery key', () => {
      return createJwkForHexKey(incorrectHexKey)
        .then(incorrectJwk => {
          return a256gcm.decrypt(ciphertext, incorrectJwk);
        })
        .then(assert.fail, err => {
          // Blink and WebKit do not provide the same decrypt error, it reports an empty string
          const isWebkit =
            UAParser(navigator.userAgent).engine.name === 'WebKit';
          if (isWebkit) {
            assert.equal(
              err.name,
              'OperationError',
              'expect a DOMException operation error'
            );
          } else {
            assert.equal(
              err.message,
              'The operation failed for an operation-specific reason',
              'correct error message'
            );
          }
        });
    });
  });
});
