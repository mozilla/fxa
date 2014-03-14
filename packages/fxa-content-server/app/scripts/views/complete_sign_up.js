/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/complete_sign_up',
  'lib/fxa-client',
  'lib/url'
],
function (_, BaseView, CompleteSignUpTemplate, FxaClient, Url) {
  var t = BaseView.t;

  var CompleteSignUpView = BaseView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    afterRender: function () {

      var completeEl = this.$el;
      var completeElHeight = completeEl.height();
      var completeElChildren = completeEl.children();
      completeElChildren.hide();
      completeEl.height(completeElHeight);

      var searchParams = this.window.location.search;
      var uid = Url.searchParam('uid', searchParams);
      if (! uid) {
        completeElChildren.show();
        return this.displayError(t('no uid specified'));
      }

      var code = Url.searchParam('code', searchParams);
      if (! code) {
        completeElChildren.show();
        return this.displayError(t('no code specified'));
      }

      var self = this;
      var client = new FxaClient();
      client.verifyCode(uid, code)
            .then(function () {
              self.navigate('signup_complete');

              self.trigger('verify_code_complete');
            })
            .then(null, function (err) {
              
              self.displayError(err);
              
              completeElChildren.show();
              self.trigger('verify_code_complete');
            });
    }

  });

  return CompleteSignUpView;
});
