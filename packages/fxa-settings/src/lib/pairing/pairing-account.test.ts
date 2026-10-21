/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getPairingAccount } from './pairing-account';
import { getBasicAccountData } from '../account-storage';

jest.mock('../account-storage', () => ({
  getBasicAccountData: jest.fn(),
}));

const LOCAL_ACCOUNT = {
  uid: 'local-uid',
  email: 'local@example.com',
  metricsEnabled: true,
  verified: true,
  sessionToken: 'local-token',
  sessionVerified: true,
  totpVerifiedAt: 1,
};

describe('getPairingAccount', () => {
  beforeEach(() => {
    jest
      .mocked(getBasicAccountData)
      .mockImplementation((uid?: string) => (uid ? null : LOCAL_ACCOUNT));
  });

  it('returns the Sync account, with no recent code when it has no local record', () => {
    expect(
      getPairingAccount({ uid: 'sync-uid', sessionToken: 'sync-token' })
    ).toEqual({
      uid: 'sync-uid',
      sessionToken: 'sync-token',
      totpVerifiedAt: undefined,
    });
  });

  it('reads the recent code and a missing token from the Sync account local record', () => {
    jest.mocked(getBasicAccountData).mockReturnValue({
      ...LOCAL_ACCOUNT,
      uid: 'sync-uid',
      totpVerifiedAt: 2,
    });
    expect(
      getPairingAccount({ uid: 'sync-uid', sessionToken: undefined })
    ).toEqual({
      uid: 'sync-uid',
      sessionToken: 'local-token',
      totpVerifiedAt: 2,
    });
    expect(getBasicAccountData).toHaveBeenCalledWith('sync-uid');
  });

  it('falls back to the current local account when the browser names no user', () => {
    expect(getPairingAccount(undefined)).toEqual({
      uid: 'local-uid',
      sessionToken: 'local-token',
      totpVerifiedAt: 1,
    });
  });
});
