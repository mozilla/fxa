/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isRetriableWithoutPrf, stripPrfExtension } from './prf-fallback';
import type { PublicKeyCredentialCreationOptionsJSON } from './webauthn';

const baseOptions: PublicKeyCredentialCreationOptionsJSON = {
  rp: { name: 'Mozilla Accounts', id: 'accounts.firefox.com' },
  user: {
    id: 'dXNlci1pZA',
    name: 'test@example.com',
    displayName: 'test@example.com',
  },
  challenge: 'Y2hhbGxlbmdl',
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
};

describe('isRetriableWithoutPrf', () => {
  // Retriable: "unexpected" ceremony failures — the class a browser produces
  // when it chokes on the optional PRF probe rather than ignoring it.
  it.each(['UnknownError', 'OperationError', 'DataError', 'EncodingError'])(
    'returns true for a %s DOMException (unexpected ceremony failure)',
    (name) => {
      expect(isRetriableWithoutPrf(new DOMException('failed', name))).toBe(
        true
      );
    }
  );

  it('returns true for an unrecognized DOMException name', () => {
    expect(isRetriableWithoutPrf(new DOMException('weird', 'WeirdError'))).toBe(
      true
    );
  });

  // Not retriable: user-action errors must never trigger a silent re-prompt.
  it.each(['NotAllowedError', 'AbortError', 'TimeoutError'])(
    'returns false for a %s DOMException (user action)',
    (name) => {
      expect(isRetriableWithoutPrf(new DOMException('cancel', name))).toBe(
        false
      );
    }
  );

  // Not retriable: device/platform errors dropping PRF won't fix, and which
  // have better specific messages.
  it.each(['NotSupportedError', 'SecurityError', 'InvalidStateError'])(
    'returns false for a %s DOMException (device/platform)',
    (name) => {
      expect(isRetriableWithoutPrf(new DOMException('nope', name))).toBe(false);
    }
  );

  it('returns false for a non-DOMException error (e.g. password-manager plain Error)', () => {
    expect(isRetriableWithoutPrf(new TypeError('boom'))).toBe(false);
    expect(isRetriableWithoutPrf(new Error('cancelled'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isRetriableWithoutPrf(null)).toBe(false);
  });
});

describe('stripPrfExtension', () => {
  it('drops the extensions object when prf was the only extension', () => {
    const result = stripPrfExtension({
      ...baseOptions,
      extensions: { prf: {} },
    });
    expect(result.extensions).toBeUndefined();
  });

  it('removes prf but preserves other extensions', () => {
    const result = stripPrfExtension({
      ...baseOptions,
      extensions: { credProps: true, prf: { eval: { first: 'c2FsdA' } } },
    });
    expect(result.extensions).toEqual({ credProps: true });
  });

  it('returns the same object reference when there is no prf extension', () => {
    const options = { ...baseOptions, extensions: { credProps: true } };
    expect(stripPrfExtension(options)).toBe(options);
  });

  it('returns the same object reference when there are no extensions', () => {
    expect(stripPrfExtension(baseOptions)).toBe(baseOptions);
  });

  it('does not mutate the input options', () => {
    const options = { ...baseOptions, extensions: { prf: {} } };
    stripPrfExtension(options);
    expect(options.extensions).toEqual({ prf: {} });
  });
});
