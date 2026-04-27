import assert from 'assert';
import '../server'; // must import this to run with nodejs
import {
  deriveHawkCredentials,
  deriveTokenCredentials,
} from 'fxa-auth-client/lib/hawk';
import { uint8ToHex } from 'fxa-auth-client/lib/utils';

// Hawk header-signing test vectors were removed with the Hawk signing code
// itself as part of the FXA-9392 Bearer migration. See test/bearer.ts for
// the replacement header-format tests. The HKDF derivation below is
// scheme-neutral and still exercised here because `deriveHawkCredentials`
// remains exported for backwards compatibility.

describe('lib/hawk', () => {
  const SESSION_TOKEN =
    'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf';
  const EXPECTED_KEY =
    '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0';
  const EXPECTED_ID =
    'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab';

  describe('deriveHawkCredentials', () => {
    it('returns the correct id and key', async () => {
      const result = await deriveHawkCredentials(SESSION_TOKEN, 'sessionToken');
      assert.equal(uint8ToHex(result.key), EXPECTED_KEY);
      assert.equal(result.id, EXPECTED_ID);
    });
  });

  describe('deriveTokenCredentials (alias)', () => {
    it('is the same function as deriveHawkCredentials', () => {
      assert.strictEqual(deriveTokenCredentials, deriveHawkCredentials);
    });

    it('returns the same id/key as deriveHawkCredentials', async () => {
      const result = await deriveTokenCredentials(
        SESSION_TOKEN,
        'sessionToken'
      );
      assert.equal(uint8ToHex(result.key), EXPECTED_KEY);
      assert.equal(result.id, EXPECTED_ID);
    });
  });
});
