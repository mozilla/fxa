/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'underscore',
  'md5',
  'views/form',
  'stache!templates/settings/avatar_gravatar',
  'lib/session'
],
function ($, _, md5, FormView, Template, Session) {

  function t (s) { return s; }

  var GRAVATAR_URL = 'http://www.gravatar.com/avatar/';

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_gravatar',

    events: {
      'error #gravatar': 'notFound'
    },

    initialize: function () {
      this.email = Session.email;
      if (this.email) {
        this.hashedEmail = this._hashEmail(this.email);
      }
    },

    context: function () {
      return {
        gravatar: this.gravatar
      };
    },

    afterRender: function () {
      if (! this.gravatar) {
        var self = this;
        this.$('#gravatar').one('load', function () {
          self.gravatar = self.gravatarUrl();
          self.render();
        });
        this.$('#gravatar').attr('src', this.gravatarUrl());
      }
    },

    notFound: function () {
      this.navigate('settings/avatar', {
        error: t('No Gravatar found')
      });
    },

    gravatarUrl: function () {
      return GRAVATAR_URL + this.hashedEmail + '?s=240d=404';
    },

    _hashEmail: function (email) {
      return md5($.trim(email.toLowerCase()));
    },

    submit: function () {
      // TODO submit intent to server
      Session.set('avatar', this.gravatarUrl());
      this.navigate('settings/avatar', {
        successUnsafe: t('Courtesy of <a href="#">Gravatar</a>')
      });
    }
  });

  return View;
});
