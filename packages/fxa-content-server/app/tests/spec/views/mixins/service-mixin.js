/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'backbone',
  'underscore',
  '../../../mocks/oauth_servers',
  '../../../mocks/window',
  '../../../mocks/channel',
  'views/mixins/service-mixin',
  'views/base',
  'lib/session',
  'stache!templates/test_template'
], function (Chai, Backbone, _, MockOAuthServers, WindowMock, ChannelMock, ServiceMixin, BaseView, Session, TestTemplate) {
  var assert = Chai.assert;


  var CLIENT_ID = 'dcdb5ae7add825d2';
  var STATE = '123';
  var SCOPE = 'profile:email';
  var CLIENT_NAME = '123Done';
  var BASE_REDIRECT_URL = 'http://127.0.0.1:8080/api/oauth';
  var DEFAULT_SEARCH_STRING = '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE;


  var OAuthView = BaseView.extend({
    template: TestTemplate,
    className: 'oauth',
    initialize: function (options) {
      this.channel = options.channel;
    }
  });
  _.extend(OAuthView.prototype, ServiceMixin);

  describe('views/mixins/service-mixin', function() {
    var view, windowMock, channelMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      channelMock = new ChannelMock();

      view = new OAuthView({
        window: windowMock,
        channel: channelMock
      });

      return view.render();
    });

    describe('setupOAuth', function () {
      it('gets OAuth parameters from window.location.search', function() {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        assert.equal(Session.service, CLIENT_ID);
      });
    });

    describe('setServiceInfo', function () {
      describe('with no OAuth params and service set to sync', function () {
        it('uses the ServiceName service to translate to a human readable name', function () {
          Session.set('service', 'sync');

          view.setupOAuth();
          return view.setServiceInfo()
              .then(function () {
                assert.equal(view.serviceName, 'Firefox Sync');
              });
        });
      });

      describe('with OAuth params', function () {
        it('fetches info from the OAuth server', function () {
          /*jshint camelcase: false*/
          windowMock.location.search = DEFAULT_SEARCH_STRING;
          view.setupOAuth();

          var mockOAuthServers = new MockOAuthServers();

          return view.setServiceInfo()
              .then(function () {
                assert.equal(view.serviceName, CLIENT_NAME);
                assert.include(view.serviceRedirectURI, BASE_REDIRECT_URL);
                mockOAuthServers.destroy();
              });
        });
      });
    });

    describe('hasService', function () {
      it('returns true if the view has a service', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        assert.isTrue(view.hasService());
      });

      it('returns false if the view does not have a service', function () {
        assert.isFalse(view.hasService());
      });
    });

    describe('finishOAuthFlowDifferentBrowser', function () {
      it('notifies the channel', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        return view.finishOAuthFlowDifferentBrowser()
            .then(function () {
              assert.equal(channelMock.getMessageCount('oauth_complete'), 1);
            });
      });
    });

    describe('finishOAuthFlow', function () {
      it('notifies the channel', function () {
        // TODO - fill this in with #1141
      });
    });

    describe('isOAuth', function () {
      it('returns true if the user is in the OAuth flow', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        assert.isTrue(view.isOAuth());
      });

      it('returns false if the user is not in the OAuth flow', function () {
        windowMock.location.search = '';
        assert.isFalse(view.isOAuth());
      });
    });

    describe('isOAuthSameBrowser', function () {
      it('returns false if completing oauth in a different browser', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        assert.isFalse(view.isOAuthSameBrowser());
      });

      it('returns true if completing oauth in the same browser', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();

        // Session.oauth is ordinarily set by the /oauth/signin or
        // /oauth/signup pages. Synthesize it for the test.
        view.persistOAuthParams();
        assert.isTrue(view.isOAuthSameBrowser());
      });
    });

    describe('isOAuthDifferentBrowser', function () {
      it('returns true if completing oauth in a different browser', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
        view.setupOAuth();
        assert.isTrue(view.isOAuthDifferentBrowser());
      });

      it('returns false if completing oauth in the same browser', function () {
        windowMock.location.search = DEFAULT_SEARCH_STRING;
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

    describe('isSync', function () {
      it('returns true if the service is sync', function () {
        Session.set('service', 'sync');

        view.setupOAuth();
        assert.isTrue(view.isSync());
      });

      it('returns false if the service is not sync', function () {
        Session.set('service', 'loop');

        view.setupOAuth();
        assert.isFalse(view.isSync());
      });
    });
  });
});

