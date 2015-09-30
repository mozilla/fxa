/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'views/base',
  'stache!templates/openid/login',
  'lib/session'
],
function (BaseView, Template, Session) {
  'use strict';

  var View = BaseView.extend({
    template: Template,
    className: 'openid-sign-in',

    initialize: function (options) {
      BaseView.prototype.initialize.call(this, options);
      options = options || {};

      Session.clear();
      this.user.clearSignedInAccount();
    },

    beforeRender: function () {
      var self = this;

      return self.fxaClient._getClient()
        .then(function (client) {
          var loginUrl = '/account/openid/login' + self.window.location.search;
          return client.request.send(loginUrl, 'GET');
        })
        .then(function (res) {
          if (res.err) {
            throw new Error(res.err);
          }
          return self.user.setSignedInAccount({
            email: res.email,
            keyFetchToken: res.key,
            sessionToken: res.session,
            uid: res.uid,
            unwrapBKey: res.unwrap,
            verified: true
          });
        })
        .then(function (account) {
          return self.invokeBrokerMethod('afterSignIn', account);
        })
        .then(function (result) {
          self.logScreenEvent('success');
          self.navigate('settings');
          return result;
        });
    }
  });

  return View;
});
