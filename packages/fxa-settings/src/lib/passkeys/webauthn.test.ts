/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createCredential,
  getCredential,
  isWebAuthnLevel3Supported,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from './webauthn';

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Human-readable source bytes for the credential's binary fields. The browser
// returns these as ArrayBuffers; toCredentialJSON base64url-encodes them.
const SRC = {
  rawId: 'raw-id',
  clientDataJSON: 'client-data',
  attestationObject: 'attestation-object',
  authenticatorData: 'auth-data',
  signature: 'signature',
  userHandle: 'user-handle',
};

// credential.id is already a base64url string in the WebAuthn API; it passes
// through unchanged (it is not re-encoded from rawId).
const CRED_ID = 'mock-credential-id';

const enc = new TextEncoder();
const toBuf = (s: string): ArrayBuffer => enc.encode(s).buffer as ArrayBuffer;

// Reference base64url encoder built on Node's Buffer — deliberately a different
// implementation from production's btoa-based encoder, so equality assertions
// cross-check rather than tautologically mirror the code under test.
const b64url = (s: string): string =>
  Buffer.from(s, 'utf8').toString('base64url');

const mockCreationOptions: PublicKeyCredentialCreationOptionsJSON = {
  rp: { name: 'Mozilla Accounts', id: 'accounts.firefox.com' },
  user: {
    id: 'dXNlci1pZA',
    name: 'test@example.com',
    displayName: 'test@example.com',
  },
  challenge: 'Y2hhbGxlbmdl',
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
};

