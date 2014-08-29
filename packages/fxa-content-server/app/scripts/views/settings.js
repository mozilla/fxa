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
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'settings',

    context: function () {
      return {
        email: Session.email,
        avatar: Session.avatar,
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
                self.navigate('signin', {
                  success: t('Signed out')
                });
              });
    }
  });

  return View;
});
