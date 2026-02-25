/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  uuidToBuffer,
} from './webauthn-adapter';
import { PasskeyConfig } from './passkey.config';

jest.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
  generateAuthenticationOptions: jest.fn(),
  verifyAuthenticationResponse: jest.fn(),
}));

const libMocks = jest.requireMock('@simplewebauthn/server') as {
  generateRegistrationOptions: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  verifyRegistrationResponse: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  generateAuthenticationOptions: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  verifyAuthenticationResponse: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
};

function mockConfig(overrides: Partial<PasskeyConfig> = {}): PasskeyConfig {
  return Object.assign(new PasskeyConfig(), {
    rpId: 'accounts.firefox.com',
    rpName: 'Mozilla Accounts',
    allowedOrigins: ['https://accounts.firefox.com'],
    userVerification: 'required',
    residentKey: 'preferred',
    ...overrides,
  });
}

function mockRegistrationResponse(): RegistrationResponseJSON {
  return {
    id: 'aGVsbG93b3JsZA',
    rawId: 'aGVsbG93b3JsZA',
    response: {
      clientDataJSON: 'e30',
      attestationObject: 'e30',
    },
    type: 'public-key',
    clientExtensionResults: {},
  };
}

function mockAuthenticationResponse(): AuthenticationResponseJSON {
  return {
    id: 'aGVsbG93b3JsZA',
    rawId: 'aGVsbG93b3JsZA',
    response: {
      clientDataJSON: 'e30',
      authenticatorData: 'e30',
      signature: 'e30',
    },
    type: 'public-key',
    clientExtensionResults: {},
  };
}

describe('uuidToBuffer', () => {
  it('converts a standard AAGUID UUID string to a 16-byte Buffer', () => {
    const result = uuidToBuffer('adce0002-35bc-c60a-648b-0b25f1f05503');

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(16);
    expect(result[0]).toBe(0xad);
    expect(result[1]).toBe(0xce);
    expect(result[2]).toBe(0x00);
    expect(result[3]).toBe(0x02);
  });

  it('converts the all-zeros AAGUID to a 16-byte zero Buffer', () => {
    const result = uuidToBuffer('00000000-0000-0000-0000-000000000000');

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(16);
    expect(result.equals(Buffer.alloc(16, 0))).toBe(true);
  });

  it('strips hyphens correctly regardless of position', () => {
    const uuid = 'f1d0f1d0-f1d0-f1d0-f1d0-f1d0f1d0f1d0';
    const result = uuidToBuffer(uuid);

    expect(result.length).toBe(16);
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBe(i % 2 === 0 ? 0xf1 : 0xd0);
    }
  });
});

describe('generateRegistrationOptions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps config and input fields to the correct library options', async () => {
    libMocks.generateRegistrationOptions.mockResolvedValue({ challenge: 'c' });
    const uid = Buffer.from([0xde, 0xad, 0xbe, 0xef]);

    await generateRegistrationOptions(
      mockConfig({
        residentKey: 'required',
        authenticatorAttachment: 'platform',
      }),
      {
        uid,
        email: 'alice@example.com',
        challenge: 'test-challenge',
      }
    );

    expect(libMocks.generateRegistrationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        rpName: 'Mozilla Accounts',
        rpID: 'accounts.firefox.com',
        userName: 'alice@example.com',
        userID: uid,
        challenge: 'test-challenge',
        authenticatorSelection: expect.objectContaining({
          userVerification: 'required',
          residentKey: 'required',
          authenticatorAttachment: 'platform',
        }),
      })
    );
  });

  it('returns the library result unchanged', async () => {
    const fakeResult = { challenge: 'xyz' };
    libMocks.generateRegistrationOptions.mockResolvedValue(fakeResult);

    const result = await generateRegistrationOptions(mockConfig(), {
      uid: Buffer.alloc(16),
      email: 'user@example.com',
      challenge: 'xyz',
    });

    expect(result).toBe(fakeResult);
  });
});

describe('verifyRegistrationResponse', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseInput = {
    response: mockRegistrationResponse(),
    challenge: 'test-challenge',
  };

  const successLibResult = {
    verified: true,
    registrationInfo: {
      credential: {
        id: 'aGVsbG93b3JsZA',
        publicKey: new Uint8Array([0x04, 0xab, 0xcd, 0xef]),
        counter: 0,
        transports: ['internal'],
      },
      aaguid: 'adce0002-35bc-c60a-648b-0b25f1f05503',
      credentialDeviceType: 'multiDevice',
      credentialBackedUp: true,
    },
  };

  it('returns { verified: true, data } when the library succeeds', async () => {
    libMocks.verifyRegistrationResponse.mockResolvedValue(successLibResult);

    const result = await verifyRegistrationResponse(mockConfig(), baseInput);

    expect(result.verified).toBe(true);
    if (!result.verified) throw new Error('narrowing');

    expect(result.data.credentialId).toBeInstanceOf(Buffer);
    expect(result.data.publicKey).toBeInstanceOf(Buffer);
    expect(result.data.signCount).toBe(0);
    expect(result.data.transports).toEqual(['internal']);
    expect(result.data.aaguid).toBeInstanceOf(Buffer);
    expect(result.data.aaguid.length).toBe(16);
    expect(result.data.backupEligible).toBe(true);
    expect(result.data.backupState).toBe(true);
  });

  it('returns { verified: false } when the library returns verified=false', async () => {
    libMocks.verifyRegistrationResponse.mockResolvedValue({ verified: false });

    const result = await verifyRegistrationResponse(mockConfig(), baseInput);

    expect(result.verified).toBe(false);
    expect((result as { data?: unknown }).data).toBeUndefined();
  });

  it('passes config and input options to the library', async () => {
    libMocks.verifyRegistrationResponse.mockResolvedValue(successLibResult);
    const config = mockConfig({
      allowedOrigins: ['https://accounts.firefox.com', 'https://other.example'],
    });

    await verifyRegistrationResponse(config, {
      response: mockRegistrationResponse(),
      challenge: 'expected-challenge-xyz',
    });

    expect(libMocks.verifyRegistrationResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedChallenge: 'expected-challenge-xyz',
        expectedOrigin: [
          'https://accounts.firefox.com',
          'https://other.example',
        ],
      })
    );
  });

  it('decodes the aaguid UUID into a 16-byte Buffer', async () => {
    libMocks.verifyRegistrationResponse.mockResolvedValue(successLibResult);

    const result = await verifyRegistrationResponse(mockConfig(), baseInput);

    expect(result.data?.aaguid[0]).toBe(0xad);
  });
});

