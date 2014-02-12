/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/complete_sign_up',
  'lib/session',
  'lib/fxa-client',
  'lib/url',
  'lib/xss'
],
function (_, BaseView, CompleteSignUpTemplate, Session, FxaClient, Url, Xss) {
  var t = BaseView.t;

  var CompleteSignUpView = BaseView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    context: function () {
      return {
        email: Session.email,
        service: Session.service,
        redirectTo: Xss.href(Session.redirectTo)
      };
    },

    afterRender: function () {
      var searchParams = this.window.location.search;
      var uid = Url.searchParam('uid', searchParams);
      if (! uid) {
        return this.displayError(t('no uid specified'));
      }

      var code = Url.searchParam('code', searchParams);
      if (! code) {
        return this.displayError(t('no code specified'));
      }

      var self = this;
      var client = new FxaClient();
      client.verifyCode(uid, code)
            .then(function () {
              // TODO - we could go to a "sign_up_complete" screen here.
              self.$('#fxa-complete-sign-up-success').show();

              self.$('h2.success').show();
              self.$('h2.failure').hide();
              self.trigger('verify_code_complete');
            })
            .then(null, function (err) {
              self.displayError(err.errno || err.message);

              self.$('h2.success').hide();
              self.$('h2.failure').show();
              self.trigger('verify_code_complete');
            });
    }

  });

  return CompleteSignUpView;
});
