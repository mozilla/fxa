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
  'lib/xss',
  'lib/strings'
],
function (_, BaseView, CompleteSignUpTemplate, Session, FxaClient, Url, Xss, Strings) {
  var t = BaseView.t;

  var CompleteSignUpView = BaseView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    context: function () {
      var service = Session.service;

      if (Session.redirectTo) {
        service = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(Session.redirectTo), Session.service
        ]);
      }

      return {
        service: service
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

              self.$('.complete').show();
              self.trigger('verify_code_complete');
            })
            .then(null, function (err) {
              self.displayError(err);

              self.trigger('verify_code_complete');
            });
    }

  });

  return CompleteSignUpView;
});