describe('generateAuthenticationOptions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes config and input options to the library', async () => {
    libMocks.generateAuthenticationOptions.mockResolvedValue({});

    await generateAuthenticationOptions(
      mockConfig({ userVerification: 'discouraged' }),
      {
        challenge: 'random-challenge-abc',
        allowCredentials: [],
      }
    );

    expect(libMocks.generateAuthenticationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        rpID: 'accounts.firefox.com',
        challenge: 'random-challenge-abc',
        userVerification: 'discouraged',
      })
    );
  });

  it('passes undefined for allowCredentials when the array is empty (discoverable flow)', async () => {
    libMocks.generateAuthenticationOptions.mockResolvedValue({});

    await generateAuthenticationOptions(mockConfig(), {
      challenge: 'ch',
      allowCredentials: [],
    });

    expect(libMocks.generateAuthenticationOptions).toHaveBeenCalledWith(
      expect.objectContaining({ allowCredentials: undefined })
    );
  });

  it('converts Buffer credential IDs to base64url ids', async () => {
    libMocks.generateAuthenticationOptions.mockResolvedValue({});
    const credId = Buffer.from('helloworld');

    await generateAuthenticationOptions(mockConfig(), {
      challenge: 'ch',
      allowCredentials: [credId],
    });

    expect(libMocks.generateAuthenticationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        allowCredentials: [
          expect.objectContaining({ id: credId.toString('base64url') }),
        ],
      })
    );
  });

  it('returns the library result unchanged', async () => {
    const fakeResult = { challenge: 'q1w2e3' };
    libMocks.generateAuthenticationOptions.mockResolvedValue(fakeResult);

    const result = await generateAuthenticationOptions(mockConfig(), {
      challenge: 'q1w2e3',
      allowCredentials: [],
    });

    expect(result).toBe(fakeResult);
  });
});

describe('verifyAuthenticationResponse', () => {
  beforeEach(() => jest.clearAllMocks());

  function makeInput() {
    return {
      response: mockAuthenticationResponse(),
      challenge: 'auth-challenge',
      credentialId: Buffer.from('aGVsbG93b3JsZA', 'base64url'),
      publicKey: Buffer.from([0x04, 0xab, 0xcd, 0xef]),
      signCount: 5,
    };
  }

  const successLibResult = {
    verified: true,
    authenticationInfo: {
      credentialID: 'aGVsbG93b3JsZA',
      newCounter: 42,
      credentialBackedUp: true,
      credentialDeviceType: 'multiDevice',
      userVerified: true,
      rpID: 'accounts.firefox.com',
      origin: 'https://accounts.firefox.com',
    },
  };

  it('returns { verified: true, data } when the library succeeds', async () => {
    libMocks.verifyAuthenticationResponse.mockResolvedValue(successLibResult);

    const result = await verifyAuthenticationResponse(
      mockConfig(),
      makeInput()
    );

    expect(result.verified).toBe(true);
    expect(result.data?.newSignCount).toBe(42);
    expect(result.data?.backupState).toBe(true);
  });

  it('returns { verified: false } with no data when library returns verified=false', async () => {
    libMocks.verifyAuthenticationResponse.mockResolvedValue({
      verified: false,
      authenticationInfo: {
        ...successLibResult.authenticationInfo,
        newCounter: 0,
        credentialBackedUp: false,
      },
    });

    const result = await verifyAuthenticationResponse(
      mockConfig(),
      makeInput()
    );

    expect(result.verified).toBe(false);
    expect(result.data).toBeUndefined();
  });

  it('reflects credentialBackedUp=false in data.backupState', async () => {
    libMocks.verifyAuthenticationResponse.mockResolvedValue({
      ...successLibResult,
      authenticationInfo: {
        ...successLibResult.authenticationInfo,
        credentialBackedUp: false,
      },
    });

    const result = await verifyAuthenticationResponse(
      mockConfig(),
      makeInput()
    );

    expect(result.data?.backupState).toBe(false);
  });

  it('passes config and input options to the library', async () => {
    libMocks.verifyAuthenticationResponse.mockResolvedValue(successLibResult);
    const credPublicKey = Buffer.from([0xde, 0xad, 0xbe, 0xef]);

    await verifyAuthenticationResponse(mockConfig(), {
      response: mockAuthenticationResponse(),
      challenge: 'specific-challenge-999',
      credentialId: Buffer.from('dGVzdA', 'base64url'),
      publicKey: credPublicKey,
      signCount: 10,
    });

    expect(libMocks.verifyAuthenticationResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedChallenge: 'specific-challenge-999',
        expectedOrigin: ['https://accounts.firefox.com'],
        credential: expect.objectContaining({
          id: Buffer.from('dGVzdA', 'base64url').toString('base64url'),
          publicKey: credPublicKey,
          counter: 10,
        }),
      })
    );
  });
});
