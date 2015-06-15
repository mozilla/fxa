/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

define([
  'cocktail',
  'views/form',
  'stache!templates/permissions',
  'lib/promise',
  'views/mixins/back-mixin',
  'views/mixins/service-mixin'
],
function (Cocktail, FormView, Template, p, BackMixin, ServiceMixin) {

  var View = FormView.extend({
    template: Template,
    className: 'permissions',

    initialize: function (options) {
      // Account data is passed in from sign up and sign in flows.
      var data = this.ephemeralData();
      this._account = data && this.user.initAccount(data.account);

      this.type = options.type;
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var account = this.getAccount();
      return {
        email: account.get('email'),
        serviceName: this.relier.get('serviceName'),
        termsUri: this.relier.get('termsUri'),
        privacyUri: this.relier.get('privacyUri')
      };
    },

    beforeRender: function () {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._previousScreen());
        return false;
      }
    },

    submit: function () {
      var self = this;
      var account = self.getAccount();

      self.logScreenEvent('accept');

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

    onSignUpSuccess: function (account) {
      var self = this;
      if (account.get('verified')) {
        // user was pre-verified, notify the broker.
        return self.broker.afterSignIn(account)
          .then(function (result) {
            if (! (result && result.halt)) {
              self.navigate('signup_complete');
            }
          });
      } else {
        self.navigate('confirm', {
          data: {
            account: account
          }
        });
      }
    },

    onSignInSuccess: function (account) {
      var self = this;
      self.logScreenEvent('success');
      return self.broker.afterSignIn(account)
        .then(function (result) {
          if (! (result && result.halt)) {
            self.navigate('settings');
          }

          return result;
        });
    },

    onSignInUnverified: function (account) {
      this.navigate('confirm', {
        data: {
          account: account
        }
      });
    },

    _previousScreen: function () {
      var page = this.is('sign_up') ? '/signup' : '/signin';
      return this.broker.transformLink(page);
    },

    is: function (type) {
      return this.type === type;
    }
  });

  Cocktail.mixin(
    View,
    ServiceMixin,
    BackMixin
  );

  return View;
});
