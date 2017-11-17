/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function(require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const { assert } = require('chai');
  const p = require('lib/promise');
  const SettingsBehavior = require('views/behaviors/settings');
  const NullBehavior = require('views/behaviors/null');
  const sinon = require('sinon');

  describe('views/behaviors/settings', () => {
    let settingsBehavior;
    let defaultBehavior;

    before(() => {
      defaultBehavior = new NullBehavior();
      settingsBehavior = new SettingsBehavior(defaultBehavior);
    });

    it('has the expected type', () => {
      assert.equal(settingsBehavior.type, 'settings');
    });

    describe('user is signed in', () => {
      it('returns a NavigateBehavior', () => {
        const view = {
          invokeBehavior: sinon.spy(),
        };
        const account = new Account();
        sinon.stub(account, 'isSignedIn').callsFake(() => p(true));

        return settingsBehavior(view, account)
          .then((behavior) => {
            assert.equal(behavior.type, 'navigate');
            assert.equal(behavior.endpoint, 'settings');
          });
      });
    });

    describe('user is not signed in', () => {
      it('returns the defaultBehavior', () => {
        const view = {
          invokeBehavior: sinon.spy(),
        };
        const account = new Account();
        sinon.stub(account, 'isSignedIn').callsFake(() => p(false));

        return settingsBehavior(view, account)
          .then((behavior) => {
            assert.strictEqual(behavior, defaultBehavior);
          });
      });
    });
  });
});
