import assert from 'assert';
import '../server'; // must import this to run with nodejs
import { bearerHeader, TOKEN_PREFIXES } from 'fxa-auth-client/lib/bearer';

// Test vectors pinned against the HKDF derivation so the exact on-the-wire
// header format is fixed. Any change here means the server-side parser in
// `packages/fxa-auth-server/lib/routes/auth-schemes/bearer-fxa-token.js`
// must be updated in lockstep. See FXA-9392 / ADR-0022.

const SESSION_TOKEN =
  'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf';

// id derived from HKDF(sessionToken, 'sessionToken'). Pinned in test/hawk.ts.
const EXPECTED_ID =
  'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab';

describe('lib/bearer', () => {
  describe('TOKEN_PREFIXES', () => {
    it('maps every client-side token kind to a prefix', () => {
      assert.deepEqual(Object.keys(TOKEN_PREFIXES).sort(), [
        'accountResetToken',
        'keyFetchToken',
        'passwordChangeToken',
        'passwordForgotToken',
        'sessionToken',
      ]);
    });

    it('matches the server-side prefixes (fxs, fxk, fxar, fxpf, fxpc)', () => {
      assert.equal(TOKEN_PREFIXES.sessionToken, 'fxs');
      assert.equal(TOKEN_PREFIXES.keyFetchToken, 'fxk');
      assert.equal(TOKEN_PREFIXES.accountResetToken, 'fxar');
      assert.equal(TOKEN_PREFIXES.passwordForgotToken, 'fxpf');
      assert.equal(TOKEN_PREFIXES.passwordChangeToken, 'fxpc');
    });
  });

  describe('bearerHeader', () => {
    it('emits `Bearer fxs_<id>` for a sessionToken', async () => {
      const headers = await bearerHeader(SESSION_TOKEN, 'sessionToken');
      assert.equal(headers.get('authorization'), `Bearer fxs_${EXPECTED_ID}`);
    });

    it('uses the kind-specific prefix for each token kind', async () => {
      for (const kind of Object.keys(TOKEN_PREFIXES) as Array<
        keyof typeof TOKEN_PREFIXES
      >) {
        const headers = await bearerHeader(SESSION_TOKEN, kind);
        const auth = headers.get('authorization');
        assert.ok(
          auth && auth.startsWith(`Bearer ${TOKEN_PREFIXES[kind]}_`),
          `${kind}: expected prefix ${TOKEN_PREFIXES[kind]}_, got ${auth}`
        );
        // Exactly one token after "Bearer " and it's 64 hex chars.
        assert.match(auth!, /^Bearer fx[a-z]+_[0-9a-f]{64}$/);
      }
    });

    it('throws on an unknown kind', async () => {
      await assert.rejects(
        bearerHeader(SESSION_TOKEN, 'notARealKind' as any),
        /unknown token kind/
      );
    });
  });
});
