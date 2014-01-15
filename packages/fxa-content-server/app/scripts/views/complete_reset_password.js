/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/complete_reset_password',
  'lib/fxa-client',
  'lib/session',
  'lib/url'
],
function (_, BaseView, Template, FxaClient, Session, Url) {
  var View = BaseView.extend({
    template: Template,
    className: 'complete_reset_password',

    events: {
      'submit form': 'submit'
    },

    afterRender: function () {
      this.uid = Url.searchParam('uid');
      if (! this.uid) {
        return this.displayError('no uid specified');
      }

      this.code = Url.searchParam('code');
      if (! this.code) {
        return this.displayError('no code specified');
      }
    },

    submit: function (event) {
      event.preventDefault();

      if (! (this.uid &&
             this.code &&
             this._validatePasswords())) {
        return;
      }

      var password = this._getPassword();

      var client = new FxaClient();
      client.completePasswordReset(password, this.uid, this.code)
            .done(_.bind(this._onResetCompleteSuccess, this),
                  _.bind(this._onResetCompleteFailure, this));
    },

    _onResetCompleteSuccess: function () {
      // This information will be displayed on the
      // reset_password_complete screen.
      Session.service = Url.searchParam('service');
      Session.redirectTo = Url.searchParam('redirectTo');
      router.navigate('reset_password_complete', { trigger: true });
    },

    _onResetCompleteFailure: function (err) {
      this.displayError(err.message);
    },

    _validatePasswords: function () {
      if (! (this.isElementValid('#password') &&
             this.isElementValid('#vpassword'))) {
        return false;
      }

      if (this._getPassword() !== this._getVPassword()) {
        this.displayError('passwords do not match');
        return false;
      }

      return true;
    },

    _getPassword: function () {
      return this.$('#password').val();
    },

    _getVPassword: function () {
      return this.$('#vpassword').val();
    }
  });

  return View;
});
