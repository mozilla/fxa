/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('../../lib/auth-errors');
  const BaseAuthenticationBroker = require('../auth_brokers/base');
  const Constants = require('../../lib/constants');
  const HaltBehavior = require('../../views/behaviors/halt');
  const NullBehavior = require('../../views/behaviors/null');
  const NavigateBehavior = require('../../views/behaviors/navigate');
  const OAuthErrors = require('../../lib/oauth-errors');
  const p = require('../../lib/promise');
  const ScopedKeys = require('lib/crypto/scoped-keys');
  const Transform = require('../../lib/transform');
  const Url = require('../../lib/url');
  const Vat = require('../../lib/vat');
  const VerificationMethods = require('../../lib/verification-methods');
  const VerificationReasons = require('../../lib/verification-reasons');

  const proto = BaseAuthenticationBroker.prototype;

  const OAUTH_CODE_RESPONSE_SCHEMA = {
    code: Vat.oauthCode().required(),
    state: Vat.string()
  };
  /**
   * Invoke `brokerMethod` on the broker and finish the OAuth flow by
   * invoking `finishMethod` if verifying in the original tab. If verifying
   * in another tab, the default behavior is returned.
   *
   * @param {String} brokerMethod
   * @param {String} finishMethod
   * @returns {Promise}
   */
  function finishOAuthFlowIfOriginalTab (brokerMethod, finishMethod) {
    return function (account) {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      //
      // The slight delay is to allow the functional tests time to bind
      // event handlers before the flow completes.
      return proto[brokerMethod].call(this, account)
        .then((behavior) => {
          return p.delay(this.DELAY_BROKER_RESPONSE_MS)
            .then(() => behavior);
        })
        .then((behavior) => {
          if (this.isOriginalTab()) {
            return this[finishMethod](account)
              .then(() => new HaltBehavior());
          }
          return behavior;
        });
    };
  }

  module.exports = BaseAuthenticationBroker.extend({
    type: 'redirect',

    initialize (options) {
      options = options || {};

      this.session = options.session;
      this._assertionLibrary = options.assertionLibrary;
      this._oAuthClient = options.oAuthClient;
      this._scopedKeys = ScopedKeys;
      this._metrics = options.metrics;

      return proto.initialize.call(this, options);
    },

    DELAY_BROKER_RESPONSE_MS: 100,

    sendOAuthResultToRelier (result) {
      var win = this.window;
      return this._metrics.flush()
        .then(function () {
          var extraParams = {};
          if (result.error) {
            extraParams['error'] = result.error;
          }
          if (result.action) {
            extraParams['action'] = result.action;
          }
          win.location.href = Url.updateSearchString(result.redirect, extraParams);
        });
    },

    getOAuthResult (account) {
      if (! account || ! account.get('sessionToken')) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }
      let assertion;
      const relier = this.relier;
      const clientId = relier.get('clientId');
      return this._assertionLibrary.generate(account.get('sessionToken'), null, clientId)
        .then((asser) => {
          assertion = asser;

          if (relier.wantsKeys()) {
            return this._provisionScopedKeys(account, assertion);
          }
        })
        .then((keysJwe) => {
          const oauthParams = {
            acr_values: relier.get('acrValues'), //eslint-disable-line camelcase
            assertion: assertion,
            client_id: clientId, //eslint-disable-line camelcase
            code_challenge: relier.get('codeChallenge'), //eslint-disable-line camelcase
            code_challenge_method: relier.get('codeChallengeMethod'), //eslint-disable-line camelcase
            keys_jwe: keysJwe, //eslint-disable-line camelcase
            scope: relier.get('scope'),
            state: relier.get('state')
          };

          if (relier.get('accessType') === Constants.ACCESS_TYPE_OFFLINE) {
            oauthParams.access_type = Constants.ACCESS_TYPE_OFFLINE; //eslint-disable-line camelcase
          }
          return this._oAuthClient.getCode(oauthParams);
        })
        .then((response) => {
          if (! response) {
            return Promise.reject(OAuthErrors.toError('INVALID_RESULT'));
          }
          // The oauth-server would previously construct and return the full redirect URI,
          // but we now expect to receive `code` and `state` and build it ourselves
          // using the relier's locally-validated redirectUri.
          delete response.redirect;
          const result = Transform.transformUsingSchema(response, OAUTH_CODE_RESPONSE_SCHEMA, OAuthErrors);
          result.redirect = Url.updateSearchString(relier.get('redirectUri'), {
            code: result.code,
            state: result.state
          });
          return result;
        });
    },

    /**
       * Derive scoped keys and encrypt them with the relier's public JWK
       *
       * @param {Object} account
       * @param {String} assertion
       * @returns {Promise} Returns a promise that resolves into an encrypted bundle
       * @private
       */
    _provisionScopedKeys (account, assertion) {
      const relier = this.relier;
      const uid = account.get('uid');

      return Promise.resolve().then(() => {
        if (account.canFetchKeys()) {
          // check if requested scopes provide scoped keys
          return this._oAuthClient.getClientKeyData({
            assertion: assertion,
            client_id: relier.get('clientId'), //eslint-disable-line camelcase
            scope: relier.get('scope')
          });
        }
      }).then((clientKeyData) => {
        if (! clientKeyData || Object.keys(clientKeyData).length === 0) {
          // if we got no key data then exit out
          return null;
        }

        return account.accountKeys().then((keys) => {
          return this._scopedKeys.createEncryptedBundle(keys, uid, clientKeyData, relier.get('keysJwk'));
        });
      });
    },

    /**
       * Overridden by subclasses to provide a strategy to finish the OAuth flow.
       *
       * @param {Object} [result] - state sent by OAuth RP
       * @param {String} [result.state] - state sent by OAuth RP
       * @param {String} [result.code] - OAuth code generated by the OAuth server
       * @param {String} [result.redirect] - URL that can be used to redirect to
       * the RP.
       *
       * @returns {Promise}
       */

    finishOAuthSignInFlow (account) {
      return this.finishOAuthFlow(account, { action: Constants.OAUTH_ACTION_SIGNIN });
    },

    finishOAuthSignUpFlow (account) {
      return this.finishOAuthFlow(account, { action: Constants.OAUTH_ACTION_SIGNUP });
    },

    transformLink (link) { //not used
      if (link[0] !== '/') {
        link = '/' + link;
      }

      // in addition to named routes, also transforms `/`
      if (/^\/(force_auth|signin|signup)?$/.test(link)) {
        link = '/oauth' + link;
      }

      const windowSearchParams = Url.searchParams(this.window.location.search);
      return Url.updateSearchString(link, windowSearchParams);
    },
    /**
     * Sets a marker used to determine if this is the tab a user
     * signed up or initiated a password reset in. If the user replaces
     * the original tab with the verification tab, then the OAuth flow
     * should complete and the user redirected to the RP.
     */
    setOriginalTabMarker () {
      this.window.sessionStorage.setItem('originalTab', '1');
    },

    isOriginalTab () {
      return !! this.window.sessionStorage.getItem('originalTab');
    },

    clearOriginalTabMarker () {
      this.window.sessionStorage.removeItem('originalTab');
    },

    persistVerificationData (account) {
      // If the user replaces the current tab with the verification url,
      // finish the OAuth flow.
      return Promise.resolve().then(() => {
        var relier = this.relier;
        this.session.set('oauth', {
          access_type: relier.get('access_type'), //eslint-disable-line camelcase
          action: relier.get('action'),
          client_id: relier.get('clientId'), //eslint-disable-line camelcase
          keys: relier.get('keys'),
          scope: relier.get('scope'),
          state: relier.get('state')
        });
        this.setOriginalTabMarker();
        return proto.persistVerificationData.call(this, account);
      });
    },

    finishOAuthFlow (account, additionalResultData) {
      this.session.clear('oauth');

      return Promise.resolve().then(() => {
        // There are no ill side effects if the Original Tab Marker is
        // cleared in the a tab other than the original. Always clear it just
        // to make sure the bases are covered.
        this.clearOriginalTabMarker();
        return this.getOAuthResult(account)
          .then((result) => {
            result = _.extend(result, additionalResultData);
            return this.sendOAuthResultToRelier(result);
          });
      });
    },

    afterCompleteResetPassword (account) {
      return proto.afterCompleteResetPassword.call(this, account)
        .then(behavior => {
          // a user can only redirect back to the relier from the original tab, this avoids
          // two tabs redirecting.
          if (account.get('verified')
            && ! account.get('verificationReason')
            && ! account.get('verificationMethod')
            && this.isOriginalTab()) {
            return this.finishOAuthSignInFlow(account);
          } else if (! this.isOriginalTab()) {
            // allows a navigation to a "complete" screen or TOTP screen if it is setup
            if (account.get('verificationMethod') === VerificationMethods.TOTP_2FA &&
              account.get('verificationReason') === VerificationReasons.SIGN_IN &&
              this.relier.has('state')) {
              return new NavigateBehavior('signin_totp_code', { account });
            }

            return new NullBehavior();
          }

          return behavior;
        });
    },

    afterCompleteSignUp: finishOAuthFlowIfOriginalTab('afterCompleteSignUp', 'finishOAuthSignUpFlow'),
  });
});
