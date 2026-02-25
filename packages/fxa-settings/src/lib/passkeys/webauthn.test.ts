/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createCredential,
  getCredential,
  isWebAuthnLevel3Supported,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from './webauthn';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockCredentialJSON: PublicKeyCredentialJSON = {
  id: 'bW9jay1pZA',
  rawId: 'bW9jay1yYXctaWQ',
  type: 'public-key',
  response: {
    clientDataJSON: 'bW9jay1jbGllbnQtZGF0YQ',
    attestationObject: 'bW9jay1hdHRlc3RhdGlvbg',
  },
  clientExtensionResults: {},
};

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
  // Use a class so that mockCredential instances pass `instanceof PublicKeyCredential`.
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

function setupMockCredentials(result: PublicKeyCredentialJSON): {
  mockCreate: jest.Mock;
  mockGet: jest.Mock;
} {
  // Create an instance of the mock class so `instanceof PublicKeyCredential` passes.
  const MockPKC = (global as any).PublicKeyCredential as { prototype: object };
  const mockCredential = Object.create(MockPKC.prototype);
  mockCredential.toJSON = jest.fn().mockReturnValue(result);

  const mockCreate = jest.fn().mockResolvedValue(mockCredential);
  const mockGet = jest.fn().mockResolvedValue(mockCredential);

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

// ─── createCredential ─────────────────────────────────────────────────────────

describe('createCredential', () => {
  let mockPKC: Record<string, jest.Mock>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPKC = setupMockPKC();
    ({ mockCreate } = setupMockCredentials(mockCredentialJSON));
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).PublicKeyCredential = undefined;
  });

  it('resolves with credential JSON on success', async () => {
    const result = await createCredential(mockCreationOptions);
    expect(result).toEqual(mockCredentialJSON);
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

// ─── getCredential ────────────────────────────────────────────────────────────

describe('getCredential', () => {
  let mockPKC: Record<string, jest.Mock>;
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPKC = setupMockPKC();
    ({ mockGet } = setupMockCredentials(mockCredentialJSON));
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).PublicKeyCredential = undefined;
  });

  it('resolves with credential JSON on success', async () => {
    const result = await getCredential(mockRequestOptions);
    expect(result).toEqual(mockCredentialJSON);
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
