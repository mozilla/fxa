/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/complete_sign_up',
  'lib/session',
  'lib/fxa-client'
],
function (_, BaseView, CompleteSignUpTemplate, Session, FxaClient) {
  function getSearchParam(name) {
    var search = window.location.search.replace(/^\?/, '');
    if (! search) {
      return;
    }

    var pairs = search.split('&');
    var terms = {};

    _.each(pairs, function (pair) {
      var keyValue = pair.split('=');
      terms[keyValue[0]] = keyValue[1];
    });

    return terms[name];
  }

  var CompleteSignUpView = BaseView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    context: function () {
      return {
        email: Session.email,
        siteName: getSearchParam('service'),
        redirectTo: getSearchParam('service')
      };
    },

    afterRender: function () {
      var uid = getSearchParam('uid');
      if (! uid) {
        return this._displayError('no uid specified');
      }

      var code = getSearchParam('code');
      if (! code) {
        return this._displayError('no code specified');
      }

      var client = new FxaClient();
      client.verifyCode(uid, code)
            .then(function () {
              this.$('#fxa-complete-sign-up-success').show();

              this.$('h2.success').show()
              this.$('h2.failure').hide()
            }.bind(this), function (err) {
              this._displayError(err.message);

              this.$('h2.success').hide()
              this.$('h2.failure').show()
            }.bind(this));
    },

    _displayError: function (msg) {
      this.$('.error').html(msg);
    }
  });

  return CompleteSignUpView;
});
