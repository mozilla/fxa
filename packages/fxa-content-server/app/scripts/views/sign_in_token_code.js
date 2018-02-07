/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to unblock their signin by entering
 * in a verification code that is sent in an email.
 */
define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const Constants = require('../lib/constants');
  const FormView = require('./form');
  const ResendMixin = require('./mixins/resend-mixin')();
  const SignInMixin = require('./mixins/signin-mixin');
  const Template = require('templates/sign_in_token_code.mustache');
  const VerificationReasonMixin = require('./mixins/verification-reason-mixin');

  const View = FormView.extend({
    className: 'sign-in-token-code',
    template: Template,

    getAccount () {
      return this.model.get('account');
    },

    beforeRender () {
      // user cannot confirm if they have not initiated a sign in.
      if (! this.model.get('account')) {
        this.navigate(this._getAuthPage());
      }
    },

    setInitialContext (context) {
      const email = this.getAccount().get('email');

      // This needs to point to correct support link
      const supportLink = Constants.BLOCKED_SIGNIN_SUPPORT_URL;

      context.set({
        email,
        escapedSupportLink: encodeURI(supportLink),
        hasSupportLink: !! supportLink
      });
    },

    submit () {
      const account = this.getAccount();
      const code = this.getElementValue('#token-code');
      return account.verifyTokenCode(code)
        .then(() => {
          this.logViewEvent('success');
          return this.invokeBrokerMethod('afterCompleteSignInTokenCode', account);
        }, (err) => {
          this.displayError(err);
        });
    },

    /**
     * Get the URL of the page for users that
     * must enter their password.
     *
     * @returns {String}
     */
    _getAuthPage () {
      const authPage =
        this.model.get('lastPage') === 'force_auth' ? 'force_auth' : 'signin';

      return this.broker.transformLink(authPage);
    }
  });

  Cocktail.mixin(
    View,
    ResendMixin,
    SignInMixin,
    VerificationReasonMixin
  );

  module.exports = View;
});
