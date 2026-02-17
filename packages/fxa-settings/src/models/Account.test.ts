/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account, getNextAvatar } from './Account';
import {
  sessionToken,
  sessionToken as mockSessionToken,
  JwtTokenCache,
} from '../lib/cache';
import {
  getFullAccountData,
  updateExtendedAccountState,
} from '../lib/account-storage';
import AuthClient from 'fxa-auth-client/browser';

jest.mock('../lib/config', () => ({
  servers: { profile: { url: 'default-url' } },
  oauth: { clientId: 'test' },
}));

jest.mock('../lib/cache', () => {
  const actual = jest.requireActual('../lib/cache');
  return {
    ...actual,
    sessionToken: jest.fn(),
    JwtTokenCache: {
      getKey: jest.fn((token: string, scope: string) => `${token}-${scope}`),
      getSnapshot: jest.fn(),
      getToken: jest.fn(),
      setToken: jest.fn(),
      removeToken: jest.fn(),
      hasToken: jest.fn(),
    },
    isSigningOut: jest.fn(() => false),
  };
});

jest.mock('../lib/account-storage', () => ({
  getFullAccountData: jest.fn(),
  updateExtendedAccountState: jest.fn(),
  updateBasicAccountData: jest.fn(),
}));

jest.mock('../lib/channels/firefox', () => ({
  __esModule: true,
  default: {
    passwordChanged: jest.fn(),
  },
}));

describe('Account', () => {
  describe('changePassword', () => {
    let account: Account;
    let mockAuthClient: jest.Mocked<AuthClient>;
    const mockedSessionToken = jest.mocked(mockSessionToken);
    const mockedJwtCache = jest.mocked(JwtTokenCache);

    beforeEach(() => {
      jest.clearAllMocks();
      mockAuthClient = { passwordChangeWithJWT: jest.fn() } as any;
      account = new Account(mockAuthClient);
      Object.defineProperty(account, 'email', {
        get: () => 'test@example.com',
      });
      Object.defineProperty(account, 'primaryEmail', {
        get: () => ({
          email: 'test@example.com',
          isPrimary: true,
          isVerified: true,
        }),
      });
    });

    it('should transfer JWT from old session token to new session token', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      const jwt = 'mock-jwt';

      mockedSessionToken.mockReturnValue(oldToken);
      mockedJwtCache.hasToken.mockReturnValue(true);
      mockedJwtCache.getToken.mockReturnValue(jwt);
      mockedJwtCache.getSnapshot.mockReturnValue({
        [`${oldToken}-password`]: jwt,
      });
      mockAuthClient.passwordChangeWithJWT.mockResolvedValue({
        sessionToken: newToken,
      } as any);

      await account.changePassword('oldPass', 'newPass');

      expect(mockedJwtCache.setToken).toHaveBeenCalledWith(
        newToken,
        'password',
        jwt
      );
      expect(mockedJwtCache.removeToken).toHaveBeenCalledWith(
        oldToken,
        'password'
      );
      expect(mockedSessionToken).toHaveBeenCalledWith(newToken);
    });

    it('should not transfer JWT if session token unchanged', async () => {
      const token = 'same-token';

      mockedSessionToken.mockReturnValue(token);
      mockedJwtCache.hasToken.mockReturnValue(true);
      mockedJwtCache.getToken.mockReturnValue('jwt');
      mockAuthClient.passwordChangeWithJWT.mockResolvedValue({
        sessionToken: token,
      } as any);

      await account.changePassword('oldPass', 'newPass');

      expect(mockedJwtCache.setToken).not.toHaveBeenCalled();
      expect(mockedJwtCache.removeToken).not.toHaveBeenCalled();
    });

    it('should not transfer JWT if none exists', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';

      mockedSessionToken.mockReturnValue(oldToken);
      mockedJwtCache.hasToken.mockReturnValue(true);
      mockedJwtCache.getToken.mockReturnValue('jwt');
      mockedJwtCache.getSnapshot.mockReturnValue({}); // No JWT in snapshot to transfer
      mockAuthClient.passwordChangeWithJWT.mockResolvedValue({
        sessionToken: newToken,
      } as any);

      await account.changePassword('oldPass', 'newPass');

      expect(mockedJwtCache.setToken).not.toHaveBeenCalled();
      expect(mockedJwtCache.removeToken).not.toHaveBeenCalled();
    });
  });

  describe('getNextAvatar', () => {
    it('should favor profile pictures', () => {
      const avatar = getNextAvatar('id', 'url', 'test@example.com', 'me');
      expect(avatar.id).toBe('id');
      expect(avatar.url).toBe('url');
    });

    it('should favor display name over email', () => {
      const avatar = getNextAvatar(
        'default-x',
        'default-url',
        'test@example.com',
        'me'
      );
      expect(avatar.id).toBe('default-m');
      expect(avatar.url).toBe('default-url/v1/avatar/m');
    });

    it('should use email when display name is out of range', () => {
      const avatar = getNextAvatar(
        undefined,
        undefined,
        'test@example.com',
        '$$'
      );
      expect(avatar.id).toBe('default-t');
      expect(avatar.url).toBe('default-url/v1/avatar/t');
    });

    it('should use the first character for a-z0-9 letters', () => {
      const avatar = getNextAvatar(undefined, undefined, 'test@example.com');
      expect(avatar.id).toBe('default-t');
      expect(avatar.url).toBe('default-url/v1/avatar/t');
    });

    it('should be "null" as a last resort', () => {
      const avatar = getNextAvatar(undefined, undefined, '!@example.com', '@#');
      expect(avatar.id).toBe(null);
      expect(avatar.url).toBe(null);
    });
  });

  describe('createPassword', () => {
    let account: Account;
    const authClient: any = {
      createPassword: jest.fn().mockResolvedValue({ passwordCreated: 123 }),
      createPasswordWithJwt: jest
        .fn()
        .mockResolvedValue({ passwordCreated: 123 }),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (getFullAccountData as jest.Mock).mockReturnValue({
        uid: 'abc',
        emails: [{ email: 'a@b.com', isPrimary: true, verified: true }],
        primaryEmail: { email: 'a@b.com', isPrimary: true, verified: true },
      });
      (sessionToken as jest.Mock).mockReturnValue('tok');
      (JwtTokenCache.getToken as jest.Mock).mockReturnValue('jwt');
      account = new Account(authClient);
    });

    it('sets hasPassword after createPassword', async () => {
      await account.createPassword('pw');
      expect(updateExtendedAccountState).toHaveBeenCalledWith(
        expect.objectContaining({ hasPassword: true })
      );
    });

    it('sets hasPassword after createPasswordWithJwt', async () => {
      await account.createPasswordWithJwt('pw');
      expect(updateExtendedAccountState).toHaveBeenCalledWith(
        expect.objectContaining({ hasPassword: true })
      );
    });
  });
});
