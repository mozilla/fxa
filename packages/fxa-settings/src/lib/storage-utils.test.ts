/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { waitFor } from '@testing-library/react';
import { storeAccountData } from './storage-utils';
import firefox from './channels/firefox';
import { Constants } from './constants';

const mockSessionDestroy = jest.fn();
jest.mock('fxa-auth-client/browser', () => ({
  __esModule: true,
  default: jest.fn(() => ({ sessionDestroy: mockSessionDestroy })),
}));

jest.mock('./channels/firefox', () => ({
  __esModule: true,
  default: { fxaStatus: jest.fn() },
}));

const UID = 'abc123';
const OLD_TOKEN = 'old-token';
const NEW_TOKEN = 'new-token';

function signIn(sessionToken: string) {
  storeAccountData({ uid: UID, email: 'user@example.com', sessionToken });
}

function inFirefox() {
  jest
    .spyOn(navigator, 'userAgent', 'get')
    .mockReturnValue('Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Firefox/140.0');
}

function browserHolds(sessionToken: string | null) {
  (firefox.fxaStatus as jest.Mock).mockResolvedValue({
    signedInUser: sessionToken ? { uid: UID, sessionToken } : null,
  });
}

describe('storeAccountData', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockSessionDestroy.mockResolvedValue({});
    signIn(OLD_TOKEN);
  });

  it('destroys the replaced token outside Firefox', async () => {
    signIn(NEW_TOKEN);

    await waitFor(() =>
      expect(mockSessionDestroy).toHaveBeenCalledWith(OLD_TOKEN)
    );
    expect(firefox.fxaStatus).not.toHaveBeenCalled();
  });

  it('does nothing when the token is the same', async () => {
    signIn(OLD_TOKEN);

    await new Promise((resolve) => setTimeout(resolve));
    expect(mockSessionDestroy).not.toHaveBeenCalled();
  });

  it('destroys the replaced token when Firefox holds a different one', async () => {
    inFirefox();
    browserHolds(null);

    signIn(NEW_TOKEN);

    await waitFor(() =>
      expect(mockSessionDestroy).toHaveBeenCalledWith(OLD_TOKEN)
    );
  });

  it('keeps the replaced token when Firefox holds it', async () => {
    inFirefox();
    browserHolds(OLD_TOKEN);

    signIn(NEW_TOKEN);

    await waitFor(() =>
      expect(firefox.fxaStatus).toHaveBeenCalledWith({
        context: Constants.OAUTH_CONTEXT,
        isPairing: false,
        service: Constants.SYNC_SERVICE,
      })
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(mockSessionDestroy).not.toHaveBeenCalled();
  });

  it('keeps the replaced token when Firefox gives no fxa_status reply', async () => {
    inFirefox();
    (firefox.fxaStatus as jest.Mock).mockResolvedValue(undefined);

    signIn(NEW_TOKEN);

    await waitFor(() => expect(firefox.fxaStatus).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve));
    expect(mockSessionDestroy).not.toHaveBeenCalled();
  });

  it('stores the new token when sessionDestroy rejects', async () => {
    mockSessionDestroy.mockRejectedValue({ errno: 110 });

    expect(() => signIn(NEW_TOKEN)).not.toThrow();

    await waitFor(() => expect(mockSessionDestroy).toHaveBeenCalled());
    const accounts = JSON.parse(
      window.localStorage.getItem('__fxa_storage.accounts') || '{}'
    );
    expect(accounts[UID].sessionToken).toBe(NEW_TOKEN);
  });
});
