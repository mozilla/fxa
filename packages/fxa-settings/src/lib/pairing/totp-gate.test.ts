/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PAIRING_SECOND_FACTOR_REPROMPT_MS,
  isSecondFactorStale,
  pairingRequiresTotp,
} from './totp-gate';

const MOCK_SESSION_TOKEN = 'a'.repeat(64);

describe('pairingRequiresTotp', () => {
  const accountProfile = jest.fn();
  const authClient = { accountProfile };

  beforeEach(() => {
    accountProfile.mockReset();
  });

  it('looks up the profile for the given session', async () => {
    accountProfile.mockResolvedValue({ authenticationMethods: ['pwd'] });

    await pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN);

    expect(accountProfile).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
  });

  it('is true when "otp" is among the authentication methods', async () => {
    accountProfile.mockResolvedValue({
      authenticationMethods: ['pwd', 'email', 'otp'],
    });

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN)
    ).resolves.toBe(true);
  });

  it('is false when "otp" is absent', async () => {
    accountProfile.mockResolvedValue({
      authenticationMethods: ['pwd', 'email'],
    });

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN)
    ).resolves.toBe(false);
  });

  it('is false when the profile carries no authentication methods', async () => {
    accountProfile.mockResolvedValue({});

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN)
    ).resolves.toBe(false);
  });

  // A profile outage must not block a session that was already verified at
  // sign-in from finishing the pairing.
  it('is false when the profile lookup fails', async () => {
    accountProfile.mockRejectedValue(new Error('Backend service failure'));

    await expect(
      pairingRequiresTotp(authClient, MOCK_SESSION_TOKEN)
    ).resolves.toBe(false);
  });
});

describe('isSecondFactorStale', () => {
  const MOCK_NOW = 1_700_000_000_000;

  it('is fresh right after the code was verified', () => {
    expect(isSecondFactorStale(MOCK_NOW, MOCK_NOW)).toBe(false);
  });

  it('is fresh up to the re-prompt window', () => {
    expect(
      isSecondFactorStale(
        MOCK_NOW - PAIRING_SECOND_FACTOR_REPROMPT_MS,
        MOCK_NOW
      )
    ).toBe(false);
  });

  it('is stale once the re-prompt window has passed', () => {
    expect(
      isSecondFactorStale(
        MOCK_NOW - PAIRING_SECOND_FACTOR_REPROMPT_MS - 1,
        MOCK_NOW
      )
    ).toBe(true);
  });
});
