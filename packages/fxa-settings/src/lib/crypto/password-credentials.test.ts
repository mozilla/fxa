/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCredentials, getCredentialsV2 } from 'fxa-auth-client/lib/crypto';
import { getNewPasswordCredentials } from './password-credentials';

// Real v2 stretching runs 650k PBKDF2 rounds; stub it with fixed output.
jest.mock('fxa-auth-client/lib/crypto', () => ({
  ...jest.requireActual('fxa-auth-client/lib/crypto'),
  getCredentialsV2: jest.fn(),
}));

const EMAIL = 'user@example.com';
const PASSWORD = 'new password';
const V2_UNWRAP_BKEY = 'ab'.repeat(32);

const xorHex = (a: string, b: string) =>
  (BigInt(`0x${a}`) ^ BigInt(`0x${b}`)).toString(16).padStart(64, '0');

describe('getNewPasswordCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCredentialsV2 as jest.Mock).mockImplementation(
      async ({ clientSalt }: { clientSalt: string }) => ({
        clientSalt,
        authPW: 'authPWVersion2',
        unwrapBKey: V2_UNWRAP_BKEY,
      })
    );
  });

  it('returns v1 credentials and an empty v2 payload when v2 is off', async () => {
    const result = await getNewPasswordCredentials(EMAIL, PASSWORD, false);

    expect(result).toEqual({
      v1: await getCredentials(EMAIL, PASSWORD),
      v2: undefined,
      v2Payload: {},
    });
    expect(getCredentialsV2).not.toHaveBeenCalled();
  });

  it('derives v2 credentials from a fresh v2 salt', async () => {
    const { v2, v2Payload } = await getNewPasswordCredentials(
      EMAIL,
      PASSWORD,
      true
    );

    expect(getCredentialsV2).toHaveBeenCalledWith({
      password: PASSWORD,
      clientSalt: expect.stringMatching(/quickStretchV2:[0-9a-f]{32}$/),
    });
    expect(v2Payload).toEqual({
      wrapKb: expect.stringMatching(/^[0-9a-f]{64}$/),
      wrapKbVersion2: expect.stringMatching(/^[0-9a-f]{64}$/),
      authPWVersion2: 'authPWVersion2',
      clientSalt: v2?.clientSalt,
    });
  });

  it('wraps the same kB under both credential versions', async () => {
    const { v1, v2Payload } = await getNewPasswordCredentials(
      EMAIL,
      PASSWORD,
      true
    );
    const { wrapKb, wrapKbVersion2 } = v2Payload as {
      wrapKb: string;
      wrapKbVersion2: string;
    };

    expect(xorHex(wrapKb, v1.unwrapBKey)).toBe(
      xorHex(wrapKbVersion2, V2_UNWRAP_BKEY)
    );
  });
});
