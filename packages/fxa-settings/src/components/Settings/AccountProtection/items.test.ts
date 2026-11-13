/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getProtectionItems } from './items';
import { isWebAuthnSupported } from '../../../lib/passkeys/webauthn';

jest.mock('../../../lib/passkeys/webauthn', () => ({
  ...jest.requireActual('../../../lib/passkeys/webauthn'),
  isWebAuthnSupported: jest.fn(),
}));

const PASSKEY_FLAGS = {
  featureFlags: { passkeysEnabled: true, passkeyRegistrationEnabled: true },
};

const account = (overrides = {}) => ({
  passkeys: [],
  hasPassword: true,
  recoveryKey: { exists: false, estimatedSyncDeviceCount: 0 },
  totp: { exists: false, verified: false },
  ...overrides,
});

const ids = (a: ReturnType<typeof account>, config = PASSKEY_FLAGS) =>
  getProtectionItems(a as never, config).map((item) => item.id);

describe('getProtectionItems', () => {
  beforeEach(() => {
    (isWebAuthnSupported as jest.Mock).mockReturnValue(true);
  });

  it('lists passkey, two-step authentication and recovery key for a new password account', () => {
    expect(ids(account())).toEqual([
      'passkey',
      'two-step-auth',
      'recovery-key',
    ]);
  });

  it('offers only a passkey to an account with no password', () => {
    expect(ids(account({ hasPassword: false }))).toEqual(['passkey']);
  });

  it('drops the passkey once the account has one', () => {
    expect(ids(account({ passkeys: [{ credentialId: 'c' }] }))).toEqual([
      'two-step-auth',
      'recovery-key',
    ]);
  });

  it('drops the passkey when the browser has no WebAuthn', () => {
    (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
    expect(ids(account())).toEqual(['two-step-auth', 'recovery-key']);
  });

  it('drops the passkey when passkey registration is off', () => {
    expect(ids(account(), { featureFlags: {} } as never)).toEqual([
      'two-step-auth',
      'recovery-key',
    ]);
  });

  it('keeps two-step authentication while it is set up but unverified', () => {
    expect(ids(account({ totp: { exists: true, verified: false } }))).toContain(
      'two-step-auth'
    );
  });

  it('drops two-step authentication once it is verified', () => {
    expect(
      ids(account({ totp: { exists: true, verified: true } }))
    ).not.toContain('two-step-auth');
  });

  it('drops the recovery key once one exists', () => {
    expect(
      ids(
        account({ recoveryKey: { exists: true, estimatedSyncDeviceCount: 1 } })
      )
    ).not.toContain('recovery-key');
  });

  it('lists nothing when everything is set up', () => {
    expect(
      ids(
        account({
          passkeys: [{ credentialId: 'c' }],
          totp: { exists: true, verified: true },
          recoveryKey: { exists: true, estimatedSyncDeviceCount: 1 },
        })
      )
    ).toEqual([]);
  });
});
