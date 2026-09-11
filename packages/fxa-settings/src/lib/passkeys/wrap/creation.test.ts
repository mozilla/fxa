/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { createPasskeyWrap, retryPasskeyWrapStore } from './creation';
import { AuthUiErrors } from '../../auth-errors/auth-errors';
import { bytesToBase64url } from '../../base64url';
import type {
  createWrapEnvelope,
  openWrapEnvelope,
} from '../../passkey-crypto';

// Real crypto by default; mocked only to force the seal and verify branches.
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

const mockGetCredential = jest.fn();
jest.mock('../webauthn', () => ({
  getCredential: (...args: unknown[]) => mockGetCredential(...args),
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const MOCK_UID = '11111111222222223333333344444444';
const MOCK_CREDENTIAL_ID = 'Y3JlZGVudGlhbA';
const MOCK_KB = new Uint8Array(32).fill(7);
const MOCK_PRF_OUT = new Uint8Array(32).fill(9);
const ZEROED = new Uint8Array(32);

const mfaTokenFor = (claims: Record<string, unknown>) =>
  [
    'header',
    bytesToBase64url(new TextEncoder().encode(JSON.stringify(claims))),
    'signature',
  ].join('.');
const MOCK_JWT = mfaTokenFor({ sub: MOCK_UID });

let createPasskeyWrapApiMock: jest.MockedFunction<
  AuthClient['createPasskeyWrap']
>;
const beginVerificationMock = jest.fn();
const completeVerificationMock = jest.fn();
const authClient = () => ({
  createPasskeyWrap: createPasskeyWrapApiMock,
  beginPasskeyVerification: beginVerificationMock,
  completePasskeyVerification: completeVerificationMock,
});
const MOCK_SESSION_TOKEN = 'deadbeef';
const FRESH_JWT = mfaTokenFor({ sub: MOCK_UID, fresh: true });

const args = () => ({
  credentialId: MOCK_CREDENTIAL_ID,
  mfaToken: MOCK_JWT,
  sessionToken: MOCK_SESSION_TOKEN,
  prfOut: Uint8Array.from(MOCK_PRF_OUT),
  kB: Uint8Array.from(MOCK_KB),
});

const serverError = (errno: number, extra: Record<string, unknown> = {}) =>
  Object.assign(new Error('nope'), { errno, ...extra });

const storedEnvelope = () => createPasskeyWrapApiMock.mock.calls[0][2];

const realCrypto = () =>
  jest.requireActual<typeof import('../../passkey-crypto')>(
    '../../passkey-crypto'
  );

const openStored = (uid = MOCK_UID) =>
  realCrypto().openWrapEnvelope({
    envelope: storedEnvelope(),
    prfOut: Uint8Array.from(MOCK_PRF_OUT),
    uid,
    credentialId: MOCK_CREDENTIAL_ID,
  });

beforeEach(() => {
  jest.clearAllMocks();
  createPasskeyWrapApiMock = jest.fn().mockResolvedValue({ created: true });
  mockCreateWrapEnvelope.mockImplementation(realCrypto().createWrapEnvelope);
  mockOpenWrapEnvelope.mockImplementation(realCrypto().openWrapEnvelope);
  beginVerificationMock.mockResolvedValue({ challenge: 'chal' });
  mockGetCredential.mockResolvedValue({ id: MOCK_CREDENTIAL_ID });
  completeVerificationMock.mockResolvedValue({ mfaToken: FRESH_JWT });
});

describe('createPasskeyWrap', () => {
  it('stores one envelope for the credential, authorized by the proof', async () => {
    await createPasskeyWrap(authClient(), args());

    expect(createPasskeyWrapApiMock).toHaveBeenCalledTimes(1);
    const [jwt, credentialId] = createPasskeyWrapApiMock.mock.calls[0];
    expect(jwt).toBe(MOCK_JWT);
    expect(credentialId).toBe(MOCK_CREDENTIAL_ID);
  });

  it('seals kB so the same PRF output and credential open it again', async () => {
    await createPasskeyWrap(authClient(), args());

    await expect(openStored()).resolves.toEqual(MOCK_KB);
  });

  it('seals against the uid the proof names', async () => {
    const otherUid = 'aaaaaaaabbbbbbbbccccccccdddddddd';

    await createPasskeyWrap(authClient(), {
      ...args(),
      mfaToken: mfaTokenFor({ sub: otherUid }),
    });

    await expect(openStored(otherUid)).resolves.toEqual(MOCK_KB);
  });

  it.each([
    ['a newly stored wrap', true],
    ['an identical wrap already stored', false],
  ])('reports %s as created=%s', async (_label, created) => {
    createPasskeyWrapApiMock.mockResolvedValue({ created });

    const outcome = await createPasskeyWrap(authClient(), args());

    expect(outcome).toEqual({ ok: true, created });
  });

  describe('server failures', () => {
    it.each([
      ERRNO.INVALID_MFA_TOKEN,
      ERRNO.INVALID_TOKEN,
      ERRNO.PASSKEY_NOT_FOUND,
      ERRNO.PASSKEY_WRAP_CONFLICT,
      ERRNO.REQUEST_BLOCKED,
      ERRNO.FEATURE_NOT_ENABLED,
    ])('hands errno %i back as the error the UI can word', async (errno) => {
      const err = serverError(errno);
      createPasskeyWrapApiMock.mockRejectedValue(err);

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, error: err });
    });

    it('offers the sealed envelope back on a throttle, with its retryAfter', async () => {
      const err = serverError(ERRNO.THROTTLED, { code: 429, retryAfter: 900 });
      createPasskeyWrapApiMock.mockRejectedValue(err);

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        retryable: true,
        envelope: storedEnvelope(),
        error: err,
      });
      // A rate limit is not an expired proof, so it must not burn the step-up.
      expect(beginVerificationMock).not.toHaveBeenCalled();
    });

    it('hands an error without server fields back untouched', async () => {
      const err = new Error('network down');
      createPasskeyWrapApiMock.mockRejectedValue(err);

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, error: err });
    });
  });

  describe('expired proof', () => {
    const expired = () => serverError(ERRNO.INVALID_MFA_TOKEN);

    it('mints a fresh proof with a step-up pinned to the passkey and stores the same envelope', async () => {
      createPasskeyWrapApiMock
        .mockRejectedValueOnce(expired())
        .mockResolvedValueOnce({ created: true });

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: true, created: true });
      expect(beginVerificationMock).toHaveBeenCalledWith(MOCK_SESSION_TOKEN, {
        scope: 'passkey',
        credentialId: MOCK_CREDENTIAL_ID,
      });
      expect(completeVerificationMock).toHaveBeenCalledWith(
        MOCK_SESSION_TOKEN,
        { id: MOCK_CREDENTIAL_ID },
        'chal'
      );
      const [first, second] = createPasskeyWrapApiMock.mock.calls;
      expect(first[0]).toBe(MOCK_JWT);
      expect(second[0]).toBe(FRESH_JWT);
      expect(second[2]).toBe(first[2]);
    });

    it('retries once only', async () => {
      const again = expired();
      createPasskeyWrapApiMock.mockRejectedValue(again);

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, error: again });
      expect(createPasskeyWrapApiMock).toHaveBeenCalledTimes(2);
      expect(beginVerificationMock).toHaveBeenCalledTimes(1);
    });

    it('hands the sealed envelope back when the step-up prompt is dismissed', async () => {
      createPasskeyWrapApiMock.mockRejectedValue(expired());
      mockGetCredential.mockRejectedValue(
        new DOMException('cancelled', 'NotAllowedError')
      );

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        retryable: true,
        envelope: storedEnvelope(),
      });
      expect(createPasskeyWrapApiMock).toHaveBeenCalledTimes(1);
    });

    it('offers the envelope back when the store is throttled after the step-up', async () => {
      const throttled = serverError(ERRNO.THROTTLED, {
        code: 429,
        retryAfter: 900,
      });
      createPasskeyWrapApiMock
        .mockRejectedValueOnce(expired())
        .mockRejectedValueOnce(throttled);

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        retryable: true,
        envelope: storedEnvelope(),
        error: throttled,
      });
      expect(beginVerificationMock).toHaveBeenCalledTimes(1);
    });

    it('reports a failed store when the step-up prompt errors', async () => {
      createPasskeyWrapApiMock.mockRejectedValue(expired());
      mockGetCredential.mockRejectedValue(
        new DOMException('no', 'NotSupportedError')
      );

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        error: AuthUiErrors.UNEXPECTED_ERROR,
      });
    });

    it('does not step up without a session token', async () => {
      const err = expired();
      createPasskeyWrapApiMock.mockRejectedValue(err);

      const outcome = await createPasskeyWrap(authClient(), {
        ...args(),
        sessionToken: null,
      });

      expect(outcome).toEqual({ ok: false, error: err });
      expect(beginVerificationMock).not.toHaveBeenCalled();
    });
  });

  describe('platform crypto', () => {
    it('refuses to store an envelope this platform cannot reopen', async () => {
      // Only opening exercises the skR unwrap and HPKE decap.
      mockOpenWrapEnvelope.mockRejectedValue(new Error('decap failed'));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
      // Label only: the underlying message is not forwarded.
      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-seal error')
      );
    });

    it('refuses to store an envelope that reopens to the wrong bytes', async () => {
      mockOpenWrapEnvelope.mockResolvedValue(new Uint8Array(32).fill(1));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-seal error')
      );
    });

    it('refuses to store when the envelope cannot be built', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
    });
  });

  describe('inputs', () => {
    it.each([
      ['no PRF output', undefined],
      ['a zero-length PRF output', new Uint8Array(0)],
      ['a wrong-width PRF output', new Uint8Array(16).fill(9)],
    ])('refuses %s without calling the server', async (_label, prfOut) => {
      const outcome = await createPasskeyWrap(authClient(), {
        ...args(),
        prfOut,
      });

      expect(outcome).toEqual({ ok: false, failure: 'prf_unsupported' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
    });

    it.each([
      ['an all-zero kB', { kB: new Uint8Array(32) }],
      ['an all-zero PRF output', { prfOut: new Uint8Array(32) }],
    ])('refuses %s without sealing', async (_label, override) => {
      const outcome = await createPasskeyWrap(authClient(), {
        ...args(),
        ...override,
      });

      expect(outcome).toEqual({ ok: false, failure: 'key_unusable' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
    });

    it('refuses a retry with the buffers it already zeroed', async () => {
      const input = args();
      await createPasskeyWrap(authClient(), input);

      const outcome = await createPasskeyWrap(authClient(), input);

      expect(outcome).toEqual({ ok: false, failure: 'key_unusable' });
      expect(createPasskeyWrapApiMock).toHaveBeenCalledTimes(1);
    });

    it('leaves kB intact when the passkey cannot hold a wrap', async () => {
      const input = { ...args(), prfOut: undefined };

      await createPasskeyWrap(authClient(), input);

      expect(input.kB).toEqual(MOCK_KB);
    });

    it.each([
      ['a token with no payload segment', 'not-a-jwt'],
      ['a payload that is not JSON', 'header.bm90LWpzb24.signature'],
      ['a payload carrying no sub', mfaTokenFor({ scope: ['mfa:passkey'] })],
      ['a sub that is not a uid', mfaTokenFor({ sub: 'not-hex' })],
    ])('refuses %s without sealing', async (_label, mfaToken) => {
      const input = { ...args(), mfaToken };

      const outcome = await createPasskeyWrap(authClient(), input);

      expect(outcome).toEqual({ ok: false, failure: 'proof_malformed' });
      expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
      expect(input.kB).toEqual(MOCK_KB);
    });
  });

  describe('secret handling', () => {
    it('zeroes kB and the PRF output on success', async () => {
      const input = args();

      await createPasskeyWrap(authClient(), input);

      expect(input.kB).toEqual(ZEROED);
      expect(input.prfOut).toEqual(ZEROED);
    });

    it('zeroes kB and the PRF output when the server rejects the wrap', async () => {
      createPasskeyWrapApiMock.mockRejectedValue(
        serverError(ERRNO.INVALID_MFA_TOKEN)
      );
      const input = args();

      await createPasskeyWrap(authClient(), input);

      expect(input.kB).toEqual(ZEROED);
      expect(input.prfOut).toEqual(ZEROED);
    });

    it('zeroes kB and the PRF output when sealing fails', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));
      const input = args();

      await createPasskeyWrap(authClient(), input);

      expect(input.kB).toEqual(ZEROED);
      expect(input.prfOut).toEqual(ZEROED);
    });

    it('zeroes the round-trip copy of kB once compared', async () => {
      const recovered = Uint8Array.from(MOCK_KB);
      mockOpenWrapEnvelope.mockResolvedValue(recovered);

      await createPasskeyWrap(authClient(), args());

      expect(recovered).toEqual(ZEROED);
    });

    it('zeroes the round-trip copy of kB when it does not match', async () => {
      const recovered = new Uint8Array(32).fill(1);
      mockOpenWrapEnvelope.mockResolvedValue(recovered);

      await createPasskeyWrap(authClient(), args());

      expect(recovered).toEqual(ZEROED);
    });

    it('zeroes both before the request goes out', async () => {
      const input = args();
      let atRequest: { kB: Uint8Array; prfOut: Uint8Array } | undefined;
      createPasskeyWrapApiMock.mockImplementation(async () => {
        atRequest = {
          kB: Uint8Array.from(input.kB),
          prfOut: Uint8Array.from(input.prfOut),
        };
        return { created: true };
      });

      await createPasskeyWrap(authClient(), input);

      expect(atRequest).toEqual({ kB: ZEROED, prfOut: ZEROED });
    });
  });
});

