/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import { BaseIntegration, IntegrationType } from './base-integration';

describe('BaseIntegration Model', function () {
  const window = new ReachRouterWindow();
  let model: BaseIntegration;
  beforeEach(function () {
    model = new BaseIntegration(IntegrationType.Web, new UrlQueryData(window));
  });

  describe('isOAuth', function () {
    it('returns `false`', function () {
      expect(model.isOAuth()).toBeFalsy();
    });
  });

  describe('isSync', function () {
    it('returns `false`', function () {
      expect(model.isSync()).toBeFalsy();
    });
  });

  describe('wantsKeys', function () {
    it('returns `false`', function () {
      expect(model.wantsKeys()).toBeFalsy();
    });
  });

  describe('isTrusted', function () {
    it('returns `true`', () => {
      expect(model.isTrusted()).toBeTruthy();
    });
  });

  // TODO: Move elsewhere
  // describe('accountNeedsPermissions', function () {
  //   it('returns `false`', function () {
  //     expect(relier.accountNeedsPermissions).toBeFalsy();
  //   });
  // });
});
