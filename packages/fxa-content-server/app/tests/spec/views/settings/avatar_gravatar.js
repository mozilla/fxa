/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'sinon',
  'views/settings/avatar_gravatar',
  '../../../mocks/router',
  '../../../mocks/profile',
  'lib/session',
  'lib/promise',
  'lib/profile'
],
function (chai, _, $, sinon, View, RouterMock, ProfileMock, Session, p, Profile) {
  var assert = chai.assert;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';
  var EMAIL_HASH = '0bc83cb571cd1c50ba6f3e8a78ef1346';
  var email = 'MyEmailAddress@example.com  ';

  describe('views/settings/avatar/gravatar', function () {
    var view;
    var routerMock;
    var profileClientMock;

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
      profileClientMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function() {
        view.isUserAuthorized = function () {
          return false;
        };
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      it('hashed email', function () {
        Session.set('email', email);

        view = new View({
          router: routerMock
        });
        assert.equal(view.hashedEmail, '0bc83cb571cd1c50ba6f3e8a78ef1346');
      });

      it('not found', function () {
        view.isUserAuthorized = function () {
          return true;
        };
        return view.render()
          .then(function () {
            return view._showGravatar()
              .then(null, function () {
                assert.equal(routerMock.page, 'settings/avatar');
                assert.equal(view.ephemeralMessages.get('error'), 'No Gravatar found');
              });
          });
      });

      it('found', function () {
        view.isUserAuthorized = function () {
          return true;
        };
        view.automatedBrowser = true;

        return view.render()
          .then(function () {
            return view._showGravatar();
          });
      });

      describe('submitting', function () {
        beforeEach(function () {
          Session.set('email', email);

          profileClientMock = new ProfileMock();

          view = new View({
            router: routerMock,
            profileClient: profileClientMock
          });
          view.isUserAuthorized = function () {
            return true;
          };
        });

        it('submits', function () {
          sinon.stub(profileClientMock, 'postAvatar', function (url) {
            return p({
              id: 'foo'
            });
          });

          return view.render()
            .then(function () {
              return view.submit();
            })
            .then(function () {
              assert.include(Session.avatar, GRAVATAR_URL + EMAIL_HASH);
              assert.equal(Session.avatarId, 'foo');
              assert.equal(routerMock.page, 'settings/avatar');
              assert.equal(view.ephemeralMessages.get('successUnsafe'), 'Courtesy of <a href="https://www.gravatar.com">Gravatar</a>');
            });
        });

        it('submits and errors', function () {
          sinon.stub(profileClientMock, 'postAvatar', function (url) {
            return p.reject(Profile.Errors.toError('UNSUPPORTED_PROVIDER'));
          });

          return view.render()
            .then(function () {
              return view.validateAndSubmit();
            })
            .then(function () {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(Profile.Errors.is(err, 'UNSUPPORTED_PROVIDER'));
              assert.isTrue(view.isErrorVisible());
            });
        });
      });

    });
  });
});