describe('retryPasskeyWrapStore', () => {
  const envelope: PasskeyWrapEnvelope = {
    pkR: Uint8Array.of(1),
    prfWrappedSkR: Uint8Array.of(2),
    keyWrapIv: Uint8Array.of(3),
    hpkeEncapsulatedSecret: Uint8Array.of(4),
    hpkeSealedKb: Uint8Array.of(5),
  };
  const retry = () =>
    retryPasskeyWrapStore(
      authClient(),
      { credentialId: MOCK_CREDENTIAL_ID, sessionToken: MOCK_SESSION_TOKEN },
      envelope
    );

  it('stores the envelope it was given under a fresh proof', async () => {
    const outcome = await retry();

    expect(outcome).toEqual({ ok: true, created: true });
    expect(beginVerificationMock).toHaveBeenCalledTimes(1);
    expect(createPasskeyWrapApiMock).toHaveBeenCalledWith(
      FRESH_JWT,
      MOCK_CREDENTIAL_ID,
      envelope
    );
  });

  it('passes a refusal from the verification calls through with its errno', async () => {
    const err = serverError(ERRNO.INVALID_TOKEN);
    beginVerificationMock.mockRejectedValue(err);

    expect(await retry()).toEqual({ ok: false, error: err });
    expect(mockGetCredential).not.toHaveBeenCalled();
  });

  it('offers the same envelope again when the prompt is dismissed', async () => {
    mockGetCredential.mockRejectedValue(
      new DOMException('cancelled', 'NotAllowedError')
    );

    expect(await retry()).toEqual({
      ok: false,
      retryable: true,
      envelope,
    });
    expect(createPasskeyWrapApiMock).not.toHaveBeenCalled();
  });

  it('hands a server refusal back untouched', async () => {
    const err = serverError(ERRNO.PASSKEY_NOT_FOUND);
    createPasskeyWrapApiMock.mockRejectedValue(err);

    expect(await retry()).toEqual({ ok: false, error: err });
  });

  it('keeps the envelope when the verification call is rate limited', async () => {
    const err = serverError(ERRNO.THROTTLED, { retryAfter: 30 });
    beginVerificationMock.mockRejectedValue(err);

    expect(await retry()).toEqual({
      ok: false,
      retryable: true,
      envelope,
      error: err,
    });
  });
});
