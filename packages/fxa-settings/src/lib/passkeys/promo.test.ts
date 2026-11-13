/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  canPromptForPasskey,
  dismissPasskeyPromo,
  isPasskeyPromoDismissed,
} from './promo';
import { isWebAuthnSupported } from './webauthn';

jest.mock('./webauthn', () => ({ isWebAuthnSupported: jest.fn() }));

const DAY = 24 * 60 * 60 * 1000;
const MOCK_NOW = 1_700_000_000_000;
const enabled = {
  featureFlags: { passkeysEnabled: true, passkeyRegistrationEnabled: true },
};

describe('canPromptForPasskey', () => {
  beforeEach(() => {
    (isWebAuthnSupported as jest.Mock).mockReturnValue(true);
  });

  it('is true for an account without passkeys on a WebAuthn browser', () => {
    expect(canPromptForPasskey(enabled, 0)).toBe(true);
  });

  it('is false when the account already has a passkey', () => {
    expect(canPromptForPasskey(enabled, 1)).toBe(false);
  });

  it('is false without WebAuthn', () => {
    (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
    expect(canPromptForPasskey(enabled, 0)).toBe(false);
  });

  it('is false when passkey registration is off', () => {
    expect(
      canPromptForPasskey({ featureFlags: { passkeysEnabled: true } }, 0)
    ).toBe(false);
  });
});

describe('passkey promo dismissal', () => {
  const key = 'test-passkey-promo';

  afterEach(() => localStorage.clear());

  it('is not dismissed before the user dismisses it', () => {
    expect(isPasskeyPromoDismissed(key)).toBe(false);
  });

  it('stays dismissed for 60 days, then prompts again', () => {
    const now = MOCK_NOW;
    dismissPasskeyPromo(key, now);
    expect(isPasskeyPromoDismissed(key, now + 59 * DAY)).toBe(true);
    expect(isPasskeyPromoDismissed(key, now + 60 * DAY)).toBe(false);
  });
});
