/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BackMixin = require('views/mixins/back-mixin');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var p = require('lib/promise');
  var ServiceMixin = require('views/mixins/service-mixin');
  var SignInSuccessMixin = require('views/mixins/signin-success-mixin')();
  var SignUpSuccessMixin = require('views/mixins/signup-success-mixin');
  var Template = require('stache!templates/permissions');

  var View = FormView.extend({
    template: Template,
    className: 'permissions',

    initialize: function (options) {
      // Account data is passed in from sign up and sign in flows.
      this._account = this.user.initAccount(this.model.get('account'));

      this.type = options.type;
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var account = this.getAccount();
      return {
        email: account.get('email'),
        privacyUri: this.relier.get('privacyUri'),
        serviceName: this.relier.get('serviceName'),
        termsUri: this.relier.get('termsUri')
      };
    },

    beforeRender: function () {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._previousView());
        return false;
      }
    },

    submit: function () {
      var self = this;
      var account = self.getAccount();

      self.logViewEvent('accept');

      return p().then(function () {
        account.saveGrantedPermissions(self.relier.get('clientId'), self.relier.get('permissions'));
        self.user.setAccount(account);

        if (self.is('sign_up')) {
          return self.onSignUpSuccess(account);
        } else if (account.get('verified')) {
          return self.onSignInSuccess(account);
        }
        return self.onSignInUnverified(account);
      });
    },

    onSignInUnverified: function (account) {
      this.navigate('confirm', {
        account: account
      });
    },

    _previousView: function () {
      var page = this.is('sign_up') ? '/signup' : '/signin';
      return this.broker.transformLink(page);
    },

    is: function (type) {
      return this.type === type;
    }
  });

  Cocktail.mixin(
    View,
    BackMixin,
    ServiceMixin,
    SignInSuccessMixin,
    SignUpSuccessMixin
  );

  module.exports = View;
});
