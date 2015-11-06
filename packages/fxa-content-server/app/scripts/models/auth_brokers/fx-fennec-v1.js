/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in Firefox for Android.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var FxDesktopV2AuthenticationBroker = require('models/auth_brokers/fx-desktop-v2');
  var NavigateBehavior = require('views/behaviors/navigate');
  var p = require('lib/promise');

  var proto = FxDesktopV2AuthenticationBroker.prototype;

  var FxFennecV1AuthenticationBroker = FxDesktopV2AuthenticationBroker.extend({
    type: 'fx-fennec-v1',

    commands: _.extend({}, proto.commands, {
      SYNC_PREFERENCES: 'fxaccounts:sync_preferences'
    }),

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: {
        engines: [
          'bookmarks',
          'history',
          'passwords',
          'tabs'
        ]
      },
      emailVerificationMarketingSnippet: false,
      syncPreferencesNotification: true
    }),

    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      afterForceAuth: new NavigateBehavior('force_auth_complete'),
      afterSignIn: new NavigateBehavior('signin_complete'),
      afterSignUpConfirmationPoll: new NavigateBehavior('signup_complete')
    }),

    afterSignUp: function (account) {
      var self = this;
      return p().then(function () {
        if (self.hasCapability('chooseWhatToSyncWebV1')) {
          return new NavigateBehavior('choose_what_to_sync', {
            data: {
              account: account
            }
          });
        }
      });
    },

    /**
     * Notify the browser that it should open sync preferences
     *
     * @method openSyncPreferences
     * @returns {promise} resolves when notification is sent.
     */
    openSyncPreferences: function () {
      return this.send(this.getCommand('SYNC_PREFERENCES'));
    }
  });

  module.exports = FxFennecV1AuthenticationBroker;
});
