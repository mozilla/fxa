/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import avatarShared from '../../../lib/routes/avatar/_shared';
import configModule from '../../../lib/config';

const config = configModule.getProperties();

describe('routes/avatar/_shared', () => {
  describe('fxaUrl', () => {
    it('creates a proper avatarUrl', () => {
      const id = 'foo';
      expect(avatarShared.fxaUrl(id)).toBe(
        config.img.url.replace('{id}', id)
      );
    });
  });
});
