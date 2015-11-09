/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Session = require('lib/session');
  var Template = require('stache!templates/reset_password');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'reset_password',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
    },

    _getPrefillEmail: function () {
      return this.relier.get('email') || this._formPrefill.get('email') || '';
    },

    context: function () {
      return {
        email: this._getPrefillEmail()
      };
    },

    afterRender: function () {
      var value = this.$('.email').val();
      if (value) {
        this.focus('.email');
      }

      if (this.relier.isOAuth()) {
        this.transformLinks();
      }

      FormView.prototype.afterRender.call(this);
    },

    beforeDestroy: function () {
      this._formPrefill.set('email', this.getElementValue('.email'));
    },

    submit: function () {
      var email = this.getElementValue('.email');

      var self = this;
      return self.fxaClient.passwordReset(
        email,
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function (result) {
        self.navigate('confirm_reset_password', {
          data: {
            email: email,
            passwordForgotToken: result.passwordForgotToken
          }
        });
      })
      .fail(function (err) {
        // clear oauth session
        Session.clear('oauth');
        if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
          err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
          return self.displayErrorUnsafe(err);
        } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
          self.logEvent('login.canceled');
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
    BackMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  module.exports = View;
});
