/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Constants from 'lib/constants';
import OAuthClient from 'lib/oauth-client';
import OAuthErrors from 'lib/oauth-errors';
import OAuthPrompt from 'lib/oauth-prompt';
import OAuthRelier from 'models/reliers/oauth';
import Session from 'lib/session';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

/*eslint-disable camelcase */
const { getValueLabel, toSearchString } = TestHelpers;

describe('models/reliers/oauth', () => {
  let config;
  var err;
  var isTrusted;
  var oAuthClient;
  var relier;
  var user;
  var windowMock;

  var ACCESS_TYPE = 'offline';
  var ACTION = 'email';
  var CLIENT_ID = 'dcdb5ae7add825d2';
  var CLIENT_IMAGE_URI =
    'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.pngx';
  var PROMPT = OAuthPrompt.CONSENT;
  var QUERY_REDIRECT_URI = 'http://127.0.0.1:8080/api/oauth';
  var SCOPE = 'profile:email profile:uid';
  var SCOPE_PROFILE = Constants.OAUTH_TRUSTED_PROFILE_SCOPE;
  var SCOPE_PROFILE_EXPANDED = Constants.OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION.join(
    ' '
  );
  var PERMISSIONS = ['profile:email', 'profile:uid'];
  var SCOPE_WITH_EXTRAS = 'profile:email profile:uid profile:non_whitelisted';
  var SCOPE_WITH_OPENID = 'profile:email profile:uid openid';
  var SERVER_REDIRECT_URI = 'http://127.0.0.1:8080/api/oauth';
  var SERVICE = 'service';
  var SERVICE_NAME = '123Done';
  var STATE = 'fakestatetoken';
  var CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
  var CODE_CHALLENGE_METHOD = 'S256';
  const ACR_VALUES = 'AAL1';
  let RESUME_INFO;

  beforeEach(() => {
    RESUME_INFO = {
      access_type: ACCESS_TYPE,
      action: ACTION,
      client_id: CLIENT_ID,
      redirect_uri: QUERY_REDIRECT_URI,
      scope: SCOPE,
      state: STATE,
    };
    isTrusted = false;
    oAuthClient = new OAuthClient();
    windowMock = new WindowMock();

    mockGetClientInfo();

    user = new User();

    config = {};

    relier = new OAuthRelier(
      {},
      {
        config,
        oAuthClient: oAuthClient,
        session: Session,
        window: windowMock,
      }
    );
  });

  describe('fetch', () => {
    describe('signin/signup flow', () => {
      it('populates expected fields from the search parameters', () => {
        windowMock.location.search = toSearchString({
          access_type: ACCESS_TYPE,
          acr_values: ACR_VALUES,
          action: ACTION,
          client_id: CLIENT_ID,
          code_challenge: CODE_CHALLENGE,
          code_challenge_method: CODE_CHALLENGE_METHOD,
          prompt: PROMPT,
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
          state: STATE,
        });

        return relier.fetch().then(() => {
          // context is not imported from query params
          assert.equal(relier.get('context'), Constants.OAUTH_CONTEXT);

          assert.equal(relier.get('action'), ACTION);

          assert.equal(relier.get('prompt'), PROMPT);

          // service will be the client_id in the signin/up flow
          assert.equal(relier.get('service'), CLIENT_ID);
          assert.equal(relier.get('state'), STATE);

          // client_id and redirect_uri are converted to camelCase
          // for consistency with other variables in the app.
          assert.equal(relier.get('clientId'), CLIENT_ID);
          assert.equal(relier.get('accessType'), ACCESS_TYPE);

          // The redirect_uri is matched with the server, if no match then we throw
          assert.equal(relier.get('redirectUri'), SERVER_REDIRECT_URI);

          // PKCE parameters
          assert.equal(relier.get('codeChallenge'), CODE_CHALLENGE);
          assert.equal(
            relier.get('codeChallengeMethod'),
            CODE_CHALLENGE_METHOD
          );

          assert.equal(relier.get('acrValues'), ACR_VALUES);
        });
      });

      it('throws if `service` is specified', () => {
        windowMock.location.search = toSearchString({
          access_type: ACCESS_TYPE,
          action: ACTION,
          client_id: CLIENT_ID,
          prompt: PROMPT,
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
          service: SERVICE,
          state: STATE,
        });

        return relier.fetch().then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
        });
      });

      it('throws if invalid PKCE code_challenge is specified', () => {
        windowMock.location.search = toSearchString({
          access_type: ACCESS_TYPE,
          action: ACTION,
          client_id: CLIENT_ID,
          code_challenge: 'foo',
          prompt: PROMPT,
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
          state: STATE,
        });

        return relier.fetch().then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'code_challenge');
        });
      });

      it('throws if invalid PKCE code_challenge_method is specified', () => {
        windowMock.location.search = toSearchString({
          access_type: ACCESS_TYPE,
          action: ACTION,
          client_id: CLIENT_ID,
          code_challenge_method: 'foo',
          prompt: PROMPT,
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
          state: STATE,
        });

        return relier.fetch().then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'code_challenge_method');
        });
      });
    });

    describe('verification flow', () => {
      it('populates OAuth information from Session if verifying in the same browser', () => {
        windowMock.location.search = toSearchString({
          client_id: CLIENT_ID,
          code: '123',
          redirect_uri: QUERY_REDIRECT_URI,
        });
        Session.set('oauth', RESUME_INFO);

        return relier.fetch().then(() => {
          assert.equal(relier.get('state'), STATE);
          // both clientId and service are populated from the stored info.
          assert.equal(relier.get('clientId'), CLIENT_ID);
          assert.equal(relier.get('service'), CLIENT_ID);
          assert.equal(relier.get('scope'), SCOPE);
          assert.equal(relier.get('accessType'), ACCESS_TYPE);
        });
      });

      it('populates PKCE params from Session if verifying in the same tab', () => {
        windowMock.location.search = toSearchString({
          client_id: CLIENT_ID,
          code: '123',
          redirect_uri: QUERY_REDIRECT_URI,
        });
        RESUME_INFO.code_challenge = CODE_CHALLENGE;
        RESUME_INFO.code_challenge_method = CODE_CHALLENGE_METHOD;
        Session.set('oauth', RESUME_INFO);

        return relier.fetch().then(() => {
          assert.equal(relier.get('state'), STATE);
          // both clientId and service are populated from the stored info.
          assert.equal(relier.get('clientId'), CLIENT_ID);
          assert.equal(relier.get('service'), CLIENT_ID);
          assert.equal(relier.get('scope'), SCOPE);
          assert.equal(relier.get('accessType'), ACCESS_TYPE);
          assert.equal(relier.get('codeChallenge'), CODE_CHALLENGE);
          assert.equal(
            relier.get('codeChallengeMethod'),
            CODE_CHALLENGE_METHOD
          );
        });
      });

      it('populates OAuth information from from the `service` query params if verifying in a second browser', () => {
        windowMock.location.search = toSearchString({
          code: '123',
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
          service: CLIENT_ID,
        });

        return relier.fetch().then(() => {
          assert.equal(relier.get('clientId'), CLIENT_ID);
          assert.equal(relier.get('service'), CLIENT_ID);
        });
      });
    });

    describe('success flow', () => {
      it('sets up the success flow', () => {
        windowMock.location.pathname = `/oauth/success/${CLIENT_ID}`;
        sinon.spy(relier, '_setupSuccessFlow');

        return relier.fetch().then(() => {
          assert.equal(relier.get('clientId'), CLIENT_ID, 'sets the client id');
          assert.isTrue(relier._setupSuccessFlow.calledOnce);
        });
      });
    });

    it('sets serviceName, and redirectUri from parameters returned by the server', () => {
      windowMock.location.search = toSearchString({
        action: ACTION,
        client_id: CLIENT_ID,
        redirect_uri: QUERY_REDIRECT_URI,
        scope: SCOPE,
        state: STATE,
      });

      return relier.fetch().then(() => {
        assert.equal(relier.get('serviceName'), SERVICE_NAME);
        assert.equal(relier.get('redirectUri'), SERVER_REDIRECT_URI);
      });
    });

    describe('query parameter validation', () => {
      describe('access_type', () => {
        var validValues = [undefined, 'offline', 'online'];
        testValidQueryParams(
          'access_type',
          validValues,
          'accessType',
          validValues
        );

        var invalidValues = ['', ' ', 'invalid'];
        testInvalidQueryParams('access_type', invalidValues);
      });

      describe('login_hint', () => {
        var validValues = [undefined, 'test@example.com'];
        // login_hint is translated to email if no email is set.
        testValidQueryParams('login_hint', validValues, 'email', validValues);

        var invalidValues = ['', ' ', 'invalid'];
        testInvalidQueryParams('login_hint', invalidValues);

        it('email takes precedence with both sent', () => {
          return fetchExpectSuccess({
            client_id: CLIENT_ID,
            email: 'test@example.com',
            login_hint: 'does_not_overwrite@example.com', //eslint_disable_line camelcase
            redirect_uri: QUERY_REDIRECT_URI,
            scope: SCOPE,
          }).then(() => {
            assert.equal(relier.get('email'), 'test@example.com');
          });
        });
      });

      describe('client_id', () => {
        testMissingRequiredQueryParam('client_id');

        var invalidValues = ['', ' ', 'not-hex'];
        testInvalidQueryParams('client_id', invalidValues);

        describe('is unknown', () => {
          beforeEach(() => {
            oAuthClient.getClientInfo.restore();
            sinon.stub(oAuthClient, 'getClientInfo').callsFake(() => {
              var err = OAuthErrors.toError('INVALID_PARAMETER');
              err.validation = {
                keys: ['client_id'],
              };
              return Promise.reject(err);
            });

            return fetchExpectError({
              client_id: '1234567abcde', // Invalid client
              scope: SCOPE,
            });
          });

          it('errors correctly', () => {
            // INVALID_PARAMETER should be converted to UNKNOWN_CLIENT
            assert.isTrue(OAuthErrors.is(err, 'UNKNOWN_CLIENT'));
          });
        });

        describe('is missing in verification flow', () => {
          beforeEach(() => {
            Session.set('oauth', {
              action: ACTION,
              scope: SCOPE,
              state: STATE,
            });

            return fetchExpectError({
              code: '123',
            });
          });

          it('errors correctly', () => {
            assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
            assert.equal(err.param, 'client_id');
          });
        });

        describe('is valid', () => {
          beforeEach(() => {
            return fetchExpectSuccess({
              client_id: CLIENT_ID,
              redirect_uri: QUERY_REDIRECT_URI,
              scope: SCOPE,
            });
          });

          it('populates service with client_id', () => {
            assert.equal(relier.get('service'), CLIENT_ID);
          });
        });
      });

      describe('prompt', () => {
        const invalidValues = ['', ' ', 'invalid'];
        testInvalidQueryParams('prompt', invalidValues);

        const validValues = [undefined, OAuthPrompt.CONSENT, OAuthPrompt.NONE];
        testValidQueryParams('prompt', validValues, 'prompt', validValues);
      });

      describe('redirectTo', () => {
        var invalidValues = ['', ' '];
        testInvalidQueryParams('redirectTo', invalidValues);

        var validValues = [undefined, 'http://testdomain.com'];
        testValidQueryParams(
          'redirectTo',
          validValues,
          'redirectTo',
          validValues
        );
      });

      describe('redirect_uri', () => {
        var validQueryParamValues = [QUERY_REDIRECT_URI];
        // redirectUri will always be loaded from the server
        var expectedValues = [SERVER_REDIRECT_URI, SERVER_REDIRECT_URI];
        testValidQueryParams(
          'redirect_uri',
          validQueryParamValues,
          'redirectUri',
          expectedValues
        );

        var invalidQueryParamValues = ['', ' ', 'not-a-url'];
        testInvalidQueryParams('redirect_uri', invalidQueryParamValues);
      });

      describe('return_on_error', () => {
        const invalidValues = ['', ' ', '1'];
        testInvalidQueryParams('return_on_error', invalidValues);

        const validValues = [undefined, true, false];
        testValidQueryParams(
          'return_on_error',
          validValues,
          'returnOnError',
          validValues
        );
      });

      describe('scope', () => {
        testMissingRequiredQueryParam('scope');

        var invalidValues = ['', ' '];
        testInvalidQueryParams('scope', invalidValues);

        describe('is valid', () => {
          testValidQueryParam('scope', SCOPE, 'scope', SCOPE);

          it('transforms to permissions', () => {
            assert.deepEqual(relier.get('permissions'), PERMISSIONS);
          });

          it('transforms plus scopes to permissions', () => {
            const SCOPE = 'profile:email+profile:uid';

            windowMock.location.search = toSearchString({
              action: ACTION,
              client_id: CLIENT_ID,
              redirect_uri: QUERY_REDIRECT_URI,
              scope: SCOPE,
              state: STATE,
            });

            return relier.fetch().then(() => {
              assert.deepEqual(relier.get('permissions'), PERMISSIONS);
            });
          });
        });

        describe('untrusted reliers', () => {
          beforeEach(() => {
            sinon.stub(relier, 'isTrusted').callsFake(() => {
              return false;
            });
          });

          var validValues = [SCOPE_WITH_EXTRAS, SCOPE_WITH_OPENID];
          var expectedValues = [SCOPE, SCOPE_WITH_OPENID];
          testValidQueryParams('scope', validValues, 'scope', expectedValues);

          var invalidValues = ['profile', 'profile:unrecognized'];
          testInvalidQueryParams('scope', invalidValues);
        });

        describe('trusted reliers that dont ask for consent', () => {
          beforeEach(() => {
            sinon.stub(relier, 'isTrusted').callsFake(() => {
              return true;
            });
            sinon.stub(relier, 'wantsConsent').callsFake(() => {
              return false;
            });
          });

          var validValues = [
            SCOPE_WITH_EXTRAS,
            SCOPE_PROFILE,
            'profile:unrecognized',
          ];
          var expectedValues = [
            SCOPE_WITH_EXTRAS,
            SCOPE_PROFILE,
            'profile:unrecognized',
          ];
          testValidQueryParams('scope', validValues, 'scope', expectedValues);
        });

        describe('trusted reliers that ask for consent', () => {
          beforeEach(() => {
            sinon.stub(relier, 'isTrusted').callsFake(() => {
              return true;
            });
            sinon.stub(relier, 'wantsConsent').callsFake(() => {
              return true;
            });
          });

          var validValues = [
            SCOPE_WITH_EXTRAS,
            SCOPE_PROFILE,
            'profile:unrecognized',
          ];
          var expectedValues = [
            SCOPE_WITH_EXTRAS,
            SCOPE_PROFILE_EXPANDED,
            'profile:unrecognized',
          ];
          testValidQueryParams('scope', validValues, 'scope', expectedValues);
        });
      });
    });

    describe('client info validation', () => {
      describe('image_uri', () => {
        // leading & trailing whitespace will be trimmed
        var validValues = ['', ' ', CLIENT_IMAGE_URI, ' ' + CLIENT_IMAGE_URI];
        var expectedValues = ['', '', CLIENT_IMAGE_URI, CLIENT_IMAGE_URI];
        testValidClientInfoValues(
          'image_uri',
          validValues,
          'imageUri',
          expectedValues
        );

        var invalidValues = ['not-a-url'];
        testInvalidClientInfoValues('image_uri', invalidValues);
      });

      describe('name', () => {
        var validValues = ['client name'];
        testValidClientInfoValues(
          'name',
          validValues,
          'serviceName',
          validValues
        );

        var invalidValues = ['', ' '];
        testInvalidClientInfoValues('name', invalidValues);
      });

      describe('redirect_uri', () => {
        describe('is missing on the server', () => {
          testMissingClientInfoValue('redirect_uri');
        });

        var invalidClientInfoValues = ['', ' '];
        testInvalidClientInfoValues('redirect_uri', invalidClientInfoValues);
      });

      describe('trusted', () => {
        var validValues = ['true', true, 'false', false];
        var expected = [true, true, false, false];
        testValidClientInfoValues('trusted', validValues, 'trusted', expected);
        var invalidValues = ['', 'not-a-boolean'];
        testInvalidClientInfoValues('trusted', invalidValues);
      });
    });

    describe('scoped-keys request validation', () => {
      describe('fails', () => {
        beforeEach(() => {
          sinon.stub(relier, '_validateKeyScopeRequest').callsFake(() => {
            throw new Error('Invalid redirect parameter');
          });

          return fetchExpectError({
            client_id: CLIENT_ID,
            scope: SCOPE,
          });
        });

        it('errors correctly', () => {
          assert.equal(err.message, 'Invalid redirect parameter');
        });
      });

      describe('succeeds', () => {
        beforeEach(() => {
          sinon.stub(relier, '_validateKeyScopeRequest').callsFake(() => {
            return true;
          });

          return fetchExpectSuccess({
            client_id: CLIENT_ID,
            keys_jwk: 'keysJwk',
            scope: SCOPE,
          });
        });

        it('returns correctly', () => {
          assert.equal(relier.get('keysJwk'), 'keysJwk');
        });
      });
    });
  });

  describe('isTrusted', () => {
    beforeEach(() => {
      windowMock.location.search = toSearchString({
        client_id: CLIENT_ID,
        redirect_uri: QUERY_REDIRECT_URI,
        scope: SCOPE,
      });
    });

    describe('when `trusted` is true', () => {
      beforeEach(() => {
        isTrusted = true;
        return relier.fetch();
      });

      it('returns `true`', () => {
        assert.isTrue(relier.isTrusted());
      });
    });

    describe('when `trusted` is false', () => {
      beforeEach(() => {
        isTrusted = false;
        return relier.fetch();
      });

      it('returns `false`', () => {
        assert.isFalse(relier.isTrusted());
      });
    });
  });

  describe('isOAuth', () => {
    it('returns `true`', () => {
      assert.isTrue(relier.isOAuth());
    });
  });

  describe('pickResumeTokenInfo', () => {
    it('returns an object with info to be passed along with email verification links', () => {
      var UTM_CAMPAIGN = 'campaign id';
      var ITEM = 'item';
      var ENTRYPOINT = 'entry point';
      var STATE = 'some long opaque state token';

      relier.set({
        entrypoint: ENTRYPOINT,
        entrypointExperiment: ITEM,
        entrypointVariation: ITEM,
        notPassed: 'this should not be picked',
        resetPasswordConfirm: false,
        state: STATE,
        style: 'trailhead',
        utmCampaign: UTM_CAMPAIGN,
        utmContent: ITEM,
        utmMedium: ITEM,
        utmSource: ITEM,
        utmTerm: ITEM,
      });
      assert.deepEqual(relier.pickResumeTokenInfo(), {
        // ensure campaign and entrypoint from
        // the Relier are still passed.
        entrypoint: ENTRYPOINT,
        entrypointExperiment: ITEM,
        entrypointVariation: ITEM,
        resetPasswordConfirm: false,
        style: 'trailhead',
        utmCampaign: UTM_CAMPAIGN,
        utmContent: ITEM,
        utmMedium: ITEM,
        utmSource: ITEM,
        utmTerm: ITEM,
      });
    });
  });

  describe('_validateKeyScopeRequest', () => {
    const scopeApp1 =
      'profile openid https://identity.mozilla.com/apps/lockbox';
    const scopeApp1Redirect =
      'https://dee85c67bd72f3de1f0a0fb62a8fe9b9b1a166d7.extensions.allizom.org';
    const scopeApp1Redirect2 = 'lockbox://redirect.ios';
    const scopeApp2Redirect =
      'https://2aa95473a5115d5f3deb36bb6875cf76f05e4c4d.extensions.allizom.org';
    const scopeNormal = 'profile';

    beforeEach(() => {
      relier._config.scopedKeysValidation = {
        'https://identity.mozilla.com/apps/lockbox': {
          redirectUris: [scopeApp1Redirect, scopeApp1Redirect2],
        },
        'https://identity.mozilla.com/apps/notes': {
          redirectUris: [scopeApp2Redirect],
        },
      };
    });

    it('returns false by default', () => {
      relier.set('scope', scopeNormal);
      assert.isFalse(relier._validateKeyScopeRequest());
    });

    it('returns true if scopes match at least one redirect uri', () => {
      relier.set('keysJwk', 'jwk');
      relier.set('scope', scopeApp1);
      relier.set('redirectUri', scopeApp1Redirect);
      assert.isTrue(relier._validateKeyScopeRequest());

      relier.set('scope', scopeApp1);
      relier.set('redirectUri', scopeApp1Redirect2);
      assert.isTrue(relier._validateKeyScopeRequest());
    });

    it('returns false if the client has not requested any scopes', () => {
      relier.set('keysJwk', 'jwk');
      relier.set('scope', '');
      relier.set('redirectUri', scopeApp1Redirect);
      assert.isFalse(relier._validateKeyScopeRequest());
    });

    it('returns false if the client has not requested any key-bearing scopes', () => {
      relier.set('keysJwk', 'jwk');
      relier.set('scope', 'https://identity.mozilla.org/not-found');
      relier.set('redirectUri', scopeApp2Redirect);
      assert.isFalse(relier._validateKeyScopeRequest());
    });

    it('throws if a client requests a scope that does not belong to it', done => {
      relier.set('keysJwk', 'jwk');
      relier.set('scope', scopeApp1);
      relier.set('redirectUri', scopeApp2Redirect);

      try {
        relier._validateKeyScopeRequest();
      } catch (err) {
        assert.equal(err.message, 'Invalid redirect parameter');
        done();
      }
    });
  });

  describe('validatePromptNoneRequest', () => {
    let account;

    beforeEach(() => {
      account = user.initAccount();
      relier.set('email', 'testuser@testuser.com');
      config.isPromptNoneEnabled = true;
      config.isPromptNoneEnabledForClient = true;
    });

    it('rejects if prompt=none not enabled', () => {
      config.isPromptNoneEnabled = false;

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'PROMPT_NONE_NOT_ENABLED'));
        });
    });

    it('rejects if prompt=none not enabled for client', () => {
      config.isPromptNoneEnabled = true;
      config.isPromptNoneEnabledForClient = false;

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(
            OAuthErrors.is(err, 'PROMPT_NONE_NOT_ENABLED_FOR_CLIENT')
          );
        });
    });

    it('rejects if the client is requesting keys', () => {
      sinon.stub(relier, 'wantsKeys').callsFake(() => true);

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'PROMPT_NONE_WITH_KEYS'));
        });
    });

    it('rejects if the client does not specify an email', () => {
      relier.unset('email');
      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'login_hint');
        });
    });

    it('rejects if no user is signed in', () => {
      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'PROMPT_NONE_NOT_SIGNED_IN'));
        });
    });

    it('rejects if the stored account has no sessionToken', () => {
      account.set({
        email: 'testuser@testuser.com',
        verified: true,
      });

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'PROMPT_NONE_NOT_SIGNED_IN'));
        });
    });

    it('rejects if requested email is different to the signed in email', () => {
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'token',
        verified: true,
      });

      relier.set('email', 'requestedUser@testuser.com');

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(
            OAuthErrors.is(err, 'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
          );
        });
    });

    it('rejects if account.sessionVerificationStatus rejects', () => {
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'token',
        verified: true,
      });

      sinon
        .stub(account, 'sessionVerificationStatus')
        .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });

    it('rejects if account or session is not verified', () => {
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'token',
        verified: true,
      });

      sinon.stub(account, 'sessionVerificationStatus').callsFake(() =>
        Promise.resolve({
          verified: false,
        })
      );

      return relier
        .validatePromptNoneRequest(account)
        .then(assert.fail, err => {
          assert.isTrue(OAuthErrors.is(err, 'PROMPT_NONE_UNVERIFIED'));
        });
    });
  });

  describe('wantsKeys', () => {
    it('returns false by default', () => {
      assert.isFalse(relier.wantsKeys());
    });

    it('returns false when scopedKeysEnabled is configured to false', () => {
      relier._config.scopedKeysEnabled = false;
      relier.set('keysJwk', 'jwk');
      assert.isFalse(relier.wantsKeys());
    });

    it('returns false when relier did not specify keysJwk', () => {
      relier._config.scopedKeysEnabled = true;
      assert.isFalse(relier.wantsKeys());
    });

    it('returns false with keysJwk but not requesting scoped keys', () => {
      relier._config.scopedKeysEnabled = true;
      relier.set('keysJwk', 'jwk');
      assert.isFalse(relier.wantsKeys());
    });

    it('returns true with keysJwk and requesting scoped keys', () => {
      const scopeWithKeys =
        'profile openid https://identity.mozilla.com/apps/lockbox';
      const scopeRedirect =
        'https://dee85c67bd72f3de1f0a0fb62a8fe9b9b1a166d7.extensions.allizom.org';
      relier._config.scopedKeysEnabled = true;
      relier._config.scopedKeysValidation = {
        'https://identity.mozilla.com/apps/lockbox': {
          redirectUris: [scopeRedirect],
        },
      };
      relier.set('keysJwk', 'jwk');
      relier.set('scope', scopeWithKeys);
      relier.set('redirectUri', scopeRedirect);
      relier._validateKeyScopeRequest();
      assert.isTrue(relier.wantsKeys());
    });
  });

  describe('wantsConsent', () => {
    describe('prompt=consent', () => {
      beforeEach(() => {
        relier.set('prompt', 'consent');
      });

      it('returns true', () => {
        assert.isTrue(relier.wantsConsent());
      });
    });

    describe('otherwise', () => {
      beforeEach(() => {
        relier.unset('prompt');
      });

      it('returns false', () => {
        assert.isFalse(relier.wantsConsent());
      });
    });
  });

  describe('wantsTwoStepAuthentication', () => {
    it('return true for acrValues=AAL2', () => {
      relier.set('acrValues', 'AAL2');
      assert.isTrue(relier.wantsTwoStepAuthentication());
    });

    it('return true for space delimited acrValues=AAL2 AAL1', () => {
      relier.set('acrValues', 'AAL2 AA1');
      assert.isTrue(relier.wantsTwoStepAuthentication());
    });

    it('return false for acrValues=undefined', () => {
      relier.unset('acrValues');
      assert.isFalse(relier.wantsTwoStepAuthentication());
    });

    it('return false otherwise', () => {
      relier.set('acrValues', 'AAL1');
      assert.isFalse(relier.wantsTwoStepAuthentication());
    });
  });

  describe('accountNeedsPermissions', () => {
    var account;
    var hasSeenPermissions;

    beforeEach(() => {
      account = user.initAccount();
      account.set('email', 'testuser@testuser.com');

      hasSeenPermissions = false;

      sinon.stub(account, 'hasSeenPermissions').callsFake(() => {
        return hasSeenPermissions;
      });

      relier.set({
        clientId: CLIENT_ID,
        permissions: ['profile:email', 'profile:display_name'],
      });
    });

    describe('a trusted relier', () => {
      beforeEach(() => {
        relier.set('trusted', true);
      });

      describe('without prompt=consent', () => {
        beforeEach(() => {
          relier.unset('prompt');
        });

        it('returns false', () => {
          assert.isFalse(relier.accountNeedsPermissions(account));
        });
      });

      describe('with prompt=consent', () => {
        beforeEach(() => {
          relier.set('prompt', 'consent');
        });

        describe('account does not need additional permissions', () => {
          beforeEach(() => {
            hasSeenPermissions = true;
          });

          it('returns false', () => {
            assert.isFalse(relier.accountNeedsPermissions(account));
          });
        });

        describe('account needs additional permissions', () => {
          beforeEach(() => {
            hasSeenPermissions = false;
          });

          it('returns true', () => {
            assert.isTrue(relier.accountNeedsPermissions(account));
          });
        });
      });
    });

    describe('an untrusted relier', () => {
      beforeEach(() => {
        relier.set('trusted', false);
      });

      describe('account has seen all the permissions', () => {
        beforeEach(() => {
          hasSeenPermissions = true;
        });

        it('should return false', () => {
          assert.isFalse(relier.accountNeedsPermissions(account));
        });

        it('should filter any permissions for which the account has no value', () => {
          relier.accountNeedsPermissions(account);
          assert.isTrue(
            account.hasSeenPermissions.calledWith(CLIENT_ID, ['profile:email'])
          );
        });
      });

      describe('account has not seen all permissions', () => {
        beforeEach(() => {
          hasSeenPermissions = false;
        });

        it('should return true', () => {
          assert.isTrue(relier.accountNeedsPermissions(account));
        });

        it('should filter any permissions for which the account has no value', () => {
          relier.accountNeedsPermissions(account);
          assert.isTrue(
            account.hasSeenPermissions.calledWith(CLIENT_ID, ['profile:email'])
          );
        });
      });
    });
  });

  describe('scopeStrToArray', () => {
    it('handles empty scopes', function() {
      assert.deepEqual(relier.scopeStrToArray(), []);
    });

    it('handles scopes with +', function() {
      assert.deepEqual(relier.scopeStrToArray('profile+openid'), [
        'profile',
        'openid',
      ]);
    });

    it('handles scopes with %20', function() {
      assert.deepEqual(relier.scopeStrToArray('profile openid'), [
        'profile',
        'openid',
      ]);
    });
  });

  function mockGetClientInfo(paramName, paramValue) {
    if (oAuthClient.getClientInfo.restore) {
      oAuthClient.getClientInfo.restore();
    }

    sinon.stub(oAuthClient, 'getClientInfo').callsFake(() => {
      var clientInfo = {
        id: CLIENT_ID,
        name: SERVICE_NAME,
        redirect_uri: SERVER_REDIRECT_URI,
        trusted: isTrusted,
      };

      if (!_.isUndefined(paramName)) {
        if (_.isUndefined(paramValue)) {
          delete clientInfo[paramName];
        } else {
          clientInfo[paramName] = paramValue;
        }
      }

      return Promise.resolve(clientInfo);
    });
  }

  function fetchExpectError(params) {
    windowMock.location.search = toSearchString(params);

    return relier.fetch().then(assert.fail, function(_err) {
      err = _err;
    });
  }

  function fetchExpectSuccess(params) {
    windowMock.location.search = toSearchString(params);

    return relier.fetch();
  }

  function testInvalidQueryParams(paramName, values) {
    describe('invalid', () => {
      values.forEach(function(value) {
        var description = 'is ' + getValueLabel(value);
        describe(description, () => {
          testInvalidQueryParam(paramName, value);
        });
      });
    });
  }

  function testInvalidQueryParam(paramName, value) {
    beforeEach(() => {
      var params = {
        client_id: CLIENT_ID,
        redirect_uri: QUERY_REDIRECT_URI,
        scope: SCOPE,
      };

      if (!_.isUndefined(value)) {
        params[paramName] = value;
      } else {
        delete params[paramName];
      }

      return fetchExpectError(params);
    });

    it('errors correctly', () => {
      assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
      assert.equal(err.param, paramName);
    });
  }

  function testMissingRequiredQueryParam(paramName) {
    describe('is missing', () => {
      beforeEach(() => {
        var params = {
          client_id: CLIENT_ID,
          redirect_uri: QUERY_REDIRECT_URI,
          scope: SCOPE,
        };

        delete params[paramName];

        return fetchExpectError(params);
      });

      it('errors correctly', () => {
        assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
        assert.equal(err.param, paramName);
      });
    });
  }

  function testValidQueryParams(paramName, values, modelName, expectedValues) {
    describe('valid', () => {
      values.forEach(function(value, index) {
        var description = 'is ' + getValueLabel(value);
        describe(description, () => {
          var expectedValue = expectedValues[index];
          testValidQueryParam(paramName, value, modelName, expectedValue);
        });
      });
    });
  }

  function testValidQueryParam(
    paramName,
    paramValue,
    modelName,
    expectedValue
  ) {
    beforeEach(() => {
      var params = {
        client_id: CLIENT_ID,
        redirect_uri: QUERY_REDIRECT_URI,
        scope: SCOPE,
      };

      if (!_.isUndefined(paramValue)) {
        params[paramName] = paramValue;
      } else {
        delete params[paramName];
      }

      return fetchExpectSuccess(params);
    });

    it('is successful', () => {
      if (_.isUndefined(expectedValue)) {
        assert.isFalse(relier.has(modelName));
      } else {
        assert.equal(relier.get(modelName), expectedValue);
      }
    });
  }

  function testMissingClientInfoValue(paramName) {
    beforeEach(() => {
      mockGetClientInfo(paramName, undefined);

      return fetchExpectError({
        client_id: CLIENT_ID,
        scope: SCOPE,
      });
    });

    it('errors correctly', () => {
      assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
      assert.equal(err.param, paramName);
    });
  }

  function testInvalidClientInfoValues(paramName, values) {
    values.forEach(function(value) {
      var description = 'is ' + getValueLabel(value);
      describe(description, () => {
        testInvalidClientInfoValue(paramName, value);
      });
    });
  }

  function testInvalidClientInfoValue(paramName, paramValue) {
    beforeEach(() => {
      mockGetClientInfo(paramName, paramValue);

      return fetchExpectError({
        client_id: CLIENT_ID,
        scope: SCOPE,
      });
    });

    it('errors correctly', () => {
      assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
      assert.equal(err.param, paramName);
    });
  }

  function testValidClientInfo(
    paramName,
    paramValue,
    modelName,
    expectedValue
  ) {
    beforeEach(() => {
      mockGetClientInfo(paramName, paramValue);

      return fetchExpectSuccess({
        client_id: CLIENT_ID,
        redirect_uri: QUERY_REDIRECT_URI,
        scope: SCOPE,
      });
    });

    it('is successful', () => {
      if (_.isUndefined(expectedValue)) {
        assert.isFalse(relier.has(modelName));
      } else {
        assert.equal(relier.get(modelName), expectedValue);
      }
    });
  }

  function testValidClientInfoValues(
    paramName,
    values,
    modelName,
    expectedValues
  ) {
    values.forEach(function(value, index) {
      var description = 'is ' + getValueLabel(value);
      describe(description, () => {
        var expectedValue = expectedValues[index];
        testValidClientInfo(paramName, value, modelName, expectedValue);
      });
    });
  }
});
