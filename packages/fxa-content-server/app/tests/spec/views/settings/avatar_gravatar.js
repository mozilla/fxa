/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthBroker = require('models/auth_brokers/base');
  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var ProfileClient = require('lib/profile-client');
  var ProfileMock = require('../../../mocks/profile');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var View = require('views/settings/avatar_gravatar');

  var assert = chai.assert;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';
  var EMAIL_HASH = '0bc83cb571cd1c50ba6f3e8a78ef1346';
  var email = 'MyEmailAddress@example.com  ';

  describe('views/settings/avatar/gravatar', function () {
    var account;
    var broker;
    var metrics;
    var notifier;
    var profileClientMock;
    var relier;
    var user;
    var view;

    beforeEach(function () {
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      user = new User();

      broker = new AuthBroker({
        relier: relier
      });

      view = new View({
        broker: broker,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user
      });

      account = user.initAccount({
        accessToken: 'abc123',
        email: email,
        verified: true
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      profileClientMock = null;
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
        sinon.spy(view, 'navigate');
        return view.render()
          .then(function () {
            return view._showGravatar()
              .then(function () {
                assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
                assert.isTrue(AuthErrors.is(view.ephemeralMessages.get('error'), 'NO_GRAVATAR_FOUND'));
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

          sinon.spy(view, 'navigate');

          return view.render()
            .then(function () {
              return view.submit();
            })
            .then(function (result) {
              assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.gravatar.submit.new'));
              assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.avatar.gravatar.submit.change'));
              assert.equal(view.updateProfileImage.args[0][0].get('id'), 'foo');
              assert.equal(view.updateProfileImage.args[0][1], account);
              assert.equal(result.id, 'foo');
              assert.isTrue(view.navigate.calledWith('settings'));
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

