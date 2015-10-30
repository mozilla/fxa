/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'lib/promise',
  'views/settings/display_name',
  'lib/metrics',
  'lib/channels/notifier',
  'models/reliers/relier',
  'models/user',
  '../../../mocks/router',
  '../../../lib/helpers',
  'lib/key-codes'
],
function (chai, $, sinon, p, View, Metrics, Notifier, Relier, User, RouterMock, TestHelpers, KeyCodes) {
  'use strict';

  var assert = chai.assert;

  describe('views/settings/display_name', function () {
    var view;
    var routerMock;
    var metrics;
    var user;
    var email;
    var account;
    var relier;
    var notifier;

    beforeEach(function () {
      email = TestHelpers.createEmail();
      routerMock = new RouterMock();
      metrics = new Metrics();
      user = new User();
      relier = new Relier();
      notifier = new Notifier();
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
        notifier: notifier,
        relier: relier,
        router: routerMock,
        user: user
      });

      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });

      sinon.stub(view, 'isUserAuthorized', function () {
        return p(true);
      });
      sinon.stub(account, 'fetchProfile', function () {
        return p();
      });
      sinon.stub(user, 'setAccount', function () {
        return p();
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    }

    describe('renders', function () {
      it('redirects to /settings/avatar/gravatar if permissions already granted', function () {
        var name = 'joe cool';
        account.set('displayName', name);

        return initView()
          .then(function () {
            assert.isTrue(account.fetchProfile.called);
            assert.isTrue(user.setAccount.calledWith(account));
            assert.equal(view.getElementValue('input.display-name'), name);
          });
      });

      it('onProfileUpdate', function () {
        return initView()
          .then(function () {
            sinon.stub(view, 'render', function () {
              return p();
            });
            view.onProfileUpdate();
            assert.isTrue(view.render.called);
          });
      });

      it('has floating labels on input', function () {
        return initView()
          .then(function () {
            view.$('.display-name').val('a');
            var event = new $.Event('input');
            event.which = KeyCodes.ENTER;

            assert.isFalse(view.$('.label-helper').text().length > 0);
            view.$('.display-name').trigger(event);
            assert.isTrue(view.$('.label-helper').text().length > 0);
          });
      });
    });

    describe('submit', function () {
      it('submits correctly', function () {
        var name = '  joe cool  ';
        sinon.stub(account, 'postDisplayName', function () {
          return p();
        });

        return initView()
          .then(function () {
            sinon.stub(view, 'updateDisplayName', function () {
              return p();
            });
            sinon.stub(view, 'displaySuccess', function () {
              return p();
            });
            sinon.spy(view, 'render');
            view.$('input.display-name').val(name);
            return view.submit();
          })
          .then(function () {
            var expectedName = name.trim();
            assert.isTrue(account.postDisplayName.calledWith(expectedName));
            assert.isTrue(view.updateDisplayName.calledWith(expectedName));
            assert.isTrue(view.displaySuccess.called);
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'settings.display-name.success'));
            assert.equal(routerMock.page, 'settings');
          });
      });

    });

  });
});
