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

  var GRAVATAR_URL = 'https://www.gravatar.com/avatar/';

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_gravatar',

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
        var img = new Image();
        img.onerror = _.bind(this.notFound, this);

        img.onload = _.bind(this.found, this);
        img.src = this.gravatarUrl();
      }
    },

    found: function () {
      this.gravatar = this.gravatarUrl();
      this.render();
    },

    notFound: function () {
      this.navigate('settings/avatar', {
        error: t('No Gravatar found')
      });
    },

    gravatarUrl: function () {
      if (this.automatedBrowser) {
        // Don't return a 404 so we can test the success flow
        return GRAVATAR_URL + this.hashedEmail + '?s=240';
      }
      return GRAVATAR_URL + this.hashedEmail + '?s=240&d=404';
    },

    _hashEmail: function (email) {
      return md5($.trim(email.toLowerCase()));
    },

    submit: function () {
      // TODO submit intent to server
      Session.set('avatar', this.gravatarUrl());
      this.navigate('settings/avatar', {
        successUnsafe: t('Courtesy of <a href="https://www.gravatar.com">Gravatar</a>')
      });
    }
  });

  return View;
});
