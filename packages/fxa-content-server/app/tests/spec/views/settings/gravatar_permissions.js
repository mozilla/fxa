/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const chai = require('chai');
  const Metrics = require('lib/metrics');
  const p = require('lib/promise');
  const Notifier = require('lib/channels/notifier');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const User = require('models/user');
  const View = require('views/settings/gravatar_permissions');

  var assert = chai.assert;

  describe('views/settings/gravatar_permissions', function () {
    var account;
    var email;
    var metrics;
    var relier;
    var user;
    var view;

    var SERVICE_NAME = 'Gravatar';
    var GRAVATAR_MOCK_CLIENT_ID = View.GRAVATAR_MOCK_CLIENT_ID;
    var GRAVATAR_PERMISSION = View.GRAVATAR_PERMISSION;

    beforeEach(function () {
      email = TestHelpers.createEmail();
      metrics = new Metrics();
      relier = new Relier();
      user = new User();

      account = user.initAccount({
        email: email,
        sessionToken: 'fake session token',
        uid: 'uid',
        verified: true
      });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    function initView () {
      view = new View({
        metrics: metrics,
        notifier: new Notifier(),
        relier: relier,
        user: user
      });
      sinon.stub(view, 'navigate', function () { });

      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });

      sinon.stub(view, 'checkAuthorization',  function () {
        return p(true);
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    describe('renders', function () {
      it('redirects to /settings/avatar/gravatar if permissions already granted', function () {
        sinon.stub(account, 'getClientPermission', function () {
          return true;
        });

        return initView()
          .then(function () {
            assert.isTrue(account.getClientPermission.calledWith(GRAVATAR_MOCK_CLIENT_ID, GRAVATAR_PERMISSION));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'settings.gravatar-permissions.already-accepted'));
            assert.isTrue(view.navigate.calledWith('settings/avatar/gravatar'));
          });
      });

      it('shows permission view if not granted', function () {
        sinon.stub(account, 'getClientPermission', function () {
          return false;
        });

        return initView()
          .then(function () {
            assert.isTrue(account.getClientPermission.calledWith(GRAVATAR_MOCK_CLIENT_ID, GRAVATAR_PERMISSION));
            assert.include(view.$el.html(), SERVICE_NAME);
          });
      });

      it('goes back to avatar change', function () {
        return initView()
          .then(function () {
            view.$('#back').click();
            assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
          });
      });
    });

    describe('submit', function () {
      beforeEach(function () {
        sinon.spy(account, 'setClientPermissions');
        sinon.stub(user, 'setAccount', function () { });
      });

      it('accepts permissions', function () {
        return initView()
          .then(function () {
            return view.submit()
              .then(function () {
                var expectedPermissions = {};
                expectedPermissions[GRAVATAR_PERMISSION] = true;
                assert.isTrue(account.setClientPermissions.calledWith(
                      GRAVATAR_MOCK_CLIENT_ID, expectedPermissions));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'settings.gravatar-permissions.accept'));
                assert.isTrue(view.navigate.calledWith('settings/avatar/gravatar'));
              });
          });
      });
    });
  });
});
