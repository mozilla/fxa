/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/settings',
  'lib/fxa-client',
  'lib/session'
],
function (_, BaseView, Template, FxaClient, Session) {
  var View = BaseView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'settings',

    context: function () {
      return {
        email: Session.email
      };
    },

    events: {
      'click #signout': 'signOut'
    },

    signOut: function (event) {
      if (event) {
        event.preventDefault();
      }

      var client = new FxaClient();
      var self = this;
      client.signOut()
            .then(function () {
              self.router.navigate('signin', { trigger: true });
            }, function (err) {
              self.displayError(err.msg || err.message);
            });
    }
  });

  return View;
});
