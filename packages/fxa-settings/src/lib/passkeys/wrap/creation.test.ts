/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { createPasskeyWrap, type PasskeyWrapFailure } from './creation';
import { bytesToBase64url } from '../../base64url';
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

/** Unsigned: only `sub` is read; verification is the server's. */
const mfaTokenFor = (claims: Record<string, unknown>) =>
  [
    'header',
    bytesToBase64url(new TextEncoder().encode(JSON.stringify(claims))),
    'signature',
  ].join('.');
const MOCK_JWT = mfaTokenFor({ sub: MOCK_UID });

let createPasskeyWrapMock: jest.MockedFunction<AuthClient['createPasskeyWrap']>;
const authClient = () => ({ createPasskeyWrap: createPasskeyWrapMock });

/** Fresh buffers per call: they are zeroed once sealing has been tried. */
const args = () => ({
  credentialId: MOCK_CREDENTIAL_ID,
  mfaToken: MOCK_JWT,
  prfOut: Uint8Array.from(MOCK_PRF_OUT),
  kB: Uint8Array.from(MOCK_KB),
});

const serverError = (errno: number, extra: Record<string, unknown> = {}) =>
  Object.assign(new Error('nope'), { errno, ...extra });

const storedEnvelope = () => createPasskeyWrapMock.mock.calls[0][2];

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
  createPasskeyWrapMock = jest.fn().mockResolvedValue({ created: true });
  mockCreateWrapEnvelope.mockImplementation(realCrypto().createWrapEnvelope);
  mockOpenWrapEnvelope.mockImplementation(realCrypto().openWrapEnvelope);
});

describe('createPasskeyWrap', () => {
  it('stores one envelope for the credential, authorized by the proof', async () => {
    await createPasskeyWrap(authClient(), args());

    expect(createPasskeyWrapMock).toHaveBeenCalledTimes(1);
    const [jwt, credentialId] = createPasskeyWrapMock.mock.calls[0];
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
    createPasskeyWrapMock.mockResolvedValue({ created });

    const outcome = await createPasskeyWrap(authClient(), args());

    expect(outcome).toEqual({ ok: true, created });
  });

  describe('server failures', () => {
    it.each<[number, PasskeyWrapFailure]>([
      [ERRNO.INVALID_MFA_TOKEN, 'proof_invalid'],
      [ERRNO.INVALID_TOKEN, 'proof_invalid'],
      [ERRNO.PASSKEY_NOT_FOUND, 'passkey_not_found'],
      [ERRNO.PASSKEY_WRAP_CONFLICT, 'wrap_conflict'],
      [ERRNO.THROTTLED, 'throttled'],
      [ERRNO.REQUEST_BLOCKED, 'throttled'],
      [ERRNO.FEATURE_NOT_ENABLED, 'feature_disabled'],
      [ERRNO.UNEXPECTED_ERROR, 'unexpected'],
    ])('maps errno %i to %s', async (errno, failure) => {
      createPasskeyWrapMock.mockRejectedValue(serverError(errno));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        failure,
        cause: { errno, code: undefined, retryAfter: undefined },
      });
    });

    it('carries retryAfter through on a throttle so callers can back off', async () => {
      createPasskeyWrapMock.mockRejectedValue(
        serverError(ERRNO.THROTTLED, { code: 429, retryAfter: 900 })
      );

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({
        ok: false,
        failure: 'throttled',
        cause: { errno: ERRNO.THROTTLED, code: 429, retryAfter: 900 },
      });
    });

    it('maps an error without server fields to unexpected, with no cause', async () => {
      createPasskeyWrapMock.mockRejectedValue(new Error('network down'));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'unexpected' });
    });

    it('reports an unmapped failure to Sentry, tagged with its errno', async () => {
      createPasskeyWrapMock.mockRejectedValue(
        serverError(ERRNO.UNEXPECTED_ERROR)
      );

      await createPasskeyWrap(authClient(), args());

      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-store error'),
        { tags: { errno: String(ERRNO.UNEXPECTED_ERROR) } }
      );
    });

    it.each([
      ERRNO.PASSKEY_WRAP_CONFLICT,
      ERRNO.THROTTLED,
      ERRNO.INVALID_MFA_TOKEN,
    ])('keeps errno %i out of Sentry', async (errno) => {
      createPasskeyWrapMock.mockRejectedValue(serverError(errno));

      await createPasskeyWrap(authClient(), args());

      expect(mockCaptureException).not.toHaveBeenCalled();
    });
  });

  describe('platform crypto', () => {
    it('refuses to store an envelope this platform cannot reopen', async () => {
      // Only opening exercises the skR unwrap and HPKE decap.
      mockOpenWrapEnvelope.mockRejectedValue(new Error('decap failed'));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapMock).not.toHaveBeenCalled();
      // Label only: the underlying message is not forwarded.
      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-seal error')
      );
    });

    it('refuses to store an envelope that reopens to the wrong bytes', async () => {
      mockOpenWrapEnvelope.mockResolvedValue(new Uint8Array(32).fill(1));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapMock).not.toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(
        new Error('passkey-wrap-seal error')
      );
    });

    it('refuses to store when the envelope cannot be built', async () => {
      mockCreateWrapEnvelope.mockRejectedValue(new Error('seal failed'));

      const outcome = await createPasskeyWrap(authClient(), args());

      expect(outcome).toEqual({ ok: false, failure: 'platform_crypto' });
      expect(createPasskeyWrapMock).not.toHaveBeenCalled();
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
      expect(createPasskeyWrapMock).not.toHaveBeenCalled();
    });

    it('leaves kB intact when the passkey cannot hold a wrap', async () => {
      const input = { ...args(), prfOut: undefined };

      await createPasskeyWrap(authClient(), input);

      expect(input.kB).toEqual(MOCK_KB);
    });

    it('throws on a wrong-width kB', async () => {
      await expect(
        createPasskeyWrap(authClient(), {
          ...args(),
          kB: new Uint8Array(16).fill(7),
        })
      ).rejects.toThrow('kB must be 32 bytes');
    });

    it.each([
      ['a token with no payload segment', 'not-a-jwt'],
      ['a payload that is not JSON', 'header.bm90LWpzb24.signature'],
      ['a payload carrying no sub', mfaTokenFor({ scope: ['mfa:passkey'] })],
      ['a sub that is not a uid', mfaTokenFor({ sub: 'not-hex' })],
    ])('refuses %s without sealing', async (_label, mfaToken) => {
      const input = { ...args(), mfaToken };

      const outcome = await createPasskeyWrap(authClient(), input);

      expect(outcome).toEqual({ ok: false, failure: 'proof_invalid' });
      expect(createPasskeyWrapMock).not.toHaveBeenCalled();
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
      createPasskeyWrapMock.mockRejectedValue(
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

    it('zeroes both before the request goes out', async () => {
      const input = args();
      let atRequest: { kB: Uint8Array; prfOut: Uint8Array } | undefined;
      createPasskeyWrapMock.mockImplementation(async () => {
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
