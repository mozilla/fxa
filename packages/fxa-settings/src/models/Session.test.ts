/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Session } from './Session';
import {
  sessionToken as mockSessionToken,
  clearSignedInAccountUid,
} from '../lib/cache';
import { dispatchStorageEvent } from '../lib/account-storage';
import { ERRNO } from '@fxa/accounts/errors';
import AuthClient from 'fxa-auth-client/browser';

jest.mock('../lib/cache', () => {
  const actual = jest.requireActual('../lib/cache');
  return {
    ...actual,
    sessionToken: jest.fn(),
    clearSignedInAccountUid: jest.fn(),
  };
});

jest.mock('../lib/account-storage', () => ({
  ...jest.requireActual('../lib/account-storage'),
  dispatchStorageEvent: jest.fn(),
}));

describe('Session', () => {
  describe('destroy', () => {
    let session: Session;
    let mockAuthClient: jest.Mocked<AuthClient>;
    const mockedSessionToken = jest.mocked(mockSessionToken);
    const mockedClearSignedInAccountUid = jest.mocked(clearSignedInAccountUid);
    const mockedDispatchStorageEvent = jest.mocked(dispatchStorageEvent);

    beforeEach(() => {
      jest.clearAllMocks();
      mockAuthClient = { sessionDestroy: jest.fn() } as any;
      session = new Session(mockAuthClient);
    });

    it('destroys the server session and clears local state', async () => {
      mockedSessionToken.mockReturnValue('valid-token');
      mockAuthClient.sessionDestroy.mockResolvedValue({});

      await session.destroy();

      expect(mockAuthClient.sessionDestroy).toHaveBeenCalledWith('valid-token');
      expect(mockedClearSignedInAccountUid).toHaveBeenCalled();
      expect(mockedDispatchStorageEvent).toHaveBeenCalledWith('isSignedIn');
    });

    it('treats errno 110 (INVALID_TOKEN) as already-destroyed and clears local state', async () => {
      mockedSessionToken.mockReturnValue('stale-token');
      mockAuthClient.sessionDestroy.mockRejectedValue({
        code: 401,
        errno: ERRNO.INVALID_TOKEN,
        message: 'Invalid authentication token in request signature',
      });

      await expect(session.destroy()).resolves.toBeUndefined();

      expect(mockedClearSignedInAccountUid).toHaveBeenCalled();
      expect(mockedDispatchStorageEvent).toHaveBeenCalledWith('isSignedIn');
    });

    it('rethrows non-INVALID_TOKEN errors and skips local cleanup', async () => {
      mockedSessionToken.mockReturnValue('valid-token');
      const networkError = new Error('Network request failed');
      mockAuthClient.sessionDestroy.mockRejectedValue(networkError);

      await expect(session.destroy()).rejects.toThrow('Network request failed');

      expect(mockedClearSignedInAccountUid).not.toHaveBeenCalled();
      expect(mockedDispatchStorageEvent).not.toHaveBeenCalled();
    });

    it('skips the server call when there is no session token', async () => {
      mockedSessionToken.mockReturnValue(undefined);

      await session.destroy();

      expect(mockAuthClient.sessionDestroy).not.toHaveBeenCalled();
      expect(mockedClearSignedInAccountUid).toHaveBeenCalled();
      expect(mockedDispatchStorageEvent).toHaveBeenCalledWith('isSignedIn');
    });
  });
});
