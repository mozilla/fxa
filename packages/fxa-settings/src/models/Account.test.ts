/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account, getNextAvatar } from './Account';
import { sessionToken, JwtTokenCache } from '../lib/cache';
import { getFullAccountData, updateExtendedAccountState } from '../lib/account-storage';

jest.mock('../lib/config', () => ({
  servers: { profile: { url: 'default-url' } },
  oauth: { clientId: 'test' },
}));
jest.mock('../lib/cache', () => ({
  sessionToken: jest.fn(),
  JwtTokenCache: { hasToken: jest.fn(() => true), getToken: jest.fn() },
  isSigningOut: jest.fn(() => false),
}));
jest.mock('../lib/account-storage', () => ({
  getFullAccountData: jest.fn(),
  updateExtendedAccountState: jest.fn(),
  updateBasicAccountData: jest.fn(),
}));

describe('Account', () => {
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
      createPasswordWithJwt: jest.fn().mockResolvedValue({ passwordCreated: 123 }),
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
