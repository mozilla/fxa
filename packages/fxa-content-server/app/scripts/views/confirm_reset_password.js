/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/confirm_reset_password',
  'lib/session',
  'lib/fxa-client'
],
function (BaseView, Template, Session, FxaClient) {
  var View = BaseView.extend({
    template: Template,
    className: 'confirm-reset-password',

    context: function () {
      return {
        // HTML is written here to simplify the l10n community's job
        email: '<strong id="confirm-email" class="email">' + Session.email + '</strong>'
      };
    },

    events: {
      'click': BaseView.preventDefaultThen('resend')
    },

    resend: function () {
      var self = this;
      var client = new FxaClient();
      client.passwordResetResend()
            .then(function () {
              self.$('.success').show();
              self.trigger('resent');
            }, function (err) {
              self.displayError(err.message);
            });
    }

  });

  return View;
});
