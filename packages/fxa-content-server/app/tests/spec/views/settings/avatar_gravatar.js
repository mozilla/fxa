/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'sinon',
  'views/settings/avatar_gravatar',
  '../../../mocks/router',
  '../../../mocks/profile',
  '../../../lib/helpers',
  'models/user',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'lib/promise',
  'lib/metrics',
  'lib/profile-client'
],
function (chai, $, sinon, View, RouterMock, ProfileMock, TestHelpers, User,
    Relier, AuthBroker, p, Metrics, ProfileClient) {
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
    var relier;
    var broker;
    var metrics;

    beforeEach(function () {
      routerMock = new RouterMock();
      user = new User();
      relier = new Relier();
      broker = new AuthBroker({
        relier: relier
      });
      metrics = new Metrics();

      view = new View({
        user: user,
        router: routerMock,
        relier: relier,
        broker: broker,
        metrics: metrics,
        screenName: 'settings.avatar.gravatar'
      });

      account = user.initAccount({
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
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
        view.isUserAuthorized = function () {
          return p(true);
        };
      });

      it('hashed email', function () {
        assert.equal(view.hashedEmail(), '0bc83cb571cd1c50ba6f3e8a78ef1346');
      });

      it('not found', function () {
        return view.render()
          .then(function () {
            return view._showGravatar()
              .then(function () {
                assert.equal(routerMock.page, 'settings/avatar/change');
                assert.equal(view.ephemeralMessages.get('error'), 'No Gravatar found');
              });
          });
      });

      it('found', function () {
        sinon.stub(broker, 'isAutomatedBrowser', function () {
          return true;
        });

        return view.render()
          .then(function () {
            sinon.spy(view, 'render');
            return view._showGravatar();
          })
          .then(function () {
            assert.isTrue(view.render.called);
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
            assert.include(url, GRAVATAR_URL + EMAIL_HASH);
            assert.isTrue(selected);
            return p({
              id: 'foo'
            });
          });

          sinon.stub(view, 'updateProfileImage', function (result) {
            assert.ok(result);
            return p();
          });

          return view.render()
            .then(function () {
              return view.submit();
            })
            .then(function (result) {
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.gravatar.submit.new'));
              assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.avatar.gravatar.submit.change'));
              assert.equal(view.updateProfileImage.args[0][0].get('id'), 'foo');
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

        it('properly tracks avatar change events', function () {
          // set the account to have an existing profile image id
          account.set('hadProfileImageSetBefore', true);
          sinon.stub(profileClientMock, 'postAvatar', function () {
            return p({
              id: 'foo'
            });
          });

          sinon.stub(view, 'updateProfileImage', function () {
            return p();
          });

          return view.render()
            .then(function () {
              return view.submit();
            })
            .then(function () {
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.gravatar.submit.change'));
            });

        });
      });

    });
  });
});


