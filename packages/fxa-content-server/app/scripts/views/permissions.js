/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BackMixin = require('views/mixins/back-mixin');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/permissions');

  var View = FormView.extend({
    template: Template,
    className: 'permissions',

    initialize: function (options) {
      // Account data is passed in from sign up and sign in flows.
      this._account = this.user.initAccount(this.model.get('account'));

      this.type = options.type;

      // to keep the view from knowing too much about the state machine,
      // a continuation function is passed in that should be called
      // when submit has completed.
      this.onSubmitComplete = this.model.get('onSubmitComplete');
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

      account.saveGrantedPermissions(self.relier.get('clientId'), self.relier.get('permissions'));
      return self.user.setAccount(account)
        .then(self.onSubmitComplete);
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
    ServiceMixin
  );

  module.exports = View;
});
