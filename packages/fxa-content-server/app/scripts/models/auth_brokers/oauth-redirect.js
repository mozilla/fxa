/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import BaseAuthenticationBroker from '../auth_brokers/base';
import Constants from '../../lib/constants';
import HaltBehavior from '../../views/behaviors/halt';
import NullBehavior from '../../views/behaviors/null';
import NavigateBehavior from '../../views/behaviors/navigate';
import OAuthErrors from '../../lib/oauth-errors';
import p from '../../lib/promise';
import ScopedKeys from 'lib/crypto/scoped-keys';
import Transform from '../../lib/transform';
import Url from '../../lib/url';
import Vat from '../../lib/vat';
import VerificationMethods from '../../lib/verification-methods';
import VerificationReasons from '../../lib/verification-reasons';

const proto = BaseAuthenticationBroker.prototype;

const OAUTH_CODE_RESPONSE_SCHEMA = {
  code: Vat.oauthCode().required(),
  state: Vat.string(),
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
function finishOAuthFlowIfOriginalTab(brokerMethod, finishMethod) {
  return function(account) {
    // The user may have replaced the original tab with the verification
    // tab. If this is the case, send the OAuth result to the RP.
    //
    // The slight delay is to allow the functional tests time to bind
    // event handlers before the flow completes.
    return proto[brokerMethod]
      .call(this, account)
      .then(behavior => {
        return p.delay(this.DELAY_BROKER_RESPONSE_MS).then(() => behavior);
      })
      .then(behavior => {
        if (this.isOriginalTab()) {
          return this[finishMethod](account).then(() => new HaltBehavior());
        }
        return behavior;
      });
  };
}

export default BaseAuthenticationBroker.extend({
  type: 'redirect',

  defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
    // the relier will take over after sign in, no need to transition.
    afterForceAuth: new HaltBehavior(),
    afterSignIn: new HaltBehavior(),
    afterSignInConfirmationPoll: new HaltBehavior(),
  }),

  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    // Disable signed-in notifications for OAuth due to the potential for
    // unintended consequences from redirecting to a relier URL more than
    // once.
    handleSignedInNotification: false,
    reuseExistingSession: true,
    tokenCode: true,
  }),

  initialize(options) {
    options = options || {};

    this.session = options.session;
    this._scopedKeys = ScopedKeys;
    this._metrics = options.metrics;

    return proto.initialize.call(this, options);
  },

  DELAY_BROKER_RESPONSE_MS: 100,

  /**
   * Performs a redirect with the necessary OAuth url params
   * @param result {Object}
   *   @param {String} [result.code] - OAuth token code
   *   @param {String} [result.state] - OAuth state
   *   @param {String} [result.error] - OAuth error string
   *   @param {String} [result.action] - Action taken by the user, such as 'signin' or 'signup'
   * @returns {Promise}
   */
  sendOAuthResultToRelier(result) {
    return Promise.resolve().then(() => {
      var extraParams = {};
      if (result.error) {
        extraParams.error = result.error;
      }
      if (result.action) {
        extraParams.action = result.action;
      }
      // Always use the state the RP passed in.
      // This is necessary to complete the prompt=none
      // flow error cases where no interaction with
      // the server occurs to get the state from
      // the redirect_uri returned when creating
      // the token or code.
      const state = this.relier.get('state');
      if (state) {
        extraParams.state = state;
      }
      this.window.location.href = Url.updateSearchString(
        result.redirect,
        extraParams
      );
    });
  },

  getOAuthResult(account) {
    if (!account || !account.get('sessionToken')) {
      return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
    }
    const relier = this.relier;
    const clientId = relier.get('clientId');
    return Promise.resolve()
      .then(() => {
        if (relier.wantsKeys()) {
          return this._provisionScopedKeys(account);
        }
      })
      .then(keysJwe => {
        /* eslint-disable camelcase */
        const oauthParams = {
          acr_values: relier.get('acrValues'),
          code_challenge: relier.get('codeChallenge'),
          code_challenge_method: relier.get('codeChallengeMethod'),
          scope: relier.get('scope'),
        };
        /* eslint-enable camelcase */

        if (keysJwe) {
          oauthParams.keys_jwe = keysJwe; //eslint-disable-line camelcase
        }

        if (relier.get('accessType') === Constants.ACCESS_TYPE_OFFLINE) {
          oauthParams.access_type = Constants.ACCESS_TYPE_OFFLINE; //eslint-disable-line camelcase
        }

        return account.createOAuthCode(
          clientId,
          relier.get('state'),
          oauthParams
        );
      })
      .then(response => {
        if (!response) {
          return Promise.reject(OAuthErrors.toError('INVALID_RESULT'));
        }
        // The oauth-server would previously construct and return the full redirect URI,
        // but we now expect to receive `code` and `state` and build it ourselves
        // using the relier's locally-validated redirectUri.
        delete response.redirect;
        const result = Transform.transformUsingSchema(
          response,
          OAUTH_CODE_RESPONSE_SCHEMA,
          OAuthErrors
        );
        result.redirect = Url.updateSearchString(relier.get('redirectUri'), {
          code: result.code,
          state: result.state,
        });
        return result;
      });
  },

  /**
   * Derive scoped keys and encrypt them with the relier's public JWK
   *
   * @param {Object} account
   * @returns {Promise} Returns a promise that resolves into an encrypted bundle
   * @private
   */
  _provisionScopedKeys(account) {
    const relier = this.relier;
    const uid = account.get('uid');

    return Promise.resolve()
      .then(() => {
        if (account.canFetchKeys()) {
          // check if requested scopes provide scoped keys
          return account.getOAuthScopedKeyData(
            relier.get('clientId'),
            relier.get('scope')
          );
        }
      })
      .then(clientKeyData => {
        if (!clientKeyData || Object.keys(clientKeyData).length === 0) {
          // if we got no key data then exit out
          return null;
        }

        return account.accountKeys().then(keys => {
          return this._scopedKeys.createEncryptedBundle(
            keys,
            uid,
            clientKeyData,
            relier.get('keysJwk')
          );
        });
      });
  },

  afterForceAuth(account) {
    return this.finishOAuthSignInFlow(account).then(() =>
      proto.afterForceAuth.call(this, account)
    );
  },

  afterSignIn(account) {
    return this.finishOAuthSignInFlow(account).then(() =>
      proto.afterSignIn.call(this, account)
    );
  },

  afterSignInConfirmationPoll(account) {
    return this.finishOAuthSignInFlow(account).then(() =>
      proto.afterSignInConfirmationPoll.call(this, account)
    );
  },

  afterCompleteSignInWithCode(account) {
    return this.finishOAuthSignInFlow(account).then(() =>
      proto.afterSignIn.call(this, account)
    );
  },

  afterSignUpConfirmationPoll(account) {
    // The original tab always finishes the OAuth flow if it is still open.

    // Check to see if ths relier wants TOTP. Newly created accounts wouldn't have this
    // so lets redirect them to signin and show a message on how it can be setup.
    // This is temporary until we have a better landing page for this error.
    if (this.relier.wantsTwoStepAuthentication()) {
      return this.getBehavior('afterSignUpRequireTOTP');
    }

    return this.finishOAuthSignUpFlow(account);
  },

  afterResetPasswordConfirmationPoll(account) {
    return Promise.resolve().then(() => {
      if (
        account.get('verified') &&
        !account.get('verificationReason') &&
        !account.get('verificationMethod')
      ) {
        return this.finishOAuthSignInFlow(account);
      } else {
        return proto.afterResetPasswordConfirmationPoll.call(this, account);
      }
    });
  },

  transformLink(link) {
    //not used
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
  setOriginalTabMarker() {
    this.window.sessionStorage.setItem('originalTab', '1');
  },

  isOriginalTab() {
    return !!this.window.sessionStorage.getItem('originalTab');
  },

  clearOriginalTabMarker() {
    this.window.sessionStorage.removeItem('originalTab');
  },

  persistVerificationData(account) {
    // If the user replaces the current tab with the verification url,
    // finish the OAuth flow.
    return Promise.resolve().then(() => {
      var relier = this.relier;
      this.session.set('oauth', {
        access_type: relier.get('access_type'), //eslint-disable-line camelcase
        action: relier.get('action'),
        client_id: relier.get('clientId'), //eslint-disable-line camelcase,
        code_challenge: relier.get('codeChallenge'), //eslint-disable-line camelcase
        code_challenge_method: relier.get('codeChallengeMethod'), //eslint-disable-line camelcase
        keys: relier.get('keys'),
        scope: relier.get('scope'),
        state: relier.get('state'),
      });
      this.setOriginalTabMarker();
      return proto.persistVerificationData.call(this, account);
    });
  },

  /**
   * Finish the OAuth flow.
   *
   * @param {Object} [result] - state sent by OAuth RP
   * @param {String} [result.state] - state sent by OAuth RP
   * @param {String} [result.code] - OAuth code generated by the OAuth server
   * @param {String} [result.redirect] - URL that can be used to redirect to
   * the RP.
   *
   * @returns {Promise}
   */

  finishOAuthSignInFlow(account) {
    return this.finishOAuthFlow(account, {
      action: Constants.OAUTH_ACTION_SIGNIN,
    });
  },

  finishOAuthSignUpFlow(account) {
    return this.finishOAuthFlow(account, {
      action: Constants.OAUTH_ACTION_SIGNUP,
    });
  },

  finishOAuthFlow(account, additionalResultData) {
    this.session.clear('oauth');

    return Promise.resolve().then(() => {
      // There are no ill side effects if the Original Tab Marker is
      // cleared in the a tab other than the original. Always clear it just
      // to make sure the bases are covered.
      this.clearOriginalTabMarker();
      return this.getOAuthResult(account).then(result => {
        result = _.extend(result, additionalResultData);

        return this._metrics.flush().then(() => {
          return this.sendOAuthResultToRelier(result, account);
        });
      });
    });
  },

  afterCompleteResetPassword(account) {
    return proto.afterCompleteResetPassword
      .call(this, account)
      .then(behavior => {
        // a user can only redirect back to the relier from the original tab, this avoids
        // two tabs redirecting.
        if (
          account.get('verified') &&
          !account.get('verificationReason') &&
          !account.get('verificationMethod') &&
          this.isOriginalTab()
        ) {
          return this.finishOAuthSignInFlow(account);
        } else if (!this.isOriginalTab()) {
          // allows a navigation to a "complete" screen or TOTP screen if it is setup
          if (
            account.get('verificationMethod') ===
              VerificationMethods.TOTP_2FA &&
            account.get('verificationReason') === VerificationReasons.SIGN_IN &&
            this.relier.has('state')
          ) {
            return new NavigateBehavior('signin_totp_code', { account });
          }

          return new NullBehavior();
        }

        return behavior;
      });
  },

  afterCompleteSignUp: finishOAuthFlowIfOriginalTab(
    'afterCompleteSignUp',
    'finishOAuthSignUpFlow'
  ),
});
