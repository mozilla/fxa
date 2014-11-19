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
  'models/user',
  'lib/promise',
  'lib/profile-client'
],
function (chai, _, $, sinon, View, RouterMock, ProfileMock, User,
    p, ProfileClient) {
  var assert = chai.assert;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';
  var EMAIL_HASH = '0bc83cb571cd1c50ba6f3e8a78ef1346';
  var email = 'MyEmailAddress@example.com  ';

  describe('views/settings/avatar/gravatar', function () {
    var view;
    var routerMock;
    var profileClientMock;
    var user;
    var account;

    beforeEach(function () {
      routerMock = new RouterMock();
      user = new User();
      view = new View({
        user: user,
        router: routerMock
      });

      account = user.createAccount({
        email: email,
        accessToken: 'abc123',
        verified: true
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
      it('redirects to signin', function () {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        sinon.stub(view, 'currentAccount', function () {
          return account;
        });
        view.isUserAuthorized = function () {
          return true;
        };
      });

      it('hashed email', function () {
        assert.equal(view.hashedEmail(), '0bc83cb571cd1c50ba6f3e8a78ef1346');
      });

      it('not found', function () {
        return view.render()
          .then(function () {
            return view._showGravatar()
              .then(null, function () {
                assert.equal(routerMock.page, 'settings');
                assert.equal(view.ephemeralMessages.get('error'), 'No Gravatar found');
              });
          });
      });

      it('found', function () {
        view.automatedBrowser = true;

        return view.render()
          .then(function () {
            return view._showGravatar();
          });
      });

      describe('submitting', function () {
        beforeEach(function () {
          profileClientMock = new ProfileMock();
          sinon.stub(account, 'profileClient', function () {
            return p(profileClientMock);
          });
        });

        it('submits', function () {
          sinon.stub(profileClientMock, 'postAvatar', function (token, url, selected) {
            assert.isTrue(selected);
            return p({
              id: 'foo'
            });
          });
          view.automatedBrowser = true;

          return view.render()
            .then(function () {
              return view.submit();
            })
            .then(function (result) {
              assert.equal(result.id, 'foo');
              assert.equal(routerMock.page, 'settings');
              assert.equal(view.ephemeralMessages.get('successUnsafe'), 'Courtesy of <a href="https://www.gravatar.com">Gravatar</a>');
            });
        });

        it('submits and errors', function () {
          sinon.stub(profileClientMock, 'postAvatar', function (token, url) {
            assert.include(url, GRAVATAR_URL + EMAIL_HASH);
            return p.reject(ProfileClient.Errors.toError('UNSUPPORTED_PROVIDER'));
          });

          return view.render()
            .then(function () {
              return view.validateAndSubmit();
            })
            .then(function () {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(ProfileClient.Errors.is(err, 'UNSUPPORTED_PROVIDER'));
              assert.isTrue(view.isErrorVisible());
              assert.isTrue(profileClientMock.postAvatar.called);
            });
        });
      });

    });
  });
});


