/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { pairingRequiresTotp } from './totp-gate';

const MOCK_SESSION_TOKEN = 'a'.repeat(64);
const MAX_AGE_MS = 5 * 60 * 1000;
const NO_RECENT_CODE = { maxAgeMs: MAX_AGE_MS };

describe('pairingRequiresTotp', () => {
  const accountProfile = jest.fn();
  const authClient = { accountProfile };

  beforeEach(() => {
    accountProfile.mockReset();
  });

  it('looks up the profile for the given session', async () => {
    accountProfile.mockResolvedValue({ authenticationMethods: ['pwd'] });

    await pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN, NO_RECENT_CODE);

    expect(accountProfile).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
  });

  it('is true when "otp" is among the authentication methods', async () => {
    accountProfile.mockResolvedValue({
      authenticationMethods: ['pwd', 'email', 'otp'],
    });

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN, NO_RECENT_CODE)
    ).resolves.toBe(true);
  });

  it('is false when "otp" is absent', async () => {
    accountProfile.mockResolvedValue({
      authenticationMethods: ['pwd', 'email'],
    });

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN, NO_RECENT_CODE)
    ).resolves.toBe(false);
  });

  it('is false when the profile carries no authentication methods', async () => {
    accountProfile.mockResolvedValue({});

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN, NO_RECENT_CODE)
    ).resolves.toBe(false);
  });

  // Pairing hands over the Sync keys, so an unknown 2FA status asks for a code.
  it('is true when the profile lookup fails', async () => {
    accountProfile.mockRejectedValue(new Error('Backend service failure'));

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN, NO_RECENT_CODE)
    ).resolves.toBe(true);
  });

  it('is true, without a profile lookup, when there is no session token', async () => {
    await expect(
      pairingRequiresTotp(authClient, undefined, NO_RECENT_CODE)
    ).resolves.toBe(true);
    expect(accountProfile).not.toHaveBeenCalled();
  });
});

describe('pairingRequiresTotp with a code verified in this browser', () => {
  const MOCK_NOW = 1_700_000_000_000;
  const accountProfile = jest.fn();
  const authClient = { accountProfile };

  beforeEach(() => {
    accountProfile.mockReset();
    accountProfile.mockResolvedValue({
      authenticationMethods: ['pwd', 'email', 'otp'],
    });
  });

  it('is false, without a profile lookup, when the code is within the max age', async () => {
    await expect(
      pairingRequiresTotp(
        authClient,
        MOCK_SESSION_TOKEN,
        { verifiedAt: MOCK_NOW - MAX_AGE_MS, maxAgeMs: MAX_AGE_MS },
        MOCK_NOW
      )
    ).resolves.toBe(false);
    expect(accountProfile).not.toHaveBeenCalled();
  });

  it('is true when there is no session token, even with a code within the max age', async () => {
    await expect(
      pairingRequiresTotp(
        authClient,
        undefined,
        { verifiedAt: MOCK_NOW, maxAgeMs: MAX_AGE_MS },
        MOCK_NOW
      )
    ).resolves.toBe(true);
  });

  it('is true for a 2FA account when the code is older than the max age', async () => {
    await expect(
      pairingRequiresTotp(
        authClient,
        MOCK_SESSION_TOKEN,
        { verifiedAt: MOCK_NOW - MAX_AGE_MS - 1, maxAgeMs: MAX_AGE_MS },
        MOCK_NOW
      )
    ).resolves.toBe(true);
  });

  it('is true for a 2FA account when no code was ever verified here', async () => {
    await expect(
      pairingRequiresTotp(
        authClient,
        MOCK_SESSION_TOKEN,
        NO_RECENT_CODE,
        MOCK_NOW
      )
    ).resolves.toBe(true);
  });
});
