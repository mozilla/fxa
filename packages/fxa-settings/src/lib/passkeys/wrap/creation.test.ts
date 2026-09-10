/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { createPasskeyWrapFlow, createPasskeyWrapStore } from './creation';
import type {
  PasskeyWrapCreationFailureReason,
  PasskeyWrapStore,
} from './interfaces';
import {
  MOCK_CREDENTIAL_ID,
  MOCK_JWT,
  MOCK_KB,
  MOCK_OTHER_CREDENTIAL_ID,
  MOCK_OTHER_UID,
  MOCK_PRF_OUT,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  ZEROED,
  args,
  argsFor,
  deferWrap,
  mfaTokenFor,
  opensTo,
  proofFor,
  serverError,
} from './mocks';
import {
  JwtNotFoundError,
  JwtTokenCache,
  sessionToken as getSessionToken,
} from '../../cache';
import type {
  createWrapEnvelope,
  openWrapEnvelope,
} from '../../passkey-crypto';

// Routed through mocks so the seal and verify branches can be forced. Both
// delegate to the real crypto by default, so every other test seals for real.
const mockCreateWrapEnvelope: jest.MockedFunction<typeof createWrapEnvelope> =
  jest.fn();
const mockOpenWrapEnvelope: jest.MockedFunction<typeof openWrapEnvelope> =
  jest.fn();
jest.mock('../../passkey-crypto', () => ({
  ...jest.requireActual('../../passkey-crypto'),
  createWrapEnvelope: (...args: Parameters<typeof createWrapEnvelope>) =>
    mockCreateWrapEnvelope(...args),
  openWrapEnvelope: (...args: Parameters<typeof openWrapEnvelope>) =>
    mockOpenWrapEnvelope(...args),
}));

