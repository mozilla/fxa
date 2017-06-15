/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const MobIosV1AuthenticationBroker = require('models/auth_brokers/mob-ios-v1');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/mob-ios-v1', () => {
    let windowMock;

    beforeEach(() => {
      windowMock = new WindowMock();
    });

    it('can be created', () => {
      const instance = new MobIosV1AuthenticationBroker({ window: windowMock });
      assert.ok(instance);
      assert.equal(instance.type, 'mob-ios-v1');
    });
  });
});
