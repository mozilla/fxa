/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const FormView = require('views/form');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const PasswordResetMixin = require('views/mixins/password-reset-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Session = require('lib/session');
  const Template = require('stache!templates/reset_password');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'reset_password',

    initialize (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
    },

    setInitialContext (context) {
      context.set({
        forceEmail: this.model.get('forceEmail'),
        serviceName: this.relier.get('serviceName')
      });
    },

    beforeRender () {
      var email = this.relier.get('email');
      var canSkip = this.relier.get('resetPasswordConfirm') === false;
      if (canSkip && email) {
        return this._resetPassword(email)
          .then(() => false)
          .fail((err) => {
            this.model.set('error', err);
          });
      }

      return FormView.prototype.beforeRender.call(this);
    },

    beforeDestroy () {
      this._formPrefill.set('email', this.getElementValue('.email'));
    },

    submit () {
      return this._resetPassword(this.getElementValue('.email'));
    },

    _resetPassword (email) {
      return this.resetPassword(email)
        .fail((err) => {
          // clear oauth session
          Session.clear('oauth');
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
            return this.unsafeDisplayError(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            this.logEvent('login.canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    }
  });

  Cocktail.mixin(
    View,
    FlowEventsMixin,
    PasswordResetMixin,
    ServiceMixin
  );

  module.exports = View;
});
