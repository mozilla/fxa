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
import { AuthUiErrors } from '../lib/auth-errors/auth-errors';

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
      clearTokens: jest.fn(),
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
      mockAuthClient = {
        passwordChangeWithJWT: jest.fn(),
        accountEmails: jest
          .fn()
          .mockResolvedValue({ original: 'a@b.com', primary: 'a@b.com' }),
      } as any;
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

    it('clears all cached MFA tokens for the old session when the session token rotates', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';

      mockedSessionToken.mockReturnValue(oldToken);
      mockedJwtCache.hasToken.mockReturnValue(true);
      mockedJwtCache.getToken.mockReturnValue('mock-jwt');
      mockAuthClient.passwordChangeWithJWT.mockResolvedValue({
        sessionToken: newToken,
      } as any);

      await account.changePassword('oldPass', 'newPass');

      // Every cached MFA JWT references the old session via its stid claim and is
      // dead once the password change destroys that session, so drop them all.
      expect(mockedJwtCache.clearTokens).toHaveBeenCalledWith(oldToken);
      expect(mockedJwtCache.setToken).not.toHaveBeenCalled();
      expect(mockedSessionToken).toHaveBeenCalledWith(newToken);
    });

    it('does not clear cached MFA tokens when the session token is unchanged', async () => {
      const token = 'same-token';

      mockedSessionToken.mockReturnValue(token);
      mockedJwtCache.hasToken.mockReturnValue(true);
      mockedJwtCache.getToken.mockReturnValue('jwt');
      mockAuthClient.passwordChangeWithJWT.mockResolvedValue({
        sessionToken: token,
      } as any);

      await account.changePassword('oldPass', 'newPass');

      expect(mockedJwtCache.clearTokens).not.toHaveBeenCalled();
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
      accountEmails: jest
        .fn()
        .mockResolvedValue({ original: 'a@b.com', primary: 'a@b.com' }),
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

  describe('renamePasskey', () => {
    let account: Account;
    let authClient: jest.Mocked<
      Pick<AuthClient, 'renamePasskey' | 'listPasskeys'>
    >;

    beforeEach(() => {
      jest.clearAllMocks();
      authClient = {
        renamePasskey: jest.fn().mockResolvedValue(undefined),
        listPasskeys: jest.fn().mockResolvedValue([]),
      } as unknown as jest.Mocked<
        Pick<AuthClient, 'renamePasskey' | 'listPasskeys'>
      >;
      (sessionToken as jest.Mock).mockReturnValue('test-token');
      account = new Account(authClient as unknown as AuthClient);
    });

    it('renames the passkey using the verified session token', async () => {
      await account.renamePasskey('cred-1', 'Work laptop');
      expect(authClient.renamePasskey).toHaveBeenCalledWith(
        'test-token',
        'cred-1',
        'Work laptop'
      );
    });

    it('refreshes the passkey list after renaming', async () => {
      await account.renamePasskey('cred-1', 'Work laptop');
      expect(authClient.listPasskeys).toHaveBeenCalledWith('test-token');
    });

    it('throws an invalid-token error without calling the client when there is no session token', async () => {
      (sessionToken as jest.Mock).mockReturnValue(null);
      await expect(account.renamePasskey('cred-1', 'Work laptop')).rejects.toBe(
        AuthUiErrors.INVALID_TOKEN
      );
      expect(authClient.renamePasskey).not.toHaveBeenCalled();
    });
  });

  describe('refresh account', () => {
    let account: Account;
    let mockAuthClient: jest.Mocked<AuthClient>;

    const baseAccountResponse = {
      emails: [{ email: 'a@b.com', isPrimary: true, verified: true }],
      createdAt: 1000000,
      passwordCreatedAt: 2000000,
      hasPassword: true,
      totp: { exists: true, verified: true },
      backupCodes: { hasBackupCodes: true, count: 3 },
      recoveryKey: { exists: true, estimatedSyncDeviceCount: 2 },
      recoveryPhone: {
        exists: true,
        phoneNumber: '+15550001234',
        nationalFormat: '(555) 000-1234',
        available: true,
      },
      linkedAccounts: [{ providerId: 1, authAt: 999, enabled: true }],
      securityEvents: [{ name: 'login', createdAt: 111, verified: true }],
    };

    const baseClientResponse = [
      {
        clientId: 'abc',
        isCurrentSession: true,
        userAgent: 'Firefox',
        deviceType: null,
        deviceId: null,
        name: 'My Device',
        lastAccessTime: 123,
        lastAccessTimeFormatted: 'just now',
        approximateLastAccessTime: null,
        approximateLastAccessTimeFormatted: null,
        location: {},
        os: null,
        sessionTokenId: 'sid',
        refreshTokenId: null,
        scope: null,
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      mockAuthClient = {
        account: jest.fn().mockResolvedValue(baseAccountResponse),
        attachedClients: jest.fn().mockResolvedValue(baseClientResponse),
        accountEmails: jest
          .fn()
          .mockResolvedValue({ original: 'a@b.com', primary: 'a@b.com' }),
      } as unknown as jest.Mocked<AuthClient>;
      (sessionToken as jest.Mock).mockReturnValue('test-token');
      account = new Account(mockAuthClient);
    });

    it('calls account and attachedClients', async () => {
      await account.refresh('account');
      expect(mockAuthClient.account).toHaveBeenCalledWith('test-token');
      expect(mockAuthClient.attachedClients).toHaveBeenCalledWith('test-token');
    });

    it('updates state with all fields from account response', async () => {
      await account.refresh('account');
      expect(updateExtendedAccountState).toHaveBeenCalledWith(
        expect.objectContaining({
          emails: [{ email: 'a@b.com', isPrimary: true, verified: true }],
          accountCreated: 1000000,
          passwordCreated: 2000000,
          hasPassword: true,
          totp: { exists: true, verified: true },
          backupCodes: { hasBackupCodes: true, count: 3 },
          recoveryKey: { exists: true, estimatedSyncDeviceCount: 2 },
          recoveryPhone: {
            exists: true,
            phoneNumber: '+15550001234',
            nationalFormat: '(555) 000-1234',
            available: true,
          },
          linkedAccounts: [{ providerId: 1, authAt: 999, enabled: true }],
          securityEvents: [{ name: 'login', createdAt: 111, verified: true }],
        })
      );
    });

    it('updates attachedClients from clients response', async () => {
      await account.refresh('account');
      expect(updateExtendedAccountState).toHaveBeenCalledWith(
        expect.objectContaining({
          attachedClients: expect.arrayContaining([
            expect.objectContaining({ clientId: 'abc', name: 'My Device' }),
          ]),
        })
      );
    });

    it('defaults missing optional fields to safe values when account response is sparse', async () => {
      mockAuthClient.account.mockResolvedValue({
        emails: [],
        createdAt: 0,
        passwordCreatedAt: 0,
        hasPassword: false,
      });

      await account.refresh('account');

      expect(updateExtendedAccountState).toHaveBeenCalledWith(
        expect.objectContaining({
          totp: { exists: false, verified: false },
          backupCodes: { hasBackupCodes: false, count: 0 },
          recoveryKey: { exists: false, estimatedSyncDeviceCount: undefined },
          recoveryPhone: {
            exists: false,
            phoneNumber: null,
            nationalFormat: null,
            available: false,
          },
          linkedAccounts: [],
          securityEvents: [],
        })
      );
    });

    it('still updates attachedClients when account call fails', async () => {
      mockAuthClient.account.mockRejectedValue(new Error('network error'));

      await account.refresh('account');

      const call = (updateExtendedAccountState as jest.Mock).mock.calls[0][0];
      expect(call.attachedClients).toBeDefined();
      expect(call.emails).toBeUndefined();
    });

    it('still updates account data when attachedClients call fails', async () => {
      mockAuthClient.attachedClients.mockRejectedValue(
        new Error('network error')
      );

      await account.refresh('account');

      const call = (updateExtendedAccountState as jest.Mock).mock.calls[0][0];
      expect(call.emails).toBeDefined();
      expect(call.attachedClients).toBeUndefined();
    });

    it('does nothing when there is no session token', async () => {
      (sessionToken as jest.Mock).mockReturnValue(null);

      await account.refresh('account');

      expect(mockAuthClient.account).not.toHaveBeenCalled();
      expect(updateExtendedAccountState).not.toHaveBeenCalled();
    });
  });
});
