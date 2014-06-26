/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/reset_password',
  'lib/session',
  'lib/auth-errors',
  'views/mixins/oauth-mixin'
],
function (_, BaseView, FormView, Template, Session, AuthErrors, OAuthMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'reset_password',

    _isBackEnabled: function () {
      /* If email is specified on the query param, user probably browsed
       * directly to the page. No back for them.
       * Users who visit `/force_auth?email=<xxx>` and
       * click "forgot password" are sent to the
       * "confirm your email" screen, skipping this step.
       */
      return !this._getQueryEmail();
    },

    _getQueryEmail: function () {
      return this.searchParam('email');
    },

    _getPrefillEmail: function () {
      return this._getQueryEmail() || Session.prefillEmail || '';
    },

    context: function () {
      return {
        email: this._getPrefillEmail(),
        backEnabled: this._isBackEnabled()
      };
    },

    afterRender: function () {
      var value = this.$('.email').val();
      if (value) {
        this.focus('.email');
      }

      if (this.isOAuthSameBrowser()) {
        this.setupOAuthLinks();
      }

      FormView.prototype.afterRender.call(this);
    },

    submit: function () {
      var email = this.$('.email').val();

      var self = this;
      return this.fxaClient.passwordReset(email)
        .then(function () {
          self.navigate('confirm_reset_password');
        })
        .then(null, function (err) {
          // clear oauth session
          Session.clear('oauth');
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            // email indicates the signed in email. Use prefillEmail
            // to avoid collisions across sessions.
            Session.set('prefillEmail', email);
            err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
            return self.displayErrorUnsafe(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            self.logEvent('login:canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
