/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'lib/promise',
  'views/settings/gravatar_permissions',
  'lib/metrics',
  'models/reliers/relier',
  'models/user',
  '../../../mocks/router',
  '../../../lib/helpers'
],
function (chai, $, sinon, p, View, Metrics, Relier, User, RouterMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/settings/gravatar_permissions', function () {
    var view;
    var routerMock;
    var metrics;
    var user;
    var email;
    var account;
    var relier;
    var SERVICE_NAME = 'Gravatar';

    beforeEach(function () {
      email = TestHelpers.createEmail();
      routerMock = new RouterMock();
      metrics = new Metrics();
      user = new User();
      relier = new Relier();
      account = user.initAccount({
        email: email,
        uid: 'uid',
        verified: true,
        sessionToken: 'fake session token'
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
        router: routerMock,
        metrics: metrics,
        user: user,
        relier: relier,
        screenName: 'gravatar-permissions'
      });
      sinon.stub(view, 'navigate', function () { });

      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });

      sinon.stub(view, 'isUserAuthorized', function () {
        return p(true);
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    describe('renders', function () {
      it('redirects to /settings/avatar/gravatar if permissions already granted', function () {
        sinon.stub(account, 'hasGrantedPermissions', function () {
          return true;
        });

        return initView()
          .then(function () {
            assert.isTrue(account.hasGrantedPermissions.calledWith(View.GRAVATAR_MOCK_CLIENT_ID, View.PERMISSIONS));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'gravatar-permissions.already-accepted'));
            assert.isTrue(view.navigate.calledWith('settings/avatar/gravatar'));
          });
      });

      it('shows permission screen if not granted', function () {
        sinon.stub(account, 'hasGrantedPermissions', function () {
          return false;
        });

        return initView()
          .then(function () {
            assert.isTrue(account.hasGrantedPermissions.calledWith(View.GRAVATAR_MOCK_CLIENT_ID, View.PERMISSIONS));
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
        sinon.spy(account, 'saveGrantedPermissions');
        sinon.stub(user, 'setAccount', function () { });
      });

      it('accepts permissions', function () {
        return initView()
          .then(function () {
            return view.submit()
              .then(function () {
                assert.isTrue(account.saveGrantedPermissions.calledWith(View.GRAVATAR_MOCK_CLIENT_ID, View.PERMISSIONS));
                assert.isTrue(user.setAccount.calledWith(account));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'gravatar-permissions.accept'));
                assert.isTrue(view.navigate.calledWith('settings/avatar/gravatar'));
              });
          });
      });

    });

  });
});
