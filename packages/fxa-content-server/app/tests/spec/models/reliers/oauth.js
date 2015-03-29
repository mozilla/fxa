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
  'lib/oauth-errors',
  'lib/promise',
  'lib/relier-keys',
  'lib/url',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, sinon, OAuthRelier, Session, OAuthClient, OAuthErrors,
      p, RelierKeys, Url, WindowMock, TestHelpers) {
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

            // Encryption keys are not fetched by default.
            assert.equal(relier.get('keys'), false);
          });
      });

      it('sets serviceName, redirectUri, and origin from parameters returned by the server', function () {
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
            assert.equal(relier.get('origin'), Url.getOrigin(SERVER_REDIRECT_URI));
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

      it('errors in verification flow if `client_id` is missing', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: '123'
        });
        Session.set('oauth', {
          state: STATE,
          scope: SCOPE,
          action: ACTION
        });

        return relier.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
            assert.equal(err.param, 'client_id');
          });
      });

      it('populates `clientId` and `service` from the `service` URL search parameter if verifying in a second browser', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: '123',
          service: CLIENT_ID,
          scope: SCOPE
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('clientId'), CLIENT_ID);
            assert.equal(relier.get('service'), CLIENT_ID);
          });
      });

      it('populates `keys` from the URL search parameter if given', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          keys: 'true',
          client_id: CLIENT_ID,
          scope: SCOPE
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('keys'), true);
          });
      });

      it('populates service with client_id if service is not set', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          //jshint camelcase: false
          client_id: CLIENT_ID,
          scope: SCOPE
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('service'), CLIENT_ID);
          });
      });

      it('errors if `client_id` is missing', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          scope: SCOPE
        });

        return relier.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
            assert.equal(err.param, 'client_id');
          });
      });

      it('errors if the `client_id` is unknown or invalid', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          client_id: 'BAD_CLIENT_ID',
          scope: SCOPE
        });

        oAuthClient.getClientInfo.restore();
        sinon.stub(oAuthClient, 'getClientInfo', function () {
          return p.reject(OAuthErrors.toError('INVALID_REQUEST_SIGNATURE'));
        });

        return relier.fetch()
          .then(assert.fail, function (err) {
            // INVALID_REQUEST_SIGNATURE should be converted to
            // UNKNOWN_CLIENT
            assert.isTrue(OAuthErrors.is(err, 'UNKNOWN_CLIENT'));
          });
      });

      it('errors if `scope` is missing', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          client_id: CLIENT_ID
        });

        return relier.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
            assert.equal(err.param, 'scope');
          });
      });
    });

    describe('isOAuth', function () {
      it('returns `true`', function () {
        assert.isTrue(relier.isOAuth());
      });
    });

    describe('getResumeToken', function () {
      it('returns an opaque token to be passed along with email verification links', function () {
        relier.set('state', 'STATE');
        assert.equal(typeof relier.getResumeToken(), 'string');
      });
    });

    describe('wantsKeys', function () {
      it('returns `true` only when keys are explicitly asked for', function () {
        assert.isFalse(relier.wantsKeys());
        relier.set('keys', true);
        assert.isTrue(relier.wantsKeys());
      });
    });

    describe('deriveRelierKeys', function () {
      it('derives `kAr` and `kBr` account master keys', function () {
        sinon.stub(RelierKeys, 'deriveRelierKeys', function () {
          return p({ kAr: 'kAr', kBr: 'kBr' });
        });
        var mockKeys = { kA: 'kA', kB: 'kB' };
        return relier.deriveRelierKeys(mockKeys, 'uid')
          .then(function (keys) {
            assert.isTrue(RelierKeys.deriveRelierKeys.calledWith(mockKeys, 'uid'));
            assert.equal(keys.kAr, 'kAr');
            assert.equal(keys.kBr, 'kBr');
          });
      });
    });
  });
});

