/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/settings',
  'lib/fxa-client',
  'lib/session',
  'lib/constants'
],
function (_, BaseView, Template, FxaClient, Session, Constants) {
  var View = BaseView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'settings',

    context: function () {
      return {
        // HTML is written here to simplify the l10n community's job
        email: '<strong id="email" class="email">' + Session.email + '</strong>',
        showSignOut: Session.get('sessionTokenContext') !== Constants.FX_DESKTOP_CONTEXT
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
              self.navigate('signin');
            }, function (err) {
              self.displayError(err);
            });
    }
  });

  return View;
});
