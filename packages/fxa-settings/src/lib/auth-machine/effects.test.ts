/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { runEffect } from './effects';
import { AuthUiErrors } from '../auth-errors/auth-errors';

const deps = {
  checkAccountStatus: jest.fn(),
  beginSignin: jest.fn(),
  cachedSignin: jest.fn(),
  sendUnblockEmail: jest.fn(),
  upgradeCredentials: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('runEffect', () => {
  it('CHECK_ACCOUNT_STATUS → ACCOUNT_STATUS event', async () => {
    deps.checkAccountStatus.mockResolvedValue({ exists: true });
    const ev = await runEffect(
      { kind: 'CHECK_ACCOUNT_STATUS', email: 'a@example.com' },
      deps as any
    );
    expect(ev).toEqual({ type: 'ACCOUNT_STATUS', exists: true });
  });

  it('BEGIN_SIGNIN maps errno 125 to REQUEST_BLOCKED with canUnblock', async () => {
    deps.beginSignin.mockRejectedValue({
      errno: AuthUiErrors.REQUEST_BLOCKED.errno,
    });
    const ev = await runEffect(
      { kind: 'BEGIN_SIGNIN', password: 'pw' },
      deps as any
    );
    expect(ev).toEqual({ type: 'REQUEST_BLOCKED', canUnblock: true });
  });

  it('BEGIN_SIGNIN success → SIGNIN_OK carrying verification fields', async () => {
    deps.beginSignin.mockResolvedValue({
      emailVerified: true,
      sessionVerified: false,
      verificationMethod: 'totp-2fa',
    });
    const ev = await runEffect(
      { kind: 'BEGIN_SIGNIN', password: 'pw' },
      deps as any
    );
    expect(ev).toMatchObject({
      type: 'SIGNIN_OK',
      verificationMethod: 'totp-2fa',
    });
  });

  it('UPGRADE_CREDENTIALS never blocks the funnel (returns null even on failure)', async () => {
    deps.upgradeCredentials.mockRejectedValue(new Error('upgrade-failed'));
    const ev = await runEffect({ kind: 'UPGRADE_CREDENTIALS' }, deps as any);
    expect(ev).toBeNull();
    expect(deps.upgradeCredentials).toHaveBeenCalled();
  });
});