jest.mock('../../cache', () => ({
  ...jest.requireActual('../../cache'),
  sessionToken: jest.fn(),
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

let createPasskeyWrap: jest.MockedFunction<AuthClient['createPasskeyWrap']>;
/** Fresh per test, so a held envelope cannot leak into the next one. */
let store: PasskeyWrapStore;

const flow = () => createPasskeyWrapFlow({ createPasskeyWrap }, store);

const storedEnvelope = (call = 0) => createPasskeyWrap.mock.calls[call][2];

beforeEach(() => {
  jest.clearAllMocks();
  createPasskeyWrap = jest.fn().mockResolvedValue({ created: true });
  store = createPasskeyWrapStore();
  jest.mocked(getSessionToken).mockReturnValue(undefined);
  mockCreateWrapEnvelope.mockImplementation(
    jest.requireActual('../../passkey-crypto').createWrapEnvelope
  );
  mockOpenWrapEnvelope.mockImplementation(
    jest.requireActual('../../passkey-crypto').openWrapEnvelope
  );
});

describe('createPasskeyWrapFlow', () => {
  it('stores one envelope for the credential, authorized by the proof', async () => {
    await flow().createWrap(args());

    expect(createPasskeyWrap).toHaveBeenCalledTimes(1);
    const [jwt, credentialId] = createPasskeyWrap.mock.calls[0];
    expect(jwt).toBe(MOCK_JWT);
    expect(credentialId).toBe(MOCK_CREDENTIAL_ID);
  });

  it('seals kB so the same PRF output and credential open it again', async () => {
    await flow().createWrap(args());

    await opensTo(storedEnvelope());
  });

  it.each([
    ['a newly stored wrap', true],
    ['an identical wrap already stored', false],
  ])('reports %s as created=%s', async (_label, created) => {
    createPasskeyWrap.mockResolvedValue({ created });

    const outcome = await flow().createWrap(args());

    expect(outcome).toEqual({ ok: true, created });
  });

  it('refuses a response with no created field rather than assuming stored', async () => {
    createPasskeyWrap.mockResolvedValue({} as { created: boolean });

    const outcome = await flow().createWrap(args());

    // Reporting it stored would drop the sealed envelope, so a retry would
    // seal fresh bytes and earn a permanent errno 235.
    expect(outcome).toEqual({ ok: false, failure: 'unexpected' });
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('passkey-wrap-response error'),
      { tags: { stage: 'store' } }
    );
  });

  describe('in-flight state', () => {
    it('is not in flight before a call', () => {
      expect(flow().inFlight).toBe(false);
    });

    it('is in flight until the store answers', async () => {
      const { called, release } = deferWrap(createPasskeyWrap);
      const wrapFlow = flow();

      const pending = wrapFlow.createWrap(args());
      await called;
      expect(wrapFlow.inFlight).toBe(true);

      release();
      await pending;
      expect(wrapFlow.inFlight).toBe(false);
    });

    it('is released after a rejection', async () => {
      const { called, refuse } = deferWrap(createPasskeyWrap);
      const wrapFlow = flow();

      const pending = wrapFlow.createWrap(args());
      await called;
      refuse(serverError(ERRNO.PASSKEY_NOT_FOUND));
      await pending;

      expect(wrapFlow.inFlight).toBe(false);
    });

    it('refuses a same-tick call while a proof rejection is still settling', async () => {
      const wrapFlow = flow();

      const first = wrapFlow.createWrap({ ...args(), mfaToken: 'not-a-jwt' });
      const second = await wrapFlow.createWrap(args());

      expect(second).toEqual({ ok: false, failure: 'in_flight' });
      await expect(first).resolves.toEqual({
        ok: false,
        failure: 'proof_invalid',
      });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });
  });

  describe('failures', () => {
    it.each<[number, PasskeyWrapCreationFailureReason]>([
      [ERRNO.INVALID_MFA_TOKEN, 'proof_invalid'],
      [ERRNO.INVALID_TOKEN, 'proof_invalid'],
      [ERRNO.PASSKEY_NOT_FOUND, 'passkey_not_found'],
      [ERRNO.PASSKEY_WRAP_CONFLICT, 'wrap_conflict'],
      [ERRNO.THROTTLED, 'throttled'],
      [ERRNO.REQUEST_BLOCKED, 'throttled'],
      [ERRNO.FEATURE_NOT_ENABLED, 'feature_disabled'],
      [ERRNO.UNEXPECTED_ERROR, 'unexpected'],
    ])('maps errno %i to %s', async (errno, failure) => {
      createPasskeyWrap.mockRejectedValue(serverError(errno));

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({
        ok: false,
        failure,
        cause: { errno, code: undefined, retryAfter: undefined },
      });
    });

    it('carries retryAfter through on a throttle so callers can back off', async () => {
      createPasskeyWrap.mockRejectedValue(
        serverError(ERRNO.THROTTLED, { code: 429, retryAfter: 900 })
      );

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({
        ok: false,
        failure: 'throttled',
        cause: { errno: ERRNO.THROTTLED, code: 429, retryAfter: 900 },
      });
    });

    it('reports an unmapped failure to Sentry, tagged with its errno', async () => {
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.UNEXPECTED_ERROR));

      await flow().createWrap(args());

      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-store error'),
        { tags: { stage: 'store', errno: String(ERRNO.UNEXPECTED_ERROR) } }
      );
    });

    it('tags an errorless envelope failure as none', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));

      await flow().createWrap(args());

      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-seal error'),
        { tags: { stage: 'seal', errno: 'none' } }
      );
    });

    it.each<[number, PasskeyWrapCreationFailureReason]>([
      [ERRNO.PASSKEY_WRAP_CONFLICT, 'wrap_conflict'],
      [ERRNO.THROTTLED, 'throttled'],
      [ERRNO.INVALID_MFA_TOKEN, 'proof_invalid'],
    ])('keeps errno %i (%s) out of Sentry', async (errno) => {
      createPasskeyWrap.mockRejectedValue(serverError(errno));

      await flow().createWrap(args());

      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('refuses to store an envelope this platform cannot reopen', async () => {
      // Only opening exercises the skR unwrap and HPKE decap.
      mockOpenWrapEnvelope.mockRejectedValue(new Error('decap failed'));

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-verify error'),
        { tags: { stage: 'verify' } }
      );
    });

    it('refuses to store an envelope that reopens to the wrong bytes', async () => {
      mockOpenWrapEnvelope.mockResolvedValue(new Uint8Array(32).fill(1));

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('maps an envelope that cannot be built to unexpected', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({ ok: false, failure: 'unexpected' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('leaves the key material intact when the envelope cannot be built', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));
      const input = args();

      await flow().createWrap(input);

      expect(input.kB).toEqual(MOCK_KB);
      expect(input.prfOut).toEqual(MOCK_PRF_OUT);
    });
  });

  describe('unusable key material', () => {
    it.each([
      ['no PRF output', undefined],
      ['a zero-length PRF output', new Uint8Array(0)],
      ['a wrong-width PRF output', new Uint8Array(16).fill(9)],
    ])('refuses %s without calling the server', async (_label, prfOut) => {
      const outcome = await flow().createWrap({ ...args(), prfOut });

      expect(outcome).toEqual({ ok: false, failure: 'prf_unsupported' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('leaves kB intact when the passkey cannot hold a wrap', async () => {
      const input = { ...args(), prfOut: undefined };

      await flow().createWrap(input);

      expect(input.kB).toEqual(MOCK_KB);
    });

    it('refuses a spent prfOut as unusable, not as an unsupported passkey', async () => {
      const outcome = await flow().createWrap({
        ...args(),
        prfOut: new Uint8Array(32),
      });

      // `prf_unsupported` would blame the authenticator for spent material.
      expect(outcome).toEqual({ ok: false, failure: 'key_unusable' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('leaves prfOut usable after a rejected kB, so a retry can still seal', async () => {
      const input = args();
      const { createWrap } = flow();

      // Regenerating the PRF output costs another ceremony and biometric prompt.
      await createWrap({ ...input, kB: new Uint8Array(16).fill(7) });
      expect(input.prfOut).toEqual(MOCK_PRF_OUT);

      const outcome = await createWrap(input);

      expect(outcome).toEqual({ ok: true, created: true });
      await opensTo(storedEnvelope());
    });

    it('refuses an already-zeroed kB rather than sealing an unopenable wrap', async () => {
      const outcome = await flow().createWrap({
        ...args(),
        kB: new Uint8Array(32),
      });

      expect(outcome).toEqual({ ok: false, failure: 'key_unusable' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('refuses a wrong-width kB', async () => {
      const outcome = await flow().createWrap({
        ...args(),
        kB: new Uint8Array(16).fill(7),
      });

      expect(outcome).toEqual({ ok: false, failure: 'key_unusable' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });
  });

  describe('proof claims', () => {
    it('seals against the uid the proof names', async () => {
      await flow().createWrap({
        ...args(),
        mfaToken: proofFor(MOCK_CREDENTIAL_ID, MOCK_OTHER_UID),
      });

      await opensTo(storedEnvelope(), { uid: MOCK_OTHER_UID });
    });

    it('refuses a proof bound to another credential without sealing', async () => {
      const input = { ...args(), mfaToken: proofFor(MOCK_OTHER_CREDENTIAL_ID) };

      const outcome = await flow().createWrap(input);

      expect(outcome).toEqual({ ok: false, failure: 'proof_invalid' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
      expect(input.kB).toEqual(MOCK_KB);
      expect(input.prfOut).toEqual(MOCK_PRF_OUT);
    });

    it('reports a proof bound to another credential as a caller error', async () => {
      await flow().createWrap({
        ...args(),
        mfaToken: proofFor(MOCK_OTHER_CREDENTIAL_ID),
      });

      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-proof error'),
        { tags: { stage: 'proof' } }
      );
    });

    it.each([
      ['a token with no payload segment', 'not-a-jwt'],
      ['a payload that is not JSON', 'header.bm90LWpzb24.signature'],
      ['a payload that is not an object', 'header.NDI.signature'],
      ['a payload carrying no sub', mfaTokenFor({ cid: MOCK_CREDENTIAL_ID })],
      ['a sub that is not a uid', proofFor(MOCK_CREDENTIAL_ID, 'not-hex')],
      ['a proof bound to no credential', mfaTokenFor({ sub: MOCK_UID })],
    ])('refuses %s', async (_label, mfaToken) => {
      const outcome = await flow().createWrap({ ...args(), mfaToken });

      expect(outcome).toEqual({ ok: false, failure: 'proof_invalid' });
      expect(createPasskeyWrap).not.toHaveBeenCalled();
    });

    it('leaves the key material intact when the proof names no account', async () => {
      const input = { ...args(), mfaToken: 'not-a-jwt' };

      await flow().createWrap(input);

      expect(input.kB).toEqual(MOCK_KB);
      expect(input.prfOut).toEqual(MOCK_PRF_OUT);
    });
  });

  describe('secret handling', () => {
    it('zeroes kB and the PRF output on success', async () => {
      const input = args();

      await flow().createWrap(input);

      expect(input.kB).toEqual(ZEROED);
      expect(input.prfOut).toEqual(ZEROED);
    });

    it('zeroes kB and the PRF output when the server rejects the wrap', async () => {
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));
      const input = args();

      await flow().createWrap(input);

      expect(input.kB).toEqual(ZEROED);
      expect(input.prfOut).toEqual(ZEROED);
    });

    it('zeroes both before the request goes out', async () => {
      const input = args();
      let atRequest: { kB: Uint8Array; prfOut: Uint8Array } | undefined;
      createPasskeyWrap.mockImplementation(async () => {
        atRequest = {
          kB: Uint8Array.from(input.kB),
          prfOut: Uint8Array.from(input.prfOut),
        };
        return { created: true };
      });

      await flow().createWrap(input);

      expect(atRequest).toEqual({ kB: ZEROED, prfOut: ZEROED });
    });
  });

  describe('retries', () => {
    it('re-sends the same envelope after a failed request', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const input = args();
      const { createWrap } = flow();

      await createWrap(input);
      expect(input.kB).toEqual(ZEROED);

      const outcome = await createWrap(input);

      // Byte-identical, so a server that already committed answers
      // `created: false` instead of errno 235.
      expect(createPasskeyWrap).toHaveBeenCalledTimes(2);
      expect(storedEnvelope(1)).toEqual(storedEnvelope(0));
      expect(outcome).toEqual({ ok: true, created: true });
    });

    it('re-sends the held envelope when a retry repeats the same kB', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());

      const retry = args();
      const outcome = await createWrap(retry);

      expect(outcome).toEqual({ ok: true, created: true });
      expect(storedEnvelope(1)).toEqual(storedEnvelope(0));
      expect(retry.kB).toEqual(ZEROED);
      expect(retry.prfOut).toEqual(ZEROED);
    });

    it('refuses a retry carrying a different kB and drops the held envelope', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());
      const refused = await createWrap({
        ...args(),
        kB: new Uint8Array(32).fill(3),
      });
      const retried = await createWrap({
        credentialId: MOCK_CREDENTIAL_ID,
        mfaToken: MOCK_JWT,
      });

      expect(refused).toEqual({ ok: false, failure: 'key_changed' });
      // Nothing held and no key supplied, so there is nothing to send.
      expect(retried).toEqual({ ok: false, failure: 'prf_unsupported' });
      expect(createPasskeyWrap).toHaveBeenCalledTimes(1);
    });

    it('keeps the held envelope when a retry carries a wrong-width kB', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());

      const refused = await createWrap({
        ...args(),
        kB: new Uint8Array(16).fill(7),
      });
      const retried = await createWrap({
        credentialId: MOCK_CREDENTIAL_ID,
        mfaToken: MOCK_JWT,
      });

      expect(refused).toEqual({ ok: false, failure: 'key_unusable' });
      expect(retried).toEqual({ ok: true, created: true });
      expect(storedEnvelope(1)).toEqual(storedEnvelope(0));
    });

    it('accepts a retry that omits the spent key material', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());

      const outcome = await createWrap({
        credentialId: MOCK_CREDENTIAL_ID,
        mfaToken: MOCK_JWT,
      });

      expect(outcome).toEqual({ ok: true, created: true });
      expect(storedEnvelope(1)).toEqual(storedEnvelope(0));
    });

    it.each([
      ERRNO.PASSKEY_NOT_FOUND,
      ERRNO.PASSKEY_WRAP_CONFLICT,
      ERRNO.FEATURE_NOT_ENABLED,
    ])(
      'drops the sealed envelope after errno %i, which no retry can clear',
      async (errno) => {
        createPasskeyWrap.mockRejectedValueOnce(serverError(errno));
        const { createWrap } = flow();

        await createWrap(args());

        const outcome = await createWrap({
          credentialId: MOCK_CREDENTIAL_ID,
          mfaToken: MOCK_JWT,
        });

        // Nothing cached and no key supplied, so there is nothing to send.
        expect(outcome).toEqual({ ok: false, failure: 'prf_unsupported' });
        expect(createPasskeyWrap).toHaveBeenCalledTimes(1);
      }
    );

    it('seals a new envelope bound to a different credential', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());
      await createWrap(argsFor(MOCK_OTHER_CREDENTIAL_ID));

      expect(storedEnvelope(1)).not.toEqual(storedEnvelope(0));
      // Inequality alone would also hold if it re-sealed under the old
      // credential; only the round trip pins the new binding.
      await opensTo(storedEnvelope(1), {
        credentialId: MOCK_OTHER_CREDENTIAL_ID,
      });
    });

    it('seals a new envelope when the proof names a different account', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());
      await createWrap({
        ...args(),
        mfaToken: proofFor(MOCK_CREDENTIAL_ID, MOCK_OTHER_UID),
      });

      expect(storedEnvelope(1)).not.toEqual(storedEnvelope(0));
      await opensTo(storedEnvelope(1), { uid: MOCK_OTHER_UID });
    });

    it('seals fresh bytes for the same credential after a stored wrap', async () => {
      const { createWrap } = flow();

      await createWrap(args());
      await createWrap(args());

      // Kept, it would re-send stale bytes after a kB rotation.
      expect(createPasskeyWrap).toHaveBeenCalledTimes(2);
      expect(storedEnvelope(1)).not.toEqual(storedEnvelope(0));
    });

    it('refuses a concurrent retry on the reuse path', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
      const { createWrap } = flow();

      await createWrap(args());

      const { called, release } = deferWrap(createPasskeyWrap);
      const settled = Promise.all([createWrap(args()), createWrap(args())]);

      await called;
      release();
      const outcomes = await settled;

      expect(outcomes).toContainEqual({ ok: false, failure: 'in_flight' });
      // Two calls total: the first attempt plus one retry. Without the guard
      // the reuse path would issue both retries.
      expect(createPasskeyWrap).toHaveBeenCalledTimes(2);
    });

    it('refuses a second call while one is in flight', async () => {
      const { called, release } = deferWrap(createPasskeyWrap);
      const { createWrap } = flow();

      const first = createWrap(args());
      const second = await createWrap(args());

      expect(second).toEqual({ ok: false, failure: 'in_flight' });

      await called;
      release();
      await first;
      expect(createPasskeyWrap).toHaveBeenCalledTimes(1);
    });
  });

  describe('shared store', () => {
    it('re-sends an envelope another instance sealed', async () => {
      createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));

      await flow().createWrap(args());
      const outcome = await flow().createWrap({
        credentialId: MOCK_CREDENTIAL_ID,
        mfaToken: MOCK_JWT,
      });

      expect(outcome).toEqual({ ok: true, created: true });
      expect(storedEnvelope(1)).toEqual(storedEnvelope(0));
    });

    it('refuses a call while another instance has the credential in flight', async () => {
      const { called, release } = deferWrap(createPasskeyWrap);

      const first = flow().createWrap(args());
      const second = await flow().createWrap(args());

      expect(second).toEqual({ ok: false, failure: 'in_flight' });

      await called;
      release();
      await first;
      expect(createPasskeyWrap).toHaveBeenCalledTimes(1);
    });

    it('lets another instance work on a different credential meanwhile', async () => {
      const { called, release } = deferWrap(createPasskeyWrap);

      const first = flow().createWrap(args());
      await called;
      createPasskeyWrap.mockResolvedValue({ created: true });
      const second = await flow().createWrap(argsFor(MOCK_OTHER_CREDENTIAL_ID));

      expect(second).toEqual({ ok: true, created: true });

      release();
      await first;
      expect(createPasskeyWrap).toHaveBeenCalledTimes(2);
    });

    it('leaves the store empty once the wrap is stored', async () => {
      await flow().createWrap(args());

      expect(store.held.size).toBe(0);
      expect(store.inFlight.size).toBe(0);
    });
  });

  describe('spent proof eviction', () => {
    // JwtTokenCache is a real module singleton backed by persistent storage,
    // so entries survive the test that wrote them.
    beforeEach(() => {
      jest.mocked(getSessionToken).mockReturnValue(MOCK_SESSION_TOKEN);
      JwtTokenCache.removeToken(MOCK_SESSION_TOKEN, 'passkey');
    });

    afterEach(() => {
      JwtTokenCache.clearTokens(MOCK_SESSION_TOKEN);
    });

    it('drops the rejected proof from the JWT cache', async () => {
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', MOCK_JWT);
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));

      await flow().createWrap(args());

      expect(JwtTokenCache.hasToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(false);
    });

    it('drops a proof that names no account', async () => {
      const mfaToken = mfaTokenFor({ scope: ['mfa:passkey'] });
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', mfaToken);

      await flow().createWrap({ ...args(), mfaToken });

      expect(JwtTokenCache.hasToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(false);
    });

    it('keeps an unrelated cached proof for the same session', async () => {
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', 'another.mfa.jwt');
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));

      await flow().createWrap(args());

      expect(JwtTokenCache.getToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(
        'another.mfa.jwt'
      );
    });

    it('leaves a cached proof alone when there is no session token', async () => {
      jest.mocked(getSessionToken).mockReturnValue(undefined);
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', MOCK_JWT);
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));

      await flow().createWrap(args());

      expect(JwtTokenCache.getToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(
        MOCK_JWT
      );
    });

    it('is a no-op when nothing is cached for the session', async () => {
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));

      const outcome = await flow().createWrap(args());

      expect(outcome).toEqual({
        ok: false,
        failure: 'proof_invalid',
        cause: {
          errno: ERRNO.INVALID_MFA_TOKEN,
          code: undefined,
          retryAfter: undefined,
        },
      });
      expect(JwtTokenCache.hasToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(false);
    });

    it('drops an expired proof the server rejected', async () => {
      const expired = mfaTokenFor({
        sub: MOCK_UID,
        cid: MOCK_CREDENTIAL_ID,
        exp: 1,
      });
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', expired);
      createPasskeyWrap.mockRejectedValue(serverError(ERRNO.INVALID_MFA_TOKEN));

      await flow().createWrap({ ...args(), mfaToken: expired });

      // `hasToken` already answers false for an expired entry, so only a read
      // shows whether it was removed.
      expect(() =>
        JwtTokenCache.getToken(MOCK_SESSION_TOKEN, 'passkey')
      ).toThrow(JwtNotFoundError);
    });

    it('keeps a proof bound to another credential', async () => {
      const mismatched = proofFor(MOCK_OTHER_CREDENTIAL_ID);
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', mismatched);

      await flow().createWrap({ ...args(), mfaToken: mismatched });

      expect(JwtTokenCache.getToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(
        mismatched
      );
    });

    it('leaves the cache alone on a failure that is not a stale proof', async () => {
      JwtTokenCache.setToken(MOCK_SESSION_TOKEN, 'passkey', MOCK_JWT);
      createPasskeyWrap.mockRejectedValue(
        serverError(ERRNO.PASSKEY_WRAP_CONFLICT)
      );

      await flow().createWrap(args());

      expect(JwtTokenCache.getToken(MOCK_SESSION_TOKEN, 'passkey')).toBe(
        MOCK_JWT
      );
    });
  });
});