const mockRequestOptions: PublicKeyCredentialRequestOptionsJSON = {
  challenge: 'Y2hhbGxlbmdl',
  userVerification: 'required',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setupMockPKC(
  overrides: Record<string, unknown> = {}
): Record<string, jest.Mock> {
  class MockPublicKeyCredential {}
  const statics = {
    parseCreationOptionsFromJSON: jest.fn().mockReturnValue({}),
    parseRequestOptionsFromJSON: jest.fn().mockReturnValue({}),
    ...overrides,
  };
  Object.assign(MockPublicKeyCredential, statics);
  (global as any).PublicKeyCredential = MockPublicKeyCredential;
  return statics as Record<string, jest.Mock>;
}

type MockCredential = Record<string, unknown> & { toJSON: jest.Mock };

/**
 * Builds a credential mock mirroring what the browser returns: binary fields as
 * ArrayBuffers, an L2 getter for extension results, and a `toJSON` spy that the
 * code under test must NOT call (that native call is what crashes WebKit).
 */
function makeAttestationCredential(
  overrides: {
    clientExtensionResults?: Record<string, unknown>;
    authenticatorAttachment?: string;
    transports?: string[];
    omitGetTransports?: boolean;
  } = {}
): MockCredential {
  const response: Record<string, unknown> = {
    clientDataJSON: toBuf(SRC.clientDataJSON),
    attestationObject: toBuf(SRC.attestationObject),
  };
  if (!overrides.omitGetTransports) {
    response.getTransports = jest
      .fn()
      .mockReturnValue(overrides.transports ?? ['internal']);
  }
  return {
    id: CRED_ID,
    rawId: toBuf(SRC.rawId),
    type: 'public-key',
    ...(overrides.authenticatorAttachment
      ? { authenticatorAttachment: overrides.authenticatorAttachment }
      : {}),
    response,
    getClientExtensionResults: jest
      .fn()
      .mockReturnValue(overrides.clientExtensionResults ?? {}),
    toJSON: jest.fn(),
  };
}

function makeAssertionCredential(
  overrides: {
    clientExtensionResults?: Record<string, unknown>;
    omitUserHandle?: boolean;
  } = {}
): MockCredential {
  const response: Record<string, unknown> = {
    clientDataJSON: toBuf(SRC.clientDataJSON),
    authenticatorData: toBuf(SRC.authenticatorData),
    signature: toBuf(SRC.signature),
  };
  if (!overrides.omitUserHandle) {
    response.userHandle = toBuf(SRC.userHandle);
  }
  return {
    id: CRED_ID,
    rawId: toBuf(SRC.rawId),
    type: 'public-key',
    response,
    getClientExtensionResults: jest
      .fn()
      .mockReturnValue(overrides.clientExtensionResults ?? {}),
    toJSON: jest.fn(),
  };
}

function wireCredentials(credential: unknown): {
  mockCreate: jest.Mock;
  mockGet: jest.Mock;
} {
  const mockCreate = jest.fn().mockResolvedValue(credential);
  const mockGet = jest.fn().mockResolvedValue(credential);
  Object.defineProperty(global.navigator, 'credentials', {
    value: { create: mockCreate, get: mockGet },
    configurable: true,
    writable: true,
  });
  return { mockCreate, mockGet };
}

// ─── isWebAuthnLevel3Supported ──────────────────────────────────────────────────────

describe('isWebAuthnLevel3Supported', () => {
  afterEach(() => {
    (global as any).PublicKeyCredential = undefined;
  });

  it('returns false when PublicKeyCredential is absent', () => {
    (global as any).PublicKeyCredential = undefined;
    expect(isWebAuthnLevel3Supported()).toBe(false);
  });

  it('returns false when parseCreationOptionsFromJSON is missing', () => {
    (global as any).PublicKeyCredential = {
      parseRequestOptionsFromJSON: jest.fn(),
    };
    expect(isWebAuthnLevel3Supported()).toBe(false);
  });

  it('returns false when parseRequestOptionsFromJSON is missing', () => {
    (global as any).PublicKeyCredential = {
      parseCreationOptionsFromJSON: jest.fn(),
    };
    expect(isWebAuthnLevel3Supported()).toBe(false);
  });

  it('returns true when both JSON helpers are present', () => {
    setupMockPKC();
    expect(isWebAuthnLevel3Supported()).toBe(true);
  });
});

describe('createCredential', () => {
  let mockPKC: Record<string, jest.Mock>;
  let mockCreate: jest.Mock;
  let credential: MockCredential;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPKC = setupMockPKC();
    credential = makeAttestationCredential();
    ({ mockCreate } = wireCredentials(credential));
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).PublicKeyCredential = undefined;
  });

  it('serializes the attestation response to JSON', async () => {
    const result = await createCredential(mockCreationOptions);
    expect(result).toEqual({
      id: CRED_ID,
      rawId: b64url(SRC.rawId),
      type: 'public-key',
      response: {
        clientDataJSON: b64url(SRC.clientDataJSON),
        attestationObject: b64url(SRC.attestationObject),
        transports: ['internal'],
      },
      clientExtensionResults: {},
    });
  });

  it('does not call the native credential.toJSON()', async () => {
    // The native toJSON() is what crashes WebKit < 26.5.1 when a prf output is
    // present; serialization must go through the L2 getters instead.
    await createCredential(mockCreationOptions);
    expect(credential.toJSON).not.toHaveBeenCalled();
  });

  it('records the PRF enabled flag from getClientExtensionResults()', async () => {
    credential = makeAttestationCredential({
      clientExtensionResults: { prf: { enabled: true } },
    });
    ({ mockCreate } = wireCredentials(credential));
    const result = await createCredential(mockCreationOptions);
    expect(result.clientExtensionResults).toEqual({ prf: { enabled: true } });
  });

  it('omits transports when the authenticator exposes no getTransports()', async () => {
    credential = makeAttestationCredential({ omitGetTransports: true });
    ({ mockCreate } = wireCredentials(credential));
    const result = await createCredential(mockCreationOptions);
    expect(result.response).toEqual({
      clientDataJSON: b64url(SRC.clientDataJSON),
      attestationObject: b64url(SRC.attestationObject),
    });
  });

  it('includes authenticatorAttachment when the browser reports it', async () => {
    credential = makeAttestationCredential({
      authenticatorAttachment: 'platform',
    });
    ({ mockCreate } = wireCredentials(credential));
    const result = await createCredential(mockCreationOptions);
    expect(result.authenticatorAttachment).toBe('platform');
  });

  it('omits authenticatorAttachment when the browser does not report it', async () => {
    const result = await createCredential(mockCreationOptions);
    expect(result).not.toHaveProperty('authenticatorAttachment');
  });

  it('serializes a 1Password-style plain object without calling its toJSON', async () => {
    // 1Password returns a plain object (not a PublicKeyCredential) whose native
    // toJSON throws; manual serialization sidesteps it entirely.
    const plain = makeAttestationCredential();
    ({ mockCreate } = wireCredentials(plain));
    const result = await createCredential(mockCreationOptions);
    expect(result.id).toBe(CRED_ID);
    expect(plain.toJSON).not.toHaveBeenCalled();
  });

  it('throws UnknownError when create resolves null', async () => {
    mockCreate.mockResolvedValue(null);
    await expect(createCredential(mockCreationOptions)).rejects.toMatchObject({
      name: 'UnknownError',
      message: expect.stringContaining('returned null'),
    });
  });

  it('throws UnknownError when the response is neither attestation nor assertion', async () => {
    mockCreate.mockResolvedValue({
      id: CRED_ID,
      rawId: toBuf(SRC.rawId),
      type: 'public-key',
      response: {},
      getClientExtensionResults: () => ({}),
    });
    await expect(createCredential(mockCreationOptions)).rejects.toMatchObject({
      name: 'UnknownError',
      message: expect.stringContaining('unrecognized authenticator response'),
    });
  });

  it('passes parsed options and AbortSignal to navigator.credentials.create', async () => {
    await createCredential(mockCreationOptions);
    expect(mockPKC['parseCreationOptionsFromJSON']).toHaveBeenCalledWith(
      mockCreationOptions
    );
    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg).toHaveProperty('publicKey');
    expect(callArg.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws NotSupportedError when WebAuthn APIs are absent', async () => {
    (global as any).PublicKeyCredential = undefined;
    await expect(createCredential(mockCreationOptions)).rejects.toMatchObject({
      name: 'NotSupportedError',
    });
  });

  it('propagates DOMException from navigator.credentials.create', async () => {
    const err = new DOMException('User cancelled', 'NotAllowedError');
    mockCreate.mockRejectedValue(err);
    await expect(createCredential(mockCreationOptions)).rejects.toBe(err);
  });

  it('throws TimeoutError when the timeout elapses', async () => {
    mockCreate.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const promise = createCredential(mockCreationOptions, 1_000);
    jest.advanceTimersByTime(1_000);
    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('propagates AbortError when an external signal aborts before completion', async () => {
    mockCreate.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const externalController = new AbortController();
    const promise = createCredential(
      mockCreationOptions,
      undefined,
      externalController.signal
    );
    externalController.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects immediately when the external signal is already aborted', async () => {
    // Real browsers reject navigator.credentials.create() synchronously when
    // passed an already-aborted signal; mirror that behaviour in the mock.
    mockCreate.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      if (signal.aborted) {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      }
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const externalController = new AbortController();
    externalController.abort();
    await expect(
      createCredential(
        mockCreationOptions,
        undefined,
        externalController.signal
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('clears the timeout after successful credential creation', async () => {
    const spy = jest.spyOn(global, 'clearTimeout');
    await createCredential(mockCreationOptions);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('clears the timeout after a failed credential creation', async () => {
    const spy = jest.spyOn(global, 'clearTimeout');
    mockCreate.mockRejectedValue(new DOMException('Fail', 'NotAllowedError'));
    await expect(createCredential(mockCreationOptions)).rejects.toBeDefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('getCredential', () => {
  let mockPKC: Record<string, jest.Mock>;
  let mockGet: jest.Mock;
  let credential: MockCredential;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPKC = setupMockPKC();
    credential = makeAssertionCredential();
    ({ mockGet } = wireCredentials(credential));
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).PublicKeyCredential = undefined;
  });

  it('serializes the assertion response to JSON', async () => {
    const result = await getCredential(mockRequestOptions);
    expect(result).toEqual({
      id: CRED_ID,
      rawId: b64url(SRC.rawId),
      type: 'public-key',
      response: {
        clientDataJSON: b64url(SRC.clientDataJSON),
        authenticatorData: b64url(SRC.authenticatorData),
        signature: b64url(SRC.signature),
        userHandle: b64url(SRC.userHandle),
      },
      clientExtensionResults: {},
    });
  });

  it('does not call the native credential.toJSON()', async () => {
    // The assertion path serializes a prf output during Phase-2 sign-in; the
    // native toJSON() would crash WebKit < 26.5.1 there too.
    await getCredential(mockRequestOptions);
    expect(credential.toJSON).not.toHaveBeenCalled();
  });

  it('omits userHandle when the authenticator does not return one', async () => {
    credential = makeAssertionCredential({ omitUserHandle: true });
    ({ mockGet } = wireCredentials(credential));
    const result = await getCredential(mockRequestOptions);
    expect(result.response).not.toHaveProperty('userHandle');
  });

  it('throws UnknownError when get resolves null', async () => {
    mockGet.mockResolvedValue(null);
    await expect(getCredential(mockRequestOptions)).rejects.toMatchObject({
      name: 'UnknownError',
      message: expect.stringContaining('returned null'),
    });
  });

  it('passes parsed options and AbortSignal to navigator.credentials.get', async () => {
    await getCredential(mockRequestOptions);
    expect(mockPKC['parseRequestOptionsFromJSON']).toHaveBeenCalledWith(
      mockRequestOptions
    );
    const callArg = mockGet.mock.calls[0][0];
    expect(callArg).toHaveProperty('publicKey');
    expect(callArg.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws NotSupportedError when WebAuthn APIs are absent', async () => {
    (global as any).PublicKeyCredential = undefined;
    await expect(getCredential(mockRequestOptions)).rejects.toMatchObject({
      name: 'NotSupportedError',
    });
  });

  it('propagates DOMException from navigator.credentials.get', async () => {
    const err = new DOMException('User cancelled', 'NotAllowedError');
    mockGet.mockRejectedValue(err);
    await expect(getCredential(mockRequestOptions)).rejects.toBe(err);
  });

  it('throws TimeoutError when the timeout elapses', async () => {
    mockGet.mockImplementation(({ signal }: { signal: AbortSignal }) => {
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    const promise = getCredential(mockRequestOptions, 1_000);
    jest.advanceTimersByTime(1_000);
    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('clears the timeout after successful credential retrieval', async () => {
    const spy = jest.spyOn(global, 'clearTimeout');
    await getCredential(mockRequestOptions);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('clears the timeout after a failed credential retrieval', async () => {
    const spy = jest.spyOn(global, 'clearTimeout');
    mockGet.mockRejectedValue(new DOMException('Fail', 'NotAllowedError'));
    await expect(getCredential(mockRequestOptions)).rejects.toBeDefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
