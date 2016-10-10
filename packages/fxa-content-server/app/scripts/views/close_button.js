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

  const BaseView = require('views/base');
  const CloseTemplate = require('stache!templates/partial/close-button');
  const OAuthErrors = require('lib/oauth-errors');
  const p = require('lib/promise');

  var View = BaseView.extend({
    template: CloseTemplate,

    events: {
      'click': BaseView.preventDefaultThen('close')
    },

    render: function () {
      return p().then(() => {
        var foxLogo = $('#fox-logo');
        foxLogo.after(this.template());
        this.$el = $('#close');
        this.delegateEvents();
      });
    },

    close: function () {
      this.logError(OAuthErrors.toError('USER_CANCELED_OAUTH_LOGIN'));
      return this.broker.cancel()
        .fail((err) => this.displayError(err));
    }
  });

  module.exports = View;
});

