/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ValidatedSupplicantRequest,
  validateSupplicantRequest,
} from './pairing-request-validation';

// The allowlist is read at call time, so each case can set it.
jest.mock('../../lib/config', () => ({
  __esModule: true,
  default: { pairing: { clients: [] as string[] } },
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../../lib/config').default;

/** Fenix — in OAUTH_NATIVE_CLIENT_IDS. */
const FENIX = 'a2270f727f45f648';
/** Firefox for iOS — also native, used to test the config allowlist narrowing. */
const FX_IOS = '1b1a3e44c54fbb58';
/** 43 characters of base64url, the length a real S256 challenge always has. */
const VALID_CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const VALID_KEYS_JWK = 'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2In0';

const OLDSYNC = 'https://identity.mozilla.com/apps/oldsync';

const validRequest = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  client_id: FENIX,
  code_challenge: VALID_CODE_CHALLENGE,
  code_challenge_method: 'S256',
  keys_jwk: VALID_KEYS_JWK,
  scope: `profile ${OLDSYNC}`,
  state: 'mock-supp-state',
  ...overrides,
});

/** The fields that failed, for asserting on a rejection. */
const failedFields = (payload: unknown) => {
  const result = validateSupplicantRequest(payload);
  return result.ok ? [] : result.failures.map((f) => f.field);
};

beforeEach(() => {
  config.pairing.clients = [];
});

describe('validateSupplicantRequest', () => {
  it('accepts a well-formed request and returns only the OAuth params', () => {
    const result = validateSupplicantRequest(
      // A real payload also carries `remoteMetaData`, which must not survive
      // into the value the authority hands to Firefox.
      validRequest({ remoteMetaData: { city: 'Vancouver' } })
    );

    expect(result).toEqual({
      ok: true,
      request: {
        client_id: FENIX,
        code_challenge: VALID_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        keys_jwk: VALID_KEYS_JWK,
        scope: `profile ${OLDSYNC}`,
        state: 'mock-supp-state',
      } satisfies ValidatedSupplicantRequest,
    });
  });

  // The supplicant normalizes its own scope before sending, but the authority
  // cannot rely on a remote peer having done so.
  it.each([
    { input: `profile+${OLDSYNC}`, expected: `profile ${OLDSYNC}` },
    { input: '  profile   profile ', expected: 'profile' },
    { input: 'profile', expected: 'profile' },
  ])('normalizes the scope $input', ({ input, expected }) => {
    const result = validateSupplicantRequest(validRequest({ scope: input }));

    expect(result.ok && result.request.scope).toBe(expected);
  });

  // The payload arrives as an unvalidated CustomEvent detail, so anything at all
  // can show up here. Rejecting has to be a return value, not a throw: a throw
  // inside the channel listener reaches no caller.
  it.each([undefined, null, 'a string', 42, [], () => {}])(
    'rejects %p without throwing',
    (payload) => {
      expect(() => validateSupplicantRequest(payload)).not.toThrow();
      expect(validateSupplicantRequest(payload).ok).toBe(false);
    }
  );

  it.each([
    'client_id',
    'code_challenge',
    'code_challenge_method',
    'keys_jwk',
    'scope',
    'state',
  ])('reports %s when it is missing', (field) => {
    expect(failedFields(validRequest({ [field]: undefined }))).toEqual([field]);
  });

  // These are the inputs that ruled out validating through GenericData /
  // class-validator: its data store throws a plain Error on any non-string.
  it.each([
    { client_id: 123 },
    { keys_jwk: {} },
    { scope: ['profile'] },
    { state: true },
    { code_challenge_method: null },
  ])('rejects the non-string value in %p without throwing', (override) => {
    const payload = validRequest(override);

    expect(() => validateSupplicantRequest(payload)).not.toThrow();
    expect(failedFields(payload)).toEqual([Object.keys(override)[0]]);
  });

  it('reports every failing field in one pass', () => {
    const failures = failedFields({
      client_id: 'nope',
      code_challenge_method: 'plain',
      state: 'x'.repeat(513),
    });

    expect(failures).toEqual([
      'client_id',
      'code_challenge',
      'code_challenge_method',
      'keys_jwk',
      'scope',
      'state',
    ]);
  });

  // The payload is remote-controlled, and `keys_jwk` / `code_challenge` are not
  // for logs — the reasons end up in a Sentry extra.
  it('never echoes a submitted value in its failure reasons', () => {
    const result = validateSupplicantRequest(
      validRequest({
        code_challenge: 'short',
        keys_jwk: 'not+base64url',
        code_challenge_method: 'plain',
      })
    );

    const reasons = result.ok ? '' : JSON.stringify(result.failures);
    expect(reasons).not.toContain('short');
    expect(reasons).not.toContain('not+base64url');
    expect(reasons).not.toContain('plain');
  });

  describe('client_id', () => {
    it.each(['A2270F727F45F648', 'a2270f727f45f64', 'a2270f727f45f6488', 'zz'])(
      'rejects %p as malformed',
      (clientId) => {
        expect(failedFields(validRequest({ client_id: clientId }))).toEqual([
          'client_id',
        ]);
      }
    );

    // Well-formed but not a browser: Firefox would still mint a code for it,
    // carrying the account's wrapped Sync keys.
    it('rejects a well-formed client id that is not a native pairing client', () => {
      const result = validateSupplicantRequest(
        validRequest({ client_id: '0123456789abcdef' })
      );

      expect(result.ok).toBe(false);
      expect(!result.ok && result.failures[0].reason).toBe(
        'not a native pairing client'
      );
    });

    it('rejects a native client that is absent from a populated allowlist', () => {
      config.pairing.clients = [FX_IOS];

      const result = validateSupplicantRequest(validRequest());

      expect(result.ok).toBe(false);
      expect(!result.ok && result.failures[0].reason).toBe(
        'not in the configured pairing allowlist'
      );
    });

    it('accepts a native client that is in the allowlist', () => {
      config.pairing.clients = [FENIX, FX_IOS];

      expect(validateSupplicantRequest(validRequest()).ok).toBe(true);
    });

    // An unhydrated config must not widen the set of clients that may pair.
    it('still requires a native client when the allowlist is empty', () => {
      config.pairing.clients = [];

      expect(failedFields(validRequest({ client_id: '0123456789abcdef' }))).toEqual(
        ['client_id']
      );
    });
  });

  describe('code_challenge', () => {
    it.each([
      { label: '42 characters', value: 'a'.repeat(42) },
      { label: '129 characters', value: 'a'.repeat(129) },
      { label: 'standard base64 padding', value: `${'a'.repeat(41)}==` },
      { label: 'a non-base64url character', value: `${'a'.repeat(42)}+` },
    ])('rejects $label', ({ value }) => {
      expect(failedFields(validRequest({ code_challenge: value }))).toEqual([
        'code_challenge',
      ]);
    });

    // v1 accepted 43-128, and so does the existing OAuthIntegrationData rule.
    it.each([43, 128])('accepts a %i character challenge', (length) => {
      expect(
        validateSupplicantRequest(
          validRequest({ code_challenge: 'a'.repeat(length) })
        ).ok
      ).toBe(true);
    });
  });

  describe('code_challenge_method', () => {
    it.each(['plain', 's256', 'S384'])('rejects %p', (method) => {
      expect(
        failedFields(validRequest({ code_challenge_method: method }))
      ).toEqual(['code_challenge_method']);
    });
  });

  describe('keys_jwk', () => {
    it.each(['dGVzdA==', 'has spaces', 'has/slash+plus'])(
      'rejects %p as not unpadded base64url',
      (keysJwk) => {
        expect(failedFields(validRequest({ keys_jwk: keysJwk }))).toEqual([
          'keys_jwk',
        ]);
      }
    );
  });

  describe('scope', () => {
    it.each(['', '   ', '+', ' + '])('rejects %p as empty', (scope) => {
      expect(failedFields(validRequest({ scope }))).toEqual(['scope']);
    });

    // Format only, by decision: an allowlist would block a future pairing
    // client until FxA shipped a new constant. auth-server still bounds what
    // each client may be granted.
    it('accepts a scope outside the sync/profile pair', () => {
      const result = validateSupplicantRequest(
        validRequest({ scope: 'https://identity.mozilla.com/apps/relay' })
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('state', () => {
    it('accepts 512 characters', () => {
      expect(
        validateSupplicantRequest(validRequest({ state: 'x'.repeat(512) })).ok
      ).toBe(true);
    });

    it('rejects 513 characters', () => {
      expect(failedFields(validRequest({ state: 'x'.repeat(513) }))).toEqual([
        'state',
      ]);
    });
  });

  describe('access_type', () => {
    it.each(['offline', 'online'])('accepts %p and returns it', (accessType) => {
      const result = validateSupplicantRequest(
        validRequest({ access_type: accessType })
      );

      expect(result.ok && result.request.access_type).toBe(accessType);
    });

    it('accepts a request that omits it, and returns no access_type', () => {
      const result = validateSupplicantRequest(validRequest());

      expect(result.ok && 'access_type' in result.request).toBe(false);
    });

    it('rejects an unknown value', () => {
      expect(failedFields(validRequest({ access_type: 'bogus' }))).toEqual([
        'access_type',
      ]);
    });
  });
});
