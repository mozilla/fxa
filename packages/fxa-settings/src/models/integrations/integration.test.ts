/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import {
  GenericIntegration,
  Integration,
  IntegrationType,
} from './integration';
import { IntegrationData } from './data/data';
import { IntegrationFeatures } from './features';

describe('Integration Model', function () {
  const window = new ReachRouterWindow();
  let model: Integration;
  beforeEach(function () {
    model = new GenericIntegration<IntegrationFeatures, IntegrationData>(
      IntegrationType.Web,
      new IntegrationData(new UrlQueryData(window)),
      {
        allowUidChange: false,
        fxaStatus: false,
        handleSignedInNotification: true,
        reuseExistingSession: false,
        supportsPairing: false,
      } satisfies IntegrationFeatures
    );
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
});
