/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createCredentialWithPrfFallback,
  getCredentialWithPrfFallback,
  extractPrfSupport,
  isRetriableWithoutPrf,
  stripPrfExtension,
  stripPrfResults,
} from './prf-fallback';
import { createCredential, getCredential } from './webauthn';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  PublicKeyCredentialJSON,
} from './webauthn';

// Mock the WebAuthn ceremony boundary so the wrapper's retry decision and
// option-stripping are exercised without a real navigator.credentials.create.
jest.mock('./webauthn');
const mockCreateCredential = createCredential as jest.MockedFunction<
  typeof createCredential
>;
const mockGetCredential = getCredential as jest.MockedFunction<
  typeof getCredential
>;

const PRF_SALT = 'dGVzdC1wcmYtc2FsdA';

const optionsWithPrf: PublicKeyCredentialCreationOptionsJSON = {
  rp: { name: 'Mozilla Accounts', id: 'accounts.firefox.com' },
  user: {
    id: 'dXNlci1pZA',
    name: 'test@example.com',
    displayName: 'test@example.com',
  },
  challenge: 'Y2hhbGxlbmdl',
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  extensions: { prf: { eval: { first: PRF_SALT } } },
};

const credentialResult: PublicKeyCredentialJSON = {
  id: 'bW9jay1pZA',
  rawId: 'bW9jay1yYXctaWQ',
  type: 'public-key',
  response: {
    clientDataJSON: 'bW9jay1jbGllbnQtZGF0YQ',
    attestationObject: 'bW9jay1hdHRlc3RhdGlvbg',
  },
  clientExtensionResults: {},
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('stripPrfExtension', () => {
  it('removes the prf extension while preserving other extensions', () => {
    const stripped = stripPrfExtension({
      ...optionsWithPrf,
      extensions: { prf: { eval: { first: PRF_SALT } }, credProps: true },
    });
    expect(stripped.extensions).toEqual({ credProps: true });
  });

  it('drops the extensions object entirely when prf was the only extension', () => {
    const stripped = stripPrfExtension(optionsWithPrf);
    expect(stripped.extensions).toBeUndefined();
  });

  it('returns the same reference when there is no prf extension', () => {
    const noPrf: PublicKeyCredentialCreationOptionsJSON = {
      ...optionsWithPrf,
      extensions: undefined,
    };
    expect(stripPrfExtension(noPrf)).toBe(noPrf);
  });
});

describe('isRetriableWithoutPrf', () => {
  it('returns true for an UnknownError DOMException (the Windows Hello PRF signature)', () => {
    expect(
      isRetriableWithoutPrf(new DOMException('boom', 'UnknownError'))
    ).toBe(true);
  });

  it.each([
    // Other "unexpected" names — not the known PRF signature, so not retried.
    'OperationError',
    'DataError',
    'EncodingError',
    'ConstraintError',
    'SomeFutureError',
    // User-action and device/platform names.
    'NotAllowedError',
    'AbortError',
    'TimeoutError',
    'SecurityError',
    'NotSupportedError',
    'NotReadableError',
  ])('returns false for a non-UnknownError DOMException %s', (name) => {
    expect(isRetriableWithoutPrf(new DOMException('boom', name))).toBe(false);
  });

  it('returns false for a non-DOMException error', () => {
    expect(isRetriableWithoutPrf(new TypeError('boom'))).toBe(false);
    expect(isRetriableWithoutPrf(new Error('boom'))).toBe(false);
  });
});

describe('createCredentialWithPrfFallback', () => {
  it('returns the credential without retrying when the first attempt succeeds', async () => {
    mockCreateCredential.mockResolvedValueOnce(credentialResult);

    const result = await createCredentialWithPrfFallback(optionsWithPrf);

    expect(result).toBe(credentialResult);
    expect(mockCreateCredential).toHaveBeenCalledTimes(1);
  });

  it('retries once without the prf extension when the first attempt fails with an unexpected error', async () => {
    // Freeze the clock so no time elapses between attempts — the retry then
    // receives the full remaining budget.
    jest.useFakeTimers();
    try {
      const signal = new AbortController().signal;
      mockCreateCredential
        .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
        .mockResolvedValueOnce(credentialResult);

      const result = await createCredentialWithPrfFallback(
        optionsWithPrf,
        1234,
        signal
      );

      expect(result).toBe(credentialResult);
      expect(mockCreateCredential).toHaveBeenCalledTimes(2);
      // The retry forwards the signal and the (full) remaining timeout, with
      // the prf extension dropped.
      const [retryOptions, retryTimeout, retrySignal] =
        mockCreateCredential.mock.calls[1];
      expect(retryTimeout).toBe(1234);
      expect(retrySignal).toBe(signal);
      expect(retryOptions.extensions?.prf).toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  it('bounds the retry to the time remaining in the original timeout', async () => {
    jest.useFakeTimers();
    try {
      // First attempt "consumes" 400ms of the 1000ms budget before failing.
      mockCreateCredential
        .mockImplementationOnce(() => {
          jest.advanceTimersByTime(400);
          return Promise.reject(new DOMException('transient', 'UnknownError'));
        })
        .mockResolvedValueOnce(credentialResult);

      await createCredentialWithPrfFallback(optionsWithPrf, 1000);

      const [, retryTimeout] = mockCreateCredential.mock.calls[1];
      expect(retryTimeout).toBe(600);
    } finally {
      jest.useRealTimers();
    }
  });

  it('skips the retry and rethrows the original error when no timeout budget remains', async () => {
    jest.useFakeTimers();
    try {
      const unknownError = new DOMException('boom', 'UnknownError');
      // First attempt consumes the whole budget before failing, so a retry
      // would get timeoutMs=0 and abort immediately, masking the real error.
      mockCreateCredential.mockImplementationOnce(() => {
        jest.advanceTimersByTime(1000);
        return Promise.reject(unknownError);
      });

      await expect(
        createCredentialWithPrfFallback(optionsWithPrf, 1000)
      ).rejects.toBe(unknownError);
      expect(mockCreateCredential).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not retry when the error is retriable but the options carried no prf', async () => {
    const noPrf: PublicKeyCredentialCreationOptionsJSON = {
      ...optionsWithPrf,
      extensions: undefined,
    };
    mockCreateCredential.mockRejectedValueOnce(
      new DOMException('transient', 'UnknownError')
    );

    await expect(createCredentialWithPrfFallback(noPrf)).rejects.toThrow(
      'transient'
    );
    expect(mockCreateCredential).toHaveBeenCalledTimes(1);
  });

  it('does not retry on a user-action error and rethrows it', async () => {
    const cancel = new DOMException('cancelled', 'NotAllowedError');
    mockCreateCredential.mockRejectedValueOnce(cancel);

    await expect(createCredentialWithPrfFallback(optionsWithPrf)).rejects.toBe(
      cancel
    );
    expect(mockCreateCredential).toHaveBeenCalledTimes(1);
  });

  it('surfaces the retry error when the second attempt also fails', async () => {
    const second = new DOMException('still broken', 'UnknownError');
    mockCreateCredential
      .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
      .mockRejectedValueOnce(second);

    await expect(createCredentialWithPrfFallback(optionsWithPrf)).rejects.toBe(
      second
    );
    expect(mockCreateCredential).toHaveBeenCalledTimes(2);
  });

  it('reports a successful retry to onPrfFallback with the triggering error name', async () => {
    const onPrfFallback = jest.fn();
    mockCreateCredential
      .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
      .mockResolvedValueOnce(credentialResult);

    await createCredentialWithPrfFallback(
      optionsWithPrf,
      undefined,
      undefined,
      onPrfFallback
    );

    expect(onPrfFallback).toHaveBeenCalledTimes(1);
    expect(onPrfFallback).toHaveBeenCalledWith({
      reason: 'UnknownError',
      outcome: 'success',
    });
  });

  it('reports a failed retry to onPrfFallback with the triggering error name', async () => {
    const onPrfFallback = jest.fn();
    mockCreateCredential
      .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
      .mockRejectedValueOnce(new DOMException('still broken', 'UnknownError'));

    await expect(
      createCredentialWithPrfFallback(
        optionsWithPrf,
        undefined,
        undefined,
        onPrfFallback
      )
    ).rejects.toThrow('still broken');

    expect(onPrfFallback).toHaveBeenCalledTimes(1);
    expect(onPrfFallback).toHaveBeenCalledWith({
      reason: 'UnknownError',
      outcome: 'failure',
    });
  });

  it('does not retry a non-UnknownError unexpected error even when prf was requested', async () => {
    const onPrfFallback = jest.fn();
    const operationError = new DOMException('boom', 'OperationError');
    mockCreateCredential.mockRejectedValueOnce(operationError);

    await expect(
      createCredentialWithPrfFallback(
        optionsWithPrf,
        undefined,
        undefined,
        onPrfFallback
      )
    ).rejects.toBe(operationError);
    expect(mockCreateCredential).toHaveBeenCalledTimes(1);
    expect(onPrfFallback).not.toHaveBeenCalled();
  });

  it('does not invoke onPrfFallback when the first attempt succeeds', async () => {
    const onPrfFallback = jest.fn();
    mockCreateCredential.mockResolvedValueOnce(credentialResult);

    await createCredentialWithPrfFallback(
      optionsWithPrf,
      undefined,
      undefined,
      onPrfFallback
    );

    expect(onPrfFallback).not.toHaveBeenCalled();
  });
});

const requestOptionsWithPrf: PublicKeyCredentialRequestOptionsJSON = {
  challenge: 'Y2hhbGxlbmdl',
  userVerification: 'required',
  extensions: { prf: { eval: { first: PRF_SALT } } },
};

const assertionResult: PublicKeyCredentialJSON = {
  id: 'bW9jay1pZA',
  rawId: 'bW9jay1yYXctaWQ',
  type: 'public-key',
  response: {
    clientDataJSON: 'bW9jay1jbGllbnQtZGF0YQ',
    authenticatorData: 'bW9jay1hdXRoLWRhdGE',
    signature: 'bW9jay1zaWduYXR1cmU',
  },
  clientExtensionResults: {},
};

const assertionWithPrfOutput: PublicKeyCredentialJSON = {
  ...assertionResult,
  clientExtensionResults: { prf: { results: { first: new ArrayBuffer(32) } } },
};

describe('getCredentialWithPrfFallback', () => {
  it('returns the credential from the first attempt without retrying on success', async () => {
    mockGetCredential.mockResolvedValueOnce(assertionWithPrfOutput);

    const result = await getCredentialWithPrfFallback(requestOptionsWithPrf);

    expect(result).toBe(assertionWithPrfOutput);
    expect(mockGetCredential).toHaveBeenCalledTimes(1);
  });

  it('retries once without PRF on a retriable UnknownError', async () => {
    mockGetCredential
      .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
      .mockResolvedValueOnce(assertionResult);

    const result = await getCredentialWithPrfFallback(requestOptionsWithPrf);

    expect(result).toBe(assertionResult);
    expect(mockGetCredential).toHaveBeenCalledTimes(2);
    const [retriedOptions] = mockGetCredential.mock.calls[1];
    expect(retriedOptions.extensions ?? {}).not.toHaveProperty('prf');
  });

  it('does not retry when the options carried no PRF extension', async () => {
    const noPrf: PublicKeyCredentialRequestOptionsJSON = {
      ...requestOptionsWithPrf,
      extensions: undefined,
    };
    mockGetCredential.mockRejectedValueOnce(
      new DOMException('transient', 'UnknownError')
    );

    await expect(getCredentialWithPrfFallback(noPrf)).rejects.toThrow(
      'transient'
    );
    expect(mockGetCredential).toHaveBeenCalledTimes(1);
  });

  it('does not retry a user-cancel (NotAllowedError) and rethrows it', async () => {
    const cancel = new DOMException('cancelled', 'NotAllowedError');
    mockGetCredential.mockRejectedValueOnce(cancel);

    await expect(
      getCredentialWithPrfFallback(requestOptionsWithPrf)
    ).rejects.toBe(cancel);
    expect(mockGetCredential).toHaveBeenCalledTimes(1);
  });

  it('reports the retry outcome to onPrfFallback', async () => {
    const onPrfFallback = jest.fn();
    mockGetCredential
      .mockRejectedValueOnce(new DOMException('transient', 'UnknownError'))
      .mockResolvedValueOnce(assertionResult);

    await getCredentialWithPrfFallback(
      requestOptionsWithPrf,
      undefined,
      onPrfFallback
    );

    expect(onPrfFallback).toHaveBeenCalledWith({
      reason: 'UnknownError',
      outcome: 'success',
    });
  });
});

describe('extractPrfSupport', () => {
  it('returns true when the get() output carries a PRF result', () => {
    expect(extractPrfSupport(assertionWithPrfOutput)).toBe(true);
  });

  it('returns false when there is no PRF result', () => {
    expect(extractPrfSupport(assertionResult)).toBe(false);
  });

  it('returns false when prf is present but results are absent', () => {
    expect(
      extractPrfSupport({
        ...assertionResult,
        clientExtensionResults: { prf: {} },
      })
    ).toBe(false);
  });
});

describe('stripPrfResults', () => {
  it('removes the prf results from clientExtensionResults', () => {
    const stripped = stripPrfResults(assertionWithPrfOutput);
    expect(stripped.clientExtensionResults).not.toHaveProperty('prf');
  });

  it('preserves other clientExtensionResults entries', () => {
    const stripped = stripPrfResults({
      ...assertionResult,
      clientExtensionResults: {
        prf: { results: { first: new ArrayBuffer(8) } },
        credProps: { rk: true },
      },
    });
    expect(stripped.clientExtensionResults).toEqual({
      credProps: { rk: true },
    });
  });

  it('returns the same reference when there is no prf result', () => {
    expect(stripPrfResults(assertionResult)).toBe(assertionResult);
  });
});
