/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import { SyncDesktopV3Integration } from './sync-desktop-v3-integration';

describe('SyncDesktopV3Integration', () => {
  const integration = new SyncDesktopV3Integration(
    new UrlQueryData(new ReachRouterWindow())
  );

  describe('getWebChannelServices', () => {
    it('requests Sync with default engines when none are given', () => {
      expect(integration.getWebChannelServices()).toEqual({ sync: {} });
    });

    it('passes the engine selection through', () => {
      const engines = {
        offeredEngines: ['bookmarks'],
        declinedEngines: ['history'],
      };
      expect(integration.getWebChannelServices(engines)).toEqual({
        sync: engines,
      });
    });
  });
});
