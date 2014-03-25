/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/reset_password',
  'lib/session',
  'lib/url'
],
function (_, FormView, Template, Session, Url) {
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
      return Url.searchParam('email', this.window.location.search);
    },

    _getPrefillEmail: function () {
      return this._getQueryEmail() || '';
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
        this.enableSubmitIfValid();
        // place cursor at the end of the text.
        var emailEl = this.$('.email').get(0);
        if (emailEl) {
          emailEl.selectionStart = emailEl.selectionEnd = value.length;
        }
      }
    },

    submit: function () {
      var email = this.$('.email').val();

      var self = this;
      return this.fxaClient.passwordReset(email)
                  .then(function () {
                    self.navigate('confirm_reset_password');
                  });
    }
  });

  return View;
});
