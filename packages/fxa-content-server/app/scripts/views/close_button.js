/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The IFrame'd OAuth flow has a little cancel button.
 * When clicked, this module sends an `oauth_cancel` message
 * to the parent that indicates "close me!"
 */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var CloseTemplate = require('stache!templates/partial/close-button');
  var OAuthErrors = require('lib/oauth-errors');
  var p = require('lib/promise');

  var View = BaseView.extend({
    template: CloseTemplate,

    events: {
      'click': BaseView.preventDefaultThen('close')
    },

    render: function () {
      var self = this;
      return p().then(function () {
        var foxLogo = $('#fox-logo');
        foxLogo.after(self.template());
        self.$el = $('#close');
        self.delegateEvents();
      });
    },

    close: function () {
      var self = this;
      self.logError(OAuthErrors.toError('USER_CANCELED_OAUTH_LOGIN'));
      return self.broker.cancel()
        .then(null, function (err) {
          self.displayError(err);
        });
    }
  });

  module.exports = View;
});

