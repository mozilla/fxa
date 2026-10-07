/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  consumePairingTotpConfirmation,
  markPairingTotpConfirmed,
  PAIRING_TOTP_CONFIRMATION_TTL_MS,
} from './pairing-totp-confirmation';

const NOW = 1_700_000_000_000;

describe('pairing-totp-confirmation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('is false when nothing was confirmed', () => {
    expect(consumePairingTotpConfirmation('uid', NOW)).toBe(false);
  });

  it('is true once for the confirmed uid, then false', () => {
    markPairingTotpConfirmed('uid', NOW);
    expect(consumePairingTotpConfirmation('uid', NOW + 1000)).toBe(true);
    expect(consumePairingTotpConfirmation('uid', NOW + 1000)).toBe(false);
  });

  it('is false for another uid and clears the confirmation', () => {
    markPairingTotpConfirmed('uid', NOW);
    expect(consumePairingTotpConfirmation('other', NOW)).toBe(false);
    expect(consumePairingTotpConfirmation('uid', NOW)).toBe(false);
  });

  it('is false when no uid is given', () => {
    markPairingTotpConfirmed('uid', NOW);
    expect(consumePairingTotpConfirmation(undefined, NOW)).toBe(false);
  });

  it('is false after the TTL', () => {
    markPairingTotpConfirmed('uid', NOW);
    expect(
      consumePairingTotpConfirmation(
        'uid',
        NOW + PAIRING_TOTP_CONFIRMATION_TTL_MS
      )
    ).toBe(false);
  });

  it('is false for a confirmation dated in the future', () => {
    markPairingTotpConfirmed('uid', NOW + 1000);
    expect(consumePairingTotpConfirmation('uid', NOW)).toBe(false);
  });
});
