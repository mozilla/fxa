/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const FxSyncAuthenticationBroker = require('models/auth_brokers/fx-sync');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/fx-sync', () => {
    let windowMock;

    beforeEach(() => {
      windowMock = new WindowMock();
    });

    it('can be created', () => {
      assert.ok(new FxSyncAuthenticationBroker({ window: windowMock }));
    });
  });
});
