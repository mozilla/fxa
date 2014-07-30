/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings/avatar_gravatar',
  '../../../mocks/router',
  'lib/session'
],
function (chai, _, $, View, RouterMock, Session) {
  var assert = chai.assert;
  var GRAVATAR_URL = 'https://www.gravatar.com/avatar/';

  describe('views/settings/avatar/gravatar', function () {
    var view, routerMock;

    beforeEach(function () {
      routerMock = new RouterMock();
      view = new View({
        router: routerMock
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function() {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      it('hashed email', function () {
        var email = 'MyEmailAddress@example.com  ';
        Session.set('email', email);

        view = new View();
        assert.equal(view.hashedEmail, '0bc83cb571cd1c50ba6f3e8a78ef1346');
      });

      it('not found', function () {
        view.isUserAuthorized = function () {
          return true;
        };
        return view.render()
          .then(function () {
            view.notFound();
            assert.equal(routerMock.page, 'settings/avatar');
            assert.equal(view.ephemeralMessages.get('error'), 'No Gravatar found');
          });
      });

      it('submits', function () {
        var email = 'MyEmailAddress@example.com  ';
        Session.set('email', email);

        view = new View({
          router: routerMock
        });
        view.isUserAuthorized = function () {
          return true;
        };
        return view.render()
          .then(function () {
            view.submit();
            assert.include(Session.avatar, GRAVATAR_URL + '0bc83cb571cd1c50ba6f3e8a78ef1346');
            assert.equal(routerMock.page, 'settings/avatar');
            assert.equal(view.ephemeralMessages.get('successUnsafe'), 'Courtesy of <a href="https://www.gravatar.com">Gravatar</a>');
          });
      });
    });
  });
});


