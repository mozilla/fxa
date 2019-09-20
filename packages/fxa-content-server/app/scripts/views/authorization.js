/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * OAuth authorization view, redirects based on requested OAuth actions.
 */
import AuthErrors from '../lib/auth-errors';
import BaseView from './base';
import Cocktail from 'cocktail';
import OAuthErrors from '../lib/oauth-errors';
import OAuthPrompt from '../lib/oauth-prompt';
import SignInMixin from './mixins/signin-mixin';

class AuthorizationView extends BaseView {
  beforeRender() {
    if (this.relier.get('prompt') === OAuthPrompt.NONE) {
      return (
        this._doPromptNone()
          // false prevents the view from rendering
          .then(() => false)
      );
    }

    const action = this.relier.get('action');
    if (action === 'force_auth') {
      this.replaceCurrentPage('/oauth/force_auth');
    } else {
      this.replaceCurrentPage('/oauth/');
    }
  }

  _doPromptNone() {
    const account = this.getSignedInAccount();

    return (
      this.relier
        .validatePromptNoneRequest(account)
        .then(() => this.signIn(account, null))
        // Both validatePromptNoneRequest and signIn can
        // reject, .catch handles both cases.
        .catch(err => {
          const normalizedErr = this._normalizePromptNoneError(err);
          return this._handlePromptNoneError(normalizedErr);
        })
    );
  }

  _normalizePromptNoneError(err) {
    if (AuthErrors.is(err, 'INVALID_TOKEN')) {
      err = OAuthErrors.toError('PROMPT_NONE_NOT_SIGNED_IN');
    }

    return err;
  }

  _handlePromptNoneError(err) {
    return Promise.resolve().then(() => {
      if (this._shouldSendErrorToRP(err)) {
        // Unless the RP overrides this behavior, errors with a `response_error_code`
        // redirect back to the RP with `response_error_code` as the `error` parameter.
        // The override is used by the functional tests to ensure the expected error
        // case is being invoked when checking whether prompt=none can be used.
        return this.broker.sendOAuthResultToRelier({
          error: err.response_error_code,
          redirect: this.relier.get('redirectUri'),
        });
      }

      // All other errors are handled at a higher level. If
      // the error should be displayed as a 400 to the user,
      // add the error to the list in error-utils.js, otherwise
      // the error will be displayed as a 500.
      throw err;
    });
  }

  _shouldSendErrorToRP(err) {
    return (
      err.response_error_code && this.relier.get('returnOnError') !== false
    );
  }
}

Cocktail.mixin(AuthorizationView, SignInMixin);

export default AuthorizationView;
