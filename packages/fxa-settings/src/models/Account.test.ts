/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getNextAvatar } from './Account';

jest.mock('../lib/config', () => ({
  servers: {
    profile: {
      url: 'default-url',
    },
  },
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
});
