/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/settings/avatar_url',
  'lib/session',
  'lib/oauth-client',
  'lib/profile-client',
  'lib/assertion',
  'lib/auth-errors'
],
function (_, FormView, Template, Session, OAuthClient, ProfileClient, Assertion, AuthErrors) {
  // A short/effective regex taken from http://mathiasbynens.be/demo/url-regex
  var urlRegex = /https?:\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i;

  function getProfileClient() {
    /* jshint camelcase: false */
    var config = Session.config;
    var params = {
      client_id: config.oauthClientId
    };
    var oauthClient = new OAuthClient({
      oauthUrl: config.oauthUrl
    });

    return Assertion.generate(config.oauthUrl)
      .then(function(assertion) {
        params.assertion = assertion;
        return oauthClient.getToken(params);
      })
      .then(function(result) {
        var profileClient = new ProfileClient({
          token: result.access_token,
          profileUrl: config.profileUrl
        });
        return profileClient;
      });
  }

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_url',

    context: function () {
      return {
        avatar: Session.avatar
      };
    },

    isValidEnd: function () {
      return this._validateUrl();
    },

    showValidationErrorsEnd: function () {
      if (! this._validateUrl()) {
        this.showValidationError('.url', AuthErrors.toError('URL_REQUIRED'));
      }
    },

    _validateUrl: function () {
      var url = $.trim(this.$('.url').val());

      return !!(url && urlRegex.test(url));
    },

    // Load the remote image into a canvas and prepare it for cropping
    submit: function () {
      var self = this;

      // Define our callbacks here to avoid a circular DOM reference
      var imgOnload = function () {
        // Store the width and height for the cropper view
        Session.set('cropImgWidth', this.width);
        Session.set('cropImgHeight', this.height);
        require(['draggable'], function () {
          self.navigate('settings/avatar/crop');
        });
      };

      var imgOnerrer = function () {
        self.navigate('settings/avatar', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      };

      return this.getRemoteImageSrc(this.$('.url').val())
        .then(function (src) {
          var img = new Image();
          img.src = src;

          img.onload = imgOnload;
          img.onerror = imgOnerrer;

          Session.set('cropImgSrc', src);
        });
    },

    getRemoteImageSrc: function (url) {
      return getProfileClient()
        .then(function(profileClient) {
          return profileClient.getRemoteImage(url);
        })
        .then(function(src) {
          return 'data:image/jpeg;base64,' + src;
        });
    }

  });

  return View;
});
