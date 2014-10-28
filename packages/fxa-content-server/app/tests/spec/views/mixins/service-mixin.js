/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'backbone',
  'underscore',
  'lib/promise',
  '../../../mocks/oauth_servers',
  '../../../mocks/window',
  '../../../mocks/channel',
  '../../../lib/helpers',
  'views/mixins/service-mixin',
  'views/base',
  'lib/session',
  'stache!templates/test_template',
  'models/reliers/relier',
  'models/reliers/fx-desktop',
  'models/reliers/oauth',
  'lib/oauth-errors'
], function (Chai, Backbone, _, p, MockOAuthServers, WindowMock, ChannelMock,
        TestHelpers, ServiceMixin, BaseView, Session, TestTemplate,
        Relier, FxDesktopRelier, OAuthRelier, OAuthErrors) {
  var assert = Chai.assert;


  var CLIENT_ID = 'dcdb5ae7add825d2';
  var STATE = '123';
  var CODE = 'd74e7d9b2c5e8be20fbff978b7804f648369b3f1f87ba7426cbe96bc2c5e360f';
  var DEFAULT_REDIRECT_STRING = TestHelpers.toSearchString({
    code: CODE,
    state: STATE
  });


  var OAuthView = BaseView.extend({
    template: TestTemplate,
    className: 'oauth',
    initialize: function (options) {
      this.channel = options.channel;
    }
  });
  _.extend(OAuthView.prototype, ServiceMixin);

  describe('views/mixins/service-mixin', function () {
    var view;
    var windowMock;
    var channelMock;
    var relier;

    beforeEach(function () {
      windowMock = new WindowMock();
      channelMock = new ChannelMock();
      relier = new OAuthRelier();

      view = new OAuthView({
        window: windowMock,
        channel: channelMock,
        relier: relier
      });

      return view.render();
    });

    describe('_decorateOAuthResult', function () {
      it('decorates nothing by default', function () {
        return view._decorateOAuthResult({}, {})
          .then(function (result) {
            assert.notOk(result.closeWindow);
            assert.notOk(result.timeout);
          });
      });

      it('decorates WebChannel from the relier', function () {
        relier.set('webChannelId', 'id');

        return view._decorateOAuthResult({}, {
          viewOptions: {
            source: 'signin'
          }
        }).then(function (result) {
          assert.isTrue(result.closeWindow);
          assert.ok(result.timeout);
          Session.clear('oauth');
        });
      });
    });

    describe('_formatOAuthResult', function () {
      it('throws on null', function () {
        relier.set('state', STATE);
        return view._formatOAuthResult().then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT'));
        });
      });

      it('throws on an empty object', function () {
        relier.set('state', STATE);
        return view._formatOAuthResult({}).then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT_REDIRECT'));
        });
      });

      it('catches invalid codes', function () {
        var redirectBadCode = TestHelpers.toSearchString({
          code: 'a',
          state: 'state1'
        });
        relier.set('state', STATE);
        return view._formatOAuthResult({
          redirect: redirectBadCode
        }).then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT_CODE'));
        });
      });

      it('formats the redirect params', function () {
        relier.set('state', STATE);
        return view._formatOAuthResult({
          redirect: DEFAULT_REDIRECT_STRING
        }).then(function (result) {
          assert.equal(result.redirect, DEFAULT_REDIRECT_STRING);
          assert.equal(result.code, CODE);
          assert.equal(result.state, STATE);
        });
      });
    });

    describe('_notifyChannel', function () {
      var mockChannel = {
        init: function () {},
        send: function (msg, data, done) { done(); },
        teardown: function () {}
      };

      it('throws timeout errors', function (done) {
        view.channel = mockChannel;
        view.setTimeout = function (func) { func(); };

        var displayedError = false;
        view.displayError = function () {
          displayedError = true;
          done();
        };

        view._notifyChannel({}, {timeout: 1});
      });

      it('throws channel errors', function () {
        view.channel = mockChannel;
        view.channel.send = function (msg, data, done) {
          done(new Error('Cannot send events'));
        };

        return view._notifyChannel({})
          .then(assert.fail, function () {
            assert.ok('Error thrown');
          });
      });
    });

    describe('finishOAuthFlow', function () {
      var mockAssertionLibrary = {
        generate: function () {
          return p('mockAssertion');
        }
      };
      var mockConfigLoader = {
        fetch: function () {
          return p({oauthUrl: ''});
        }
      };

      it('notifies the channel', function () {
        view.assertionLibrary = mockAssertionLibrary;
        view._configLoader = mockConfigLoader;
        view._oAuthParams = {};
        view._oAuthClient = {
          getCode: function () {
            return p({redirect: DEFAULT_REDIRECT_STRING});
          }
        };

        return view.finishOAuthFlow()
          .then(function () {
            assert.equal(Session.oauth, null);
          });
      });

      it('throws errors', function () {
        view.assertionLibrary = mockAssertionLibrary;
        view._configLoader = mockConfigLoader;
        view._oAuthParams = {};
        view._oAuthClient = {
          getCode: function () {
            return p({});
          }
        };
        var displayedError = false;
        view.displayError = function () {
          displayedError = true;
        };

        return view.finishOAuthFlow()
          .then(function () {
            assert.isTrue(displayedError);
          });
      });
    });

    describe('isOAuthSameBrowser', function () {
      it('returns false if completing oauth in a different browser', function () {
        view.setupOAuth();
        assert.isFalse(view.isOAuthSameBrowser());
      });

      it('returns true if completing oauth in the same browser', function () {
        relier.set('clientId', CLIENT_ID);
        view.setupOAuth();
        // Session.oauth is ordinarily set by the /oauth/signin or
        // /oauth/signup pages. Synthesize it for the test.
        view.persistOAuthParams();

        assert.isTrue(view.isOAuthSameBrowser());
      });
    });

    describe('isOAuthDifferentBrowser', function () {
      it('returns true if completing oauth in a different browser', function () {
        view.setupOAuth();
        assert.isTrue(view.isOAuthDifferentBrowser());
      });

      it('returns false if completing oauth in the same browser', function () {
        relier.set('state', STATE);
        relier.set('clientId', CLIENT_ID);
        view.setupOAuth();

        // Session.oauth is ordinarily set by the /oauth/signin or
        // /oauth/signup pages. Synthesize it for the test.
        view.persistOAuthParams();
        assert.isFalse(view.isOAuthDifferentBrowser());
      });
    });

    describe('displayErrorUnsafe', function () {
      it('converts /signin links to /oauth/signin', function () {
        view.displayErrorUnsafe('<a href="/signin" id="replaceMe">error</a>');
        assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin');
      });

      it('converts /signup links to /oauth/signup', function () {
        view.displayErrorUnsafe('<a href="/signup" id="replaceMe">error</a>');
        assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signup');
      });
    });
  });
});

