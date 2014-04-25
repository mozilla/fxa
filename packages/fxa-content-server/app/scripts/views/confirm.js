/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/form',
  'views/base',
  'stache!templates/confirm',
  'lib/session',
  'lib/auth-errors'
],
function (FormView, BaseView, Template, Session, authErrors) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    context: function () {
      return {
        email: Session.email
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! Session.sessionToken) {
        this.navigate('signup');
        return false;
      }
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

    submit: function () {
      var self = this;

      return this.fxaClient.signUpResend()
              .then(function () {
                self.displaySuccess();
              }, function (err) {
                if (authErrors.is(err, 'INVALID_TOKEN')) {
                  return self.navigate('signup', {
                    error: t('Invalid token')
                  });
                }

                // unexpected error, rethrow for display.
                throw err;
              });
    }

  });

  return View;
});
