/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'models/reliers/oauth',
  'lib/session',
  'lib/oauth-client',
  'lib/promise',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, sinon, OAuthRelier, Session, OAuthClient, p, WindowMock,
      TestHelpers) {
  var assert = chai.assert;

  describe('models/reliers/oauth', function () {
    var relier;
    var oAuthClient;
    var windowMock;

    var STATE = 'fakestatetoken';
    var SERVICE = 'service';
    var SERVICE_NAME = '123Done';
    var CLIENT_ID = 'dcdb5ae7add825d2';
    var REDIRECT_URI = 'http://redirect.here';
    var SERVER_REDIRECT_URI = 'http://127.0.0.1:8080/api/oauth';
    var SCOPE = 'profile:name';
    var ACTION = 'signup';
    var PREVERIFY_TOKEN = 'abigtoken';

    var RESUME_INFO = {
      state: STATE,
      //jshint camelcase: false
      client_id: CLIENT_ID,
      scope: SCOPE,
      action: ACTION
    };

    beforeEach(function () {
      windowMock = new WindowMock();
      oAuthClient = new OAuthClient();

      sinon.stub(oAuthClient, 'getClientInfo', function () {
        return p({
          name: SERVICE_NAME,
          redirect_uri: SERVER_REDIRECT_URI
        });
      });

      relier = new OAuthRelier({
        window: windowMock,
        oAuthClient: oAuthClient,
        session: Session
      });
    });

    describe('fetch', function () {
      it('populates expected fields from the search parameters', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          preVerifyToken: PREVERIFY_TOKEN,
          service: SERVICE,
          state: STATE,
          //jshint camelcase: false
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          scope: SCOPE,
          action: ACTION
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('preVerifyToken'), PREVERIFY_TOKEN);
              assert.equal(relier.get('service'), SERVICE);
              assert.equal(relier.get('state'), STATE);

              // client_id and redirect_uri are converted to camelCase
              // for consistency with other variables in the app.
              assert.equal(relier.get('clientId'), CLIENT_ID);

              // The redirect_uri passed in is ignored, we only care about
              // the redirect_uri returned by the oauth server
              assert.notEqual(relier.get('redirectUri'), REDIRECT_URI);
            });
      });

      it('sets serviceName and redirectUri from parameters returned by the server', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          preVerifyToken: PREVERIFY_TOKEN,
          service: SERVICE,
          state: STATE,
          //jshint camelcase: false
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          scope: SCOPE,
          action: ACTION
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('serviceName'), SERVICE_NAME);
              assert.equal(relier.get('redirectUri'), SERVER_REDIRECT_URI);
            });
      });

      it('populates OAuth information from Session to allow a user to verify', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: '123'
        });
        Session.set('oauth', RESUME_INFO);

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('state'), STATE);
              assert.equal(relier.get('clientId'), CLIENT_ID);
              assert.equal(relier.get('scope'), SCOPE);
            });
      });

      it('populates `clientId` and `service` from the `service` URL search parameter if verifying in a second browser', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: '123',
          service: CLIENT_ID
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('clientId'), CLIENT_ID);
              assert.equal(relier.get('service'), CLIENT_ID);
            });
      });

      it('populates service with client_id if service is not set', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          //jshint camelcase: false
          client_id: CLIENT_ID
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('service'), CLIENT_ID);
            });
      });
    });

    describe('isOAuth', function () {
      it('returns `true`', function () {
        assert.isTrue(relier.isOAuth());
      });
    });

    describe('toResumeToken', function () {
      it('returns an opaque token to be passed along with email verification links', function () {
        relier.set('state', 'STATE');
        assert.equal(typeof relier.toResumeToken(), 'string');
      });
    });
  });
});

