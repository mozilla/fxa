/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  derivePrfOutput,
  VirtualAuthenticator,
  type VirtualCeremonyExtensions,
  type VirtualCredential,
} from './virtual-authenticator';

const TEST_RP_ID = 'accounts.firefox.com';
const TEST_ORIGIN = 'https://accounts.firefox.com';
const TEST_CHALLENGE = Buffer.alloc(32, 0xbb).toString('base64url');
// base64url of "test-prf-salt" — the dev-config PRF salt, not the production one.
const TEST_PRF_SALT = 'dGVzdC1wcmYtc2FsdA';
// base64url of "other-prf-salt".
const OTHER_PRF_SALT = 'b3RoZXItcHJmLXNhbHQ';

const CEREMONY = {
  challenge: TEST_CHALLENGE,
  origin: TEST_ORIGIN,
  rpId: TEST_RP_ID,
};

const PRF_REQUESTED: VirtualCeremonyExtensions = {
  prf: { eval: { first: TEST_PRF_SALT } },
};

type PrfOutput = {
  enabled?: boolean;
  results?: { first?: string };
};

function prfOutput(extensionResults: unknown): PrfOutput | undefined {
  return (extensionResults as { prf?: PrfOutput }).prf;
}

function assertionPrf(
  cred: VirtualCredential,
  extensions?: VirtualCeremonyExtensions
) {
  return prfOutput(
    VirtualAuthenticator.createAssertionResponse(cred, {
      ...CEREMONY,
      extensions,
    }).clientExtensionResults
  );
}

function attestationPrf(
  cred: VirtualCredential,
  extensions?: VirtualCeremonyExtensions
) {
  return prfOutput(
    VirtualAuthenticator.createAttestationResponse(cred, {
      ...CEREMONY,
      extensions,
    }).clientExtensionResults
  );
}

function expectedOutput(cred: VirtualCredential, salt: string) {
  return derivePrfOutput(cred, salt).toString('base64url');
}

describe('VirtualAuthenticator PRF outputs', () => {
  let cred: VirtualCredential;

  beforeEach(() => {
    cred = VirtualAuthenticator.createCredential();
  });

  describe('when the ceremony does not request PRF', () => {
    it('reports no prf output on an assertion', () => {
      const response = VirtualAuthenticator.createAssertionResponse(
        cred,
        CEREMONY
      );
      expect(response.clientExtensionResults).toEqual({});
    });

    it('reports no prf output on an attestation', () => {
      const response = VirtualAuthenticator.createAttestationResponse(
        cred,
        CEREMONY
      );
      expect(response.clientExtensionResults).toEqual({});
    });

    it('reports no prf output when extensions omit prf', () => {
      const response = VirtualAuthenticator.createAssertionResponse(cred, {
        ...CEREMONY,
        extensions: {},
      });
      expect(response.clientExtensionResults).toEqual({});
    });
  });

  describe('registration', () => {
    it('reports PRF capability without an output', () => {
      expect(attestationPrf(cred, PRF_REQUESTED)).toEqual({ enabled: true });
    });

    it('reports PRF capability when no salt was supplied', () => {
      expect(attestationPrf(cred, { prf: {} })).toEqual({ enabled: true });
    });
  });

  describe('authentication', () => {
    it('returns the derived output for the evaluated salt', () => {
      expect(assertionPrf(cred, PRF_REQUESTED)).toEqual({
        results: { first: expectedOutput(cred, TEST_PRF_SALT) },
      });
    });

    it('omits the capability flag, which is a registration-time output', () => {
      expect(assertionPrf(cred, PRF_REQUESTED)).not.toHaveProperty('enabled');
    });

    it('returns no output when the eval carries no salt', () => {
      // Malformed per spec, but easy for a test to construct, so a missing
      // salt has to yield no output rather than throwing.
      const response = VirtualAuthenticator.createAssertionResponse(cred, {
        ...CEREMONY,
        extensions: {
          prf: { eval: {} },
        } as unknown as VirtualCeremonyExtensions,
      });
      expect(response.clientExtensionResults).toEqual({});
    });

    it('returns no output when no salt was supplied', () => {
      const response = VirtualAuthenticator.createAssertionResponse(cred, {
        ...CEREMONY,
        extensions: { prf: {} },
      });
      expect(response.clientExtensionResults).toEqual({});
    });

    it('returns the same output for repeated assertions', () => {
      // Pinned to a value so two absent outputs can't pass vacuously; the
      // sign-count bump between calls is what's under test.
      const expected = {
        results: { first: expectedOutput(cred, TEST_PRF_SALT) },
      };
      expect(assertionPrf(cred, PRF_REQUESTED)).toEqual(expected);
      expect(assertionPrf(cred, PRF_REQUESTED)).toEqual(expected);
    });

    it('returns distinct outputs for distinct credentials', () => {
      const other = VirtualAuthenticator.createCredential();
      expect(assertionPrf(cred, PRF_REQUESTED)?.results?.first).not.toEqual(
        assertionPrf(other, PRF_REQUESTED)?.results?.first
      );
    });
  });

  describe('derivation', () => {
    it('derives a 32-byte output', () => {
      expect(derivePrfOutput(cred, TEST_PRF_SALT)).toHaveLength(32);
    });

    it('returns distinct outputs for distinct salts', () => {
      expect(derivePrfOutput(cred, TEST_PRF_SALT)).not.toEqual(
        derivePrfOutput(cred, OTHER_PRF_SALT)
      );
    });
  });
  describe('when the authenticator cannot evaluate a PRF', () => {
    let unsupported: VirtualCredential;

    beforeEach(() => {
      unsupported = VirtualAuthenticator.createCredential({
        prfSupported: false,
      });
    });

    it('reports the capability as false at registration', () => {
      expect(attestationPrf(unsupported, PRF_REQUESTED)).toEqual({
        enabled: false,
      });
    });

    it('returns no output at assertion', () => {
      const response = VirtualAuthenticator.createAssertionResponse(
        unsupported,
        { ...CEREMONY, extensions: PRF_REQUESTED }
      );
      expect(response.clientExtensionResults).toEqual({});
    });
  });
});
