/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NavigateFn, WindowLocation } from '@reach/router';
import { ReachRouterWindow } from './window';

describe('window', () => {
  describe('ReachRouterWindow', () => {
    it('creates', () => {
      const window = new ReachRouterWindow();
      expect(window).toBeDefined();
      expect(window.location).toBeDefined();
      expect(window.navigate).toBeDefined();
      expect(window.history).toBeDefined();
      expect(window.localStorage).toBeDefined();
      expect(window.sessionStorage).toBeDefined();
    });

    it('allows overrides', () => {
      const fakeOverride: any = {
        fake: 'yup',
      };

      const window = new ReachRouterWindow({
        location: fakeOverride as WindowLocation<any>,
        navigate: fakeOverride as NavigateFn,
        history: fakeOverride as History,
        localStorage: fakeOverride as Storage,
        sessionStorage: fakeOverride as Storage,
      });
      expect(window).toBeDefined();
      expect(window.location).toStrictEqual(fakeOverride);
      expect(window.navigate).toStrictEqual(fakeOverride);
      expect(window.history).toStrictEqual(fakeOverride);
      expect(window.localStorage).toStrictEqual(fakeOverride);
      expect(window.sessionStorage).toStrictEqual(fakeOverride);
    });
  });
});
