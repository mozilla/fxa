/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'sinon',
  'views/settings',
  '../../mocks/router',
  '../../mocks/profile',
  '../../lib/helpers',
  'lib/session',
  'lib/constants',
  'lib/fxa-client',
  'lib/promise',
  'models/reliers/relier'
],
function (chai, _, $, sinon, View, RouterMock, ProfileMock, TestHelpers, Session, Constants,
      FxaClient, p, Relier) {
  var assert = chai.assert;

  describe('views/settings', function () {
    var view;
    var routerMock;
    var fxaClient;
    var profileClientMock;
    var relier;

    beforeEach(function () {
      routerMock = new RouterMock();
      relier = new Relier();
      fxaClient = new FxaClient();
      profileClientMock = new ProfileMock();

      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        relier: relier,
        profileClient: profileClientMock
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        sinon.stub(view.fxaClient, 'sessionStatus', function () {
          return p(true);
        });
        Session.set('sessionToken', 'sessiontoken');

        sinon.stub(profileClientMock, 'getAvatar', function () {
          return p({});
        });

        email = TestHelpers.createEmail();

        return view.render()
          .then(function () {
            $('body').append(view.el);
          });
      });

      it('shows the settings page', function () {
        assert.ok(view.$('#fxa-settings-header').length);
      });

      it('has no avatar set', function () {
        Session.clear('avatar');

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 0);
          });
      });

      it('has an avatar set', function () {
        var url = 'https://example.com/avatar.jpg';
        var id = 'foo';
        profileClientMock.getAvatar.restore();
        sinon.stub(profileClientMock, 'getAvatar', function () {
          return p({ avatar: url, id: id });
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').attr('src'), url);
          });
      });

      describe('submit', function () {
        it('signs the user out, redirects to signin page', function () {
          return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'signin');
              });
        });
      });

      describe('desktop context', function () {
        it('does not show sign out link', function () {
          Session.set('sessionTokenContext', Constants.FX_DESKTOP_CONTEXT);

          return view.render()
            .then(function () {
              assert.equal(view.$('#signout').length, 0);
            });
        });
      });
    });
  });
});


