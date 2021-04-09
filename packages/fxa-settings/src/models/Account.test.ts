/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  hasAccountRecovery,
  hasSecondaryEmail,
  hasSecondaryVerifiedEmail,
  hasTwoStepAuthentication,
  getNextAvatar,
} from './Account';
import { mockEmail, MOCK_ACCOUNT } from './_mocks';

jest.mock('../lib/config', () => ({
  servers: {
    profile: {
      url: 'default-url',
    },
  },
}));

describe('Account', () => {
  describe('hasSecondaryEmail', () => {
    it('should be false when there is only one email', () => {
      const actual = hasSecondaryEmail(MOCK_ACCOUNT);
      expect(actual).toBe(false);
    });

    it('should be true when there are more than one emails', () => {
      const actual = hasSecondaryEmail({
        ...MOCK_ACCOUNT,
        emails: [...MOCK_ACCOUNT.emails, mockEmail('wormhole@example.com')],
      });
      expect(actual).toBe(true);
    });
  });

  describe('hasSecondrayVerifiedEmail', () => {
    it('should be false when there is only one email', () => {
      const actual = hasSecondaryVerifiedEmail(MOCK_ACCOUNT);
      expect(actual).toBe(false);
    });

    it('should be false when the second email is not verified', () => {
      const actual = hasSecondaryVerifiedEmail({
        ...MOCK_ACCOUNT,
        emails: [
          ...MOCK_ACCOUNT.emails,
          mockEmail('wormhole@example.com', false, false),
        ],
      });
      expect(actual).toBe(false);
    });

    it('should be true when the second email is verified', () => {
      const actual = hasSecondaryVerifiedEmail({
        ...MOCK_ACCOUNT,
        emails: [
          ...MOCK_ACCOUNT.emails,
          mockEmail('wormhole@example.com', false, true),
        ],
      });
      expect(actual).toBe(true);
    });
  });

  describe('hasAccountRecovery', () => {
    it('should be true when there is an account recovery key', () => {
      const actual = hasAccountRecovery(MOCK_ACCOUNT);
      expect(actual).toBe(true);
    });

    it('should be false when there is no account recovery key', () => {
      const actual = hasAccountRecovery({
        ...MOCK_ACCOUNT,
        recoveryKey: false,
      });
      expect(actual).toBe(false);
    });
  });

  describe('hasTwoStepAuthentication', () => {
    it('should be true when TOTP does not exist', () => {
      const actual = hasTwoStepAuthentication({
        ...MOCK_ACCOUNT,
        totp: { exists: false, verified: false },
      });
      expect(actual).toBe(false);
    });

    it('should be true when TOTP exists but not verified', () => {
      const actual = hasTwoStepAuthentication({
        ...MOCK_ACCOUNT,
        totp: { exists: true, verified: false },
      });
      expect(actual).toBe(false);
    });

    it('should be true when TOTP exists and verified', () => {
      const actual = hasTwoStepAuthentication(MOCK_ACCOUNT);
      expect(actual).toBe(true);
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
});
