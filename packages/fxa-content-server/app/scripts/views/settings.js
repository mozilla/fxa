/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/settings',
  'lib/session',
  'lib/constants'
],
function (_, FormView, BaseView, Template, Session, Constants) {
  var View = FormView.extend({
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
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #signout': BaseView.preventDefaultThen('validateAndSubmit')
    },

    submit: function () {
      var self = this;
      return this.fxaClient.signOut()
              .then(function () {
                self.navigate('signin');
              });
    }
  });

  return View;
});
